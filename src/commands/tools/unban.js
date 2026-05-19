const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    staffOnly: true, 
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a specified user')
        .addStringOption(option => 
          option.setName('user_id')
            .setDescription('ID of the user to unban')
            .setRequired(true))
        .addStringOption(option => 
          option.setName('reason')
            .setDescription('Reason for the unban')
            .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason');
        
        try {
            await interaction.guild.bans.remove(userId, reason);
            
            return interaction.reply({ embeds: [
                    new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(`- **User with ID ${userId}** has been successfully unbanned from this server with the reason: **${reason}**`)
                ]
            });   
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: 'There was an error trying to unban this user!',
                ephemeral: true
            });
        }
    }
};