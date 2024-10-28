const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const queue = new Map();
const SPECIFIC_USER_ID=''
module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Advanced music bot')
    .addStringOption(option => 
        option.setName('song')
        .setDescription('The song name or URL to play')
        .setRequired(true)),
  
  async execute(interaction) {
    const voice_channel = interaction.member.voice.channel;
    if(interaction.member.id !== SPECIFIC_USER_ID){
        return;
    }
    if (!voice_channel) return interaction.reply('You need to be in a voice channel to use this command!');
    const permissions = voice_channel.permissionsFor(interaction.client.user);
    if (!permissions.has('CONNECT')) return interaction.reply('I don\'t have permission to connect to this channel.');
    if (!permissions.has('SPEAK')) return interaction.reply('I don\'t have permission to speak in this channel.');

    const server_queue = queue.get(interaction.guild.id);
    const songInput = interaction.options.getString('song');
    let song = {};

    if (ytdl.validateURL(songInput)) {
      const song_info = await ytdl.getInfo(songInput);
      song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url };
    } else {
      const video_finder = async (query) => {
        const videoResult = await ytSearch(query);
        return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
      }

      const video = await video_finder(songInput);
      if (video) {
        song = { title: video.title, url: video.url };
      } else {
        return interaction.reply('Error finding video.');
      }
    }

    if (!server_queue) {
      const queue_constructor = {
        voice_channel: voice_channel,
        text_channel: interaction.channel,
        connection: null,
        songs: []
      };

      queue.set(interaction.guild.id, queue_constructor);
      queue_constructor.songs.push(song);

      try {
        const connection = joinVoiceChannel({
          channelId: voice_channel.id,
          guildId: voice_channel.guild.id,
          adapterCreator: voice_channel.guild.voiceAdapterCreator,
        });

        queue_constructor.connection = connection;
        video_player(interaction.guild, queue_constructor.songs[0]);

      } catch (err) {
        queue.delete(interaction.guild.id);
        return interaction.reply('There was an error connecting to the voice channel.');
      }
    } else {
      server_queue.songs.push(song);
      return interaction.reply(`**${song.title}** has been added to the queue!`);
    }
  }
};

const video_player = async (guild, song) => {
  const song_queue = queue.get(guild.id);

  if (!song) {
    song_queue.connection.destroy();
    queue.delete(guild.id);
    return;
  }

  const stream = ytdl(song.url, { filter: 'audioonly' });
  const resource = createAudioResource(stream);
  const player = createAudioPlayer();

  player.play(resource);
  song_queue.connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    song_queue.songs.shift();
    video_player(guild, song_queue.songs[0]);
  });

  await song_queue.text_channel.send(`Now playing **${song.title}**`);
};

const skip_song = (interaction, server_queue) => {
  if (!interaction.member.voice.channel) return interaction.reply('You need to be in a voice channel to skip songs.');
  if (!server_queue) return interaction.reply('There are no songs in the queue to skip.');

  server_queue.connection.dispatcher.end();
};

const stop_song = (interaction, server_queue) => {
  if (!interaction.member.voice.channel) return interaction.reply('You need to be in a voice channel to stop the music.');
  
  server_queue.songs = [];
  server_queue.connection.dispatcher.end();
};
