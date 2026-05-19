const { welcome_channel, MID_BANNER, support_channel } = process.env;
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            const channel = member.guild.channels.cache.get(welcome_channel);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`👋 Welcome to ${member.guild.name}`)
                    .setDescription(`** > We are happy to have you here ${member}. Let me show you around.**`)
                    .addFields(
                        { name: 'Our Portfolio:', value: `<#${support_channel}>`, inline: true },
                        { name: 'You can Order:', value: `<#${support_channel}>`, inline: true }
                    )
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setImage(MID_BANNER);

                channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);
        }
    }
};