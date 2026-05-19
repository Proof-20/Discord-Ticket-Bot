const { ActivityType } = require("discord.js");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Ready!! ${client.user.tag} is logged in and online.`);

        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        client.user.setActivity(`${totalUsers} Members`, { 
            type: ActivityType.Streaming, 
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        });
    }
}
