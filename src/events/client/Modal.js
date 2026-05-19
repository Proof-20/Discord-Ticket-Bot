const { ModalBuilder, TextInputBuilder, ActionRowBuilder, PermissionsBitField, TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { createTranscript } = require('discord-html-transcripts');
const { BIG_BANNER, staff_member, owner, review_channel, transcript_channel } = process.env;

const MODALS = {
    billing_support: {
        customId: 'billing_support',
        title: 'Buy a Product',
        emoji: { name: '💵' },
        inputs: [
            { 
                customId: 'service_input', 
                label: 'What kind of service do you want?', 
                style: TextInputStyle.Paragraph, 
                minLength: 5 
            },
            { 
                customId: 'budget_input', 
                label: 'What budget do you have?', 
                style: TextInputStyle.Short, 
                minLength: 0 
            }
        ]
    },
    technical_support: {
        customId: 'technical_support',
        title: 'Technical Support',
        emoji: { name: '🔧' },
        inputs: [
            { 
                customId: 'service_input', 
                label: 'What support do you need?', 
                style: TextInputStyle.Paragraph, 
                minLength: 5 
            },
            { 
                customId: 'problem_input', 
                label: 'Describe your problem:', 
                style: TextInputStyle.Paragraph, 
                minLength: 5 
            }
        ]
    },
    concerns_support: {
        customId: 'concerns_support',
        title: 'Question Or Concerns',
        emoji: { name: '🛑' },
        inputs: [
            { 
                customId: 'service_input', 
                label: 'What question/concerns do you have?', 
                style: TextInputStyle.Paragraph, 
                minLength: 5 
            }
        ]
    }
};

// 2026 update: I created this small registry so instead of doing Object.values(MODALS).find() it do a lookup directly with the key
const MODAL_BY_CUSTOM_ID = Object.values(MODALS).reduce((registry, modal) => {
    registry[modal.customId] = modal;
    return registry;
}, {});


async function handleStringSelectMenu(interaction) {
    const selectedValue = interaction.values[0];
    const modalData = MODALS[selectedValue];
    if (!modalData) return;

    const modal = new ModalBuilder()
        .setCustomId(modalData.customId)
        .setTitle(modalData.title);

    modalData.inputs.forEach(input => {
        const textInput = new TextInputBuilder()
            .setCustomId(input.customId)
            .setLabel(input.label)
            .setStyle(input.style)
            .setMaxLength(100)
            .setMinLength(input.minLength)
            .setRequired(true);

        const actionRow = new ActionRowBuilder().addComponents(textInput);
        modal.addComponents(actionRow);
    });

    await interaction.showModal(modal);
}

async function createSupportTicket(interaction, responses) {
    const serviceResponse = responses.find(res => res.customId === 'service_input');
    const budgetResponse = responses.find(res => res.customId === 'budget_input');
    const problemResponse = responses.find(res => res.customId === 'problem_input');

    const currentDate = new Date().toLocaleDateString('en-GB');

    const modalData = MODALS[interaction.customId];
    const categoryEmoji = modalData?.emoji?.name || '💰'; 

    
    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
        .setImage(BIG_BANNER)
        .setFooter({ text: 'Please allow up to 24 hours for a response.' })
        .setTitle(`Thank you for opening a new ticket!`)
        .setDescription(`
            > **Please** wait patiently while a staff member reviews your **ticket**.`);
    
    const fields = [
        { name: 'Service', value: serviceResponse?.value || 'N/A', inline: true },
        { name: 'Created', value: currentDate, inline: true }
    ];

    if (budgetResponse || problemResponse) {
        fields.splice(1, 0, {
            name: budgetResponse ? 'Budget' : 'Problem',
            value: budgetResponse ? `${budgetResponse.value}€` : problemResponse?.value || '',
            inline: true
        });
    }

    embed.addFields(fields);

    const button = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(button);

    const { guild, member } = interaction;
    const category = await guild.channels.create({
        name: `${categoryEmoji}・${member.user.username}`,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
            {
                id: guild.roles.everyone,
                deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
                id: member.id,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.Connect,
                    PermissionsBitField.Flags.Speak
                ]
            },
            {
                id: staff_member,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ManageMessages
                ]
            }
        ]
    });

    const [textChannel] = await Promise.all([
        guild.channels.create({
            name: '💬・chat',
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: category.permissionOverwrites.cache
        }),
        guild.channels.create({
            name: '🔊・voice',
            type: ChannelType.GuildVoice,
            parent: category.id,
            permissionOverwrites: category.permissionOverwrites.cache
        })
    ]);

    await textChannel.send({ embeds: [embed], components: [row] });
    await textChannel.setTopic(`User ID: ${member.user.id}`);
    await interaction.followUp({ content: 'Your support request has been created!', ephemeral: true });

    // Auto-close after 24 hours
    setTimeout(async () => {
        try {
            const fetchedCategory = await guild.channels.fetch(category.id);
            if (fetchedCategory?.type === ChannelType.GuildCategory) {
                await Promise.all([...fetchedCategory.children.cache.values()].map(channel => channel.delete()));
                await fetchedCategory.delete();
            }
        } catch (error) {
            console.error('Failed to delete support ticket category:', error);
        }
    }, 24 * 60 * 60 * 1000);
}

