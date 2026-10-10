require('dotenv').config();
const {
  Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits,
  Collection
} = require('discord.js');

const CONFIG = {
  prefix: '!',
  rulesLogo: 'https://kommodo.ai/i/SxkiDdAQtrYjk2pfcRjT',
  rulesImage: 'https://kommodo.ai/i/UpUKuhxztZNQ3fY7yYq5',
  ticketImage: 'https://kommodo.ai/i/SxkiDdAQtrYjk2pfcRjT',
  staffRoleId: 'STAFF_ROLE_ID_HERE',
  ticketCategoryId: 'CATEGORY_ID_HERE'
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

client.commands.set('rules', {
  execute(message) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Server Rules', iconURL: CONFIG.rulesLogo })
      .setThumbnail(CONFIG.rulesLogo)
      .setDescription(
        '**1.** Be respectful to everyone.\n' +
        '**2.** No swearing — keep it clean and nice.\n' +
        '**3.** No spam, no advertising.\n' +
        '**4.** No NSFW content anywhere.\n' +
        '**5.** Use the correct channels for the correct topics.\n' +
        '**6.** No drama — take issues to DMs or staff.\n' +
        '**7.** Follow staff instructions at all times.\n' +
        '**8.** Have fun and enjoy the server!'
      )
      .setImage(CONFIG.rulesImage)
      .setFooter({ text: 'Breaking rules = warning, then punishment.' })
      .setColor(0x5865F2);
    message.channel.send({ embeds: [embed] });
  }
});
client.commands.set('rule', client.commands.get('rules'));

client.commands.set('ticket', {
  execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('Create a Ticket')
      .setDescription('Click the button below to open a ticket.')
      .setImage(CONFIG.ticketImage)
      .setColor(0x00FF00);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Success)
    );

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

client.commands.set('ping', {
  execute(message) {
    message.reply(`Pong! ${client.ws.ping}ms`);
  }
});

client.commands.set('say', {
  execute(message, args) {
    if (!args.length) return message.reply('Give me something to say.');
    message.delete().catch(() => {});
    message.channel.send(args.join(' '));
  }
});

client.commands.set('avatar', {
  execute(message) {
    const user = message.mentions.users.first() || message.author;
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ size: 512 }))
      .setColor(0x5865F2);
    message.channel.send({ embeds: [embed] });
  }
});

client.commands.set('serverinfo', {
  execute(message) {
    const g = message.guild;
    const embed = new EmbedBuilder()
      .setTitle(g.name)
      .setThumbnail(g.iconURL())
      .addFields(
        { name: 'Members', value: `${g.memberCount}`, inline: true },
        { name: 'Owner', value: `<@${g.ownerId}>`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setColor(0x5865F2);
    message.channel.send({ embeds: [embed] });
  }
});

client.commands.set('userinfo', {
  execute(message) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);
    const embed = new EmbedBuilder()
      .setTitle(user.username)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
      )
      .setColor(0x5865F2);
    message.channel.send({ embeds: [embed] });
  }
});

client.commands.set('clear', {
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return message.reply('No permission.');
    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100)
      return message.reply('Give a number 1-100.');
    await message.channel.bulkDelete(amount, true);
    const m = await message.channel.send(`Deleted ${amount} messages.`);
    setTimeout(() => m.delete().catch(() => {}), 3000);
  }
});

client.commands.set('kick', {
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers))
      return message.reply('No permission.');
    const member = message.mentions.members.first();
    if (!member) return message.reply('Mention a user.');
    await member.kick();
    message.channel.send(`Kicked ${member.user.tag}`);
  }
});

client.commands.set('ban', {
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers))
      return message.reply('No permission.');
    const member = message.mentions.members.first();
    if (!member) return message.reply('Mention a user.');
    await member.ban();
    message.channel.send(`Banned ${member.user.tag}`);
  }
});

client.commands.set('timeout', {
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return message.reply('No permission.');
    const member = message.mentions.members.first();
    const minutes = parseInt(args[1]);
    if (!member || !minutes) return message.reply('Usage: !timeout @user 10');
    await member.timeout(minutes * 60 * 1000);
    message.channel.send(`Timed out ${member.user.tag} for ${minutes} min.`);
  }
});

client.commands.set('help', {
  execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('Commands')
      .setDescription([...client.commands.keys()].map(n => `\`!${n}\``).join(', '))
      .setColor(0x5865F2);
    message.channel.send({ embeds: [embed] });
  }
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(CONFIG.prefix)) return;

  const args = message.content.slice(CONFIG.prefix.length).trim().split(/ +/);
  const name = args.shift().toLowerCase();

  const command = client.commands.get(name);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (err) {
    console.error(err);
    message.reply('Error running command.');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'create_ticket') return;

  const guild = interaction.guild;

  const channel = await guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: CONFIG.ticketCategoryId,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      { id: CONFIG.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
    ]
  });

  const embed = new EmbedBuilder()
    .setTitle('Ticket Created')
    .setDescription(`Hello ${interaction.user}, staff will be with you shortly.`)
    .setColor(0x00FF00);

  channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed] });
  interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
});

client.login(process.env.TOKEN);
