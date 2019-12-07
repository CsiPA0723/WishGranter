const DatabaseTableSchema = require('./database.json');

const sqlite = require('better-sqlite3');
const Database = new sqlite('./database/database.sqlite');

const colors = require('colors/safe');

const Functions = require('./functions.js');

/** 
 * @typedef {Object} databaseObject
 * @property {string} id
 * @property {number} rub
 * @property {number} dailyClaimTime
 * @property {number} artifactClaimTime
*/

/** @typedef {('currency')} tableName */

module.exports = {

    Database: Database,

    /**
     * @param {tableName} tableName
     * @returns {sqlite.Statement} The table
     */
    Prepare: function(tableName) {
        var tableArrString = [];
        var tableArr = DatabaseTableSchema[`${tableName}`];
        for(var i = 0; i < tableArr.length; i++) {
            tableArrString.push(`${tableArr[i].name} ${tableArr[i].type}`);
        }

        const Table = Database.prepare(`SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = '${tableName}';`).get();

        if(!Table['count(*)']) {
            Database.prepare(`CREATE TABLE ${tableName} (${tableArrString.join(', ')});`).run();
            Database.pragma("synchronous = 1");
            Database.pragma("journal_mode = wal");
        }

        console.log(colors.cyan(`DB: ${Functions.FirstCharUpperCase(tableName)} Table is Ready!`));
        return Table;
    },

    /**
     * @param {tableName} tableName The name of the table.
     * @param {string} id The searched id.
     * @returns {databaseObject} Table Data.
     */

    GetData: function(tableName, id) {
        var tableData = Database.prepare(`SELECT * FROM ${tableName} WHERE id = ? ;`).get(id);
        if(!tableData) tableData = this.GetObjectTemplate(tableName, id);
        this.SetData(tableName, tableData);
        return tableData;
    },

    /**
     * @param {tableName} tableName The name of the table.
     * @param {databaseObject} data Data that will be inserted into the table.
     * @returns {sqlite.Statement}
     */
    
    SetData: function(tableName, data) {
        var tableArr = DatabaseTableSchema[`${tableName}`];
        var names = Functions.GetObjectValueFromArray(tableArr, "name");
        return Database.prepare(`INSERT OR REPLACE INTO ${tableName} (${names.join(', ')}) VALUES (@${names.join(', @')});`).run(data);
    },

    /**
     * @param {tableName} tableName The name of the table.
     * @param {string} id Based on this id, the database will delete that data.
     * @returns {sqlite.Statement}
     */
    
    DeleteData: function(tableName, id) {
        return Database.prepare(`delete FROM ${tableName} WHERE id = ? ;`).run(id);
    },
    
    /**
     * @param {tableName} tableName The name of the table.
     * @param {string | number}  id The id which repsresent the primary key.
     * @returns {databaseObject}
     */

    GetObjectTemplate: function(tableName, id) {
        var tableArr = DatabaseTableSchema[`${tableName}`];
        var obj = { id: id };
        for(let i = 1; i < tableArr.length; i++) {
            if(tableArr[i].type.includes("BOOLEAN") || tableArr[i].type.includes("INTEGER")) {
                obj[tableArr[i].name] = 0;
            } else if(tableArr[i].type.includes("TEXT")) {
                obj[tableArr[i].name] = "None";
            } else {
                obj[tableArr[i].name] = null;
            }
        }

        return obj;
    }
}

/** @returns {number} */

function GetLastAvaiableId() {
    var statement = Database.prepare("SELECT count(*) FROM warnings;").get();
    return statement['count(*)'] + 1;
}

module.exports.config = {
    DayInMilliSeconds: 86400000,
    HalfDayInMilliSeconds: 43200000
}