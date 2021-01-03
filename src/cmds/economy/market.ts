import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import { Message, MessageEmbed } from "discord.js";
import InventoryManager from "../../systems/inventory";
import Economy from "../../systems/economy";

class Buy implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "market";
    aliases = ["shop"];
    desc = "Shows what's avaiable on the market.";
    usage = `${Prefix}market`;

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
    */
    public async execute(message: Message, args?: string[]) {
        try {
            const market: string[] = [];

            for(const { id, name, alias, price } of InventoryManager.Items) {
                market.push(`\`${id}\` - **${name}** (${alias}) --- ${price} Gold`);
            }

            const embed = new MessageEmbed()
                .setAuthor(message.member.user.tag, message.member.user.avatarURL({ size: 4096, format: "png", dynamic: true }))
                .setTimestamp(Date.now())
                .setColor("BLUE")
                .setTitle("Market")
                .setDescription(`${market.join("\n")}`)
                .addField("Help", `${(await message.client.CommandHandler.commands).get("buy").usage}`);

            return message.channel.send(embed);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default new Buy();