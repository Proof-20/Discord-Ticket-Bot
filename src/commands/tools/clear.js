const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    staffOnly: true, 
    data: new SlashCommandBuilder()
        .setName('clean')
        .setDescription('Deletes a specified number of messages')
        .addIntegerOption(option => 
        option.setName('count').setDescription('Number of messages to delete')
            .setRequired(true)),
    async execute(interaction) {
        const deleteCount = interaction.options.getInteger('count');

        if (deleteCount < 1 || deleteCount > 100) {
            return interaction.reply({ content: 'Please provide a number between 1 and 100 for the number of messages to delete.', ephemeral: true });
        }
        try {
            const fetched = await interaction.channel.messages.fetch({ limit: deleteCount });
            await interaction.channel.bulkDelete(fetched);
            interaction.reply({ content: `Successfully deleted ${deleteCount} messages.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'There was an error trying to delete messages in this channel!', ephemeral: true });
        }
    },
};