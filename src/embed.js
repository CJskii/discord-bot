const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Leaderboard"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setURL("https://github.com/CJskii/discord-bot/blob/main/index.js")
      .setAuthor({
        name: "CJski",
        iconURL:
          "https://pbs.twimg.com/profile_images/1556993729206140928/TKufuZDc_400x400.jpg",
      })
      .setDescription("This is a description")
      .setThumbnail(
        "https://assets-global.website-files.com/6080d45b6168d4415fe5cbd7/60884c8981cb68df3afd8bc9_1589514797-essential-guide-to-the-100-days-of-code-challenge.png"
      )
      .addFields({
        name: "A field",
        value: "THIS IS A VALUE FIELD",
        inline: true,
      })
      .addFields({
        name: "Not inline field",
        value: "THIS IS A VALUE FIELD",
        inline: false,
      })
      .addFields({
        name: "A field",
        value: "THIS IS A VALUE FIELD",
        inline: true,
      })
      .setImage(
        "https://pbs.twimg.com/profile_images/1556993729206140928/TKufuZDc_400x400.jpg"
      )
      .setTimestamp()
      .setFooter({
        text: "A footer",
        iconURL:
          "https://pbs.twimg.com/profile_images/1556993729206140928/TKufuZDc_400x400.jpg",
      });

    await interaction.reply({ embeds: [embed] });
  },
};
