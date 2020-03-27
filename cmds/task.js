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
    if(now >= currencyData.taskClaimTime + database.config.Hours6InMilliSeconds || message.author.id == bot.devId) {
        var task = Task();
        currencyData.st += task.st;
        currencyData.taskClaimTime = now;
        database.SetData("currency", currencyData);
        message.channel.send(task.msg); 
    } else {
        message.channel.send("There is no task for you right now!");
    }
}

function Task() {
    var outcomes = [{
        good: false,
        msg: "YOU NEED TO BE WAY BETTER, TO GET THAT IRON CROSS: **# ST**",
        st: 150,
        chance: 40
    },{
        good: true,
        msg: "THANKS FOR YOUR SERVICE! PAYMENT: **# ST**",
        st: 300,
        chance: 60
    }
];
    var returned = {
        st: 0,
        msg: ""
    }

    var rnd = Math.random();
    var acc = 0;
    var i = 0;
    while(rnd > acc && i < outcomes.length) {
        acc += outcomes[i].chance / 100;
        if (rnd < acc) {
            var st = outcomes.st;
            if(outcomes[i].good) returned.st = st;
            else retruned.st = -st;
            retruned.msg = outcomes[i].msg.replace("#", `${returned.st}`);
        };
        i++;
    }

    return returned;
}

module.exports.help = {
    cmd: "task",
    alias: ["feladat"],
    name: "Task",
    desc: "Végezz el valami feladatot! (6 óránkét elérhető)",
    usage: "%task",
}