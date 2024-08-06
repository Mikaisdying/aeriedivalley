require('dotenv').config();
const { Client, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const { handleReaction, handleStoryInteraction } = require('./InteractionStory/storyTelling');
const { registerCommands, handleCharacterInteraction } = require('./CharacterData/createCharacter');
const setupDatabase = require('./CharacterData/setupDatabase');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

async function clearCommands(clientId, token) {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Clearing application (/) commands.');
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    console.log('Successfully cleared application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

client.once('ready', async () => {
  console.log('Bot is ready!');
  const CLIENT_ID = client.user.id;
  await setupDatabase();
  await clearCommands(CLIENT_ID, process.env.TOKEN);
  await registerCommands(CLIENT_ID, process.env.TOKEN);
});

client.on('messageReactionAdd', (reaction, user) => handleReaction(client, reaction, user));

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    await handleCharacterInteraction(interaction);
  } else if (interaction.isMessageComponent()) {
    await handleStoryInteraction(interaction, client);
  }
});

client.login(process.env.TOKEN);