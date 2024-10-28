const { SlashCommandBuilder } = require('@discordjs/builders');
const queue = new Map(); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the currently playing song'),

  async execute(interaction) {
    const voice_channel = interaction.member.voice.channel;
    const server_queue = queue.get(interaction.guild.id);

    if (!voice_channel) {
      return interaction.reply('You need to be in a voice channel to use this command.');
    }

    if (!server_queue) {
      return interaction.reply('There are no songs in the queue to skip.');
    }

    server_queue.connection.dispatcher.end();
    interaction.reply('Skipped the current song.');
  },
};
