const { Client, GatewayIntentBits, Partials, EmbedBuilder, TextChannel, ActivityType, Collection, Events, ChannelType } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path'); 
const fs = require('fs'); 
const translate = require('@iamtraction/google-translate');
require('dotenv').config(); 


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildMessageReactions, 
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
  ],
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands'); 
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

// declared ids
const logFilePath = './deleted_messages.log';
const CHANNEL_ID = '';
const SPECIFIC_USER_ID = '';
const editedLogFilePath = './edited_messages.log';
const SPECIFIC_USER_ID2='';
const specificRoleId = ''; 

// website check
async function checkWebsite() {
  try {
     const response = await axios.get('https://sk1er.club/leaderboards/guild_wins_duels');
    const $ = cheerio.load(response.data);

    const lastGeneratedText = $('body').text().match(/Last Generated: [0-9]+ Minute Ago/);
    if (lastGeneratedText && lastGeneratedText[0] === 'Last Generated: 0 Minute Ago') {
      const channel = await client.channels.fetch(CHANNEL_ID);
      await channel.send("The website https://sk1er.club/leaderboards/guild_wins_duels has been updated.");
      console.log('updated');
      return true; 
    }
  } catch (error) {x
    console.error('Error checking website:', error);
  }
  return false; 
}



// time arguments for checkWebsite()
function startChecking() {
  const checkInterval = setInterval(async () => {
    const updated = await checkWebsite();
    if (updated) {
      clearInterval(checkInterval); 
      setTimeout(startChecking, 79200000); 
    }
  }, 60000);
}
// random meme from r/Catmemes
async function fetchMeme() {
    try {
        const response = await axios.get('https://www.reddit.com/r/Catmemes/top.json?limit=50');
        
        const posts = response.data.data.children;
        const randomPost = posts[Math.floor(Math.random() * posts.length)].data;

        return randomPost.url; 
    } catch (error) {
        console.error('Error fetching meme:', error);
        return null;
    }
}


const REQUIRED_ROLES = ['', ''];
client.on('messageCreate', async (message) => {
  if (message.content==='.lb'){
    const mess='https://sk1er.club/leaderboards/guild_wins_duels';
    message.reply(mess);
  }
    if (message.content.toLowerCase() === '-cm') {
        
        const hasRole = message.member.roles.cache.some(role => 
          REQUIRED_ROLES.includes(role.name) || REQUIRED_ROLES.includes(role.id)
      );
        
        if (hasRole) {
            const memeImageUrl = await fetchMeme();
            if (memeImageUrl) {
                message.reply(memeImageUrl);
            } else {
                message.reply('Sorry, I couldn\'t fetch a meme right now.');
            }
        } else {
            message.reply('You do not have the required role to use this command.');
        }
    }
});

// client.on('messageCreate', async (message) => {
//     if (message.content.toLowerCase() === '-ff') {
//        
//         const hasRole = message.member.roles.cache.some(role => 
//           REQUIRED_ROLES.includes(role.name) || REQUIRED_ROLES.includes(role.id)
//       );
        
//         if (hasRole) {
//             const memeImageUrl = await fetchMeme2();
//             if (memeImageUrl) {
//                 message.reply(memeImageUrl);
//             } else {
//                 message.reply('Sorry, I couldn\'t fetch a meme right now.');
//             }
//         } else {
//             message.reply('You do not have the required role to use this command.');
//         }
//     }
// });

//client initialization
client.once('ready', () => {
  console.log('Bot is online!');
  startChecking(); 
  client.user.setPresence({
    activities: [{
      name: 'its chaos!',
      type: ActivityType.Custom, 
    }],
    status: 'idle'
  });
});

function ranc() {
  var col = ["#000000", "#1ABC9C", "#11806A", "#57F287", "#1F8B4C", "#3498DB", "#206694", "#9B59B6", "#71368A", "#E91E63", "#AD1457", "#F1C40F", "#C27C0E", "#E67E22", "#A84300", "#ED4245", "#992D22", "#95A5A6", "#979C9F", "#7F8C8D", "#BCC0C0", "#34495E", "#2C3E50", "#FFFF00"]
  var rnd = Math.floor(Math.random() * col.length);
  return(col[rnd])
}


let meowCounts = {};


try {
    if (fs.existsSync('meowCounts.json')) {
        const data = fs.readFileSync('meowCounts.json', 'utf8');
        if (data) {
            meowCounts = JSON.parse(data);
        }
    }
} catch (error) {
    console.error('Error reading or parsing meowCounts.json:', error);
    meowCounts = {};  
}