async function handleRating(interaction) {
    const rating = parseInt(interaction.customId.replace('rating_', ''));

    if (rating >= 1 && rating <= 5) {
        const modal = new ModalBuilder()
            .setCustomId(`feedback_modal_${rating}`)
            .setTitle('Additional Feedback');

        const feedbackInput = new TextInputBuilder()
            .setCustomId('feedback_text')
            .setLabel('Any additional comments? (Optional)')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);
 
        const actionRow = new ActionRowBuilder().addComponents(feedbackInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
     
    }
}

async function sendFeedback(interaction, rating, feedbackText = '') {
    const ticketChannel = interaction.channel;
    const feedbackChannel = interaction.guild.channels.cache.get(review_channel);

    const messageCount = (await ticketChannel.messages.fetch()).size;
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Ticket Feedback')
        .setDescription(`Feedback from Customer <@${interaction.user.id}>`)
        .addFields(
            { name: 'Rating', value: '⭐'.repeat(rating), inline: true },
            { name: 'Message Count', value: messageCount.toString(), inline: true },
            { name: 'Feedback', value: `> ${feedbackText} ` || `No feedback provided.`, inline: false }
        )
        .setTimestamp();

    await feedbackChannel.send({ embeds: [embed] });
    ticketChannel.feedbackGiven = true;
    await interaction.reply({ content: 'Feedback sent successfully!', ephemeral: true });
}

async function processTranscript(interaction) {
    const category = interaction.channel.parent;
    if (category?.type !== ChannelType.GuildCategory) return;

    const textChannel = category.children.cache
        .find(channel => channel.type === ChannelType.GuildText);
    
    if (!textChannel) return;

    const userId = textChannel.topic?.match(/User ID: (\d+)/)?.[1];
    if (!userId) return;

    try {
        const user = await interaction.guild.members.fetch(userId);
        const file = await createTranscript(textChannel, { 
            limit: 100, 
            returnBuffer: false, 
            filename: `${textChannel.name.toLowerCase()}-transcript.html` 
        });

        const transcriptChannel = interaction.guild.channels.cache.get(transcript_channel);
        if (transcriptChannel) {
            const msg = await transcriptChannel.send({ files: [file] });
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("Open (deprecated)")
                    .setURL(`https://mahto.id/chat-exporter?url=${msg.attachments.first()?.url}`)
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel("Download")
                    .setURL(msg.attachments.first()?.url)
                    .setStyle(ButtonStyle.Link)
            );

            const embed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle('Transcript')
                .setAuthor({ name: user.user.username, iconURL: user.user.displayAvatarURL() })
                .setDescription(`Hello <@${user.user.id}> please note that any media sent in this ticket transcript may not load in the copy after a couple of days.`)
                .addFields(
                    { name: 'Closed by:', value: `<@${user.user.id}>`, inline: true },
                    { name: 'Attachment', value: `<#${transcript_channel}>`, inline: true },
                    { name: 'Created', value: new Date().toLocaleDateString('en-GB'), inline: true },
                )
                .setImage(BIG_BANNER);

            await transcriptChannel.send({ embeds: [embed], components: [buttons] });
            try {
                await user.send({ embeds: [embed], components: [buttons] });
            } catch (error) {
                console.error(`Could not send DM to ${user.user.username}`);
            }
        }

        await Promise.all([...category.children.cache.values()].map(channel => channel.delete()));
        await category.delete();
    } catch (error) {
        console.error('Error processing transcript:', error);
    }
}

