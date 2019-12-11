const Discord = require("discord.js");
const { mode } = require('../config.json');
const database = require('../database');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */


module.exports.run = async (bot, message, args) => {
    const currencyData = database.GetData("currency", message.author.id);
    var now = Date.now();
    if(now >= currencyData.artifactClaimTime + database.config.HalfDayInMilliSeconds || (message.author.id == bot.devId && mode == "development")) {
        var artifact = Artifact();
        currencyData.rub += artifact.rub;
        currencyData.artifactClaimTime = now;
        database.SetData("currency", currencyData);

        message.channel.send(artifact.msg);
    } else {
        message.channel.send("A kivánság nem teljesíthető, probálkoz késöbb.");
    }
}

function Artifact() {
    var outcomes = [{
        good: false,
        msg: "Azta! Ez igen értékes darab! 3000 RUB az értéke! Ezért az egész bár a te kontodra szórakozott! Sajnos bőven elitták az árát. **# RUB**",
        rubMax: 350,
        rubMin: 200,
        chance: 10
    },{
        good: true,
        msg: "Értékes képződményt találtál, amiért eladtad: **# RUB**",
        rubMax: 350,
        rubMin: 200,
        chance: 10
    },{
        good: false,
        msg: "Majdnem ott hagytad a fogad, te radioaktív kutyatáp! A mocsári doktor mentett meg! Orvosi költség: **# RUB**",
        rubMax: 150,
        rubMin: 100,
        chance: 20  
    },{
        good: false,
        msg: "Értékes képződményt találtál, de a bárban el is ittad az árát… Sőt többet is **# RUB**",
        rubMax: 200,
        rubMin: 100,
        chance: 20  
    },{
        good: false,
        msg: "Ördög-gyám képződményt találtál… Inkább hagyd ott **# RUB**",
        rubMax: 0,
        rubMin: 0,
        chance: 20 
    },{
        good: false,
        msg: "A kutatásod során rátok támadtak, nem találtál semmit. Sőt, egy bicskád is odaveszett! **# RUB**",
        rubMax: 0,
        rubMin: 0,
        chance: 20  
    }
];

    var retruned = {
        rub: 0,
        msg: ""
    }

    var rnd = Math.random();
    var acc = 0;
    var i = 0;
    while(rnd > acc && i < outcomes.length) {
        acc += outcomes[i].chance / 100;
        if (rnd < acc) {
            var rub = Math.floor(Math.random() * (outcomes[i].rubMax - outcomes[i].rubMin) + outcomes[i].rubMin);
            if(outcomes[i].good) retruned.rub = rub;
            else retruned.rub = -rub;
            retruned.msg = outcomes[i].msg.replace("#", `${retruned.rub}`);
        };
        i++;
    }

    return retruned;
}
module.exports.help = {
    cmd: "artifact",
    alias: ["artefact"],
    name: "Artifact",
    desc: "Taláj egy képződményt és add el jó pénzért!",
    usage: "~wish artifact",
}