const Discord = require("discord.js");

const database = require('../database');

const dailyRub = 100;

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    const currencyData = database.GetData("currency", message.author.id);
    var now = Date.now();
    if(now >= currencyData.dailyClaimTime + database.config.DayInMilliSeconds) {
        currencyData.rub += dailyRub;
        currencyData.dailyClaimTime = now;
        database.SetData("currency", currencyData);
        message.channel.send("Kivánság teljesítve: +100 RUB");
    } else {
        message.channel.send("A kivánság nem teljesíthető, probálkoz késöbb.");
    }
}

module.exports.help = {
    cmd: "rich",
    alias: [],
    name: "Rich",
    desc: "Gazdagá tesz!",
    usage: "~wish rich",
}