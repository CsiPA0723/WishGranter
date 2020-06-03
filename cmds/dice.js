const Discord = require("discord.js");

const database = require('../database');

const Min_BET = 500;
const Multiplyer = 3;

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    const currencyData = database.GetData("currency", message.author.id);
    var now = Date.now();

    var pBet = parseInt(args[0]);

    if(isNaN(pBet)) { message.channel.send(`Kérem rakjon egy tételt. \`SEGÍTSÉG\` => \`${this.help.usage}\``); return; }
    if(pBet < Min_BET) { message.channel.send(`A minimum tétel 500 gold.`); return; }
    if(pBet > currencyData.gold) { message.channel.send(`Nincs ennyi gold-od.`); return; }

    if(now >= currencyData.diceClaimTime + database.config.Hours3InMilliSeconds || message.author.id == bot.devId) {
        var diceNum1 = roleDice();
        var diceNum2 = roleDice();
        var sum = diceNum1 + diceNum2;

        var embed = new Discord.RichEmbed()
            .setDescription(
                `Kockajáték ${pBet} gold összeggel
                Szorzó: ${Multiplyer}x
                1. kocka: ${diceNum1}
                2. kocka: x`
            );

        message.channel.send(embed).then(/** @param {Discord.Message} msg */ msg => {
            const filter = m => m.member.id == message.member.id;
            const collector = msg.channel.createMessageCollector(filter, {time: 15000});

            collector.on('collect', m => {
                var win = false;
                var result = m.content.match(/(\d)/g);
                var guess = result[0];
                if(!isNaN(guess) && guess >= 2 && guess <= 12) {
                    embed.setDescription(
                        `Kockajáték ${pBet} gold összeggel
                        Szorzó: ${Multiplyer}x
                        1. kocka: ${diceNum1}
                        2. kocka: ${diceNum2}
                        Összesen: ${sum}`
                    );
                    if(sum == guess) {
                        currencyData.gold += pBet * Multiplyer;
                        win = true;
                    } else {
                        currencyData.gold -= pBet;
                        win = false;
                    }
                    if(win) embed.addField("Nyertél", `${pBet * Multiplyer} Gold-ot!`, true)
                    else embed.addField("Vesztettél", `${pBet} Gold-ot!`, true)
                    message.channel.send(embed);
                    if(msg.deletable) msg.delete();
                    database.SetData('currency', currencyData);
                    collector.stop("match");
                } else message.channel.send("Csak 2 és 12 között tippelhetsz.").then(m => m.delete(5000));
            });

            collector.on('end', (collected, reason) => {
                console.log(`Collected ${collected.size} items`);
                if(reason == "match") console.log("Match found");
                else console.log("Collector timeout");
            });
        }).catch(console.error);
    } else message.channel.send("Próbálkozz később");
}

function roleDice() { return Math.floor(Math.random() * 5 + 1); }

module.exports.help = {
    cmd: "dice",
    alias: [],
    name: "Dice",
    desc: "a játékosnak meg kell tippelnie hogy a következő kocka és az első összege mennyi lesz",
    usage: "%dice <összeg>",
}