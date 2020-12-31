import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import { Message, MessageEmbed } from "discord.js";
import Economy from "../../systems/economy";
import embedTemplates from "../../utils/embed-templates";
import Database from "../../systems/database";
import tools from "../../utils/tools";

class Dice implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = true;
    isDev = false;

    name = "dice";
    aliases = [];
    desc = "You need to tip the next and the first dice sum within 30 secs";
    usage = `${Prefix}dice [amount]`;

    public static MIN_BET = 500; // Gold
    public static MULTIPLYER = 2;

    public static COOLDOWN_TIME_MILLIS = 3 * 60 * 60 * 1000; // 3 hours

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
     */
    public async execute (message: Message, args?: string[]) {
        try {
            const now = Date.now();
            const currencyData = await Economy.GetInfo(message.member);
            if(now >= currencyData.diceUseTime + Dice.COOLDOWN_TIME_MILLIS || message.author.id == message.client.devId) {
                let bet = parseInt(args[0]);
                if(isNaN(bet)) {
                    return message.channel.send(embedTemplates.Cmd.ArgErrCustom(message.client, "Please place a bet.", this));
                }
                if(bet > currencyData.balance) {
                    return message.channel.send(embedTemplates.Cmd.ArgErrCustom(message.client, "You do not have enough gold!", this));
                }
                if(bet < Dice.MIN_BET) {
                    return message.channel.send(embedTemplates.Cmd.ArgErrCustom(message.client, "The minimum bet is 500 gold!", this));
                }

                const diceNum1 = this.roleDice();
                const diceNum2 = this.roleDice();
                const sum = diceNum1 + diceNum2;
                console.log(`${diceNum1} + ${diceNum2} = ${sum}`);

                const embed = new MessageEmbed()
                    .setDescription(
                        `Dice with ${bet} amount of gold
                        Multiplyer: ${Dice.MULTIPLYER}x
                        1. dice: ${diceNum1}
                        2. dice: ?`
                    );

                return message.channel.send(embed).then(msg => {
                    const filter = (m: Message) => m.member.id == message.member.id;
                    const collector = msg.channel.createMessageCollector(filter, { time: 30000 });

                    collector.on('collect', (m: Message) => {
                        let win = false;
                        const result = m.content.match(/(\d+)/g);
                        if(!result) return;
                        const guess = parseInt(result[0]);
                        if(!isNaN(guess) && guess >= 2 && guess <= 12) {
                            embed.setDescription(
                                `Dice with ${bet} amount of gold
                                Multiplyer: ${Dice.MULTIPLYER}x
                                1. dice: ${diceNum1}
                                2. dice: ${diceNum2}
                                Sum: ${sum}`
                            );
                            if(sum == guess) {
                                Economy.Add(message.member, bet * Dice.MULTIPLYER, "Dice Win").then(currencyData => {
                                    currencyData.diceUseTime = now;
                                    Database.SetData("Currency", currencyData);
                                });
                                win = true;
                            } else {
                                Economy.Remove(message.member, bet, "Dice Lose").then(currencyData => {
                                    currencyData.diceUseTime = now;
                                    Database.SetData("Currency", currencyData);
                                });
                                win = false;
                            }
                            if(win) embed.addField("Won", `\`\`\`${bet * Dice.MULTIPLYER} Gold\`\`\``, true).setColor("GREEN");
                            else embed.addField("Lost", `\`\`\`${bet} Gold\`\`\``, true).setColor("RED");
                            message.channel.send(embed);
                            if(msg.deletable) msg.delete();
                            collector.stop("match");
                        } else message.channel.send("Guess between 2 and 12.").then(m => m.delete({timeout: 5000}));
                    });
                }).catch(console.error);
            } else {
                const { hours, minutes, seconds } = tools.ParseMilliseconds(currencyData.diceUseTime + Dice.COOLDOWN_TIME_MILLIS - now);
                const time = `${hours ? hours+" Hour(s)": ""} ${minutes ? minutes+" Minute(s)" : ""} ${seconds ? seconds+" Sec(s)" : ""}`;
                const text = `⏱️ Let's wait a litle bit before going another round. Remaining: ${time}`;
                return message.channel.send(embedTemplates.Jobs(message, "COOLDOWN", text));
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public roleDice() { return Math.floor(Math.random() * 5 + 1); }
}

export default new Dice();
