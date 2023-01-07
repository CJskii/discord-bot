const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  Premissions,
  ModalAssertions,
} = require(`discord.js`);

const { google } = require("googleapis");

const prefix = "!";

// Replace with your Discord bot's token
const DISCORD_BOT_TOKEN = "TOKEN_HERE";

// Replace with the ID of your Google Drive spreadsheet
const SPREADSHEET_ID = "1yFt-bFQol0IF_737jUiDXhlt3jRTSwSU8CHNvveGYqs";

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

// New message

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  // message array

  const messageArray = message.content.split(" ");
  const argument = messageArray.slice(1);
  const cmd = messageArray[0];

  // COMMANDS

  if (command === "leaderboard") {
    message.channel.send("leaderboard will be sent here on request");
  }
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Fetch data from the Google Drive spreadsheet every hour
  setInterval(async () => {
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
      // Send the data to the Discord channel
      const channel = client.channels.cache.get("1048058181215064124"); // Replace with channel ID from discord
      //formatLeaderboard(rows);
      channel.send(`Here is the leaderboard:\n${formatLeaderboard(rows)}`);
    } catch (error) {
      console.error(error);
    }
  }, 30 * 1000); // 3600 * 1000 milliseconds = 1 hour
});

// Formats the leaderboard data
function formatLeaderboard(rows) {
  let users = [];
  rows.forEach((row) => {
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

  let leaderboardString = "";

  for (let i = 1; i < leaderboardArray.length; i++) {
    const entry = leaderboardArray[i];
    leaderboardString += `${i}. ${entry.username}: ${entry.daysOfCoding}\n`;
  }

  const firstEntry = leaderboardArray[0];
  leaderboardString = `Placement : ${firstEntry.username}: ${firstEntry.daysOfCoding}\n${leaderboardString}`;

  console.log(leaderboardString);

  return leaderboardString;
}
