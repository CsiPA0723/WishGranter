import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import { Message } from "discord.js";
import InventoryManager from "../../systems/inventory";
import Economy from "../../systems/economy";
import embedTemplates from "../../utils/embed-templates";

class Buy implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = true;
    isDev = false;

    name = "buy";
    aliases = [];
    desc = "Buy items from the market.";
    usage = `${Prefix}buy [amount] [item id]`;

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
    */
    public async execute(message: Message, args?: string[]) {
        try {
            const amount = parseInt(args[0]);
            const itemId = parseInt(args[1]);

            if(isNaN(amount) || !amount) {
                const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Missing amount.", this);
                return message.channel.send(embed);
            }

            if(isNaN(itemId) || !itemId) {
                const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Missing item id.", this);
                return message.channel.send(embed);
            }

            const itemToBuy = InventoryManager.Items.find(item => item.id === itemId);
            if(!itemToBuy) {
                const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Item not found. Check the market for items to buy.", this);
                return message.channel.send(embed);
            }

            const price = itemToBuy.price * amount;

            const currencyData = await Economy.GetInfo(message.member);
            if(!currencyData || price > currencyData.balance) {
                const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "You do not have enough Gold for purchase.", this);
                return message.channel.send(embed);
            }

            return Economy.Remove(message.member, price, "MARKET BUY").then(async () => {
                try {
                    await InventoryManager.AddItem(message.member, itemToBuy, amount);
                    const text = `You bought ${amount} **${itemToBuy.name}** for ${price} Gold. You can check it in your inventory. (${(await message.client.CommandHandler.commands).get("inventory").usage})`;
                    return message.channel.send(embedTemplates.Jobs(message, "SUCCESS", text));
                } catch (error) {
                    return Promise.reject(error);
                }
            });       
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default new Buy();