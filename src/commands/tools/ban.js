const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { clientId, staff_member } = process.env

module.exports = {
    staffOnly: true, 
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a specified user')
        .addUserOption(option => 
          option.setName('target').setDescription('User to ban')
            .setRequired(true))
        .addStringOption(option => 
          option.setName('reason').setDescription('Reason for the ban')
            .setRequired(true)),
            async execute(interaction) {
                const user = interaction.options.getUser('target');
                const reason = interaction.options.getString('reason');
                
            try {
                const member = await interaction.guild.members.fetch(user.id);
                if (user.id === clientId) {
                return interaction.reply({ embeds: [
                      new EmbedBuilder()
                          .setColor('#ff0000')
                          .setDescription("- Nah bro, you're a legitimate retarded, why tf do you want to ban the bot 🙏💀.")
                        ]
                    });
                }   
                if (member.roles.cache.some(role => staff_member.includes(role.id))) {
                    return interaction.reply({ embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription("- You can't ban a staff member.")
                    ], ephemeral: true });
                }
                await member.ban({ reason });
                return interaction.reply({ embeds: [
                      new EmbedBuilder()
                          .setColor('#0099ff')
                          .setDescription(`- **${user.tag}** has been successfully banned from this server for the reason: **${reason}**`)
                        ]
                    });   
                } catch (error) {
                    console.error(error);
                    return interaction.reply({
                        content: 'There was an error trying to ban this user! Or you try to ban yourself...',
                        ephemeral: true
                    });
                }
            }};