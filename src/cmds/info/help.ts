import Discord from "discord.js";
import BaseCommand from "../../structures/base-command";
import Tools from "../../utils/tools";
import { Prefix } from "../../settings.json";

enum CategoryTranslation {
    dev = "Developer",
    economy = "Economy",
    fun = "Fun",
    info = "Information",
    jobs = "Jobs",
    misc = "Miscellaneous",
    mod = "Moderator",
    staff = "Staff",
    test = "Test",
    utility = "Utility"
}

class Help implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "help";
    aliases = ["segitseg", "segítség"];
    desc = "List of the commands";
    usage = `${Prefix}help <command>`;

    public async execute(message: Discord.Message, args?: string[]) {
        const bot = message.client;
        const commands = await bot.CommandHandler.commands;
        const categories = await bot.CommandHandler.categories;


        let embed = new Discord.MessageEmbed()
            .setTitle("List of the commands")
            .setColor(message.guild.member(bot.user).displayHexColor)
            .setDescription(`**\`${Prefix}help <command>\` » For more help.**`)
            .addField("Symbols:", "<optional> | [must]", true);

        if(args[0]) {
            const cmd = commands.get(args[0].toLowerCase()) || commands.find(c => c.aliases && c.aliases.includes(args[0].toLowerCase()));
            if(cmd) {
                embed = new Discord.MessageEmbed()
                    .setTitle(Tools.FirstCharUpperCase(cmd.name))
                    .setColor(message.guild.member(bot.user).displayHexColor)
                    .setTimestamp(Date.now())
                    .setDescription(`\`\`\`md\n# ${cmd.desc}\`\`\``)
                    .addField("Usage:", `\`\`\`md\n${cmd.usage}\`\`\``);
                if(cmd.aliases && cmd.aliases.length > 0) {
                    embed.addField("Alias:", `\`${Prefix}${cmd.aliases.join(`\` \`${Prefix}`)}\``);
                }
                embed.addField("Symbols:", "<optional> | [must]", true);
                return message.channel.send({ embed: embed });
            } else { return message.channel.send("Command not found."); }
        } else {
            categories.forEach((cmdNames, category) => {
                if(category !== "dev" && category !== "test") {
                    embed.addField(`${CategoryTranslation[category]} ─ ${cmdNames.length}`, `\`${cmdNames.join("` `")}\``);
                }
            });
            return message.channel.send({ embed: embed });
        }
    }
}

export default new Help();