// It is theoretically possible to change this to the MariaDB connector, but it IS untested and may require debugging.
import dblib from "mysql";
import fs from "node:fs";
const configdata = require("../../config.json");

const DB_USERNAME = configdata["db_username"];
const DB_PASSWORD = configdata["db_password"];
const DATABASE = configdata["database"];

export const pool = dblib.createPool({
    host: "localhost",
    port: 3306,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DATABASE
})

export var getConnection = function(callback: Function) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
};