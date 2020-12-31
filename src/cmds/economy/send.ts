import { Message } from "discord.js";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import { GetMember } from '../../utils/tools';

class Send implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = true;
    isDev = false;

    name = "send";
    aliases = ["utal"];
    desc = "Utalj át másoknak aranyat!";
    usage = `${Prefix}send [összeg] [név]`;

    /**
     * @param {Discord.Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
     public execute(message: Message, args?: string[]) {
        const target = GetMember(message, args.slice(1));
        if(!args[0] || !target) {
            message.channel.send(`Error, no target was specified: \`${this.help.usage}\``);
            return;
        }
        if(target.id == message.author.id) {
            message.channel.send(`Error, you cannot send Gold to yourself`);
            return;
        }
        let summary = Math.abs(parseInt(args[0])) <= Number.MAX_VALUE ? Math.abs(parseInt(args[0])) : 0;
        const currencyData = database.GetData('currency', message.author.id);
        const targetCurrencyData = database.GetData('currency', target.id);
        if(currencyData.gold <= 0 || summary < 0) summary = 0;
        else if(currencyData.gold < summary) summary = currencyData.gold;
        currencyData.gold -= summary;
        targetCurrencyData.gold += summary;
        database.SetData('currency', currencyData);
        database.SetData('currency', targetCurrencyData);
        return message.channel.send(`${summary} Gold átadva neki ${target.displayName}`);
    }
}

export default new Send();
