import { Client, TextChannel } from "discord.js";
const client = new Client({
    partials: ["GUILD_MEMBER", "CHANNEL", "MESSAGE", "REACTION", "USER"],
    ws: { intents: [
        "DIRECT_MESSAGES",
        "DIRECT_MESSAGE_REACTIONS",
        "DIRECT_MESSAGE_TYPING",
        "GUILDS",
        "GUILD_BANS",
        "GUILD_EMOJIS",
        "GUILD_INTEGRATIONS",
        "GUILD_INVITES",
        "GUILD_MEMBERS",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_REACTIONS",
        "GUILD_MESSAGE_TYPING",
        "GUILD_PRESENCES",
        "GUILD_VOICE_STATES",
        "GUILD_WEBHOOKS"
    ]}
});

import path from "path";
process.env.APP_ROOT = path.resolve(__dirname).split("\\").slice(0, -1).join("/");

import Config from "./config.json";
process.env.mode = Config.mode;

import Settings from "./settings.json";
import CommandHandler from "./command-handler";
import EventHandler from "./event-handler";
// import Database from "./systems/database";
import EmbedTemplates from "./utils/embed-templates";

import colors from "colors";

client.prefix = Settings.Prefix;

client.devPrefix = "#%";
client.devId = "333324517730680842";

console.log(colors.yellow("BOT Starting...\n"));
client.CommandHandler = new CommandHandler();
client.EventHandler = new EventHandler(client);

import dateFormat from "dateformat";
import { Clean } from "./utils/tools";
client.logDate = (timestamp: number) => {
    if(!timestamp) timestamp = Date.now();
    return dateFormat(timestamp, "yyyy-mm-dd | HH:MM:ss 'GMT'o");
};

const statuses = [`${Settings.Prefix}help`, "Made By CsiPA0723#0423"];

client.on("ready", async () => {
    client.logChannel = <TextChannel>client.channels.resolve(Settings.Channels.modLogId);
    
    // await Database.Connect().catch(console.error);

    console.log("Ready!");

    client.logChannel.send(EmbedTemplates.Online(`**Mode:**\`\`\`${Config.mode}\`\`\``));
    if(Config.mode === "development") {
        client.user.setPresence({ activity: { name: "in development", type: "PLAYING" }, status: "dnd" });
    } else {
        client.setInterval(() => {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            client.user.setPresence({ activity: { name: `${status}`, type: "WATCHING" }, status: "online" });
        }, 30000); // Half a minute
    }
});

client.login(Config.TOKEN).catch(console.error);

process.on("uncaughtException", err => { errorHandling(err, "Uncaught Exception", true); });

process.on("unhandledRejection", err => { errorHandling(err, "Unhandled Rejection", false); });

async function errorHandling(err: Error | any, msg: string, toShutdown = false) {
    try {
        console.error(err);
        let logMsg = `\`${msg}\`\n\`\`\`xl\n${Clean(err)}\n\`\`\``;
        if(toShutdown) logMsg += `\n\`SHUTTING DOWN\` | \`${client.logDate()}\``;
        const embed = EmbedTemplates.Error(logMsg);
        if(client.logChannel) await client.logChannel.send({ embed: embed }).catch(console.error);
        if(toShutdown) {
            // await Database.Connection.end().then(() => console.log("Database shutdown"));
            client.setTimeout(() => { client.destroy(); }, 2000);
        }
    } catch (error) {
        console.error(error);
    }
}