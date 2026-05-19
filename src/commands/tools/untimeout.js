const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { clientId, staff_member } = process.env;

module.exports = {
    staffOnly: true,
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Removes the timeout from a specified user')
        .addUserOption(option => 
          option.setName('target')
            .setDescription('User to untimeout')
            .setRequired(true)),
    async execute(interaction) {
        try {
            const user = interaction.options.getUser('target');
            const member = await interaction.guild.members.fetch(user.id);
            
            if (user.id === clientId) {
                return interaction.reply({ embeds: [
                    new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('- You can\'t untimeout the bot.')
                    ]
                });
            }
            
            if (member.roles.cache.some(role => staff_member.includes(role.id))) {
                return interaction.reply({ embeds: [
                    new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('- You can\'t untimeout a staff member.')
                ], ephemeral: true });
            }
            
            await member.timeout(null);
            
            return interaction.reply({ embeds: [
                    new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(`- **${user.tag}**'s timeout has been successfully removed.`)
                ]
            });   
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: 'There was an error trying to remove the timeout from this user!',
                ephemeral: true
            });
        }
    }
};