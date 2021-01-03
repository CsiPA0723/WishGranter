import { GuildMember } from "discord.js";
import Database, { Item, Users } from "../database";

class InventoryManager {
    public static Items: Item[];

    public static async UpdateItems() {
        try {
            this.Items = await Database.Connection.query("SELECT * FROM Item;");
            return Promise.resolve(this.Items);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static async GetItems(member: GuildMember): Promise<InventoryItem[]> {
        try {
            const userData = await Database.GetData("Users", member.id);
            if(!userData) {
                await Database.SetData("Users", <Users>{ id: member.id, tag: member.user.tag, inventory: "" });
                return Promise.resolve([]);
            }
            return Promise.resolve(this.StringToInventory(userData.inventory));
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static async AddItem(member: GuildMember, item: Item, amount: number) {
        try {
            const items = await this.GetItems(member);
            if(items.some(({ item: i }) => i.id === item.id)) {
                const index = items.findIndex(({ item: i }) => i.id === item.id);
                items[index].count += amount;
            } else items.push({ count: amount, item });
            
            return Database.SetData("Users", <Users>{
                id: member.id,
                tag: member.user.tag,
                inventory: this.InventoryToString(items)
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static async RemoveItem(member: GuildMember, item: Item, amount: number) {
        try {
            const items = await this.GetItems(member);
            if(items.some(({ item: i }) => i.id === item.id)) {
                const index = items.findIndex(({ item: i }) => i.id === item.id);
                if(items[index].count - amount <= 0) {
                    items.splice(index);
                } else items[index].count -= amount;
            } else return Promise.resolve("Item not found!");
            
            return Database.SetData("Users", <Users>{
                id: member.id,
                tag: member.user.tag,
                inventory: this.InventoryToString(items)
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static async SetItems(member: GuildMember, items: Item[]) {
        try {
            return Database.SetData("Users", <Users>{
                id: member.id,
                tag: member.user.tag,
                inventory: items.map(i => i.id).join(";")
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private static InventoryToString(inventory: InventoryItem[]) {
        let str = "";
        for(const invItem of inventory) {
            str += `${invItem.item.id};`.repeat(invItem.count);
        }
        return str.substring(0, str.length - 1);
    }

    private static StringToInventory(str: string) {
        let inventory: InventoryItem[] = [];
        const invItems = str.split(";");
        for(const itemId of invItems) {
            const item = this.Items.find(i => i.id.toString() === itemId);
            if(!item) throw new Error(`Item id of ${itemId} not found in InventoryManager.Items!`);
            const index = inventory.findIndex(invI => invI.item.id.toString() === itemId);
            if(index > 0) inventory[index].count++;
            else inventory.push({ count: 1, item });
        }
        return inventory;
    }
}

export default InventoryManager;

export interface InventoryItem {
    count: number;
    item: Item;
}