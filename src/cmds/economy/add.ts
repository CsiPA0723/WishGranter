import Tools from "../../utils/tools";
import { Constants, Message, MessageEmbed, Permissions } from "discord.js";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import Economy from "../../systems/economy";
import embedTemplates from "../../utils/embed-templates";

class Add implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "add";
    aliases = [];
    desc = "(STAFF) Ezzel a parancsal tudsz adni Gold-ot a felhasználóknak.";
    usage = `${Prefix}add <felhasználó> [mennyiség] (Ha nincsen felhasználó megadva akkor te leszel a célszemély.)`;

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
    */
    public async execute(message: Message, args?: string[]) {
        if(!message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR, { checkAdmin: true, checkOwner: true })
          && message.author.id != message.client.devId) {
            return message.channel.send("Nincs jogod ehhez a parancshoz.");
        }

        const target = Tools.GetMember(message, args);
        if(!target) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Nem találtam ilyen felhasználót.", this);
            return message.channel.send(embed);
        }

        let amount = 0;
        if(!isNaN(parseInt(args[0]))) amount = parseInt(args[0]);
        else if(!isNaN(parseInt(args[1]))) amount = parseInt(args[1]);
        else {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Mennyiség nem volt megadva.", this);
            return message.channel.send(embed);
        }

        return Economy.Add(target, amount, "ADMIN ADD").then((currencyData) => {
            const embed = new MessageEmbed()
                .setAuthor(message.member.displayName, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
                .setTimestamp(Date.now())
                .setColor(Constants.Colors.GOLD)
                .setTitle("Gold")
                .setDescription(`${target} egyenlege bővült ${amount} Gold-al.`)
                .addField(`${target.displayName} egyenlege`, `\`\`\`${currencyData.balance} Gold\`\`\``);

            return message.channel.send({ embed: embed });
        });
    }
}

export default new Add();