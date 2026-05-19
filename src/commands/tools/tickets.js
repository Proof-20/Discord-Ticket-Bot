const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { support_channel, BIG_BANNER} = process.env

module.exports = {
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Provides support information and options'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Tickets')
            .setDescription('> **Tickets** created **as** jokes or for **questions** already **answered** in the terms **will** be closed.')
            .setTimestamp();
            
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('support_select')
            .setPlaceholder('Choose a service')
            .addOptions([
                {
                    label: 'Buy A Product',
                    description: 'Get help with technical issues',
                    value: 'billing_support',
                    emoji: { name: '💵' },
                },
                {
                    label: 'Tehnical Support',
                    description: 'Get help with billing issues',
                    value: 'technical_support',
                    emoji: { name: '🔧' },
                },
                {
                    label: 'Question Or Concerns',
                    description: 'Get help with any questions',
                    value: 'concerns_support',
                    emoji: { name: '🛑' },
                },
            ]);
            
            if (interaction.channelId !== support_channel) {
                await interaction.reply({ embeds: [
                    new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(` - This command can only be used in the support channel: <#${support_channel}>.`)
                ], ephemeral: true });
                return;
            }

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ embeds: [embed], components: [row] });

    
    }
};