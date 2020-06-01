const Discord = require("discord.js");

const database = require('../database');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    const currencyData = database.GetData("currency", message.author.id);
    var now = Date.now();
    if(now >= currencyData.exploreClaimTime + database.config.Hours6InMilliSeconds || message.author.id == bot.devId) {
        var explore = Explore();
        currencyData.gold += explore.gold;
        currencyData.exploreClaimTime = now;
        database.SetData("currency", currencyData);
        message.channel.send(explore.msg); 
    } else {
        message.channel.send("*placeholder*");
    }
}

function Explore() {
    var outcomes = [{
        good: false,
        msg: "*placeholder*: **# Gold**",
        gold: 150,
        chance: 40
    },{
        good: true,
        msg: "*placeholder*: **# Gold**",
        gold: 300,
        chance: 60
    }
];
    var explore = {
        gold: 0,
        msg: ""
    }

    var rnd = Math.random();
    var acc = 0;
    var i = 0;
    while(rnd > acc && i < outcomes.length) {
        acc += outcomes[i].chance / 100;
        if (rnd < acc) {
            var st = outcomes[i].gold;
            if(outcomes[i].good) explore.gold = st;
            else explore.gold = -st;
            explore.msg = outcomes[i].msg.replace("#", `${explore.gold}`);
        };
        i++;
    }

    return explore;
}

module.exports.help = {
    cmd: "explore",
    alias: ["felfedez"],
    name: "Explore",
    desc: "*desc*",
    usage: "%explore",
}