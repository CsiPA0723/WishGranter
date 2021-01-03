import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import { Message } from "discord.js";
import Economy from "../../systems/economy";
import embedTemplates from "../../utils/embed-templates";
import Database from "../../systems/database";
import tools from "../../utils/tools";

class Explore implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "explore";
    aliases = ["felfedez"];
    desc = "GO out and explore the world!";
    usage = `${Prefix}explore`;

    public static COOLDOWN_TIME_MILLIS = 5 * 60 * 60 * 1000; // 5 hours

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
     */
    public async execute (message: Message, args?: string[]) {
        try {
            const now = Date.now();
            const currencyData = await Economy.GetInfo(message.member);
            if(now >= currencyData.exploreUseTime + Explore.COOLDOWN_TIME_MILLIS || message.author.id == message.client.devId) {
                const gold = this.getExploreGold();
                const isSuccess = gold > 0 ? "SUCCESS" : "FAILED";
                if(isSuccess === "SUCCESS") {
                    await Economy.Add(message.member, gold, "Explore").then(currencyData => {
                        currencyData.exploreUseTime = now;
                        Database.SetData("Currency", currencyData);
                    });
                } else {
                    await Economy.Remove(message.member, gold, "Explore").then(currencyData => {
                        currencyData.exploreUseTime = now;
                        Database.SetData("Currency", currencyData);
                    });
                }
                
                const text = this.getRandomFlavourText(isSuccess).replace("%", `${gold}`);
                return message.channel.send(embedTemplates.Jobs(message, isSuccess, text));
                
            } else {
                const { hours, minutes, seconds } = tools.ParseMilliseconds(currencyData.exploreUseTime + Explore.COOLDOWN_TIME_MILLIS - now);
                const time = `${hours ? hours+" Hour(s)": ""} ${minutes ? minutes+" Minute(s)" : ""} ${seconds ? seconds+" Sec(s)" : ""}`;
                const text = "⏱️ You are not ready for an explore.";
                return message.channel.send(embedTemplates.Jobs(message, "COOLDOWN", text).addField("Remaining", `\`\`\`${time}\`\`\``));
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public getExploreGold() {
        return Math.random() >= 0.5 ? 300 : -150;
    }

    public getRandomFlavourText(isSuccess: "SUCCESS"|"FAILED") {
        const goodTexts = [
            "Mission complited, heres your reward: % Gold",
            "Finally, our map is getting bigger, your reward: % Gold"
        ];

        const badTexts = [
            "You failed at exploring. Lost % Gold",
            "Your ship drowned… Lost % Gold"
        ];

        return isSuccess === "SUCCESS" ? goodTexts[Math.floor(Math.random() * goodTexts.length)] : badTexts[Math.floor(Math.random() * badTexts.length)]
    }
}

export default new Explore();
