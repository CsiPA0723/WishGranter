import { Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";
import Tools from "../../utils/tools";
import { Prefix } from "../../settings.json";

class BotInfo implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "botinfo";
    aliases = ["bot"];
    desc = "Information of the bot.";
    usage = `${Prefix}botinfo`;
    public async execute(message: Message) {
        const msg = await message.channel.send("Genrating...");
        const bot = message.client;
        const embed = new MessageEmbed()
            .setAuthor(bot.user.username)
            .setTitle("Bot information:")
            .setDescription(
                `**Fullname:** *${bot.user.username}#${bot.user.discriminator}*
                **ID:** *${bot.user.id}*\n
                **State:** *${bot.user.presence.status}*
                **Created at:** *${bot.user.createdAt}*\n
                **Author:** *${message.guild.member("333324517730680842") || "CsiPA0723#0423"}*
                **Guild count:** *${bot.guilds.cache.size}*
                **Channel count:** *${bot.channels.cache.size}*
                **User count:** *${bot.users.cache.size}*\n
                **Uptime:** *${Tools.ParseMillisecondsIntoReadableTime(bot.uptime)}*`
            )
            .setThumbnail(bot.user.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
            .setColor(message.guild.member(bot.user).displayHexColor);

        return message.channel.send({ embed: embed }).then(() => msg.delete());
    }
}

export default new BotInfo();