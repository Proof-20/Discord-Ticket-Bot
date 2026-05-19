const { EmbedBuilder } = require('discord.js');
const { staff_member, owner } = process.env;

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const errorEmbed = new EmbedBuilder().setColor('#0099ff');

        if (command.staffOnly && !interaction.member.roles.cache.has(staff_member)) {
            errorEmbed.setDescription(` - You don't have access to use this command.`);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (command.ownerOnly && !interaction.member.roles.cache.has(owner)) {
            errorEmbed.setDescription(` - You are not an owner.`);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'There was an error while executing that command!',
                ephemeral: true 
            });
        }
    },
};