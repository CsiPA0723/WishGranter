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
    if(now >= currencyData.artifactClaimTime + database.config.HalfDayInMilliSeconds) {
        var artifact = Artifact();
        currencyData.rub += artifact;
        currencyData.artifactClaimTime = now;
        database.SetData("currency", currencyData);
        if(artifact > 0) {
            message.channel.send(`Értékes képződményt találtál, amiért eladtad: **${artifact} RUB**`);
        } else { 
            message.channel.send(`Majdnem ott hagytad a fogad, te radioaktív kutyatáp! A mocsári doktor mentett meg! Orvosi költség: **${Math.abs(artifact)} RUB**`);
        }
    } else {
        message.channel.send("A kivánság nem teljesíthető, probálkoz késöbb.");
    }
}

function Artifact() {
    var chance = 20;
    var rubMax = 350, rubMin = 200;
    var mRubMax = 150, mRubMin = 100;
    var rub = Math.floor(Math.random() * (rubMax - rubMin + 1) + rubMin);
    var minusRub = Math.floor(Math.random() * (mRubMax - mRubMin + 1) + mRubMin);

    var rnd = Math.random();

    if(rnd < chance / 100) return rub;
    else return -minusRub;
}

module.exports.help = {
    cmd: "artifact",
    alias: ["artefact"],
    name: "Artifact",
    desc: "Taláj egy képződményt és add el jó pénzért!",
    usage: "~wish artifact",
}