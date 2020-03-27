const Discord = require("discord.js");

const database = require('../database');

const dailySt = { min: 100, max: 250 };

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    const currencyData = database.GetData("currency", message.author.id);
    var now = Date.now();
    if(now >= currencyData.workClaimTime + database.config.Hours3InMilliSeconds || message.author.id == bot.devId) {
        var st = getDailySt();
        currencyData.st += st;
        currencyData.workClaimTime = now;
        database.SetData("currency", currencyData);
        message.channel.send(`PAYMENT: ${st} ST`); 
    } else {
        message.channel.send("There is no work for you right now!");
    }
}

function getDailySt() {
    return Math.floor(Math.random() * (dailySt.max - dailySt.min) + dailySt.min);
}

module.exports.help = {
    cmd: "work",
    alias: ["munka"],
    name: "Working",
    desc: "Dolgozz! (3 óránkét érhető el)",
    usage: "%work",
}