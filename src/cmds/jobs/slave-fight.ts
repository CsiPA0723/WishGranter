import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import { Collection, Message, Snowflake } from "discord.js";
import InventoryManager from "../../systems/inventory";
import embedTemplates from "../../utils/embed-templates";
import tools from "../../utils/tools";
import Economy from "../../systems/economy";

class SlaveFight implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = true;
    isDev = false;

    name = "slave-fight";
    aliases = ["slave"];
    desc = "Sends your slave to fight.";
    usage = `${Prefix}slave-fight [gold]`;

    static COOLDOWN = new Collection<Snowflake, { timestampt: number, timeout: NodeJS.Timeout }>();

    static MULTIPLYER = 2;

    static get SLAVE() {
        const item = InventoryManager.Items.find(i => i.name.toLowerCase() === "slave");
        if(!item) throw new Error("SLAVE item not found in database!");
        return item;
    }

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
    */
    public async execute(message: Message, args?: string[]) {
        try {
            const now = Date.now();
            if(SlaveFight.COOLDOWN.has(message.member.id)) {
                const { timestampt } = SlaveFight.COOLDOWN.get(message.member.id);
                const { hours, minutes, seconds } = tools.ParseMilliseconds(timestampt + 30_000 - now);
                const time = `${hours ? hours+" Hour(s)": ""} ${minutes ? minutes+" Minute(s)" : ""} ${seconds ? seconds+" Sec(s)" : ""}`;
                const text = "⏱️ You slave doesn't ready for a fight.";
                return message.channel.send(embedTemplates.Jobs(message, "COOLDOWN", text).addField("Remaining", `\`\`\`${time}\`\`\``));
            }

            const userInventory = await InventoryManager.GetItems(message.member);
            if(!userInventory.some(invI => invI.item.id === SlaveFight.SLAVE.id)) {
                return message.channel.send(embedTemplates.Jobs(message, "FAILED", "You have no slave yet. Go buy one."));
            }

            const bet = parseInt(args[0]);

            if(isNaN(bet) || !bet) {
                const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Please place a bet.", this);
                return message.channel.send(embed);
            }

            const won = Math.random() >= 0.6;
            if(won) {
                await Economy.Add(message.member, bet * SlaveFight.MULTIPLYER, "Slave Fight Won");
                SlaveFight.COOLDOWN.set(message.member.id, {
                    timestampt: now,
                    timeout: setTimeout(() => {
                        SlaveFight.COOLDOWN.delete(message.member.id);
                    }, 30_000) // 30 seconds
                });
                const text = `Your slave won the fight. Your reward: ${bet * SlaveFight.MULTIPLYER} Gold`;
                return message.channel.send(embedTemplates.Jobs(message, "SUCCESS", text));
            } else {
                await InventoryManager.RemoveItem(message.member, SlaveFight.SLAVE, 1);
                await Economy.Remove(message.member, bet, "Slave Fight Lost");
                SlaveFight.COOLDOWN.set(message.member.id, {
                    timestampt: now,
                    timeout: setTimeout(() => {
                        SlaveFight.COOLDOWN.delete(message.member.id);
                    }, 30_000) // 30 seconds
                });
                return message.channel.send(embedTemplates.Jobs(message, "FAILED", `Your slave lost the fight. Lost: ${bet} Gold`));
            }

        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default new SlaveFight();