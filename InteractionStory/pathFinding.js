const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const userDirections = new Map(); 

const directions = ['Sang trái', 'Sang phải', 'Đi thẳng', 'Dùng phép thuật đi xuyên qua đường cụt'];

async function handleWentByYourself(interaction, client) {
  // Select a random direction for the user
  const chosenDirections = Array.from({ length: 3 }, () => directions[Math.floor(Math.random() * directions.length)]);
  userDirections.set(interaction.user.id, { chosenDirections, step: 0, correctCount: 0 });

  // Send initial direction message
  await sendDirectionMessage(interaction, chosenDirections[0], client);
}

async function sendDirectionMessage(interaction, direction, client) {
  const directionEmbed = new EmbedBuilder()
    .setDescription(`Chọn đường:\n1. ${directions[0]}\n2. ${directions[1]}\n3. ${directions[2]}`);

  const directionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('acknowledged')
      .setLabel('Đã hiểu')
      .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
      .setCustomId('hahaletmefollowyou')
      .setLabel('Haha... Đi theo cô ấy thôi.')
      .setStyle(ButtonStyle.Primary),
  );

  await interaction.reply({ embeds: [directionEmbed], components: [directionRow] });
}

async function handleDirectionAck(interaction, client) {
  const userId = interaction.user.id;
  const userChoice = userDirections.get(userId);

  if (!userChoice) return;

  const { chosenDirections, step, correctCount } = userChoice;

  if (step < 3) {
    const direction = chosenDirections[step];
    await interaction.update({ content: `Bạn đã chọn đường: ${direction}`, components: [] });

    setTimeout(async () => {
      const directionEmbed = new EmbedBuilder()
        .setDescription(`Bạn đang đi dạo trong rừng. Bạn nên đi đâu tiếp?`);

      const directionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('Sang trái')
          .setLabel('Sang trái')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('Sang phải')
          .setLabel('Sang phải')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('Đi thẳng')
          .setLabel('Đi thẳng')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('Dùng phép thuật đi xuyên qua đường cụt')
          .setLabel('Dùng phép thuật đi xuyên qua đường cụt')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.followUp({ embeds: [directionEmbed], components: [directionRow] });

      // Update directions with '?' after 30 seconds
      setTimeout(() => {
        interaction.editReply({
          content: interaction.message.content.replace(direction, '?'),
          components: []
        });
      }, 30000);
    }, 1000); // Delay for the follow-up message

    userDirections.set(userId, { chosenDirections, step: step + 1, correctCount });
  }
}

async function handleDirectionChoice(interaction, client) {
  const userId = interaction.user.id;
  const userChoice = userDirections.get(userId);

  if (!userChoice) return;

  const { chosenDirections, step, correctCount } = userChoice;
  const direction = chosenDirections[step - 1];
  const correctSequence = Array.from({ length: 3 }, () => directions[Math.floor(Math.random() * directions.length)]);
  const isCorrect = interaction.customId === correctSequence[correctCount];

  if (isCorrect) {
    const messages = [
      'Bạn đã đi đúng hướng lần 1!',
      'Bạn đã đi đúng hướng lần 2!',
      'Bạn đã đi đúng hướng lần 3!'
    ];

    await interaction.reply(messages[correctCount]);
    userDirections.set(userId, { chosenDirections, step, correctCount: correctCount + 1 });
  } else {
    const messages = [
      'Bạn đã đi sai hướng lần 1!',
      'Bạn đã đi sai hướng lần 2!',
      'Bạn đã đi sai hướng lần 3!'
    ];

    await interaction.reply(messages[correctCount]);
    userDirections.set(userId, { chosenDirections, step, correctCount: 0 }); // Reset correctCount on wrong choice
  }

  if (step < 3) {
    await sendDirectionMessage(interaction, chosenDirections[step], client);
  }
}

module.exports = {
  handleWentByYourself,
  handleDirectionAck,
  handleDirectionChoice,
};
