import { GuildMember, MessageEmbed } from "discord.js";
import Database from "../database";

export enum ResponseTypes {
    "NONE",
    "INSUFFICIENT",
    "DONE"
}

enum LogTypeHelp {
    ADD = "Jóváírás",
    REMOVE = "Levonás",
    TRANSFER = "Utalás"
}

class Economy {
    public static readonly MAX_MONEY = 1_000_000;
    public static readonly MIN_MONEY = -1_000_000;

    public static readonly DAY_IN_MILLIS = 86_400_000;

    public static async GetInfo(member: GuildMember) {
        try {
            let userData = await Database.GetData("Currency", member.id);
            
            if(!userData) {
                userData = {
                    id: member.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                }
                await Database.SetData("Currency", userData);
            }

            return Promise.resolve(userData);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static async Add(member: GuildMember, amount: number, reason?: string) {
        try {
            let userData = await Database.GetData("Currency", member.id);

            if(!userData) {
                userData = {
                    id: member.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                }
            }
    
            if(amount > this.MAX_MONEY) userData.bits = this.MAX_MONEY;
            else userData.bits += amount;
    
            await Database.SetData("Currency", userData);

            this.Log("ADD", {
                member: member,
                amount: amount,
                balance: userData.bits
            }, reason);

            return Promise.resolve(userData);
        } catch (error) {
            return Promise.reject(error);
        }   
    }

    public static async Remove(member: GuildMember, amount: number, reason?: string) {
        try {
            let userData = await Database.GetData("Currency", member.id);
            if(!userData) {
                userData = {
                    id: member.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                }
            }
    
            if(amount < this.MIN_MONEY) userData.bits = this.MIN_MONEY;
            else userData.bits -= amount;
    
            await Database.SetData("Currency", userData);

            this.Log("REMOVE", {
                member: member,
                amount: amount,
                balance: userData.bits
            }, reason);
            
            return Promise.resolve(userData);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static async Transfer(fromMember: GuildMember, toMember: GuildMember, amount: number, reason?: string) {
        try {
            let fromUserData =  await Database.GetData("Currency", fromMember.id);
            let toUserData = await Database.GetData("Currency", toMember.id);

            let response = ResponseTypes.NONE;

            if(!fromUserData) {
                fromUserData = {
                    id: fromMember.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                };
                response = ResponseTypes.INSUFFICIENT;
            }

            if(!toUserData) {
                toUserData = {
                    id: toMember.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                };
            }

            if(fromUserData.bits >= amount) {
                toUserData.bits += amount;
                fromUserData.bits -= amount;
                response = ResponseTypes.DONE;
            } else response = ResponseTypes.INSUFFICIENT;

            Database.SetData("Currency", fromUserData);
            Database.SetData("Currency", toUserData);

            if(response === ResponseTypes.DONE) {
                this.Log("TRANSFER", {
                    member: fromMember,
                    amount: amount,
                    balance: fromUserData.bits,
                    toMember: toMember,
                    toBalance: toUserData.bits
                }, reason);
            }

            return Promise.resolve({ fromUserData, toUserData, response });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private static Log(type: "ADD", options: {
        member: GuildMember,
        amount: number,
        balance: number
    }, reason?: string): any;
    private static Log(type: "REMOVE", options: {
        member: GuildMember,
        amount: number,
        balance: number
    }, reason?: string): any;
    private static Log(type: "TRANSFER", options: {
        member: GuildMember,
        amount: number,
        balance: number,
        toMember: GuildMember,
        toBalance: number
    }, reason?: string): any;
    private static Log(type: "ADD"|"REMOVE"|"TRANSFER", options: any, reason = "Nincs megadva.") {
        const { member, amount, balance } = options;
        const embed = new MessageEmbed()
            .setTimestamp(Date.now())
            .setColor("#78b159")
            .setTitle(`${LogTypeHelp[type]} (Gold)`)
            .addFields([
                { name: "Felhasználó", value: `${member}`, inline: false },
                { name: "Menyiség", value: `\`\`\`${amount} Gold\`\`\``, inline: true },
                { name: "Egyenleg", value: `\`\`\`${balance} Gold\`\`\``, inline: true }
            ]);

        if(type === "TRANSFER") {
            const { toMember, toBalance } = options;
            embed.fields[0] = {
                name: "Felhasználók",
                value: `${member} => ${toMember}`,
                inline: false
            };
            embed.fields[1].inline = false;
            embed.fields[2].name = `${member.displayName} egyenlege`
            embed.fields[2].inline = false;
            embed.addField(`${toMember.displayName} egyenlege`, `\`\`\`${toBalance} Gold\`\`\``, false);
        }

        embed.addField("Ok",`\`\`\`${reason}\`\`\``, false);

        return member.client.economyLogChannel.send({ embed: embed });
    }
}

export default Economy;