async function promptForRating(interaction) {
    const buttons = Array.from({ length: 5 }, (_, i) => 
        new ButtonBuilder()
            .setCustomId(`rating_${i + 1}`)
            .setLabel(`${i + 1}⭐`)
            .setStyle(ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder().addComponents(buttons);
    await interaction.reply({
        content: 'Please rate your experience:',
        components: [row],
        ephemeral: true
    });
}


async function handleButtonInteraction(interaction) {
    const isStaff = interaction.member.roles.cache.has(staff_member || owner);

    if (interaction.customId === 'close_ticket') {
        isStaff ? await processTranscript(interaction) : 
                  await promptForRating(interaction);

    } else if (interaction.customId.startsWith('rating_')) {
        await handleRating(interaction);
        
    }
}

/*
   I notice this is event router type of arhitecture not an classic ECS or OOP so for this discord bot is likely to get an event "interactioCreate" who can be classify
   then send it to the correct system
**/

// 2026
async function handleSupportModalSubmit(interaction) {
    const modalData = MODAL_BY_CUSTOM_ID[interaction.customId];
    if (!modalData) return false;

    const response = modalData.inputs.map(input => ({
        label: input.label,
        value: interaction.fields.getTextInputValue(input.customId),
        customId: input.customId
    }));

    if (interaction.customId === 'billing_support') {
        const budgetResponse = response.find(response => response.customId === "budget_input");

        if (budgetResponse && Number.isNaN(Number(budgetResponse.value))) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(' - Please enter a valid number for budget...')
                ],
                ephemeral: true
            });

            return true;
        }
    }

    await interaction.deferReply({ ephemeral: true });
    await createSupportTicket(interaction, response);

    return true;
}

async function handleFeedbackModalSubmit(interaction) {
    if (!interaction.customId.startsWith('feedback_modal_')) return false;

    const rating = Number(interaction.customId.split('_')[2]);
    const feedbackText = interaction.fields.getTextInputValue('feedback_text');

    await sendFeedback(interaction, rating, feedbackText);
    await processTranscript(interaction);

    return true;
}

async function handleModalSubmit(interaction) {
    const feedbackHandled = await handleFeedbackModalSubmit(interaction);
    if (feedbackHandled) return;

    await handleSupportModalSubmit(interaction);
}

async function replyWithInteractionError(interaction, error) {
    console.error('Error handling interaction:', error);

    const payload = {
        content: 'An error occurred while processing your request.',
        ephemeral: true
    };

    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(payload);
            return;
        }

        await interaction.reply(payload);
    }
    catch (replyError) {
        console.error('Error sending error message:', replyError);
    }
}

const INTERACTION_ROUTES = [
    {
        matches: interaction => interaction.isStringSelectMenu(),
        execute: handleStringSelectMenu
    },
    {
        matches: interaction => interaction.isModalSubmit(),
        execute: handleModalSubmit
    },
    {
        matches: interaction => interaction.isButton(),
        execute: handleButtonInteraction
    }
];

module.exports = {
    name: 'interactionCreate',

    async execute(interaction, client) {
        try {
            const route = INTERACTION_ROUTES.find(route => route.matches(interaction));
            if (!route) return;

            await route.execute(interaction, client);
        } catch (error) {
            await replyWithInteractionError(interaction, error);
        }
    }
};

// 2024
/*
module.exports = {s
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            if (interaction.isStringSelectMenu()) {
                await handleStringSelectMenu(interaction);
            } else if (interaction.isModalSubmit()) {
                const modalId = interaction.customId;
                if (modalId.startsWith('feedback_modal_')) {       
                    const rating = parseInt(modalId.split('_')[2]);
                    const feedbackText = interaction.fields.getTextInputValue('feedback_text');
                    await sendFeedback(interaction, rating, feedbackText);
                    await processTranscript(interaction);
                } else {
                    const modalData = Object.values(MODALS).find(modal => modal.customId === modalId);
                    if (modalData) {
                        const responses = modalData.inputs.map(input => ({
                            label: input.label,
                            value: interaction.fields.getTextInputValue(input.customId),
                            customId: input.customId
                        }));

                        if (modalId === 'billing_support') {
                            const budgetResponse = responses.find(res => res.customId === 'budget_input');
                            if (budgetResponse && isNaN(budgetResponse.value)) {
                                await interaction.reply({
                                    embeds: [new EmbedBuilder()
                                        .setColor('#0099ff')
                                        .setDescription(' - Please enter a valid number for budget...')
                                    ],
                                    ephemeral: true
                                });
                                return;
                            }
                        }

                        await interaction.deferReply({ ephemeral: true });
                        await createSupportTicket(interaction, responses);
                    }
                }
            } else if (interaction.isButton()) {
                await handleButtonInteraction(interaction);
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            try {
                const reply = { content: 'An error occurred while processing your request.', ephemeral: true };
                if (interaction.deferred) {
                    await interaction.followUp(reply);
                } else {
                    await interaction.reply(reply);
                }
            } catch (e) {
                console.error('Error sending error message:', e);
            }
        }
    }
};
**/
