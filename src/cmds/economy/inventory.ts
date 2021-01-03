import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import { Message, MessageEmbed } from "discord.js";
import InventoryManager from "../../systems/inventory";
import Economy from "../../systems/economy";

class Inventory implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "inventory";
    aliases = ["inv"];
    desc = "Shows your inventory.";
    usage = `${Prefix}inventory`;

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
    */
    public async execute(message: Message, args?: string[]) {
        try {
            const currencyData = await Economy.GetInfo(message.member);
            let balance = 0;
            if(currencyData) {
                balance = currencyData.balance;
            }
            const items = await InventoryManager.GetItems(message.member);
            const inventory: string[] = [];

            for (const { count, item } of items) {
                inventory.push(`${count} - ${item.name}`);
            }

            const embed = new MessageEmbed()
                .setAuthor(message.member.user.tag, message.member.user.avatarURL({ size: 4096, format: "png", dynamic: true }))
                .setTimestamp(Date.now())
                .setColor("BLUE")
                .setDescription(
                    `__Gold: ${balance}__
                    \n__Inventory__
                    \n${inventory.length > 0 ? inventory.join("\n") : "Empty..."}`
                ).setFooter(`Check the market for items to buy! ${(await message.client.CommandHandler.commands).get("market").usage}`);

            return message.channel.send(embed);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default new Inventory();