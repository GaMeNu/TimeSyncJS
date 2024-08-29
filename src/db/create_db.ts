// It is theoretically possible to change this to the MariaDB connector, but it IS untested and may require debugging.
import dblib from "mysql2";
import fs from "node:fs";
import GlobalsManager from "../util/globals";
import { Connection } from "mysql2/typings/mysql/lib/Connection";

const DB_USERNAME = GlobalsManager.INSTANCE.DB_USERNAME;
const DB_PASSWORD = GlobalsManager.INSTANCE.DB_PASSWORD;
const DATABASE = GlobalsManager.INSTANCE.DATABASE;
let DB_VERSION = GlobalsManager.INSTANCE.DB_VERSION;

let wasUpdated: boolean = false;

console.log(`CURRENT DATABASE VERSION: ${DB_VERSION}`);

function finish_version(connection: Connection, newVersion: string){
    wasUpdated = true;
    connection.commit();
    DB_VERSION = newVersion;
    GlobalsManager.INSTANCE.DB_VERSION = DB_VERSION   
    console.log(`Database updated to version ${DB_VERSION}`);
}

const connection = dblib.createConnection({
    host: "localhost",
    port: 3306,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DATABASE,
    multipleStatements: true
});

connection.connect();

if (DB_VERSION == null) {
    let content = fs.readFileSync("./res/scripts/create_db.sql");
    let script = content.toString();
    try {
        let res = connection.query(script);
    } catch (error) {
        console.log("An error has occured")
        connection.end()
        throw error;
    }
    finish_version(connection, "1.0.0");
}

connection.end();
if (wasUpdated) {
    console.log("Successfully recreated/updated database!");
} else {
    console.log("Database is already up-to-date!");
    
}
console.log(`Current version: ${DB_VERSION}`)