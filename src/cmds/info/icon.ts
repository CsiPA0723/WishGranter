import { Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";

class Icon implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "icon";
    aliases = ["servericon", "ico"];
    desc = "Gets the server's icon.";
    usage = `${Prefix}icon`;

    public async execute(message: Message) {
        if(!message.guild.iconURL()) return message.channel.send("This server does not have an icon.");
        const msg = await message.channel.send("Fetching Server icon..");
        const embed = new MessageEmbed()
            .setTitle("Server Icon")
            .setDescription(`[Icon LINK](${message.guild.iconURL({ format: "png", size: 4096 })})`)
            .setImage(message.guild.iconURL({ format: "png", size: 4096 }))
            .setColor(message.member.displayHexColor);

        return message.channel.send({ embed: embed }).then(() => msg.delete());
    }
    
}

export default new Icon();