//for meow counter
client.on('messageCreate', (message) => {
   if (message.author.bot) return;


  if (!message.channel) return;


  if (message.channel.type === 'DM') return;
 if (!message.guild) return;
    const content = message.content.toLowerCase();
    const userId = message.author.id;  
    const username = message.author.username;  
    const guildId = message.guild.id;
    const guildName = message.guild.name;

    
    if (!meowCounts[guildId]) {
        meowCounts[guildId] = {}; 
    }

   
    if (content === 'meow') {
        
        if (meowCounts[guildId][userId]) {
            meowCounts[guildId][userId].count++;
        } else {
            meowCounts[guildId][userId] = { count: 1, username: username }; 
        }

        
        fs.writeFileSync('meowCounts.json', JSON.stringify(meowCounts, null, 2));
    }

   

  //leaderboard generate
    else if (content === '.meowtop') {
        
        if (!meowCounts[guildId] || Object.keys(meowCounts[guildId]).length === 0) {
            message.channel.send(`No one has said 'meow' yet in ${message.guild.name}!`);
        } else {
          
            const filteredMeows = Object.entries(meowCounts[guildId])
                .filter(([, data]) => data.count > 0)  
                .sort(([, a], [, b]) => b.count - a.count)  
                .slice(0, 10);  

            if (filteredMeows.length === 0) {
                message.channel.send(`No one has said 'meow' yet in ${message.guild.name}!`);
            } else {
              
                let topMeowers = '';
                filteredMeows.forEach(([userId, data], index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                    const rank = index >= 3 ? `${index + 1}. ` : ''; 
                    topMeowers += `${medal} ${rank}${data.username}: ${data.count} meows\n`;
                });

                const utcTime = new Date().toUTCString();

             
                const embed = new EmbedBuilder()
                    .setColor(ranc())
                    .setTitle(`Top Meowers in ${message.guild.name}`)
                    .setDescription('Meow Leaderboard')
                    .setFooter({ text: `Generated: ${utcTime}` }) 
                    .setThumbnail(message.guild.iconURL())
                    .addFields({ name: 'Leaderboard', value: topMeowers });  

                
                message.channel.send({ embeds: [embed] });
            }
        }
    }

    
    else if (content === '.meowtopg') {
        
        let globalMeowCounts = {};

        
        for (const guildId in meowCounts) {
            const guildMeows = meowCounts[guildId];

            for (const userId in guildMeows) {
                if (globalMeowCounts[userId]) {
                    globalMeowCounts[userId].count += guildMeows[userId].count;  
                } else {
                    globalMeowCounts[userId] = { count: guildMeows[userId].count, username: guildMeows[userId].username };  
                }
            }
        }

        
        const sortedGlobalMeows = Object.entries(globalMeowCounts)
            .filter(([, data]) => data.count > 0) 
            .sort(([, a], [, b]) => b.count - a.count)  
            .slice(0, 10);  

        if (sortedGlobalMeows.length === 0) {
            message.channel.send("No one has said 'meow' globally yet!");
        } else {
            
            let topMeowersGlobal = '';
            sortedGlobalMeows.forEach(([userId, data], index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                const rank = index >= 3 ? `${index + 1}. ` : ''; 
                topMeowersGlobal += `${medal} ${rank}${data.username}: ${data.count} meows\n`;
            });

            const utcTime = new Date().toUTCString();

           
            const embed = new EmbedBuilder()
                .setColor(ranc())
                .setTitle('Top Meowers Globally')
                .setDescription('Global Meow Leaderboard')
                .setFooter({ text: `Generated: ${utcTime}` })  
                .setThumbnail('https://path.to/trophy/image')  
                .addFields({ name: 'Leaderboard', value: topMeowersGlobal });  

            
            message.channel.send({ embeds: [embed] });
        }
    }
   
   
    if (content === '.meow') {
        const userMeows = meowCounts[guildId][userId]?.count || 0;

        if (userMeows === 0) {
            message.reply(`You have not said any meows yet! Go meow.`);
        } else if (userMeows === 1) {
            message.reply(`You have said meow once. :3`);
        } else {
            message.reply(`You have said meow ${userMeows} times. :3`);
        }
    }
});


//sending dms to members
client.on('messageCreate', async (message) => {
 if (message.content.startsWith('!dm')) {
  const args = message.content.split(' ').slice(1);
  const userId = args.shift();
  const dmMessage = args.join(' ');

  if (!userId || !dmMessage) {
    return message.reply('Please provide a user ID and a message.');
  }

  
  (async () => {
    try {
      const user = await client.users.fetch(userId);
      await user.send(dmMessage);
      console.log(`Sent a DM to ${user.tag}`);
      message.reply(`Successfully sent a DM to ${user.tag}`);
    } catch (error) {
      console.error('Error sending DM:', error);
      message.reply('An error occurred while sending the DM. Please check the user ID and try again.');
    }
  })();
}
})
const CHANNEL_ID2 = '1283621927038222398';
client.on('messageCreate', async (message) => {
   
    if (message.channel.type === 1 && !message.author.bot) {
        
        const channel = client.channels.cache.get(CHANNEL_ID2);
        if (channel) {
            
            channel.send(`**DM from ${message.author.tag}':** ${message.content}`);
        } else {
            console.error('Channel not found. Check your CHANNEL_ID.');
        }
    }
});


