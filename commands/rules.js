const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'rules',
  execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('Server Rules')
      .setDescription('Read and follow these rules.')
      .setImage(config.rulesImage)
      .setColor(0x5865F2);

    message.channel.send({ embeds: [embed] });
  }
};
