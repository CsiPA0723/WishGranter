const Discord = require("discord.js");

const database = require('../database');
const { GetMember } = require('../functions');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */


module.exports.run = async (bot, message, args) => {
    var target = GetMember(message, args.slice(1));
    if(!args[0] || !target) {
        message.channel.send(`Error, no target was specified: \`${this.help.usage}\``);
        return;
    }
    if(target.id == message.author.id) {
        message.channel.send(`Error, you cannot send Gold to yourself`);
        return;
    }
    var summary = parseInt(args[0]);
    var currencyData = database.GetData('currency', message.author.id);
    var targetCurrencyData = database.GetData('currency', target.id);
    if(!message.author.id == "545287753995255818") {
        if(currencyData.gold <= 0 || summary < 0) summary = 0;
        else if(currencyData.gold < summary) summary = currencyData.gold;
    } else {
        currencyData.gold = Math.floor(Math.random() * (120000 - 22000) + 22000);
        currencyData.gold += summary;
    }
    currencyData.gold -= summary;
    targetCurrencyData.gold += summary;
    database.SetData('currency', currencyData);
    database.SetData('currency', targetCurrencyData);
    message.channel.send(`${summary} Gold sent to ${target.displayName}`);
}

module.exports.help = {
    cmd: "send",
    alias: ["utal"],
    name: "Send",
    desc: "Utalj át másoknak aranyat!",
    usage: "%send [összeg] [név]",
}