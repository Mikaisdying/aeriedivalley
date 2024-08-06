const { REST, Routes } = require('discord.js');
const { addCharacter } = require('./dataHandling');

const commands = [
  {
    name: 'addcharacter',
    description: 'Ghi chú nhân vật của bạn.',
    options: [
      {
        name: 'name',
        type: 3,
        description: 'Tên thường gọi của nhân vật',
        required: true,
      },
      {
        name: 'witch',
        type: 3,
        description: 'Pháp danh',
        required: true,
      },
      {
        name: 'ability',
        type: 3,
        description: 'Pháp lực bẩm sinh',
        required: true,
      },
    ],
  },
];

async function registerCommands(clientId, token) {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('Successfully reloaded application (/) commands.');

    await logCommands(clientId, token);
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

async function logCommands(clientId, token) {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Fetching registered application (/) commands.');
    const registeredCommands = await rest.get(Routes.applicationCommands(clientId));
    console.log('Registered commands:', registeredCommands);
  } catch (error) {
    console.error('Error fetching commands:', error);
  }
}

async function handleCharacterInteraction(interaction) {
  if (interaction.isCommand() && interaction.commandName === 'addcharacter') {
    console.log('Handling addcharacter command.');
    await addCharacter(interaction);
  } else {
    console.log('Unknown command interaction:', interaction.commandName);
  }
}

module.exports = {
  registerCommands,
  handleCharacterInteraction,
};
