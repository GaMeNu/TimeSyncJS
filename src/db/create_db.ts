// It is theoretically possible to change this to the MariaDB connector, but it IS untested and may require debugging.
import dblib from "mysql2";
import fs from "node:fs";
import Globals from "../util/globals";

const DB_USERNAME = Globals.DB_USERNAME;
const DB_PASSWORD = Globals.DB_PASSWORD;
const DATABASE = Globals.DATABASE;

const connection = dblib.createConnection({
    host: "localhost",
    port: 3306,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DATABASE,
    multipleStatements: true
})

connection.connect();

let content = fs.readFileSync("./res/scripts/create_db.sql");
let script = content.toString();
try {
    let res = connection.query(script);
} catch (error) {
    console.log("An error has occured")
    connection.end()
    throw error;
}
connection.commit();
connection.end()

console.log("Successfully recreated database.");