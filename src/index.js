const { Client, GatewayIntentBits, EmbedBuilder } = require(`discord.js`);
const { google } = require("googleapis");
require("dotenv").config();

const prefix = "!";

// Replace with your Discord bot's token
const DISCORD_BOT_TOKEN = process.env.DISCORD_TOKEN;

// Replace with the ID of your Google Drive spreadsheet
const SPREADSHEET_ID = "1ifq06TD9qtnrSM5psbPAENktSXRM60RGUOtmDrMJgvk";

// Replace with your Google API credentials
const credentials = require("./credentials.json");

// Create a new Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// BOT LOGIN
client.login(DISCORD_BOT_TOKEN);

let messageToEdit;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  getEmbed();
  // Fetch data from the Google Drive spreadsheet every hour
  setInterval(async () => {
    getEmbed();
  }, 300 * 1000); // 3600 * 1000 milliseconds = 1 hour
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
  console.log(leaderboardArray);
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
    .setDescription("#100DaysOfCodeLW3")
    .setThumbnail("https://i.imgur.com/2ZZl1H3.png")
    .setImage("https://i.imgur.com/nfEDbrh.png")
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
        range: "Sheet1!A1:F", // Replace with the range of cells you want to retrieve
      });
    const data = response.data;
    const rows = data.values;

    const channel = client.channels.cache.get("1048058181215064124");
    const messageID = "1093680184529530881"; // Replace with channel ID from discord
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
