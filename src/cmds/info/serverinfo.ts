import BaseCommand from "../../structures/base-command";
import { Message, MessageEmbed } from "discord.js";
import { Prefix } from "../../settings.json";

class ServerInfo implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "serverinfo";
    aliases = ["server", "guild", "guildinfo"];
    desc = "Gets server information";
    usage = `${Prefix}serverinfo`;
    
    public async execute(message: Message) {
        const msg = await message.channel.send("Generating...");
        const guild = message.guild;
        const explicitLeves = {
            DISABLED: "Do not scan any media content.",
            MEMBERS_WITHOUT_ROLES: "Scan media content from members without a role.",
            ALL_MEMBERS: "Scan media content from all members."
        };
        const verificationLevel = {
            NONE: "Unrestricted",
            LOW: "Must have a verified email.",
            MEDIUM: "Verified email, registered on Discord for longer than 5 minutes.",
            HIGH: "Verified email, registered on Discord for longer than 5 minutes, member of this server for longer than 10 minutes.",
            VERY_HIGH: "Verified email, registered on Discord for longer than 5 minutes, member of this server for longer than 10 minutes, must have verified phone on their Discord account."
        };
        const embed = new MessageEmbed()
            .setTitle("Server information")
            .setThumbnail(guild.iconURL({ format: "png", size: 4096 }))
            .addFields([
                { name: "Server Name", value: `\`\`\`${guild.name}\`\`\``, inline: true },
                { name: "Server ID", value: `\`\`\`xl\n${guild.id}\`\`\``, inline: true },
                { name: "\u200b", value: "\u200b", inline: false },
                { name: "Expilict media content filter", value: `\`\`\`${explicitLeves[guild.explicitContentFilter]}\`\`\``, inline: true },
                { name: "Region", value: `\`\`\`${guild.region}\`\`\``, inline: true },
                { name: "Verification level", value: `\`\`\`${verificationLevel[guild.verificationLevel]}\`\`\``, inline: false },
                { name: "\u200b", value: "\u200b", inline: false },
                { name: "Owner", value: `${guild.owner}`, inline: false },
                { name: "Owner's Tag", value: `\`\`\`${guild.owner.user.tag}\`\`\``, inline: true },
                { name: "Owner's ID", value: `\`\`\`xl\n${guild.ownerID}\`\`\``, inline: true },
                { name: "\u200b", value: "\u200b", inline: false },
                { name: "Created at", value: message.client.logDate(guild.createdTimestamp), inline: false },
                { name: "Members", value: guild.members.cache.filter(m => !m.user.bot).size, inline: true },
                { name: "Bots", value: guild.members.cache.filter(m => m.user.bot).size, inline: true },
                { name: "Channels", value: guild.channels.cache.size, inline: true }
            ])
            .setTimestamp(Date.now())
            .setColor(guild.member(message.client.user.id).displayHexColor);

        return message.channel.send({ embed: embed }).then(() => msg.delete());
    };

}

export default new ServerInfo();