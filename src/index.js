const { Client, GatewayIntentBits, EmbedBuilder } = require(`discord.js`);
const { google } = require("googleapis");
require("dotenv").config();
const config = require("./config");
const schedule = require("node-schedule");

// Create a new Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const initializeBot = async (DISCORD_TOKEN) => {
  // BOT LOGIN
  client.login(DISCORD_TOKEN);
};

const prefix = "!";

// Replace with the ID of your Google Drive spreadsheet
const SPREADSHEET_ID = "1ifq06TD9qtnrSM5psbPAENktSXRM60RGUOtmDrMJgvk";

// Replace with your Google API credentials
const credentials = require("./credentials.json");

let messageToEdit;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Schedule the script to run at 00:03 GMT
  const updateJob = schedule.scheduleJob(
    { hour: 0, minute: 3, tz: "Etc/GMT" },
    () => {
      console.log("Updating leaderboard at:", new Date());
      getEmbed();
    }
  );

  // Run the script once when the bot starts
  getEmbed();
});

// Formats the leaderboard data
function formatLeaderboard(rows, leaderboardEmbed) {
  let users = [];
  rows.forEach((row) => {
    // Create Array for user objects
    users.push({ username: row[2], daysOfCoding: row[5] });
  });

  // Create a new object that combines the daysOfCoding values for each unique username, keeping only the highest value
  const leaderboard = users.reduce((acc, user) => {
    if (!acc[user.username] || user.daysOfCoding > acc[user.username]) {
      acc[user.username] = user.daysOfCoding;
    }
    return acc;
  }, {});

  // Create an array of objects in the format { username, daysOfCoding }
  const leaderboardArray = Object.entries(leaderboard).map(
    ([username, daysOfCoding]) => ({ username, daysOfCoding })
  );

  // Sort the array in descending order based on the number of days of coding
  leaderboardArray.sort((a, b) => b.daysOfCoding - a.daysOfCoding);

  // Add placement
  for (let i = 0; i < leaderboardArray.length; i++) {
    leaderboardArray[i].placement = i;
  }
  // Leaderboard name/value constructor
  leaderboardArray.forEach((entry) => {
    if (entry.placement != 0 && entry.placement <= 10) {
      let name;
      if (entry.placement == 1) {
        name = `** :trophy: ${entry.placement}. ${entry.username}**`;
      } else if (entry.placement == 2) {
        name = `** :second_place: ${entry.placement}. ${entry.username}**`;
      } else if (entry.placement == 3) {
        name = `** :third_place: ${entry.placement}. ${entry.username}**`;
      } else {
        name = `**${entry.placement}. ${entry.username}**`;
      }
      leaderboardEmbed.addFields({
        name: name,
        value: `\`Days coding\` | \`${entry.daysOfCoding}\``,
      });
    }
  });
}

// DELETE MESSAGE FROM THE CHANNEL

function deleteLastMessage(channel) {
  channel.messages.fetch({ limit: 1 }).then((messages) => {
    // Delete the last message
    messages.first().delete();
  });
}

// EMBED

function createEmbed() {
  // Embed constructor
  // Change values below to edit embed
  const leaderboardEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("Leaderboard")
    .setURL(
      "https://docs.google.com/spreadsheets/d/1ifq06TD9qtnrSM5psbPAENktSXRM60RGUOtmDrMJgvk/edit#gid=552958224"
    )
    .setAuthor({
      name: "LearnWeb3",
      iconURL:
        "https://pbs.twimg.com/profile_images/1583101110608400385/FkTz9xEl_400x400.jpg",
      url: "https://twitter.com/LearnWeb3DAO",
    })
    .setDescription("#30DaysOfSolidity")
    .setThumbnail(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Solidity_logo.svg/1200px-Solidity_logo.svg.png"
    )
    .setImage(
      "https://media.discordapp.net/attachments/1102332669410426951/1102401851971870740/30DaysofSolidity.png?width=1200&height=480"
    )
    .setTimestamp()
    .setFooter({
      text: "Last updated",
      iconURL:
        "https://pbs.twimg.com/profile_images/1583101110608400385/FkTz9xEl_400x400.jpg",
    });

  return leaderboardEmbed;
}

// GET TIME

function getTimestamp() {
  const timestamp = new Date().toLocaleString("eu", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
  return timestamp;
}

async function getEmbed() {
  try {
    // Authenticate with Google using the API credentials
    const auth = await google.auth.getClient({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    // Get the data from the spreadsheet
    const response = await google
      .sheets({ version: "v4", auth })
      .spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "30DoS!A1:F", // Replace with the range of cells you want to retrieve
      });
    const data = response.data;
    const rows = data.values;
    const channelId = config.getChannelId();
    const channel = client.channels.cache.get(channelId);
    const messageID = config.getMessageId();
    const leaderboardEmbed = createEmbed();
    formatLeaderboard(rows, leaderboardEmbed);

    // Fetch the message with the specified ID
    channel.messages
      .fetch(messageID)
      .then((messageToEdit) => {
        // If the message exists, edit it with the new data
        const timestamp = getTimestamp();
        messageToEdit
          .edit({ embeds: [leaderboardEmbed] })
          .then((msg) => console.log(`[${timestamp}] Updated message content`))
          .catch(console.error);
      })
      .catch(async () => {
        // If the message doesn't exist, send a new one
        await channel.send({ embeds: [leaderboardEmbed] });
      });
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  const DISCORD_TOKEN = config.getDiscordToken();
  initializeBot(DISCORD_TOKEN);
})();
