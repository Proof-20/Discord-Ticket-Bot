const {  SlashCommandBuilder,  EmbedBuilder,  ActionRowBuilder,  ButtonBuilder,  ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Displays the close ticket message with button'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription('Click the button below to close this ticket.')
            .setTimestamp();

        const closeButton = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(closeButton);

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};