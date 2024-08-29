// It is theoretically possible to change this to the MariaDB connector, but it IS untested and may require debugging.
import dblib from "mysql2/promise";
import GM from "../util/globals";

const DB_USERNAME = GM.INSTANCE.DB_USERNAME;
const DB_PASSWORD = GM.INSTANCE.DB_PASSWORD;
const DATABASE = GM.INSTANCE.DATABASE;

export const pool = dblib.createPool({
    host: "localhost",
    port: 3306,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DATABASE
})

export var getConnection = async function getConnection() {
    return await pool.getConnection();
};