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
    var summary = parseInt(args[0]);
    var currencyData = database.GetData('currency', message.author.id);
    var targetCurrencyData = database.GetData('currency', target.id);
    if(currencyData.rub < summary) summary = currencyData.rub;
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