const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, '../database.sqlite'));

async function addCharacter(interaction) {
  const userId = interaction.user.id;
  const commonName = interaction.options.getString('Tên chung');
  const religiousName = interaction.options.getString('Pháp danh');
  const innateAbility = interaction.options.getString('Sức mạnh bẩm sinh');


  db.serialize(() => {
    db.run(`INSERT OR IGNORE INTO users (id) VALUES (?)`, [userId]);

    db.run(`INSERT INTO char (userId, commonName, religiousName, innateAbility) VALUES (?, ?, ?, ?)`,
      [userId, commonName, religiousName, innateAbility],
      function (err) {
        if (err) {
          interaction.editReply({ content: 'There was an error adding your character.' });
          console.error(err.message);
        } else {
          interaction.editReply({ content: 'Character added successfully!' });
        }
      });
  });
}


module.exports = {
  addCharacter,
};

