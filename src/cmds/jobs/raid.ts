import { Message } from "discord.js";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import Economy from "../../systems/economy";
import Database from "../../systems/database";
import embedTemplates from "../../utils/embed-templates";
import tools from "../../utils/tools";

class Raid implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "raid";
    aliases = ["munka"];
    desc = "It's time to raid!";
    usage = `${Prefix}raid`;

    public static RANDOM_GOLD = { 
        min: 100,
        max: 250
    };

    public static COOLDOWN_TIME_MILLIS = 3 * 60 * 60 * 1000; // 3 hours

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
     */
    public async execute (message: Message, args?: string[]) {
        try {
            const now = Date.now();
            const currencyData = await Economy.GetInfo(message.member);
            if(now >= currencyData.raidUseTime + Raid.COOLDOWN_TIME_MILLIS || message.author.id == message.client.devId) {
                const gold = this.getRaidGold();
                await Economy.Add(message.member, gold, "Raid").then(currencyData => {
                    currencyData.raidUseTime = now;
                    Database.SetData("Currency", currencyData);
                });
                return message.channel.send(embedTemplates.Jobs(message, "SUCCESS", this.getRandomFlavourText().replace("%", `${gold}`))); 
            } else {
                const { hours, minutes, seconds } = tools.ParseMilliseconds(currencyData.raidUseTime + Raid.COOLDOWN_TIME_MILLIS - now);
                const time = `${hours ? hours+" Hour(s)": ""} ${minutes ? minutes+" Minute(s)" : ""} ${seconds ? seconds+" Sec(s)" : ""}`;
                const text = "⏱️ You are not ready for a battle.";
                return message.channel.send(embedTemplates.Jobs(message, "COOLDOWN", text).addField("Remaining", `\`\`\`${time}\`\`\``));
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public getRaidGold() {
        return Math.floor(Math.random() * (Raid.RANDOM_GOLD.max - Raid.RANDOM_GOLD.min) + Raid.RANDOM_GOLD.min);
    }

    public getRandomFlavourText() {
        const texts = [
            "You killed 3 man in a fight and looted them. Loot: % Gold",
            "For burning down a village you get % Gold from the High King.",
            "You selled all the weapons you looted from the raid. Your payment was: % Gold",
            "You helped your brothers with the battle paints. You recivied: % Gold",
            "Wow, your battle cry was really loud. Heres some cash: % Gold"
        ];

        return texts[Math.floor(Math.random() * texts.length)]
    }
}

export default new Raid();
