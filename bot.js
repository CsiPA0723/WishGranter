const Discord = require('discord.js');
const bot = new Discord.Client();

const fs = require('fs');
const colors = require('colors/safe');
const dateFormat = require('dateformat');

const config = require('./config.json');
process.env.mode = config.mode;
const settings = require('./settings.json');

const database = require('./database');

/** @type {string} */
const prefix = settings.prefix;
const devPrefix = "bm>";
const devId = "333324517730680842";
bot.devPrefix = devPrefix;
bot.devId = devId;

var commands = new Discord.Collection();
var aliasCmds = new Discord.Collection();

/** @type {Discord.Guild} */
var mainGuild;
/** @type {Discord.TextChannel} */
var devLogChannel;

loadCmds();
bot.login(config.TOKEN).catch(console.error);

/** @param {number} timestamp */

bot.logDate = (timestamp) => {
    if(!timestamp) timestamp = Date.now();
    return dateFormat(timestamp, "yyyy-mm-dd | HH:MM:ss 'GMT'o");
}

bot.on('ready', () => {
    database.Prepare('currency');

    mainGuild = bot.guilds.resolve('662018979082010664');
    devLogChannel = bot.guilds.resolve('427567526935920655').channels.resolve('693080450406678528');

    bot.mainGuild = mainGuild;
    bot.devLogChannel = devLogChannel;


    console.log("Ready");
});

bot.on('message', async message => {
    if(message.author.bot) return;
    if(message.channel.type === 'dm') return;
    if(config.mode === "development" && message.author.id != config.devId) return;
    if(message.content.startsWith(`${prefix}:`)) return;

    if(message.content.startsWith(bot.devPrefix) && message.author.id === bot.devId) {
        const { command, args } = makeArgs(message, bot.devPrefix);

        var reloads = ["reloadcmds", "reload", "r"];
        var shutdowns = ["shutdown", "shut", "s"];
        var updates = ["update", "upd", "up"];
        var restarts = ["restart", "res", "rs"];
        var switchmodes = ["switchmode", "switch", "sw"];

        if(command === "eval") {
            try {
                console.log(colors.red("WARN: eval being used by " + message.member.displayName));
                const code = args.join(" ");
                var evaled = eval(code);
    
                if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
                message.channel.send(clean(evaled), {code:"xl", split: {char: '\n'} }).catch(error => {
                    console.error(`${error.name}: ${error.message}\nStack: ${error.stack}`);
                });
            } catch (err) {
                message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``).catch(error => {
                    console.error(`${error.name}: ${error.message}\nStack: ${error.stack}`);
                });
            }
        } else if(reloads.includes(command)) {
            if(devLogChannel) devLogChannel.send("\`Reloading commands\`");
            console.log("Reloading commands");
            loadCmds();
            message.channel.send("Commands successfully reloaded!");
        } 
        else if(shutdowns.includes(command)) await shutdown(message, "Shutting down");
        else if(updates.includes(command)) await shutdown(message, "Updating");
        else if(restarts.includes(command)) await shutdown(message, "Restarting");
        else if(switchmodes.includes(command)) await shutdown(message, "Switching to mode: " + (config.mode == "development" ? "production." : "development."));
    } else if(message.content.startsWith(prefix)) {
        const { command, args } = makeArgs(message, prefix);

        var logMsg = `${message.member.displayName} (${message.author.tag}) used the ${command} in ${message.channel.name}.`;

        bot.commands = commands;
        bot.aliasCmds = aliasCmds;

        /**
         * @typedef {(bot: Discord.Client, message: Discord.Message, args: Array<string>)} run
         * 
         * @typedef {Object} help
         * @property {string} cmd
         * @property {Array<string>} alias
         * @property {string} name
         * @property {string} desc
         * @property {string} usage
         * @property {string} category
         * 
         * @typedef {Object} cmd
         * @property {run} run
         * @property {help} help
         */

        /** @type {cmd} */
        var cmd = commands.get(command) || commands.get(aliasCmds.get(command)) || commands.get("help");
        if(cmd) cmd.run(bot, message, args);

        console.log(colors.cyan(logMsg));
    }
});

/**
 * @param {Discord.Message} message 
 * @param {string} prefix
 * @returns {{command:string, args: Array<string>}}
 */

function makeArgs(message, prefix) {
    var messageArray = message.content.split(/ +/g);
    var args = [];
    var command = messageArray[0].toLowerCase().slice(prefix.length);
    if(!command && messageArray[1]) {
        command = messageArray[1].toLowerCase();
        args = messageArray.slice(2);
    } else args = messageArray.slice(1);

    return { command: command, args: args };
}

/** 
 * @param {Discord.Message} message
 * @param {string} text 
 */

async function shutdown(message, text) {
    if(devLogChannel) await devLogChannel.send(`\`${text}\``);
    await message.channel.send(`\`${text}\``);
    console.log(text);
    bot.destroy();
    process.exit(0);
}

process.on('uncaughtException', err => { errorHandling(err, "Uncaught Exception") });

process.on('unhandledRejection', err => { errorHandling(err, "Unhandled Rejection") });

/**
 * @param {Error} err
 * @param {string} msg
 */

function errorHandling(err, msg) {
    if(devLogChannel) devLogChannel.send(`\`ERROR: ${msg}\`\n\`\`\`xl\n${clean(err)}\n\`\`\`\n\`SHUTTING DOWN\` | \`${bot.logDate()}\``).catch(console.error);
    console.error(err);
    bot.setTimeout(() => { bot.destroy() }, 2000);
}

/** @param {string} text */

function clean(text) {
    if (typeof(text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
}

function loadCmds() {
    fs.readdir("./cmds/",(err, files) => {
        if(err) console.error(`ERROR: ${err}`);

        var jsfiles = files.filter(f => f.split(".").pop() === "js");
        if(jsfiles.length <= 0) {
            console.log(colors.red("ERROR: No commands to load!"));
            return;
        }

        console.log(colors.cyan(`Loading ${jsfiles.length} bot commands!`));

        jsfiles.forEach((f, i) => {
            delete require.cache[require.resolve(`./cmds/${f}`)];
            var props = require(`./cmds/${f}`);
            console.log(colors.white(`${i + 1}: ${f} loaded!`));
            commands.set(props.help.cmd, props);
            props.help.alias.forEach((name) => {
                aliasCmds.set(name, props.help.cmd);
            });

        });

        bot.commands = commands;
        bot.aliasCmds = aliasCmds;
        
        console.log(colors.cyan(`Successfully loaded ${jsfiles.length} commands!`));
    });
}