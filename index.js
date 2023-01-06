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
const DISCORD_BOT_TOKEN =
  "MTAwNTk4MjkyNzY1NTUzNDcwNA.GBug1s.KhC5i_ADFNhqBBuWosioMmKLXSyWJkXtIT8uLU";

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
      console.log(data);
      const rows = response.data.values;

      // Send the data to the Discord channel
      const channel = client.channels.cache.get("1048058181215064124");
      channel.send(`Here is the leaderboard:\n${formatLeaderboard(data)}`);
    } catch (error) {
      console.error(error);
    }
  }, 60 * 1000); // 3600 * 1000 milliseconds = 1 hour
});

// Formats the leaderboard data as a string
function formatLeaderboard(data) {
  let leaderboard = "";

  return leaderboard;
}
