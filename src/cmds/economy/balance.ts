import { Message } from "discord.js";
import BaseCommand from "../../structures/base-command";
import Discord from "discord.js";
import { Prefix } from "../../settings.json";

class Balance implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "balance";
    aliases = ["bal"];
    desc = "Az egyenleged";
    usage = `${Prefix}balance`;

    /**
     * @param {Discord.Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
     public execute(message: Message, args?: string[]) {
        const currencyData = database.GetData("currency", message.author.id);
        const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL({size: 4096, format: "png", dynamic: true}))
            .setTitle("Balance")
            .setDescription(`BALANCE: ${currencyData.gold} Gold`);
        return message.channel.send({embed: embed});
    }
}

export default new Balance();
