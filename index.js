require('dotenv').config();
const {
  Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits,
  REST, Routes, SlashCommandBuilder
} = require('discord.js');

const CONFIG = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  rulesLogo: 'https://i.imgur.com/2FrFg7k.png',
  rulesImage: 'https://i.imgur.com/2mHTvfv.jpeg',
  ticketImage: 'https://i.imgur.com/2FrFg7k.png',
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

// ---------- SLASH COMMANDS (ADMIN ONLY) ----------
const commands = [
  new SlashCommandBuilder().setName('rules').setDescription('Show server rules').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName('welcome').setDescription('Show welcome message').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName('ticket').setDescription('Open a ticket panel').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName('ping').setDescription('Check bot latency').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName('help').setDescription('List all commands').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot say something')
    .addStringOption(o => o.setName('text').setDescription('What to say').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Show a user avatar')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder().setName('serverinfo').setDescription('Server info').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('User info')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete messages')
    .addIntegerOption(o => o.setName('amount').setDescription('1-100').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addIntegerOption(o => o.setName('minutes').setDescription('Minutes').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
];

// ---------- REGISTER ----------
const rest = new REST({ version: '10' }).setToken(CONFIG.token);

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  try {
    await rest.put(
      Routes.applicationGuildCommands(CONFIG.clientId, CONFIG.guildId),
      { body: commands.map(c => c.toJSON()) }
    );
    console.log('Slash commands registered (admin only).');
  } catch (err) {
    console.error(err);
  }
});

// ---------- HANDLE ----------
client.on('interactionCreate', async (interaction) => {
  // Ticket button
  if (interaction.isButton()) {
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
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  // Double-check admin (in case someone bypasses the default permissions)
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: 'You need Administrator permission.', ephemeral: true });
  }

  const { commandName } = interaction;

  if (commandName === 'rules') {
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
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'welcome') {
    const embed = new EmbedBuilder()
      .setTitle('Welcome!')
      .setDescription('Glad to have you here. Check the rules and enjoy your stay.')
      .setImage(CONFIG.rulesImage)
      .setThumbnail(CONFIG.rulesLogo)
      .setColor(0x00FF00);
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'ticket') {
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

    return interaction.reply({ embeds: [embed], components: [row] });
  }

  if (commandName === 'ping') {
    return interaction.reply({ content: `Pong! ${client.ws.ping}ms`, ephemeral: true });
  }

  if (commandName === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('Commands')
      .setDescription(commands.map(c => `\`/${c.name}\``).join(', '))
      .setColor(0x5865F2);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (commandName === 'say') {
    const text = interaction.options.getString('text');
    await interaction.channel.send(text);
    return interaction.reply({ content: 'Sent.', ephemeral: true });
  }

  if (commandName === 'avatar') {
    const user = interaction.options.getUser('user') || interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ size: 512 }))
      .setColor(0x5865F2);
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'serverinfo') {
    const g = interaction.guild;
    const embed = new EmbedBuilder()
      .setTitle(g.name)
      .setThumbnail(g.iconURL())
      .addFields(
        { name: 'Members', value: `${g.memberCount}`, inline: true },
        { name: 'Owner', value: `<@${g.ownerId}>`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setColor(0x5865F2);
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'userinfo') {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const embed = new EmbedBuilder()
      .setTitle(user.username)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
      )
      .setColor(0x5865F2);
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'clear') {
    const amount = interaction.options.getInteger('amount');
    await interaction.channel.bulkDelete(Math.min(amount, 100), true);
    return interaction.reply({ content: `Deleted ${amount} messages.`, ephemeral: true });
  }

  if (commandName === 'kick') {
    const member = interaction.options.getMember('user');
    await member.kick();
    return interaction.reply({ content: `Kicked ${member.user.tag}` });
  }

  if (commandName === 'ban') {
    const member = interaction.options.getMember('user');
    await member.ban();
    return interaction.reply({ content: `Banned ${member.user.tag}` });
  }

  if (commandName === 'timeout') {
    const member = interaction.options.getMember('user');
    const minutes = interaction.options.getInteger('minutes');
    await member.timeout(minutes * 60 * 1000);
    return interaction.reply({ content: `Timed out ${member.user.tag} for ${minutes} min.` });
  }
});

client.login(CONFIG.token);
