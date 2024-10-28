const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');


const REQUIRED_ROLE_ID = '';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search-edited')
        .setDescription('Search for edited messages')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('The user to search for')
                .setRequired(false)),

    async execute(interaction) {
        try {
           
            if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
                return await interaction.reply({
                    content: 'You do not have the required role to use this command.',
                    ephemeral: true  
                });
            }

            await interaction.deferReply(); 

            const user = interaction.options.getString('user');
            const messageContent = interaction.options.getString('message');

            if (!user && !messageContent) {
                return await interaction.editReply('Please provide a user or message content to search for.');
            }

            const logFilePath = 'C:\\Users\\Administrator\\Downloads\\log\\duels ekittens\\edited_messages.log';
            const data = fs.readFileSync(logFilePath, 'utf-8');
            const logEntries = data.split('\n').filter(line => line.trim() !== '');

            let results = logEntries;

            if (user) {
                results = results.filter(entry => {
                    const userMatch = entry.match(/edited in #[^\s]* by (.+?) Content:/);
                    const username = userMatch ? userMatch[1].trim() : '';
                    return username.toLowerCase().includes(user.toLowerCase());
                });
            }

            if (messageContent) {
                results = results.filter(entry => {
                    const contentMatch = entry.match(/Content: (.*)/);
                    const content = contentMatch ? contentMatch[1].trim() : '';
                    return content.toLowerCase().includes(messageContent.toLowerCase());
                });
            }

            if (results.length === 0) {
                return await interaction.editReply('No deleted messages found matching your criteria.');
            }

        
            const formattedResults = results.map(entry => {
                const dateMatch = entry.match(/^\[(.*?)\]/);
                const channelMatch = entry.match(/edited in (#[^\s]*)/);
                const userMatch = entry.match(/edited in #[^\s]* by (.+?) Content:/);
                const contentMatch = entry.match(/Content: (.*)/);

                const date = dateMatch ? dateMatch[1] : '[Unknown date]';
                const channel = channelMatch ? channelMatch[1] : '[Unknown channel]';
                const username = userMatch ? userMatch[1].trim() : '[Unknown user]';
                const content = contentMatch ? contentMatch[1].trim() : '[No text content]';

                return `[${date}] Message edited in ${channel} written by ${username}\nContent: ${content}`;
            });

          
            const embeds = [];
            const itemsPerPage = 5; 
            for (let i = 0; i < formattedResults.length; i += itemsPerPage) {
                const embed = new EmbedBuilder()
                    .setTitle('Deleted Messages')
                    .setDescription(formattedResults.slice(i, i + itemsPerPage).join('\n\n'))
                    .setFooter({ text: `Page ${Math.floor(i / itemsPerPage) + 1} of ${Math.ceil(formattedResults.length / itemsPerPage)}` });
                embeds.push(embed);
            }

           
            let currentPage = 0;

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previousbtn')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('nextbtn')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Secondary)
                );

            const paginatedMessage = await interaction.editReply({
                embeds: [embeds[currentPage]],
                components: [row]
            });

            const collector = paginatedMessage.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 60000
            });

            collector.on('collect', async i => {
                if (i.customId === 'previousbtn') {
                    if (currentPage > 0) currentPage--;
                } else if (i.customId === 'nextbtn') {
                    if (currentPage < embeds.length - 1) currentPage++;
                }

                await i.update({
                    embeds: [embeds[currentPage]],
                    components: [row]
                });
            });

            collector.on('end', () => {
                row.components.forEach(button => button.setDisabled(true));
                paginatedMessage.edit({ components: [row] });
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply('An error occurred while processing your request.');
        }
    },
};
