// It is theoretically possible to change this to the MariaDB connector, but it IS untested and may require debugging.
import dblib from "mysql";
import fs from "node:fs";
const configdata = require("../../config.json");

const DB_USERNAME = configdata["db_username"];
const DB_PASSWORD = configdata["db_password"];
const DATABASE = configdata["database"];

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

connection.query(script);
connection.commit();
connection.end()

console.log("Successfully recreated database.");