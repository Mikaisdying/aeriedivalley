const { REST, Routes } = require('discord.js');
const { addCharacter } = require('./dataHandling');

const commands = [
  {
    name: 'addcharacter', // Đảm bảo tất cả các ký tự là chữ thường và không có khoảng trắng
    description: 'Ghi chú nhân vật của bạn.',
    options: [
      {
        name: 'name', // Đảm bảo tất cả các ký tự là chữ thường và không có khoảng trắng
        type: 3, // STRING
        description: 'Tên thường gọi của nhân vật',
        required: true,
      },
      {
        name: 'witch', // Đảm bảo tất cả các ký tự là chữ thường và không có khoảng trắng
        type: 3, // STRING
        description: 'Pháp danh',
        required: true,
      },
      {
        name: 'ability', // Đảm bảo tất cả các ký tự là chữ thường và không có khoảng trắng
        type: 3, // STRING
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
