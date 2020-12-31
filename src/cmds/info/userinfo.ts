import { Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";
import Tools from "../../utils/tools";
import { Prefix } from "../../settings.json";

class UserInfo implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "userinfo";
    aliases = ["user"];
    desc = "View yours or others profile.";
    usage = `${Prefix}userinfo <user>`;

    public async execute(message: Message, args?: string[]) {
        const targetMember = Tools.GetMember(message, args);
        const roleArr = targetMember.roles.cache.array();
        roleArr.pop();
        let roles = roleArr.join(" | ");
        if(!roles) roles = "Do not have any roles.";

        const msg = await message.channel.send("Fetching data...");
        const avatarURL = targetMember.user.displayAvatarURL({ size: 4096, format: "png", dynamic: true });
        const embed = new MessageEmbed()
            .setAuthor(targetMember.user.tag, avatarURL)
            .setThumbnail(avatarURL)
            .setTitle("User information:")
            .setColor(targetMember.displayHexColor)
            .setDescription(
                `**Name:** *${targetMember}*
                **State:** \`${targetMember.presence.status.toUpperCase()}\`
                **Full Username:** *${targetMember.user.username}#${targetMember.user.discriminator}*
                **ID:** *${targetMember.id}*\n
                **Joined at:** *${message.client.logDate(targetMember.joinedTimestamp)}*
                **Created at:** *${message.client.logDate(targetMember.user.createdTimestamp)}*
                **Roles:** *${roles}*`
            );
        msg.channel.send({ embed: embed }).then(() => msg.delete({ reason: "Done waiting." }));
    };
}

export default new UserInfo();