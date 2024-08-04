const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, '../database.sqlite'));

async function addCharacter(interaction) {
  const userId = interaction.user.id;
  const commonName = interaction.options.getString('name');
  const religiousName = interaction.options.getString('witch');
  const innateAbility = interaction.options.getString('ability');

  try {
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(`INSERT OR IGNORE INTO users (id) VALUES (?)`, [userId], (err) => {
          if (err) {
            return reject(err);
          }
        });

        db.get(`SELECT COUNT(*) AS count FROM char WHERE religiousName = ?`, [religiousName], (err, row) => {
          if (err) {
            return reject(err);
          }

          if (row.count > 0) {
            // religiousName đã tồn tại
            return reject(new Error('Pháp danh đã tồn tại. Vui lòng chọn một pháp danh khác.'));
          }

          db.get(`SELECT COALESCE(MAX(orderNo), 0) + 1 AS newOrderNo FROM char WHERE userId = ?`, [userId], (err, row) => {
            if (err) {
              return reject(err);
            }

            const newOrderNo = row.newOrderNo;

            db.run(`INSERT INTO char (userId, orderNo, commonName, religiousName, innateAbility) VALUES (?, ?, ?, ?, ?)`,
              [userId, newOrderNo, commonName, religiousName, innateAbility],
              function (err) {
                if (err) {
                  return reject(err);
                }
                resolve();
              });
          });
        });
      });
    });

    await interaction.editReply({ content: 'Character added successfully!' });
  } catch (err) {
    await interaction.editReply({ content: err.message || 'There was an error adding your character. Please try again later.' });
    console.error(err.message);
  }
}

module.exports = {
  addCharacter,
};