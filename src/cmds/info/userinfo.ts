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
    desc = "Információk a te profilodról vagy máséról.";
    usage = `${Prefix}userinfo <felhasználó>`;

    public async execute(message: Message, args?: string[]) {
        const targetMember = Tools.GetMember(message, args);
        const roleArr = targetMember.roles.cache.array();
        roleArr.pop();
        let roles = roleArr.join(" | ");
        if(!roles) roles = "Nincsen rangja.";

        const msg = await message.channel.send("Adatok rendezése...");
        const avatarURL = targetMember.user.displayAvatarURL({ size: 4096, format: "png", dynamic: true });
        const embed = new MessageEmbed()
            .setAuthor(targetMember.user.tag, avatarURL)
            .setThumbnail(avatarURL)
            .setTitle("Felhasználói információ:")
            .setColor(targetMember.displayHexColor)
            .setDescription(
                `**Név:** *${targetMember}*
                **Státusz:** \`${targetMember.presence.status.toUpperCase()}\`
                **Teljsen Felhasználói név:** *${targetMember.user.username}#${targetMember.user.discriminator}*
                **ID:** *${targetMember.id}*\n
                **Szerverre Csatlakozott:** *${message.client.logDate(targetMember.joinedTimestamp)}*
                **Felhasználó létrehozva:** *${message.client.logDate(targetMember.user.createdTimestamp)}*
                **Rangok:** *${roles}*`
            );
        msg.channel.send({ embed: embed }).then(() => msg.delete({ reason: "Done waiting." }));
    };
}

export default new UserInfo();