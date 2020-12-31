import { Constants, Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import Tools from '../../utils/tools';
import embedTemplates from "../../utils/embed-templates";
import Economy, { ResponseTypes } from "../../systems/economy";

class Send implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = true;
    isDev = false;

    name = "send";
    aliases = ["utal"];
    desc = "Utalj át másoknak aranyat!";
    usage = `${Prefix}send [összeg] [név]`;

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
     */
     public async execute(message: Message, args?: string[]) {
        const target = Tools.GetMember(message, args, false);
        if(!target) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Nem találtam ilyen felhasználót.", this);
            return message.channel.send(embed);
        }

        if(target.id === message.author.id) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Magadnak nem utalhatsz bitet.", this);
            return message.channel.send(embed);
        }

        if(target.user.bot) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Botnak nem küldhetsz bitet.", this);
            return message.channel.send(embed);
        }

        if(!args[1] || isNaN(parseInt(args[1]))) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Mennyiség nem volt megadva.", this);
            return message.channel.send(embed);
        }

        let amount = parseInt(args[1]);
        if(amount < 0) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Mennyiség nem lehet negatív.", this);
            return message.channel.send(embed);
        }

        Economy.Transfer(message.member, target, amount, "Felhasználói utalás.").then(({fromUserData, toUserData, response}) => {
            if(response === ResponseTypes.INSUFFICIENT) {
                const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Jelenleg 0 bited van ezért nem tudsz küldeni másnak.", this);
                return message.channel.send(embed);
            }

            if(response === ResponseTypes.DONE) {
                const embed = new MessageEmbed()
                    .setAuthor(message.member.displayName, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
                    .setTimestamp(Date.now())
                    .setColor(Constants.Colors.GOLD)
                    .setTitle("Gold")
                    .setDescription(`${message.member.displayName} átutalt ${amount} Gold-ot ${target} egyenlegébe.`)
                    .addField(`${target.displayName} egyenlege`, `\`\`\`${toUserData.balance} Gold\`\`\``)
                    .addField(`${message.member.displayName} egyenlege`, `\`\`\`${fromUserData.balance} Gold\`\`\``);

                return message.channel.send(embed);
            }

            if(response === ResponseTypes.NONE) {
                return Promise.reject("Something went wrong");
            }
        });
    }
}

export default new Send();
