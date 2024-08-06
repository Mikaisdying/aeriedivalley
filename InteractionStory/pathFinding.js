const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const userDirections = new Map();

const directions = ['Sang trái', 'Sang phải', 'Đi thẳng', 'Dùng phép thuật đi xuyên qua đường cụt'];

async function handleWentByYourself(interaction, client) {
  const chosenDirections = Array.from({ length: 3 }, () => directions[Math.floor(Math.random() * directions.length)]);
  userDirections.set(interaction.user.id, { chosenDirections, step: 0, correctCount: 0, hasFailed: false });

  await sendDirectionMessage(interaction, chosenDirections[0], client);
}

async function sendDirectionMessage(interaction, direction, client) {
  const directionEmbed = new EmbedBuilder()
    .setDescription(`“Được, đường đi cũng đơn giản thôi nè, đi tiếp cách tầm hai lăm chain, rồi ${direction},\n\n` +
      `khoảng chừng năm phút đi bộ sau đó sẽ không còn đường đi, khi đó cứ ${directions[1]}. ${directions[2]} xong đến khi thấy dấu đường đất thì ngửa mặt lên trời vỗ tay ba tiếng trước khi đặt chân lên bụi đất nha!\n\n` +
      `Nơi bồ cần đến gọi là **Ma Tháp**, Ma Tháp, nhớ chưa?”\n\n` +
      `“Đoạn cuối là sao vậy?”\n` +
      `“Thì nếu chỉ đi bình thường thôi thì chán quá ó!”`);
    
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

  const { chosenDirections, step, hasFailed } = userChoice;

  if (step < 3 && !hasFailed) {
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
        content: interaction.message.content.replace(chosenDirections[step], '?'),
        components: []
      });
    }, 30000);
    
    userDirections.set(userId, { chosenDirections, step: step + 1, correctCount: 0, hasFailed: false });
  }
}
async function handleDirectionChoice(interaction, client) {
  const userId = interaction.user.id;
  const userChoice = userDirections.get(userId);

  if (!userChoice) return;

  const { chosenDirections, step, correctCount, hasFailed } = userChoice;
  const direction = chosenDirections[step];
  const isCorrect = interaction.customId === direction;

  if (!isCorrect) {
    if (!hasFailed) {
      // Mark as failed and notify the user
      const failMessages = [
        'Bạn đã đi sai hướng lần 1!',
        'Bạn đã đi sai hướng lần 2!',
        'Bạn đã đi sai hướng lần 3!'
      ];

      await interaction.reply(failMessages[correctCount]);

      // Continue to notify user about the remaining steps even though they have failed
      userDirections.set(userId, { chosenDirections, step, correctCount: 0, hasFailed: true });
    } else {
      // If user has already failed, send the final fail message
      const finalFailEmbed = new EmbedBuilder()
        .setTitle('Chấm hết...')
        .setDescription(`Có người tiến vào phạm vi pháp trận!\n\n` +
          `Kiểm tra pháp danh và tuyên thệ!\n\n` +
          `Xin chúc mừng, bạn đã quay vào ô đi lạc vào địa phận Thánh điện. Dù chánh điện cách cả chuỗi, nhưng những tu sĩ lộ rõ vẻ không hài lòng với sự xuất hiện của bạn. Và Chúa của họ cho rằng bạn có chạy trốn thì cũng vô ích thôi. Lưỡi kiếm ngọt lịm xuyên qua cổ bạn. Cứ tưởng là đã thoát khỏi tay tử thần, ai ngờ lại rơi vào tay tử y - một đám tu sĩ mặc đồ tím giống hệt hội đi cùng nhỏ tóc đỏ bạn nãy!\n\n` +
          `Đầu lìa khỏi cổ, bạn nghe thấy tên kiếm sĩ tóc đỏ vừa chặt bạn như chặt thịt gà hoảng hốt “Đây là khách của Hồi thước mà mấy đứa?!\n\n` +
          `“Ôi Kokariel đại thánh, nhìn xem ngài Lioncourt chém khách của Hồi thước đại nhân kìa.”\n\n` +
          `6s kết thúc.`);

      await interaction.reply({ embeds: [finalFailEmbed], components: [] });
      userDirections.delete(userId); // Clear user directions after failing
    }
  } else {
    const successMessages = [
      'Bạn đã đi đúng hướng lần 1!',
      'Bạn đã đi đúng hướng lần 2!',
      'Bạn đã đi đúng hướng lần 3!'
    ];

    await interaction.reply(successMessages[correctCount]);

    const newCorrectCount = correctCount + 1;
    if (newCorrectCount === 3) {
      // If all three answers are correct, send final message
      const finalEmbed = new EmbedBuilder()
        .setDescription(`Sau một hồi đi qua những con phố đông đúc, bạn cuối cùng cũng đến được chân Ma Tháp.\n\n` +
          `Lính gác tính cản bạn, nhưng…\n\n` +
          `“Để người đó tiến vào đi, khách của Hồi Thước.” Một thanh niên tóc đỏ đã nói đỡ cho bạn. Dường như bạn đã gặp người này ở đâu đó, có điều không để lại ấn tượng để có thể chen nhau “Chúc một ngày tốt lành, ngài Lioncourt” như vài người qua đường chợt tiến lại gần. Lính gác thúc giục bạn vào trong.\n\n`);
      
      const finalRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('towerfront')
          .setLabel('Trước cổng Ma Tháp')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ embeds: [finalEmbed], components: [finalRow] });
      userDirections.delete(userId); // Clear user directions after completing the quest
    } else {
      userDirections.set(userId, { chosenDirections, step: step + 1, correctCount: newCorrectCount, hasFailed: false });
      if (step < 2) {
        await sendDirectionMessage(interaction, chosenDirections[step + 1], client);
      }
    }
  }
}


module.exports = {
  handleWentByYourself,
  handleDirectionAck,
  handleDirectionChoice
};
