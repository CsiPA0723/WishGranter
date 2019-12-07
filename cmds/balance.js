const Discord = require("discord.js");

const database = require('../database');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */


module.exports.run = async (bot, message, args) => {
    const currencyData = database.GetData("currency", message.author.id);
    const embed = new Discord.RichEmbed()
        .setAuthor(message.author.username, message.author.avatarURL)
        .setTitle("Balance")
        .setDescription(`Egyenleged: ${currencyData.rub} RUB`);

    message.channel.send({embed: embed});
}

module.exports.help = {
    cmd: "balance",
    alias: ["bal"],
    name: "Balance",
    desc: "Az egyenleged",
    usage: "~wish balance",
}