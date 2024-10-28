const { SlashCommandBuilder } = require('@discordjs/builders');
const queue = new Map(); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the music and clear the queue'),

  async execute(interaction) {
    const voice_channel = interaction.member.voice.channel;
    const server_queue = queue.get(interaction.guild.id);

    if (!voice_channel) return interaction.reply('You need to be in a voice channel to use this command.');
    if (!server_queue) return interaction.reply('There are no songs in the queue to stop.');

    server_queue.songs = [];
    server_queue.connection.dispatcher.end();
    interaction.reply('Stopped the music and cleared the queue.');
  },
};
