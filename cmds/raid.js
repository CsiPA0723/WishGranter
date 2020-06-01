const Discord = require("discord.js");

const database = require('../database');

const dailyGold = { min: 100, max: 250 };

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    const currencyData = database.GetData("currency", message.author.id);
    var now = Date.now();
    if(now >= currencyData.workClaimTime + database.config.Hours3InMilliSeconds || message.author.id == bot.devId) {
        var gold = getDailyGold();
        currencyData.gold += gold;
        currencyData.workClaimTime = now;
        database.SetData("currency", currencyData);
        message.channel.send(`*placeholder*: ${gold} Gold`); 
    } else {
        message.channel.send("There is no work for you right now!");
    }
}

function getDailyGold() {
    return Math.floor(Math.random() * (dailyGold.max - dailyGold.min) + dailyGold.min);
}

module.exports.help = {
    cmd: "raid",
    alias: ["munka"],
    name: "Raid",
    desc: "*desc*",
    usage: "%raid",
}