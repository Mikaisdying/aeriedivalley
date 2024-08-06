const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, '../database.sqlite'));

async function addCharacter(interaction) {
  const userId = interaction.user.id;
  const commonName = interaction.options.getString('name');
  const religiousName = interaction.options.getString('witch');
  const innateAbility = interaction.options.getString('ability');

  console.log(`Received interaction: userId=${userId}, commonName=${commonName}, religiousName=${religiousName}, innateAbility=${innateAbility}`);

  try {
    await interaction.deferReply(); // Hoãn phản hồi ngay lập tức
    console.log('Deferred reply.');

    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(`INSERT OR IGNORE INTO users (id) VALUES (?)`, [userId], (err) => {
          if (err) {
            console.error(`Error inserting user: ${err.message}`);
            return reject(err);
          }
          console.log('Inserted or ignored user.');
        });

        db.get(`SELECT COUNT(*) AS count FROM char WHERE religiousName = ?`, [religiousName], (err, row) => {
          if (err) {
            console.error(`Error checking religious name: ${err.message}`);
            return reject(err);
          }

          if (row.count > 0) {
            console.error('Pháp danh đã tồn tại. Vui lòng chọn một pháp danh khác.');
            return reject(new Error('Pháp danh đã tồn tại. Vui lòng chọn một pháp danh khác.'));
          }

          db.get(`SELECT COALESCE(MAX(orderNo), 0) + 1 AS newOrderNo FROM char WHERE userId = ?`, [userId], (err, row) => {
            if (err) {
              console.error(`Error getting new order number: ${err.message}`);
              return reject(err);
            }

            const newOrderNo = row.newOrderNo;
            console.log(`New order number for character: ${newOrderNo}`);

            db.run(`INSERT INTO char (userId, orderNo, commonName, religiousName, innateAbility) VALUES (?, ?, ?, ?, ?)`,
              [userId, newOrderNo, commonName, religiousName, innateAbility],
              function (err) {
                if (err) {
                  console.error(`Error inserting character: ${err.message}`);
                  return reject(err);
                }
                console.log('Character inserted successfully.');
                resolve();
              });
          });
        });
      });
    });

    await interaction.editReply({ content: `Nhân vật đã được thêm!\nTên thường gọi: ${commonName}\nPháp danh: ${religiousName}\nNăng lực bẩm sinh: ${innateAbility}` });
    console.log('Interaction reply edited successfully.');
  } catch (err) {
    console.error(`Caught error: ${err.message}`);
    await interaction.editReply({ content: err.message || 'Có lỗi xảy ra khi thêm nhân vật, xin hãy thử lại!' });
  }
}

module.exports = {
  addCharacter,
};
