const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json'); 

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log('Started fetching application (/) commands.');

      
        const commands = await rest.get(Routes.applicationCommands(clientId));

        console.log(`Fetched ${commands.length} global application (/) commands.`);

        
        const commandsToKeep = ['yourCommand1', 'yourCommand2']; 

        
        for (const command of commands) {
            if (!commandsToKeep.includes(command.name)) {
                console.log(`Deleting command: ${command.name}`);

                await rest.delete(Routes.applicationCommand(clientId, command.id));
                console.log(`Successfully deleted command: ${command.name}`);
            }
        }

        console.log('Finished deleting unused application (/) commands.');
    } catch (error) {
        console.error('Error deleting commands:', error);
    }
})();
