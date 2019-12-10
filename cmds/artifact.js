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
    if(now >= currencyData.artifactClaimTime + database.config.HalfDayInMilliSeconds || message.author.id == bot.devId) {
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
    var goodOutcomes = [{
        msg: "Értékes képződményt találtál, amiért eladtad: **# RUB**",
        rubMax: 350,
        rubMin: 200
    }];
    var badOutcomes = [{
            msg: "Majdnem ott hagytad a fogad, te radioaktív kutyatáp! A mocsári doktor mentett meg! Orvosi költség: **# RUB**",
            rubMax: 150,
            rubMin: 100  
        },{
            msg: "Értékes képződményt találtál, de a bárban el is ittad az árát… Sőt többet is **# RUB**",
            rubMax: 200,
            rubMin: 100  
        },{
            msg: "Ördög-gyám képződményt találtál… Inkább hagyd ott **# RUB**",
            rubMax: 0,
            rubMin: 0  
        },{
            msg: "A kutatásod során rátok támadtak, nem találtál semmit. Sőt, egy bicskád is odaveszett! **# RUB**",
            rubMax: 0,
            rubMin: 0  
        },{
            msg: "Azta! Ez igen értékes darab! 3000 RUB az értéke! Ezért az egész bár a te kontodra szórakozott! Sajnos bőven elitták az árát. **# RUB**",
            rubMax: 350,
            rubMin: 200  
        }
    ]

    var retruned = {
        rub: 0,
        msg: ""
    }

    const winChance = 20;
    var rnd = Math.random();

    if(rnd < winChance / 100) {
        var { msg, rubMax, rubMin } = goodOutcomes[Math.floor(Math.random() * goodOutcomes.length)];
        retruned.rub = Math.floor(Math.random() * (rubMax - rubMin) + rubMin);
        retruned.msg = msg.replace("#", `${retruned.rub}`);
    } else {
        var { msg, rubMax, rubMin } = badOutcomes[Math.floor(Math.random() * badOutcomes.length)];
        retruned.rub = -Math.floor(Math.random() * (rubMax - rubMin) + rubMin);
        retruned.msg = msg.replace("#", `${retruned.rub}`);
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