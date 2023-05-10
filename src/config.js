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
}

const configData = {
  channelId: "1102332831113433228",
  discordToken: process.env.DISCORD_TOKEN,
};

const config = new Config(configData);

module.exports = config;
