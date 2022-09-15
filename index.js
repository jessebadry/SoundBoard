const config = require("./config.json");
const {
  REST,
  Routes,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { join } = require('path');
const {
  joinVoiceChannel,
  createAudioPlayer,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  createAudioResource,
} = require("@discordjs/voice");

const player = createAudioPlayer();
player.on(AudioPlayerStatus.Playing, () => {
  console.log("The audio player has started playing!");
});
const {Client, GatewayIntentBits} = require("discord.js");
const fs = require("fs");
const SOUND_DIRECTORY = "./sounds/";

if (!fs.existsSync(SOUND_DIRECTORY)) {
  fs.mkdirSync(SOUND_DIRECTORY);
}

const commands = [
  {
    name: "join",
    description: "SoundBoard joins users channel",
  },
  {
    name: "sounds",
    description: "Display soundboard",
  },
];

const rest = new REST({version: "10"}).setToken(config.token);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(config.client_id), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

async function createVoiceMenu() {
  let sounds = await fs.promises.readdir(SOUND_DIRECTORY);
  console.log(sounds);
  let soundNameButtonRows = [];

  for (const sound of sounds) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(sound)
        .setLabel(sound)
        .setStyle(ButtonStyle.Primary)
    );

    soundNameButtonRows.push(row);
  }
  return soundNameButtonRows;
}

async function playSound(interaction) {


  await interaction.reply({content: `Playing ${interaction.customId}`});
}

const client = new Client({intents: [GatewayIntentBits.Guilds]});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    await playSound(interaction);
    return;
  } else if (!interaction.isCommand()) return;
  let voiceChannel = interaction.member.voice.channel;

  if (interaction.commandName === "join") {
 
    let connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.member.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    connection.subscribe(player);
    player.play(
      createAudioResource(join(SOUND_DIRECTORY, "Civil_war.mp3"))
    );

    player.unpause();
  } else if (interaction.commandName === "sounds") {
    let soundButtons = await createVoiceMenu();
    await interaction.reply({content: "Pong!", components: soundButtons});
  }
});

client.login(config.token);
