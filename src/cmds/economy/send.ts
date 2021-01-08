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
    desc = "Sends Gold to another user!";
    usage = `${Prefix}send [amount] [user]`;

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
     */
     public async execute(message: Message, args?: string[]) {
        const target = Tools.GetMember(message, args, false);
        if(!target) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "User not found.", this);
            return message.channel.send(embed);
        }

        if(target.id === message.author.id) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Can not send to yourself.", this);
            return message.channel.send(embed);
        }

        if(target.user.bot) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Can not send to bots.", this);
            return message.channel.send(embed);
        }

        if(!args[0] || isNaN(parseInt(args[0]))) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Missing amount.", this);
            return message.channel.send(embed);
        }

        let amount = parseInt(args[0]);
        if(amount < 0) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "The amount can not be negative.", this);
            return message.channel.send(embed);
        }

        Economy.Transfer(message.member, target, amount, "Felhasználói utalás.").then(({fromUserData, toUserData, response}) => {
            if(response === ResponseTypes.INSUFFICIENT) {
                const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Your account does not have any gold.", this);
                return message.channel.send(embed);
            }

            if(response === ResponseTypes.DONE) {
                const embed = new MessageEmbed()
                    .setAuthor(message.member.displayName, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
                    .setTimestamp(Date.now())
                    .setColor(Constants.Colors.GOLD)
                    .setTitle("Gold")
                    .setDescription(`${message.member.displayName} sent ${amount} Gold to ${target}.`)
                    .addField(`${target.displayName}'s balance`, `\`\`\`${toUserData.balance} Gold\`\`\``)
                    .addField(`${message.member.displayName}'s balance`, `\`\`\`${fromUserData.balance} Gold\`\`\``);

                return message.channel.send(embed);
            }

            if(response === ResponseTypes.NONE) {
                return Promise.reject("Something went wrong");
            }
        });
    }
}

export default new Send();
