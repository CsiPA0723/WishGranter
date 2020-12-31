import { Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";
import Tools from "../../utils/tools";
import { Prefix } from "../../settings.json";

class Avatar implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "avatar";
    aliases = ["profile"];
    desc = "View yours or others avatar.";
    usage = `${Prefix}avatar <user>`;

    public async execute(message: Message, args: Array<string>) {
        const msg = await message.channel.send("Fetching...");
        const target = Tools.GetMember(message, args);

        const avatarUrl = target.user.displayAvatarURL({ size: 4096, format: "png", dynamic: true });

        const embed = new MessageEmbed()
            .setTitle(`${target.displayName}'s avatar`)
            .setDescription(`[Avatar LINK](${avatarUrl})`)
            .setImage(avatarUrl)
            .setColor(target.displayHexColor);

        return message.channel.send({ embed: embed }).then(() => msg.delete());
    }
}

export default new Avatar();