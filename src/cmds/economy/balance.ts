import { Constants, Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import Economy from "../../systems/economy";

class Balance implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "balance";
    aliases = ["bal"];
    desc = "Az egyenleged";
    usage = `${Prefix}balance`;

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
     */
     public async execute(message: Message, args?: string[]) {
        return Economy.GetInfo(message.member).then(userData => {
            const embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.avatarURL({size: 4096, format: "png", dynamic: true}))
                .setTitle("Balance")
                .setColor(Constants.Colors.GOLD)
                .setDescription(`\`\`\`${userData.balance} Gold\`\`\``);
            return message.channel.send({embed: embed});
        });
    }
}

export default new Balance();
