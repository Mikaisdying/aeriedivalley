const {
  PermissionsBitField,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder
} = require('discord.js');
require('dotenv').config();

const { handleWentByYourself, handleDirectionAck, handleDirectionChoice } = require('./pathFinding');


const userCharacters = new Map();
const messageId = process.env.MESSAGE_ID;
const categoryId = process.env.CATEGORY_ID;


async function handleReaction(client, reaction, user) {


  try {
    if (reaction && reaction.message.id === messageId && reaction.emoji.name === '❓') {
      await reaction.users.remove(user.id);

      const guild = reaction.message.guild;
      const category = guild.channels.cache.get(categoryId);

      if (!category) {
        console.log(`Category with ID ${categoryId} not found.`);
        return;
      }

      const existingChannel = guild.channels.cache.find(
        channel => channel.name === user.username && channel.parentId === categoryId
      );

      if (existingChannel) {
        console.log(`Channel with name ${user.username} already exists in category ${categoryId}.`);
        await user.send(`Bạn đã bắt đầu câu chuyện tại đây: ${existingChannel.url}`);
        return;
      }

      const newChannel = await guild.channels.create({
        name: user.username,
        type: ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
            deny: [
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.CreatePublicThreads,
              PermissionsBitField.Flags.CreatePrivateThreads,
              PermissionsBitField.Flags.AddReactions,
            ]
          },
        ],
      });
      

      const characters = ['Vitoria','Gilbert','Zircon'];
      let chosenCharacter = characters[Math.floor(Math.random() * characters.length)];
      
      userCharacters.set(user.id, chosenCharacter);

      await sendInitialMessage(client, newChannel, chosenCharacter, user);
    }
  } catch (error) {
    console.error('Error handling reaction:', error);
  }
}

async function sendInitialMessage(client, channel, chosenCharacter, user) {
  const messages = {
    'Vitoria': {
      embeds: [
        new EmbedBuilder()
          .setTitle('Đối mặt')
          .setDescription(`
  Nhìn kìa, ${user}!
  Một nhóm người mặc đồng phục xuất hiện trong tầm mắt bạn.
  Đi đầu là một cô gái tóc đen. Mái tóc được cắt gọn gàng, đôi mắt sắc lẹm.
  Cô ta đeo một cái gọng kính mỏng theo kiểu mấy nhà hiền triết già, nhưng khuôn mặt trẻ măng đó không tạo điều kiện cho cô ta tỏ vẻ trưởng thành.
  Có vẻ cô ta đã thấy bạn.
  
  “Tại sao ngươi lại ở đây?”
  
  Cô ta liếc bạn một cái. Rất nhanh.
  Đó là ánh mắt của loài thú săn mồi.
  
  “Ngươi không phải công dân của Thung lũng… ngươi là ai?”`)
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`speak-${user.id}`)
            .setLabel('Nói')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`silent-${user.id}`)
            .setLabel('Im lặng')
            .setStyle(ButtonStyle.Secondary)
        )
      ]
    },
    'Gilbert': {
      embeds: [
        new EmbedBuilder()
          .setTitle('Đối mặt')
          .setDescription(`
Nhìn kìa, ${user}!
Một nhóm người mặc đồng phục xuất hiện trong tầm mắt bạn.

Đi đầu là một chàng trai cao lớn. Mái tóc trắng bạc được vuốt gọn gàng, nổi bật hơn cả là đôi mắt màu đỏ tím của anh ta. 
Dù sở hữu thân hình cao lớn nhưng biểu cảm trên khuôn mặt lại khá thân thiện. 
Anh ấy trông không đáng sợ lắm…

Có vẻ anh ấy đã nhìn thấy bạn. 
“Bạn là ai thế?” 
Anh ấy tiến tới, có vẻ đang đánh giá bạn.
`)
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`facinggil-${user.id}`)
            .setLabel('Đối mặt')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`fleegil-${user.id}`)
            .setLabel('Bỏ chạy')
            .setStyle(ButtonStyle.Secondary)
        )
      ]
    },
    
    'Zircon': {
      embeds: [
        new EmbedBuilder()
          .setTitle('Đối mặt')
          .setDescription(`
Những kẻ ngạo mạn chẳng thèm giấu sự hiện diện của bản thân, chúng khoác trên mình pháp phục đen tuyền với viền bạc lẹm như lưỡi kiếm. Một tốp tám người tiến vào tầm mắt bạn, bảy tu sĩ vây quanh một cô gái tóc đỏ mận cột hai bên. Cách đôi mắt vàng của cô ta bám riết lấy bạn ở khoảng cách xa như vậy khiến bạn rùng mình, tựa như có một con trăn trườn bò lên chân, chực chờ siết chặt cơ thể bạn.

“Đằng ấy là ai vậy?” Chữ “vậy” ngọng líu lo thành chữ “dợ”, chẳng biết từ lúc nào, cô ấy chợt xuất hiện ngay bên cạnh bạn cùng cây lưỡi hái cao hơn chủ nhân nó hai cái đầu, lạnh lùng tra sát trên cổ bạn.

${user}, bạn sẽ làm gì?
`)
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`fighted-${user.id}`)
            .setLabel('Đối mặt')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`frozen-${user.id}`)
            .setLabel('Bỏ chạy')
            .setStyle(ButtonStyle.Secondary)
        )
      ]
    }
  };

  const message = messages[chosenCharacter] || messages['default'];

  await channel.send({
    embeds: message.embeds || [],
    content: message.content || '',
    components: message.components || []
  });

}

