const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { clientId, staff_member } = process.env;

module.exports = {
    staffOnly: true,
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Times out a specified user')
        .addUserOption(option => 
          option.setName('target').setDescription('User to timeout')
            .setRequired(true))
        .addIntegerOption(option => 
          option.setName('duration').setDescription('Duration of the timeout in minutes')
            .setRequired(true))
        .addStringOption(option => 
          option.setName('reason').setDescription('Reason for the timeout')
            .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason');

        if (duration <= 0) {
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('- The duration must be a positive number.')
                ], ephemeral: true});
        }

        try {
            const member = await interaction.guild.members.fetch(user.id);
            
            if (user.id === clientId) {
                return interaction.reply({ embeds: [
                    new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('- You can\'t timeout the bot.')
                    ]});
            }
            
            if (member.roles.cache.some(role => staff_member.includes(role.id))) {
                return interaction.reply({ embeds: [
                    new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('- You can\'t timeout a staff member.')
                ], ephemeral: true });
            }
            
            await member.timeout(duration * 60 * 1000, reason);
            
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                .setColor('#0099ff')
                .setDescription(`- **${user.tag}** has been successfully timed out for **${duration}** minutes for the reason: **${reason}**`)
                ]
            });   
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: 'There was an error trying to timeout this user!',
                ephemeral: true
            });
        }
    }
};