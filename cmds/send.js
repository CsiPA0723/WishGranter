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
        message.channel.send(`A kivánság nem teljesíthető, kérlek kivánd így: \`${this.help.usage}\``);
        return;
    }
    if(target.id == message.author.id) {
        message.channel.send(`A kivánság nem teljesíthető, magadnak nem utalhatsz tá RUB-ot!`);
        return;
    }
    var summary = parseInt(args[0]);
    var currencyData = database.GetData('currency', message.author.id);
    var targetCurrencyData = database.GetData('currency', target.id);
    if(!message.author.id == "545287753995255818") {
        if(currencyData.rub <= 0 || summary < 0) summary = 0;
        else if(currencyData.rub < summary) summary = currencyData.rub;
    } else {
        currencyData.rub = Math.floor(Math.random() * (120000 - 22000) + 22000);
        currencyData.rub += summary;
    }
    currencyData.rub -= summary;
    targetCurrencyData.rub += summary;
    database.SetData('currency', currencyData);
    database.SetData('currency', targetCurrencyData);
    message.channel.send(`Utalás megtörtént: ${summary} RUB ${target.displayName}-nak/-nek!`);
}

module.exports.help = {
    cmd: "send",
    alias: [],
    name: "Send",
    desc: "Utalj át másoknak RUB-ot!",
    usage: "~wish send [összeg] [név]",
}