async function handleStoryInteraction(interaction, user) {
  try {
    if (!interaction.isButton()) return;
    const chosenCharacter = userCharacters.get(interaction.user.id);
    const userId = interaction.customId.split('-').pop();
    const action = interaction.customId.replace(`-${userId}`, '');


    const followUpMessages = {
      'speak': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Nói')
          .setDescription( `Bạn định mở miệng đáp lại thì cô ta đã giơ tay ra dấu “dừng”.
  
  
  “Ta nghĩ là ta cũng không cần biết chuyện đó. Ta cũng không quan tâm ngươi ở đây vì cớ gì cả. Bây giờ, đi theo ta, đừng cố gắng chống cự.”
  
  
  Những người đi cùng cô ta đã sớm tản ra bao vây lấy bạn.
  
  
  Nên làm gì bây giờ?
  `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`submit-${user.id}`)
            .setLabel('Phục tùng')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`resist-${user.id}`)
            .setLabel('Phản kháng')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
      'silent': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Im lặng')
          .setDescription( `Bạn không định trả lời cô ta. Cô ta cũng đã giới thiệu bản thân đâu?
  Nhưng cô ta cũng chẳng cần bạn trả lời.
  
  
  “Ngươi là ai hay ngươi ở đây làm gì cũng thế cả thôi. Bây giờ, đi theo ta, đừng cố gắng chống cự.”
  
  
  Những người đi cùng cô ta đã sớm tản ra bao vây lấy bạn.
  
  
  Nên làm gì bây giờ?
  `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`submit-${user.id}`)
            .setLabel('Phục tùng')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`resist-${user.id}`)
            .setLabel('Phản kháng')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
      'submit': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Phục tùng')
          .setDescription( `Thôi được rồi, lấy một địch một đội không phải lựa chọn tốt. Bạn cũng không chắc chắn bạn sẽ toàn thây trở ra.
  Thế nên bạn giơ cả hai tay lên trời.
  Vậy mà cô ta lại xua tay.
  
  
  “Thôi khỏi. Xin người. Cứ đi theo là được.”
  
  
  Không cả trói lại luôn sao?
  
  
  “Vì có trói hay không ngươi cũng chẳng chạy được.”
  
  
  Một nụ cười hiếm hoi xuất hiện trên môi cô ta.
  `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`follow-${user.id}`)
            .setLabel('Đi theo')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
      'resist': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Phản kháng')
          .setDescription( `Tình hình lúc này trông không khả quan lắm, nhất là khi một nhóm người lạ mặt từ đâu chạy đến bao vây lấy bạn.
  Lựa chọn tốt nhất lúc này là bỏ chạy.
  Không cần biết phải chạy đến đâu, bây giờ phải thoát khỏi chỗ này trước đã.
  
  
  Bạn chỉ mới lùi về phía sau một bước thì đã bị cô gái kia để ý.
  Nụ cười trên môi cô ả ngay lập tức biến mất.
  “Bắt kẻ kia lại.”
  Những người đi cùng cô ta nhanh chóng hướng vũ khí về phía bạn, chỉ cần nhận được mệnh lệnh là bạn sẽ nằm gục giữa vũng màu.
  
  
  Nhưng thứ chờ đợi bạn lại chẳng phải cơn đau.
  Mà cô ta bước tới nắm lấy đầu bạn.
  
  
  “Lần sau, hãy nghĩ kỹ trước khi làm.”
  
  
  Rồi bạn chẳng cảm thấy gì nữa.
  [Kết thúc]`)],
        components: []
      },
      'follow': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Đi theo')
          .setDescription( `Dù đã lựa chọn đi theo nhưng bạn không cảm thấy thoải mái cho lắm.
  Nhất là khi bị một đống người bao vây xung quanh như vậy, chẳng khác nào áp giải phạm nhân cả.
  
  
  “Ngươi có biết mình đang ở đâu hay không?”
  
  
  Cô gái tóc đen lại hỏi bạn.
  `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`unknown-${user.id}`)
            .setLabel('Chưa từng')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`known-${user.id}`)
            .setLabel('Đã biết')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
      'unknown': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Chưa từng')
          .setDescription(`Cô gái kia chau mày sau khi nghe câu trả lời của bạn.
  Nhận ra không khí càng ngày càng nặng nề, một cô gái đã đứng ra giải thích cho bạn, cũng để xua đi phần nào sự căng thẳng.
  “Đây là Aerie á. Đằng ấy đã nghe thấy tên về nơi này bao giờ chưa?”
  
  
  Hình như bạn đã từng nghe thấy cái tên này ở đâu đó. Có lẽ là ở trong những lời đồn đại được lưu truyền giữa các phù thuỷ.
  
  
  Một thứ mà văn hóa phương Đông gọi là “thế ngoại đào viên”.
  Nơi ấy được gọi là Thung Lũng Aerie.
  `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`crewjoin-${user.id}`)
            .setLabel('Cùng đoàn người')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
      'known': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Đã biết')
          .setDescription(`Đối diện với áp lực đến từ việc bị một đống người bao vây, bạn chần chừ một lúc.
  Cuối cùng vẫn gật đầu tỏ ý bản thân đã biết.
  
  
  Phải ngớ ngẩn tới mức nào mới không biết đây là đâu.
  Nhìn đội bảo an kia đi. Nếu có một đội ngũ tinh nhuệ như vậy xuất hiện tại thung lũng vắng lặng lại thì có thể là Aerie thôi.
  
  
  Hẳn rồi, đây là Thung lũng duy nhất gìn giữ được hòa bình, thứ xuất hiện trong lời đồn được lưu truyền giữa các phù thuỷ.
  `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
          .setCustomId(`crewjoin-${user.id}`)
          .setLabel('Cùng đoàn người')
          .setStyle(ButtonStyle.Secondary)
        )]
      },
      'crewjoin':{
        embeds: [
          new EmbedBuilder()
          .setTitle('Cùng đoàn người')
          .setDescription(`Cô gái tóc đen… đội trưởng kia giữ im lặng suốt dọc đường.
  Những người còn lại trông thoải mái hơn, họ cười đùa vui vẻ không ngớt.
  Nói đủ thứ chuyện trên trời dưới bể.
  … họ cũng chỉ là những con người bình thường.
  Hoặc là, Phù thủy bình thường.
  
  
  Bỗng một người quay sang nói với bạn.
  “May mà cậu gặp được tụi tôi chứ không phải chó điên đấy!
  `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`who-${user.id}`)
            .setLabel('“Là ai thế?”')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
     
      'who': {
        embeds: [
          new EmbedBuilder()
          .setTitle('”Là ai thế?”')
          .setDescription(`Bạn nhướn mày một chút.
  Có vẻ người nói chuyện với bạn cũng hiểu rằng bạn chả biết cái người bị gọi là chó điên kia là ai cả.
  “Là Gilbert.”
  
  
  Người đó cười cười mà kể tiếp.
  “Gilbert ấy à… hắn là một con quỷ đội lốt người, cực kỳ tàn bạo và xảo quyệt. Đã không ít lần hắn gieo rắc nỗi kinh hoàng khắp nơi, không từ thủ đoạn để đạt được mục đích. Máu nhuốm đỏ móng vuốt sắc nhọn của Gilbert luôn. Những linh hồn yếu đuối nào kém may mắn mà rơi vào tay Gilbert thì coi như xong.”
  
  
  “Lạ ở chỗ Thủ hộ giả lại thu nhận một ác quỷ khét tiếng như Gilbert.”
  `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`askfurther-${user.id}`)
            .setLabel('Hỏi thêm')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`stopasking-${user.id}`)
            .setLabel('Không hỏi')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
      'askfurther':{
        embeds: [
          new EmbedBuilder()
          .setTitle('Hỏi thêm')
          .setDescription(`“Gilbert không chỉ tàn bạo mà còn vô cùng xảo trá. Hắn luôn giấu đằng sau vẻ ngoài đáng sợ của mình là những âm mưu đen tối và thâm hiểm.”
  
  
  “...”
  
  
  “Người ta gọi hắn là Dã Khuyển Phù Thủy đấy.”
  
  
  “Chó diên.”
  
  
  “Điên cực kỳ luôn.”
  
  
  Cảm giác như cô gái tóc đen tính thở dài mà lại thôi.
  `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`whisper-${user.id}`)
            .setLabel('Lao xao')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
      'stopasking':{
        embeds: [
          new EmbedBuilder()
          .setTitle('Không hỏi')
          .setDescription(`“Cái đội đó cũng chẳng ra làm sao hết.”
  
  
  “Toàn mấy đứa đâu đâu í. Hừ…”
  
  
  “...”
  
  
  “Bên đó có một thằng chuyên đi xàm quần.”
  
  
  “Cả một đứa tham ăn nữa. Con mẻ ăn hết nửa cái quán nhà người ta ấy.”
  
  
  “Có trả tiền không?”
  
  
  “Ừ thì có nhưng mà…”
  
  
  `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`whisper-${user.id}`)
            .setLabel('Lao xao')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
      'whisper': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Lao xao')
          .setDescription( `Đủ loại âm thanh từ tứ phía ập đến, những câu chuyện trên trời dưới biển khiến bạn cảm thấy… chán làm sao.
  Bạn chẳng buồn theo tiết tấu nữa.
  
  
  Màu lam nhạt của trời, màu trắng tinh khôi của mây.
  Sóng nước xô lăn tăn trên mặt hồ, tia nắng đáp nhẹ xuống những tán cây cùng gió vui đùa.
  Và cả tiếng chim hót.
  Thật… yên bình. Thật thơ mộng.
  
  
  Từ lúc nào bạn không chú ý, không khí đã trở nên hài hoà và dễ chịu hơn.
  Chủ đề của cuộc hội thoại cũng thay đổi.
  
  
  Một ai đó đã bắt đầu kể về quá khứ, những câu chuyện xưa cũ và những kỷ niệm đã phủ bụi mờ.
  “Ngày xưa ấy à…”
  Giữa tiếng hát của những tán cây, có một câu lọt được vào tai bạn.
  `)],
  components: [new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`eavesdrop-${user.id}`)
      .setLabel('Nghe lén')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`ignore-${user.id}`)
      .setLabel('Mặc kệ')
      .setStyle(ButtonStyle.Secondary)
  )]
  },
  
  
  'eavesdrop': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Nghe lén')
          .setDescription( `Bạn không có ý nghe lén. Chẳng qua câu chuyện cứ tự chạy vào tai bạn thôi.
  
  
  “Nếu ngày xưa không có Ngự Hồn Phù Thủy thì giờ chắc không có Aerie ha?”
  
  
  “Kiểu gì cũng có người mang vai trò đó thôi. Nghe đồn Nguyệt tỷ hồi đó cũng từng hỗ trợ nhiều Phù thủy trẻ lắm, chắc nếu muốn cũng đào tạo ra được vài ba Ngự Hồn.”
  
  
  “Cuộc chiến đó phá hủy gần như mọi thứ sót lại của vương quốc ngày xưa…”
  
  
  Câu chuyện dường như không có hồi kết.
  `)],
  components: [new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ignore-${user.id}`)
      .setLabel('Mặc kệ')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`witch-${user.id}`)
      .setLabel('Về Ngự Hồn Phù Thủy')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`moon-${user.id}`)
      .setLabel('Về mặt trăng rực sáng')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`kingdom-${user.id}`)
      .setLabel('Về vương quốc đã mất')
      .setStyle(ButtonStyle.Secondary)
  )]
  },
  
  
  'ignore': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Mặc kệ')
          .setDescription(`Nghe đến đấy thôi, dù sao cũng không phải chuyện của bạn, quan tâm làm gì cơ chứ.
  Đời đủ nhiều thứ cần quan tâm rồi.
  Tốt nhất là nên tìm chút niềm vui nhỏ bé từ thiên nhiên cỏ cây hay cái gì đó đại loại thế là được.
  
  
  Những chiếc lá phong rơi.
  Mùi olive thoang thoảng trong không gian.
  
  
  Kể cả khi rời khỏi cánh rừng, tiến vào khu vực người ta sinh sống,
  Mùi olive vẫn còn đó.
  `)],
  components: [new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`tower-${user.id}`)
      .setLabel('Ma Tháp')
      .setStyle(ButtonStyle.Secondary)
  )]
  },
  
  
  'witch': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Về Ngự Hồn Phù Thủy')
          .setDescription( `Nghe có vẻ thú vị, bạn đi gần họ hơn chút để nghe rõ hơn.
  “Ngự Hồn Phù Thủy là ai thế?”
  
  
  “Ngự Hồn Phù Thủy có tên thật là Evelynn Erie á.”
  
  
  “Cái Phép thuật Bẩm sinh của bả cũng hay nữa, nó cho phép bà ấy hiểu được bất kỳ ai!”
  
  
  “Thế thì sẽ chẳng có cãi nhau nữa nhỉ?”
  
  
  “Sao thế được. Người biết về bà ấy chia thành hai phe: một là thích bà ấy; hai ngược là những người không thích bà ấy chút nào. Ghét thậm ghét tệ luôn ấy chứ.”
  
  
  “Vì thế mà hai phe này thường gây gổ với nhau.”
  
  
  “Nhưng hiện tại Ngự Hồn Phù Thủy đã mất tích rồi. Không ai biết bà ấy giờ đang ở đâu hết.”
  `)],
  components: [new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`tower-${user.id}`)
      .setLabel('Ma Tháp')
      .setStyle(ButtonStyle.Secondary)
  )]
  },
  'moon': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Về mặt trăng rực sáng')
          .setDescription( `Nghe có vẻ thú vị, bạn đi gần họ hơn chút để nghe rõ hơn.
  “Nguyệt tỷ là ai cơ?”
  
  
  “Nguyệt tỷ trong Tinh Nguyệt tỉ muội ấy!”
  
  
  “Bà ấy là Tân Nguyệt Phù Thủy, tên thật là Esther á nha. Họ thì chẳng ai biết cả…”
  
  
  “Kỳ cục thế?”
  
  
  “Bà ấy là một trong những Crafter tài năng nhất trong lịch sử. Đằng ấy nghe thấy những Pháp cụ có tận 20 câu Thần chú bao giờ chưa? Toàn của Esther hết á.”
  
  
  “Chúng được coi như là báu vật ai ai cũng muốn sở hữu!”
  
  
  “Thế giờ họ ở đâu rồi?”
  
  
  “Chà, ai biết được?”
  `)],
  components: [new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`tower-${user.id}`)
      .setLabel('Ma Tháp')
      .setStyle(ButtonStyle.Secondary)
  )]
  },
  'kingdom': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Về vương quốc đã mất')
          .setDescription(`Nghe có vẻ thú vị, bạn đi gần họ hơn chút để nghe rõ hơn.
  “Vương quốc ngày xưa là ở nơi nào thế?”
  
  
  “Aerie được xây dựng trên Thung lũng Vô danh, nhưng trước đây ở đây có một Vương quốc á. Tên nó là Auralius.”
  
  
  “Từ bao giờ thế?”
  
  
  “Chả biết. Nhưng nó cũng bị hủy diệt khá lâu rồi. Phù thủy ở đây nhớ về nó vì Auralius được xây dựng nhờ người được đồn đại là Phù thủy Đầu tiên thôi, chứ chả có gì đặc biệt cả.”
  
  
  “Không phải Auralius có một Nguyền sư…”
  
  
  “Shhh! Cô ả không phải người Auralius!”
  
  
  “Rồi rồi. Sao nữa?”
  
  
  “Sau đó Auralius bị hủy diệt. Thung lũng này đổi thành Thung lũng Vô danh tới tận sau Đại chiến…”
  
  
  “À… đó là lý do tại sao Đại chiến Phù thủy lại gọi là Đại chiến Thung lũng Vô danh nhỉ.
  
  
  “Những gì còn sót lại chỉ là lâu đài và nhà thờ cổ, mấy thứ còn lại đều biến mất rồi.”
  `)],
  components: [new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`tower-${user.id}`)
      .setLabel('Ma Tháp')
      .setStyle(ButtonStyle.Secondary)
  )]
  },
  'tower': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Ma Tháp')
          .setDescription(`Câu chuyện của đoàn người vừa hay kết thúc lúc đoàn người dừng lại trước một tòa tháp cao chọc trời.
  
  
  “Đi vào đây để đăng ký.”
  Tóc đen chỉ vào tòa tháp.
  “Phải rồi. Tên ta là Vitoria.”
  
  
  Sau lời giới thiệu ngắn gọn từ Vitoria có một cô gái tóc đỏ tiến tới.
  “Hãy đưa người này lên gặp Thủ hộ giả.”
  Cô gái tóc đỏ nghe vậy liền nhìn về phía bạn. Không nói một lời, cô ấy cúi người đưa tay hướng về phía cầu thang rồi dẫn bạn lên lầu.
  
  
  Qua cầu thang dài với từng bậc đá xếp chồng lên nhau cao vút, hai người các bạn dừng lại trước một cánh cửa lớn.
  Cô gái tóc đỏ gõ nhẹ vào cánh cửa, đợi một chút rồi mới đẩy nó ra.
  
  
  Bạn nhìn thấy một mái tóc màu tím ẩn hiện đằng sau những cuốn sách xếp chồng lên nhau.
  `)],
  components: [new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`girlinbooks-${user.id}`)
      .setLabel('Cô bé ngồi trong đống sách…')
      .setStyle(ButtonStyle.Secondary)
  )]
  },
  'girlinbooks': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Cô bé ngồi trong đống sách…')
          .setDescription( `Đồng thời người ngồi ở đó cũng quay lại nhìn phía bạn.
  “Tên ta là Taeriel Tangra.”
  “Thủ hộ giả của Aerie.”
  
  
  Một tờ giấy bay đến trước mặt bạn.
  Taeriel quay lại với quyển sách đang mở trên bàn.
  
  
  “Để trở thành công dân và được quyền ở lại thì xin hãy đồng ý với Lời Tuyên thệ của Aerie. Nhé?”
  `)],
  components: [new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`contract-${user.id}`)
      .setLabel('Đọc bản khế ước.')
      .setStyle(ButtonStyle.Secondary)
  )]
  },
  
  'facinggil': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Bình tĩnh đối mặt')
          .setDescription( `Người đàn ông cao lớn với nụ cười ấm áp và ánh mắt thân thiện đứng đầu đoàn người.
  Anh ta hình như là người dễ tính nhất xuất hiện ở đây… có vẻ thế.
  
  Tim bạn đập nhanh trong giây lát, bạn ngẩn người một lúc nhưng đã lấy lại bình tĩnh một cách nhanh chóng sau khi nghe câu hỏi của anh ta.
  “Tôi đi lạc.” `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`speakgil-${user.id}`)
            .setLabel('Nói chuyện')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'fleegil': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Bỏ chạy')
          .setDescription( `Mặc dù đối phương luôn duy trì vẻ mặt thân thiện nhưng bạn vẫn cảm nhận được [ác ý] thông qua ánh mắt. 
  Bạn lùi một bước thì người đàn ông tóc trắng liền tiến thêm một bước. 
  Không… Đừng tiến lại thêm nữa!
  Đi đâu cũng được, miễn là bạn không phải chịu đựng thêm nữa.
  
  Ngay lập tức bạn quay đầu chạy đi.
  Bạn đã chạy được vài bước… nhưng khi ngẩng đầu lên đã thấy mình ở vị trí cũ.
  “Xin lỗi nhé.”
  Bạn chưa kịp hiểu toàn bộ câu nói thì tâm trí đã bị cảm giác nhói đau thay thế. 
  
  Thứ cuối cùng bạn nghe được là tiếng xương của chính mình vỡ vụn.
  
  [Kết thúc] `)]},
  
  'speakgil': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Nói chuyện')
          .setDescription( `Nghe vậy, chàng trai tóc trắng dẫn đầu đoàn đội ngỏ ý muốn đi cùng bạn.
  Trong tình huống này thì đi cùng nhiều người sẽ tốt hơn là đi một mình mà ha.
  Bạn gật đầu, xong hòa với nhóm người, bắt đầu thả chậm nhịp thở…
  
  Trong lúc đoàn người di chuyển, chàng trai ấy tiến tới chỗ bạn với điệu cười nhàn nhạt trên môi.
  “Thế bạn có biết bạn đang ở đâu không?”
  
  `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`yesforest-${user.id}`)
            .setLabel('Rồi')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`noforest-${user.id}`)
            .setLabel('Chưa')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'yesforest': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Rồi')
          .setDescription( `Bạn đáp lời bằng một cái gật đầu nhẹ.
  Nơi có những cây phong trồng cùng olive, và luôn lấp lánh dưới ánh mặt trời…
  Đây không phải là một khu rừng bình thường mà chính là rừng Olea nổi tiếng trong lịch sử, là một “thành trì” bao quanh Vương quốc Auralius xưa kia. 
  Người ta nói Vương quốc này là chỗ được Phù thủy Đầu tiên xây dựng.
  
  Cũng là nơi, hiện tại đây, có “thế ngoại đào viên” duy nhất thuộc về Phù thủy.
  
  Bạn như cảm nhận được sự yên bình và tĩnh lặng của khu rừng. 
  Lịch sử phủ bụi được che giấu dưới từng tán lá này, không biết đến bao giờ mới có người để ý… `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`followgil-${user.id}`)
            .setLabel('Đi theo')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'noforest': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Chưa')
          .setDescription( `Bạn bước đi giữa những hàng cây phong và olive, khi nghe câu hỏi ấy bạn đáp lời bằng một cái lắc đầu. 
  Không khí trong rừng mát mẻ và tĩnh lặng, chỉ có tiếng lá xào xạc theo gió và tiếng chim hót thỉnh thoảng vang lên. 
  
  Bỗng nhiên, một người trong nhóm dừng lại mà chen ngang vào không gian im lặng.
  “Đây là rừng Olea.” 
  
  Rừng Olea.
  Bao quanh Vương quốc Auralius thuộc về những ngày xưa cũ.
  Người ta nói Vương quốc này là chỗ được Phù thủy Đầu tiên xây dựng.
  
  Cũng là nơi, hiện tại đây, có “thế ngoại đào viên” duy nhất thuộc về Phù thủy. `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`followgil-${user.id}`)
            .setLabel('Đi theo')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'followgil': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Đi theo')
          .setDescription( `Suốt quãng đường đạp lên lớp lá phong là tiếng nói cười của đoàn người. 
  
  Chàng trai tóc trắng cùng đội của anh ta tiếp tục trò chuyện với nhau, giọng nói của họ thân thiện và dễ mến.
  Họ nói đủ thứ chuyện, từ những điều nhỏ nhặt trong cuộc sống hàng ngày đến những câu chuyện phiêu lưu mà họ từng trải qua. 
  
  Có người tự dưng nói.
  “May mà không phải gặp sát thần bên kia đấy."
  
  Câu nói như thể lời chúc mừng với bạn vì đã tránh được một đại họa vậy.  `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`whovit-${user.id}`)
            .setLabel('”Ai cơ?”')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'whovit': {
        embeds: [
          new EmbedBuilder()
          .setTitle('”Ai cơ?”')
          .setDescription( `Bạn thực sự tò mò về người đó.
  Tại sao lại phải thấy may mắn khi không gặp được người ta cơ?
  
  “Tên cô ả là Vitoria.”
  
  Một người trong đoàn đã nói với bạn bằng một giọng cảm khái. Hoặc người ta cố dọa ma bạn, không biết nữa…
  
  “Chẳng hiểu sao Tangra lại chọn kẻ cuồng tín như thế nhỉ?” `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`askvit-${user.id}`)
            .setLabel('Bắt lấy câu hỏi')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`nocarevit-${user.id}`)
            .setLabel('Không quan tâm')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'askvit': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Bắt lấy câu hỏi')
          .setDescription( `Nghe nhận xét của mọi người về Vitoria khiến bạn tò mò mà bắt đầu hỏi thêm về cô ấy. 
  
  Người ta đổi giọng liền.
  “Victoria ấy à, cô ta cọc tính lắm.” 
  “Đúng vậy, khát máu và khó gần.” 
  Họ kể về những lần chạm trán với Victoria và mô tả cô ta như một người mà không ai muốn đối đầu. 
  
  Bạn nghe mà trong lòng không khỏi thắc mắc vì sao một người như vậy lại tồn tại trong những câu chuyện của họ. 
  Không, phải là, tại sao cô ấy lại còn… ở đây? `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`inthewood-${user.id}`)
            .setLabel('Trong rừng cây')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'nocarevit': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Không quan tâm')
          .setDescription( `Bất ngờ, cuộc trò chuyện chuyển sang đội của Victoria. 
  
  “Đội của Victoria ấy à, chẳng ai muốn dính líu đến họ đâu.”
  “Nghe chuyện chúng nó xiên người còn kéo xác về cho Thủ hộ giả xem chưa?”
  “Eo ơi…”
  “Cô ấy cứng nhắc và khó giao tiếp lắm. Cô ấy thích đi một mình mà chẳng bao giờ hòa đồng với ai.” 
  
  Dù chữ vẫn chui vào tai, bạn không thực sự quan tâm. 
  Tâm trí bạn chỉ tập trung vào khung cảnh rừng Olea xung quanh. `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`inthewood-${user.id}`)
            .setLabel('Trong rừng cây')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'inthewood': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Trong rừng cây')
          .setDescription( `Đủ loại âm thanh từ tứ phía ập đến, những câu chuyện trên trời dưới biển khiến bạn cảm thấy… chán làm sao.
  Bạn chẳng buồn để ý câu chuyện đã trôi tới phương nào nữa.
  
  Màu lam nhạt của trời, màu trắng tinh khôi của mây. 
  Sóng nước xô lăn tăn trên mặt hồ, tia nắng đáp nhẹ xuống những tán cây cùng gió vui đùa.
  Và cả tiếng chim hót.
  Thật… yên bình. Thật thơ mộng.
  
  Và ở đó có
  Mùi của lá phong.
  Mùi của olive.
  Mùi của… sự sống.
  
  Một ai đó đã bắt đầu kể về quá khứ, những câu chuyện xưa cũ và những kỷ niệm đã phủ bụi mờ.
  “Ngày xưa ấy à…”
  Giữa tiếng hát của những tán cây, có một câu lọt được vào tai bạn. `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`ignorant-${user.id}`)
            .setLabel('Mặc kệ')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`joingil-${user.id}`)
            .setLabel('Tham gia cuộc nói chuyện')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'ignorant': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Mặc kệ')
          .setDescription( `Nghe đến đấy thôi, dù sao cũng không phải thứ bạn quan tâm.
  Mọi người có vẻ rất vui, nhưng để ý hay không là quyền của bạn mà.
  
  Giữa mùi hương nhè nhẹ của lá phong và olive,
  Bạn được dẫn vào khu phố náo nhiệt.
  
  Đầy sự sống.
  Đầy niềm vui.
  Ngoài kia…
  
  Bạn hơi nhắm mắt lại.
  
  Ngoài kia thế giới không hạnh phúc như thế.
  Thật tốt. `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`towergil-${user.id}`)
            .setLabel('Ma Tháp')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'joingil': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Tham gia cuộc nói chuyện')
          .setDescription( `Bất ngờ, một chủ đề mới xuất hiện trong cuộc trò chuyện của họ.
  
  “Diêu Tinh Phù Thủy mạnh thật nhỉ? Đến tận giờ tên bà ấy vẫn được nhắc đến… như sao Mai của thế giới này ấy.”
  
  “Nhưng bà ấy đâu có tham gia Đại chiến Phù thủy đâu?”
  
  “Nhưng đồ đệ của bả thì có. Những đứa tự xưng là mặt trời đêm ấy.”
  
  Câu chuyện dường như không có hồi kết. `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`ignorant-${user.id}`)
            .setLabel('Mặc kệ')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`estelle-${user.id}`)
            .setLabel('Chuyện về ánh sao không tắt')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`valleywar-${user.id}`)
            .setLabel('Chuyện về Đại chiến Phù thủy')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`minatsonce-${user.id}`)
            .setLabel('Chuyện về những mặt trời đêm')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'estelle': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Chuyện về ánh sao không tắt')
          .setDescription( `Nghe có vẻ thú vị, bạn đi lại gần họ hơn chút để nghe rõ hơn.
  “Diêu Tinh Phù Thủy là ai thế?” 
  
  “Diêu Tinh Phù Thủy có tên thật chính là Estelle S.”
  
  “Phép thuật của bà ấy có thể cho bà ấy nhìn thấy bản chất của vạn vật á.” 
  
  “Vị Diêu Tinh Phù Thủy ấy quyền năng đến mức đó sao?”
  
  “Đúng vậy. Người ta đồn ai được bà ấy coi là đồ đệ sẽ nhận được Pháp cụ chứa Phép thuật của Estelle, có nghĩa là cũng có khả năng nhìn thấu vạn vật luôn!” 
  
  “Không biết bà ấy còn sống không nhỉ? Giờ xin làm đồ đệ còn kịp không?” 
  
  “Chà, ai biết được? Nếu còn sống, bà ấy sẽ phải hơn trăm tuổi rồi… mà chuyện đó cũng không có gì lạ trong giới Phù thủy mà.” `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`towergil-${user.id}`)
            .setLabel('Ma Tháp')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'valleywar': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Chuyện về Đại chiến Phù thủy')
          .setDescription( `Nghe có vẻ thú vị, bạn đi lại gần họ hơn chút để nghe rõ hơn.
  “Đại chiến Phù Thủy là thế nào thế?” 
  
  “Đại chiến Phù thủy… hay là Đại chiến Thung lũng Vô danh ấy. Chưa nghe bao giờ à?”
  
  “Nó to vậy cơ mà, sao lại chưa bao giờ nghe thấy được?”
  
  “Phải đó phải đó! Nhưng mà Đại chiến thật sự chỉ chia hai phe thôi sao? Thế mà cũng thành Đại chiến?”
  
  “Đúng rồi. Tại họ có lý do để chia phe đánh nhau mà. Ngự Hồn Phù Thủy ấy…”
  
  “Ngự Hồn… điều khiển linh hồn ấy hả?”
  
  “Có tin đồn là thế. Mà thế nên người ta mới chia hai phe.”
  
  “Đừng nói là chia phe người bị điều khiển và người không bị điều khiển nhá hahaha.”
  
  
  “Biết đâu đấy~”
  
  “Thế giờ Phù thủy ấy đâu rồi?”
  
  “Chịu. Nhưng quả thật có Đại chiến đó thì mới có Thung lũng của hiện tại chứ.” `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`towergil-${user.id}`)
            .setLabel('Ma Tháp')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'minatsonce': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Chuyện về những mặt trời đêm')
          .setDescription( `Nghe có vẻ thú vị, bạn đi lại gần họ hơn chút để nghe rõ hơn.
  “Ai là người được gọi là mặt trời đêm cơ?” 
  
  “Họ là những cá nhân được coi như là huyền thoại trong giới Phù thủy…” 
  
  “Hể? Huyền thoại đến mức nào?”
  
  “Họ là đồ đệ của những Phù thủy quyền năng nhất! Biết hai chị em Phù thủy đã tạo ra Thời đại chỉ thuộc về Phù thủy như bây giờ không?”
  
  “Bảo là chỉ thuộc về Phù thủy thì có vẻ hơi quá…”
  
  “Mọi người có thể nhận ra họ bằng chiếc ghim cài áo đặc trưng có hình mặt trăng và ngôi sao! Trên áo Thủ hộ giả có một cái ấy. Tuyệt đẹp luôn.” 
  
  “Nhưng có lời đồn rằng cùng là “đồ đệ” nhưng họ chẳng thân với nhau chút nào.” 
  
  “Thế thì nghe thật … kỳ cục nhỉ?” `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`towergil-${user.id}`)
            .setLabel('Ma Tháp')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'towergil': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Ma Tháp')
          .setDescription( `Câu chuyện của đoàn người vừa hay kết thúc lúc đoàn người dừng lại trước một tòa tháp cao chọc trời.
  
  “Tên tôi là Gilbert, cứ gọi nếu có việc cần giúp đỡ nhé.”
  Nói rồi chàng trai tóc trắng chỉ tay hướng dẫn bạn đi vào tòa tháp.
  
  Sau lời giới thiệu ngắn gọn từ Gilbert, có một cô gái tóc đỏ tiến tới. 
  “Hãy đưa người này lên gặp Thủ hộ giả.”
  Cô gái tóc đỏ nghe vậy liền nhìn về phía bạn. Không nói một lời, cô ấy cúi người đưa tay hướng về phía cầu thang rồi dẫn bạn lên lầu.
  
  Qua cầu thang dài với từng bậc đá xếp chồng lên nhau cao vút, hai người các bạn dừng lại trước một cánh cửa lớn. 
  Cô gái tóc đỏ gõ nhẹ vào cánh cửa, đợi một chút rồi mới đẩy nó ra. 
  
  Bạn nhìn thấy một cô bé trên ngực áo có một cái ghim cài hình mặt trăng lồng với một ngôi sao. `)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`tangragil-${user.id}`)
            .setLabel('Cô bé với ghim cài hình ngôi sao')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
  'tangragil': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Cô bé với ghim cài hình ngôi sao')
          .setDescription( `Người với chiếc ghim cài đó quay lại nhìn bạn. 
  “Tên ta là Taeriel Tangra.”
  “Thủ hộ giả của Aerie.”
  
  Một tờ giấy bay đến trước mặt bạn.
  Taeriel quay lại với quyển sách đang mở trên bàn.
  
  “Để trở thành công dân và được quyền ở lại thì xin hãy đồng ý với Lời Tuyên thệ của Aerie. Nhé?”`)],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`contract-${user.id}`)
            .setLabel('Đọc bản khế ước')
            .setStyle(ButtonStyle.Secondary)
        )]
      },
  
      'yesgil': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Từ chối')
          .setDescription( `Tangra gật đầu sau lời từ chối của bạn. Cô ấy nói với cô gái tóc đỏ.
  “Hãy đưa người này ra khỏi thung lũng.” 
  
  Trước khi cánh cửa đóng lại, bạn nghe thấy Taeriel nói.
  “Aerie sẽ luôn chào đón ngươi.”
  “Nhưng có vẻ không phải vào hôm nay.” 
  
  “Hãy quay lại khi người sẵn sàng.”
  
          [Kết thúc]]`)]
      },
  
      'saw': {
        embeds: [
          new EmbedBuilder()
            .setTitle('Gặp mặt')
            .setDescription(`
    Những kẻ ngạo mạn chẳng thèm giấu sự hiện diện của bản thân, chúng khoác trên mình pháp phục đen tuyền với viền bạc lẹm như lưỡi kiếm. Một tốp tám người tiến vào tầm mắt bạn, bảy tu sĩ vây quanh một cô gái tóc đỏ mận cột hai bên. Cách đôi mắt vàng của cô ta bám riết lấy bạn ở khoảng cách xa như vậy khiến bạn rùng mình, tựa như có một con trăn trườn bò lên chân, chực chờ siết chặt cơ thể bạn.
    
    “Đằng ấy là ai vậy?” Chữ “vậy” ngọng líu lo thành chữ “dợ”, chẳng biết từ lúc nào, cô ấy chợt xuất hiện ngay bên cạnh bạn cùng cây lưỡi hái cao hơn chủ nhân nó hai cái đầu, lạnh lùng tra sát trên cổ bạn.`)
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('fighted')
              .setLabel('Chống trả')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('frozen')
              .setLabel('Chết trân')
              .setStyle(ButtonStyle.Secondary)
          )
        ]
      },
      'fighted': {
        embeds: [
          new EmbedBuilder()
            .setTitle('Chống trả')
            .setDescription(`
    “Thánh tiền tam nhãn Kokariel, 
    chúng sinh tự sơ sinh chân bình đẳng.”
    Não bạn trống rỗng ngay lúc bạn có ý định chống trả. Đã ở tận đây rồi mà vẫn rơi vào tay tu sĩ? Trời đất đảo lộn, tiếng cười lớn của con nhóc đó vang lên trêu chọc cái câu thần chú sến rượm mà các tu sĩ sử dụng là những thứ cuối cùng bạn cảm nhận được.`)
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('woke')
              .setLabel('Tỉnh dậy')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('lied')
              .setLabel('Nằm tiếp')
              .setStyle(ButtonStyle.Secondary)
          )
        ]
      },
      'lied': {
        embeds: [
          new EmbedBuilder()
            .setTitle('Nằm tiếp')
            .setDescription('...')
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('woke')
              .setLabel('Tỉnh dậy')
              .setStyle(ButtonStyle.Secondary)
          )
        ]
      },
      'woke': {
        embeds: [
          new EmbedBuilder()
            .setTitle('Tỉnh dậy')
            .setDescription(`
    Bạn không thể cử động được, cũng không thể sử dụng phép thuật bẩm sinh lẫn ma pháp. Bạn có thể cảm nhận sự hiện diện của hương trà nhàn nhạt. Mở mắt ra, bạn đang ngồi trong một bàn trà ba người. 
    
    “Mời dùng, mời dùng!~” Theo hiệu lệnh của con nhỏ lúc trước, giờ bạn đã có thể di chuyển tay ở phạm vi ngắn, giống như chỉ là con rối bị điều khiển, không thể thành lập những suy nghĩ phản loạn.`)
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('drank')
              .setLabel('Uống trà')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('observed')
              .setLabel('Quan sát')
              .setStyle(ButtonStyle.Secondary)
          )
        ]
      },
      'observed': {
        embeds: [
          new EmbedBuilder()
            .setTitle('Quan sát')
            .setDescription('Tay bạn tự uống trà.')
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('drank')
              .setLabel('Uống trà')
              .setStyle(ButtonStyle.Secondary)
          )
        ]
      },
      'drank': {
        embeds: [
          new EmbedBuilder()
            .setTitle('Uống trà')
            .setDescription(`
    “Mong rằng trà hợp với khẩu vị của đằng ấy nha!~ Giờ ấy nhá, giờ ấy nhá. Bồ đang ở Aerie nè, mà chỗ này bồ phải đăng ký quyền công dân á. Nên Zircone mình mới cắp bồ về ý!” Nhỏ liến thoắng một hồi “Là do Lioncourte sắc quá nên kế hoạch mới hơi máu me chút xíu thôi! Chị Tangrae giới thiệu bản thân đi kìa!” 
    
    Cô bé tóc tím được gọi là Tangra quay sang nhìn, nhưng vẫn chớp mắt trả lời.
    
    “Ta là Taeriel Tangra, minatsonce thứ Tám, Thủ hộ giả của Aerie.”
    Một tờ giấy bay đến trước mặt bạn.
    Taeriel quay lại với quyển sách đang mở trên bàn.
    
    “Để trở thành công dân và được quyền ở lại thì xin hãy đồng ý với Lời Tuyên thệ của Aerie. Nhé?”`)
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('contract')
              .setLabel('Đọc khế ước')
              .setStyle(ButtonStyle.Secondary)
          )
        ]
      },
  
  'contract': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Đọc bản khế ước')
          .setDescription( `
  Trên tờ giấy chỉ ghi vài dòng ngắn.
  \`\`\`Lời thề Aerie
  1. Không được phép tước bỏ “quyền được sống” của cá nhân khác.
  (Bao gồm hành động cố tình, sự kiện ngộ sát, hành động gây sát thương chí tử)
  
  2. Không được phép sử dụng Phép thuật để làm hại cá nhân khác.
  (Định nghĩa “làm hại” được xác định dựa trên tiêu chuẩn của Tarie Tangra, sẽ được so sánh mặc định thông qua tiềm thức của Tangra mỗi lần công dân Aerie sử dụng Phép thuật)
  
  3. Không được xâm phạm vào tài sản cá nhân của cá nhân khác.
  (Bao gồm bất động sản, Pháp cụ và các vật sở hữu liên quan)
  
  4. Không được vào những khu vực riêng tư và Ma Tháp trừ khi được cho phép.
  
  5. Trong trường hợp vật sở hữu của một cá nhân vi phạm Lời thề Aerie cho dù có chủ ý hay vô tình, chủ nhân của nó sẽ phải chịu trách nhiệm và hình phạt tương đương trường hợp tự cá nhân đó chủ động vi phạm.
  \`\`\``)],
  components: [new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`agree-${user.id}`)
      .setLabel('Đồng ý')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`decline-${user.id}`)
      .setLabel('Từ chối')
      .setStyle(ButtonStyle.Danger)
  )]
  },
  
  
      'decline': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Từ chối')
          .setDescription(`Tangra gật đầu sau lời từ chối của bạn. Cô ấy nói với cô gái tóc đỏ.
  “Hãy đưa người này ra khỏi thung lũng.”
  
  
  Trước khi cánh cửa đóng lại, bạn nghe thấy Taeriel nói.
  “Aerie sẽ luôn chào đón ngươi.”
  “Nhưng có vẻ không phải vào hôm nay.”
  
  
  “Hãy quay lại khi ngươi sẵn sàng.”
  [Kết thúc]`)],
        components: []
      },
      'agree': {
        embeds: [
          new EmbedBuilder()
          .setTitle('Đồng ý')
          .setDescription( `Bạn đọc kỹ lời thề rồi ấn ngón tay chỉ điểm.  
  “Ngươi còn nhớ… Người nào đã bảo vệ ngươi suốt quãng đường tới đây không?”
  Tangra cất tiếng hỏi khi nhận lại bản khế ước.
  `)],
        components: []
      }
    };
  
    
  
    const followUpMessage = followUpMessages[action];
    
    if (followUpMessage) {
      await interaction.update({
        content: interaction.message.content,
        components: [],
      });

      await interaction.channel.send({
        embeds: followUpMessage.embeds || [],
        content: followUpMessage.content || '',
        components: followUpMessage.components || []
      });      

      if (action === 'solo') {
        await handleWentByYourself(interaction, client);
      } else if (action === 'acknowledged') {
        await handleDirectionAck(interaction, client);
      } else if (['Sang trái', 'Sang phải', 'Đi thẳng', 'Dùng phép thuật đi xuyên qua đường cụt'].includes(action)) {
        await handleDirectionChoice(interaction, client);
      };

    if (action === 'agree') {
      
      const user = interaction.guild.members.cache.get(interaction.user.id);
      const roleId = process.env.ROLE_ID;
      const channel = interaction.channel;

      if (!user) {
        console.error(`User with ID ${interaction.user.id} not found.`);
        return;
      }

        await channel.permissionOverwrites.edit(interaction.user.id, {
          SendMessages: true,
        });

        const filter = m => m.author.id === interaction.user.id && new RegExp(`\\b${chosenCharacter.toLowerCase()}\\b`).test(m.content.trim().toLowerCase());
        const collected = await channel.awaitMessages({ filter, max: 1 });

        if (collected.size > 0) {
          const role = interaction.guild.roles.cache.get(roleId);
          if (role) {
            await user.roles.add(role);

            await interaction.followUp({
              content: 'Bạn đã thành công trở thành cư dân của Aerie.',
              components: [],
            });

            //Gửi tin nhắn chuẩn bị xóa channel
            await interaction.channel.send({
              content:'Cốt truyện đã kết thúc. Sau một chu kỳ mặt trời, cuộc gặp mặt này sẽ trở về với sa bàn của Thủ hộ giả.',
            });
            
            //Xóa kênh sau 24h
            setTimeout(async() => {await interaction.channel.delete('Xóa kênh sau 24h'); }, 24*60*60*1000);
          } else {
            console.error('Role with ID ${roleId} not found.');
          }
        }
      }
    }

  } catch (error) {
    console.error('Interaction handling failed:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.followUp({
        content: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
        components: [],
      });
    }
  }
  
}

module.exports = {
  handleReaction,
  handleStoryInteraction,
};
