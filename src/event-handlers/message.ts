import { Message } from "discord.js";
import colors from "colors";
import embedTemplates from "../utils/embed-templates";
import { Clean } from "../utils/tools";
import { Channels } from "../settings.json";

export default async (message: Message) => {
    if(message.partial) await message.fetch().catch(console.error);
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    if(message.author.id !== message.client.devId && message.channel.id == Channels.modLogId) {
        const reason = "A log csatornákba nem küldhetsz üzeneteket.";
        if(message.deletable) message.delete({ reason: reason }).catch(console.error);
        message.author.send(reason);
    }

    const commands = await message.client.CommandHandler.commands;

    if(checkPrefix(message.content, message.client.devPrefix) && message.author.id === message.client.devId) {
        const { command, args } = makeArgs(message, message.client.devPrefix);
        const cmd = commands.get(command);

        if(cmd && cmd.isDev) cmd.execute(message, args);
    } else if(checkPrefix(message.content, message.client.prefix)) {
        const { command, args } = makeArgs(message, message.client.prefix);
        const cmd = commands.get(command) || commands.find(c => c.aliases && c.aliases.includes(command));

        if(cmd && !cmd.isDev) {
            const logMsg = `${message.member.displayName} used the ${cmd.name} in ${message.channel.name}.`;
            if(cmd.mustHaveArgs && args.length === 0) {
                const embed = embedTemplates.Cmd.ArgErr(message.client, cmd);
                message.channel.send(embed);
            } else {
                cmd.execute(message, args).then(() => {
                    console.log(colors.cyan(logMsg));
                }).catch(error => {
                    console.error(error);
                    message.client.logChannel.send(embedTemplates.Error(`\`\`\`xl\n${Clean(error)}\n\`\`\``));
                });
            }
        } else message.channel.send(embedTemplates.Cmd.Help(message.client));
    } else if(message.mentions.has(message.client.user, { ignoreEveryone: true, ignoreRoles: true })) {
        message.channel.send(embedTemplates.Cmd.Help(message.client));
    }
}

function checkPrefix(text: string, prefix: string): boolean {
    let safePrefix = "";
    for(const char of prefix) safePrefix += `\\${char}`;
    return new RegExp(`^${safePrefix}\\w+`).test(text);
}

function makeArgs(message: Message, prefix: string): { command: string; args: string[]; } {
    const [ command, ...args ] = message.content.trim().slice(prefix.length).split(/\s+/g);
    return { command: command.toLowerCase(), args: args };
}