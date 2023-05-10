require("dotenv").config();

class Config {
  constructor(data) {
    this.data = data;
  }

  getConfigData() {
    return this.data;
  }

  getChannelId() {
    return this.data.channelId;
  }

  getDiscordToken() {
    return this.data.discordToken;
  }

  getMessageId() {
    return this.data.messageToEdit;
  }
}

const configData = {
  channelId: "1102332831113433228",
  discordToken: process.env.DISCORD_TOKEN,
  messageToEdit: "1105992015797301329",
};

const config = new Config(configData);

module.exports = config;
