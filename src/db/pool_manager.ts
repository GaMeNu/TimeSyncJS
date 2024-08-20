// It is theoretically possible to change this to the MariaDB connector, but it IS untested and may require debugging.
import dblib from "mysql";
import Globals from "../util/globals";

const DB_USERNAME = Globals.DB_USERNAME;
const DB_PASSWORD = Globals.DB_PASSWORD;
const DATABASE = Globals.DATABASE;

export const pool = dblib.createPool({
    host: "localhost",
    port: 3306,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DATABASE
})

export var getConnection = function(callback: (err: dblib.MysqlError, connection: dblib.PoolConnection) => void) {
    pool.getConnection(function(err: dblib.MysqlError, connection: dblib.PoolConnection) {
        callback(err, connection);
    });
};