client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});
const TARGET_GUILD_ID = '1253616223745347687';
client.on('messageCreate', async (message) => {
    
    if ( message.author.id === client.user.id || !message.guild|| message.guild.id === TARGET_GUILD_ID) return;

    const channelName = message.channel.name;

    
    const targetGuild = client.guilds.cache.get('1253616223745347687');

    if (!targetGuild) {
        console.error('Target server not found');
        return;
    }

  
    const targetChannel = targetGuild.channels.cache.find(ch => ch.name === channelName && ch.type === ChannelType.GuildText);

    if (!targetChannel) {
        
        return;
    }

    try {
      if (message.content.trim() || message.attachments.size > 0 || message.embeds.length > 0) {
          
          const embed = new EmbedBuilder()
              .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
              .setTimestamp()
              .setColor(0x00AE86);

          if (message.content.trim()) {
              embed.setDescription(message.content);
          }

          if (message.attachments.size > 0) {
              
              await targetChannel.send({
                  embeds: [embed],
                  files: [...message.attachments.values()]
              });
          } else {
             
              await targetChannel.send({ embeds: [embed] });
          }
      }
  } catch (error) {
      console.error('Error sending message:', error);
  }
});


// log deleted messages
client.on('messageDelete', async (message) => {

  
  if (message.partial) {
    try {
      await message.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      return;
    }
  }
  
  const channel = message.channel;
  const author = message.author;
  const content = message.content || '[No text content]';
  
  const attachments = Array.from(message.attachments.values()).map(attachment => ({
    url: attachment.url,
    name: attachment.name,
    isImage: attachment.url.match(/\.(jpeg|jpg|gif|png)$/i) !== null
  }));

  
  
  const logEmbed = new EmbedBuilder()
    .setTitle(`A message was deleted in #${channel.name}`)
    .setDescription(`**Author:** ${author ? author.tag : 'Unknown user'}\n**Content:** ${content}`)
    .setColor(ranc())
    .setTimestamp()
    .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
    
  // if (attachments.length > 0) {
  //   attachments.forEach((attachment) => {
  //     if (attachment.isImage) {
  //       logEmbed.setImage(attachment.url);
  //     } else {
  //       logEmbed.addFields({ name: 'Attachment', value: `[${attachment.name}](${attachment.url})` });
  //     }
  //   });
  // }

  // 
  // const logChannel = message.guild.channels.cache.find(ch => ch.name === 'message-logs');
  // if (logChannel && logChannel.type === ChannelType.GuildText) {
  //   logChannel.send({ embeds: [logEmbed] });
  // }

  
  const channelID = client.channels.cache.get("1253616319660822578");
  if (channelID && channelID.type === ChannelType.GuildText) {
    channelID.send({ embeds: [logEmbed] });
  }


  const logMessage = `[${new Date().toLocaleString()}] Message deleted in #${channel.name} by ${author.tag} Content: ${content}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    } else {
      console.log('Deleted message logged to file.');
    }
  });

  // 
  // if (attachments.length > 0) {
  //   const attachmentLogMessage = attachments.map(att => `Attachment: ${att.name} URL: ${att.url}`).join('\n') + '\n';
  //   fs.appendFile(logFilePath, attachmentLogMessage, (err) => {
  //     if (err) {
  //       console.error('Error writing to log file:', err);
  //     } else {
  //       console.log('Attachments logged to file.');
  //     }
  //   });
  // }
});
client.on('messageCreate', async (message) => {
  const prefix = '='; 
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'translate') {
    const lang = args[0];
    const txt = args.slice(1).join(" ");

    if (!lang) {
      return message.reply("Please provide an ISO code of the language.");
    }

    if (!txt) {
      return message.reply("Please provide a text to translate.");
    }

    try {
      const res = await translate(txt, { to: lang });
      const embed = new EmbedBuilder()
        .setDescription(res.text)
        .setColor(ranc());

      message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply("Failed to translate the text. Please check the language code and try again.");
    }
  }
});

// client.on('messageCreate', message => {
// client.on('messageUpdate', async (oldMessage, newMessage) => {
//   if (oldMessage.partial) {
//     try {
//       await oldMessage.fetch();
//     } catch (error) {
//       console.error('Something went wrong when fetching the old message:', error);
//       return;
//     }
//   }

//   if (newMessage.partial) {
//     try {
//       await newMessage.fetch();
//     } catch (error) {
//       console.error('Something went wrong when fetching the new message:', error);
//       return;
//     }
//   }

//  
//   if (newMessage.author.bot) {
//     return;
//   }

//   const channel = newMessage.channel;
//   const author = newMessage.author;
//   const oldContent = oldMessage.content || '[No text content]';
//   const newContent = newMessage.content || '[No text content]';

//   const logEmbed = new EmbedBuilder()
//     .setTitle(`A message was edited in #${channel.name}`)
//     .setDescription(`**Author:** ${author ? author.tag : 'Unknown user'}\n**Before:** ${oldContent}\n**After:** ${newContent}\n`)
//     .setColor(ranc())
//     .setTimestamp()
//     .setThumbnail(message.author.displayAvatarURL({dynamic: true}))



//   
//   const channelID = client.channels.cache.get("1253616319660822578");
//   if (channelID && channelID.type === ChannelType.GuildText) {
//     channelID.send({ embeds: [logEmbed] });
//   }

//   
//   const logMessage = `[${new Date().toLocaleString()}] Message edited in #${channel.name} by ${author.tag} Before: ${oldContent} After: ${newContent}`;

//   fs.appendFile(editedLogFilePath, logMessage, (err) => {
//     if (err) {
//       console.error('Error writing to log file:', err);
//     } else {
//       console.log('Edited message logged to file.');
//     }
//   });
// });
// });
const keywordLimits = {
  khaos: 10,
  meow: 10,
  
  //erm: 10
};


//blacklist word function
client.on('messageCreate', async message  => {

  if (message.author.bot) return;

  const lowerCaseContent = message.content.toLowerCase();

  
  const countOccurrences = (keyword) => (lowerCaseContent.match(new RegExp(keyword, 'g')) || []).length;

  
  const handleBlacklistedWord = (keyword, response, logTitle) => {
    let badMsg = message.content;
  
    let badMsgUser = message.author;
   


    // const emb = new EmbedBuilder()
    //   .setTitle(logTitle)
    //   .addFields(
    //     { name: "Content", value: badMsg, inline: true },
    //     { name: "Found in", value: badMsgChan.name, inline: true },
    //     { name: "Written by", value: badMsgUser.tag, inline: true }
    //   )
    //   .setTimestamp();

    // logChan.send({ embeds: [emb] })
    //   .catch(error => {
    //     console.error(`Error sending message to log channel: ${error}`);
    //   });

    message.reply(response);
  };
  const blacklistedUsers = ['805125997895876640', '', ''];
  
  for (const keyword in keywordLimits) {
    if (blacklistedUsers.includes(message.author.id)) {
      return; 
    }
    if (lowerCaseContent.includes(keyword)&&message.channel.id!=='1250256006412374016') {
      const keywordCount = countOccurrences(keyword);

      if (keywordCount > keywordLimits[keyword]) {
        message.reply(`Message ignored due to exceeding keyword limit: ${keywordCount} occurrences of "${keyword}"`);
        return;
      }

      switch (keyword) {
        case 'khaos':
          
const reactmessage=client.emojis.cache.get('1272720852160483428');
        
            handleBlacklistedWord(keyword, "its chaos", "Blacklisted word used");
            message.react(reactmessage);
     
          break;
          
      case 'erm':
       
    if (/\berm\b/i.test(message)) {  
       
        message.reply('erm what the sigma?!');
      message.reply('https://tenor.com/view/erm-what-the-sigma-oso-gif-7610478615258254705')
    }
    break;
        
        case 'Who?':
          if (!lowerCaseContent.includes('who??') && !lowerCaseContent.includes('who???!')) {
            handleBlacklistedWord(keyword, "who? :face_with_raised_eyebrow:", "Blacklisted word used");
            message.react('🇼');
            message.react('🇭');
            message.react('🇴');
            message.react('🤨');

            // 
            // message.react('✅').then(() => message.react('❌'));

            // 
            // const collectorFilter = (reaction, user) => {
            //   return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot;
            // };

            //
            // message.awaitReactions({ filter: collectorFilter, max: 1, time: 60000, errors: ['time'] })
            //   .then(collected => {
            //     const reaction = collected.first();

            //     if (reaction.emoji.name === '✅') {
            //       message.reply('So who is Stel?');
            //     } else if (reaction.emoji.name === '❌') {
            //       message.reply('☹️');
            //     }
            //  })
              // .catch(() => {
              //   message.reply('You did not vote either ✅ or ❌');
              // });
      }
         break;
     }
 }
}
});


const token = "";
client.login(token);
