import { Message, Guild, GuildMember, MessageEmbed, Client } from "discord.js";
import BaseCommand from "../structures/base-command";
import Settings from "../settings.json";

export default {
    Warning: (targetMember: GuildMember, issuer: GuildMember, reason: string): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle("Figyelmeztetés")
            .addField("Név:", `${targetMember.displayName} (${targetMember.user.tag})`)
            .addField("Id:", `${targetMember.id}`)
            .addField("Oka:", `${reason}`)
            .addField("Adó:", `${issuer.displayName} (${issuer.user.tag} | ${issuer.id})`)
            .setTimestamp(Date.now());
        return embed;
    },

    SpamDelete: (message: Message, reason: string): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("ORANGE")
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
            .setDescription(`**${message.member} üzenete törölve a ${message.channel} szobából.**`)
            .addField("Törlés Oka:", reason)
            .setFooter(`USER_ID: ${message.author.id}`)
            .setTimestamp(Date.now());
        return embed;
    },

    MsgDelete: (message: Message, reason: string, foundTexts?: string[]): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("ORANGE")
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
            .setDescription(`**${message.member} üzenete törölve a ${message.channel} szobából.**`)
            .addField("Üzenet:", message.content)
            .addField("Törlés Oka:", reason)
            .setFooter(`USER_ID: ${message.author.id}`)
            .setTimestamp(Date.now());

        if(foundTexts && foundTexts[0]) {
            embed.addField("Talált szavak/linkek", foundTexts.join(", "));
        }
        
        return embed;
    },

    Join: (guild: Guild, member: GuildMember): MessageEmbed => {
        const embed = new MessageEmbed()
            .setAuthor(guild.owner.displayName, guild.owner.user.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
            .setTitle("Üdv a szerveren!")
            .setThumbnail(guild.iconURL({ size: 4096, format: "jpg" }))
            .setDescription(`${member} érezd jól magad!`)
            .setTimestamp(member.joinedAt);
        return embed;
    },

    JoinRequest: (message: Message): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("AQUA")
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
            .setDescription(`${message.member} szeretne csatlakozni a közösségünkbe!`)
            .addField("Üzenet:", message.content)
            .addField("URL:", message.url)
            .setFooter(`USER_ID: ${message.author.id}`)
            .setTimestamp(message.createdAt);
        return embed;
    },

    Error: (code: string): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("RED")
            .setTitle("ERROR")
            .setDescription(code)
            .setTimestamp(Date.now());
        return embed;
    },

    Cmd: {
        ArgErr: (client: Client, cmd: BaseCommand): MessageEmbed => {
            const embed = new MessageEmbed()
                .setTimestamp(Date.now())
                .setColor("RED")
                .setTitle("Error")
                .setDescription("```md\nIncomplete command!```")
                .addFields([
                    { name: "Help", value: `\`\`\`md\n${cmd.usage}\`\`\``, inline: false },
                    { name: "For More Help", value: `\`\`\`md\n${Settings.Prefix}help ${cmd.name}\`\`\``, inline: true },
                ]).setFooter(`In case of an error, please contact my author:! ${client.users.resolve(client.devId).tag}`);
            return embed;
        },

        ArgErrCustom: (client: Client, desc: string, cmd: BaseCommand): MessageEmbed => {
            const embed = new MessageEmbed()
                .setTimestamp(Date.now())
                .setColor("RED")
                .setTitle("Error")
                .setDescription(`\`\`\`md\n${desc}\`\`\``)
                .addFields([
                    { name: "Help", value: `\`\`\`md\n${cmd.usage}\`\`\``, inline: false },
                    { name: "For More Help", value: `\`\`\`md\n${Settings.Prefix}help ${cmd.name}\`\`\``, inline: true },
                ]).setFooter(`In case of an error, please contact my author:! ${client.users.resolve(client.devId).tag}`);
            return embed;
        },

        Help: (client: Client): MessageEmbed => {
            const embed = new MessageEmbed()
                .setTimestamp(Date.now())
                .setColor("GREEN")
                .setTitle("For help write:")
                .setDescription(`\`\`\`md\n${Settings.Prefix}help\`\`\``)
                .setFooter(`In case of an error, please contact my author:! ${client.users.resolve(client.devId).tag}`);
            return embed;
        }
    },

    Jobs: (message: Message, type: "SUCCESS"|"FAILED"|"COOLDOWN", text: string) => {
        let color: string;
        if(type === "SUCCESS") color = "GREEN";
        else if(type === "FAILED") color = "RED";
        else if(type === "COOLDOWN") color = "BLUE";

        const embed = new MessageEmbed()
            .setAuthor(message.member.user.tag, message.member.user.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
            .setColor(color)
            .setDescription(text)
            .setTimestamp(Date.now());
        return embed;
    },

    Online: (mode: string): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("Online")
            .setDescription(mode)
            .setTimestamp(Date.now());
        return embed;
    },

    Shutdown: (mode: string): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("YELLOW")
            .setTitle("Shutting Down")
            .setDescription(mode)
            .setTimestamp(Date.now());
        return embed;
    }
};