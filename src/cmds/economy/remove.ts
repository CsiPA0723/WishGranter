import { Prefix } from "../../settings.json";
import Tools from "../../utils/tools";
import { Constants, Message, MessageEmbed, Permissions } from "discord.js";
import BaseCommand from "../../structures/base-command";
import embedTemplates from "../../utils/embed-templates";
import Economy from "../../systems/economy";

class Remove implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "remove";
    aliases = [];
    desc = "(STAFF) Ezzel a parancsal tudsz megvonni Gold-ot a felhasználókntól.";
    usage = `${Prefix}remove <felhasználó> [mennyiség] (Ha nincsen felhasználó megadva akkor te leszel.)`;

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
        
        return Economy.Remove(target, amount, "ADMIN REMOVE").then(userData => {
            const embed = new MessageEmbed()
                .setAuthor(message.member.displayName, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
                .setTimestamp(Date.now())
                .setColor(Constants.Colors.GOLD)
                .setTitle("Gold")
                .setDescription(`${target} egyenlege csökkent ${amount} Gold-al.`)
                .addField(`${target.displayName} egyenlege`, `\`\`\`${userData.balance} Gold\`\`\``);

            return message.channel.send(embed);
        });
    }
}

export default new Remove();