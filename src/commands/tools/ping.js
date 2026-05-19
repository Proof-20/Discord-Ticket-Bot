const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Return my Ping!'),
    async execute(interaction, client) {
        const message = await interaction.deferReply({
            ephemeral: true
        });

        const apiLatency = client.ws.ping;
        const clientPing = message.createdTimestamp - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Pong!')
            .addFields(
                { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
                { name: 'Client Ping', value: `${clientPing}ms`, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], ephemeral: true });
    }
};