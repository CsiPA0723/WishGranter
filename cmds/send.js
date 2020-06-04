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
    var summary = Math.abs(parseInt(args[0])) <= Number.MAX_VALUE ? Math.abs(parseInt(args[0])) : 0;
    var currencyData = database.GetData('currency', message.author.id);
    var targetCurrencyData = database.GetData('currency', target.id);
    if(currencyData.gold <= 0 || summary < 0) summary = 0;
    else if(currencyData.gold < summary) summary = currencyData.gold;
    currencyData.gold -= summary;
    targetCurrencyData.gold += summary;
    database.SetData('currency', currencyData);
    database.SetData('currency', targetCurrencyData);
    message.channel.send(`${summary} Gold átadva neki ${target.displayName}`);
}

module.exports.help = {
    cmd: "send",
    alias: ["utal"],
    name: "Send",
    desc: "Utalj át másoknak aranyat!",
    usage: "%send [összeg] [név]",
}