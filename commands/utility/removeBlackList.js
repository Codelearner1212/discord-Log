const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Colors } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeblacklist')
        .setDescription('Remove a user from the blacklist')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove from the blacklist')
                .setRequired(true)),

    async execute(interaction) {
        const requiredRole = ''; 
        const userToRemove = interaction.options.getUser('user');
        const userIdToRemove = userToRemove.id;

      
        if (!interaction.member.roles.cache.has(requiredRole)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

       
        const blacklistFilePath = path.join(__dirname, 'Blacklist.txt');

        
        fs.readFile(blacklistFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Failed to read Blacklist.txt:', err);
                return interaction.reply({ content: 'Failed to read the blacklist file.', ephemeral: true });
            }

          
            let blacklist = data.split('\n').filter(id => id.trim() !== '');

       
            const initialLength = blacklist.length;
            blacklist = blacklist.filter(id => id !== userIdToRemove);

            if (blacklist.length === initialLength) {
                
                return interaction.reply({ content: `User ${userToRemove.tag} was not found in the blacklist.`, ephemeral: true });
            }

          
            fs.writeFile(blacklistFilePath, blacklist.join('\n'), 'utf8', (err) => {
                if (err) {
                    console.error('Failed to write to Blacklist.txt:', err);
                    return interaction.reply({ content: 'Failed to update the blacklist file.', ephemeral: true });
                }

                
                const blacklistChannelId = ''; 
                const blacklistChannel = interaction.client.channels.cache.get(blacklistChannelId);

                if (!blacklistChannel) {
                    return interaction.reply({ content: 'Blacklist channel not found.', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setTitle('User Removed from Blacklist')
                    .setDescription(`**User:** ${userToRemove.tag}\n**ID:** ${userToRemove.id}`)
                    .setThumbnail(userToRemove.displayAvatarURL({ dynamic: true }))
                    .setColor(Colors.Green) 
                    .setTimestamp();

                blacklistChannel.send({ embeds: [embed] });

                interaction.reply({ content: `User ${userToRemove.tag} has been removed from the blacklist.`, ephemeral: true });
            });
        });
    },
};
