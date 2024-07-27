const { REST, Routes } = require('discord.js');
const { addCharacter } = require('./dataHandling');

const commands = [
  {
    name: 'addcharacter',
    description: 'Add a new character',
    options: [
      {
        name: 'common_name',
        type: 3, // STRING
        description: 'Common name of the character',
        required: true,
      },
      {
        name: 'religious_name',
        type: 3, // STRING
        description: 'Religious name of the character',
        required: true,
      },
      {
        name: 'innate_ability',
        type: 3, // STRING
        description: 'Innate ability of the character',
        required: true,
      },
    ],
  },
];

async function registerCommands(clientId, token) {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Started refreshing application (/) commands.');
    const response = await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

async function handleCharacterInteraction(interaction) {
  if (interaction.isCommand() && interaction.commandName === 'addcharacter') {
    await addCharacter(interaction);
  }
}

module.exports = {
  registerCommands,
  handleCharacterInteraction,
};
