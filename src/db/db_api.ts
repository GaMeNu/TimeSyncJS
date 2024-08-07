// It is theoretically possible to change this to the MariaDB connector, but it IS untested and may require debugging.
import dblib from "mysql";
const configdata = require("../../config.json");

const DB_USER = configdata[""];

const connection = dblib.createConnection({
    host: "localhost",
    port: 3306
    // TODO: add connection
})