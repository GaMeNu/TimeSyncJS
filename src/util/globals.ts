const CONFIG = require("../../config.json");

module Globals {
    export const CONFIGDATA = CONFIG;

    export const BOT_TOKEN = CONFIG["token"];
    export const CLIENT_ID = CONFIG["client_id"];
    export const AUTHOR_ID = CONFIG["author_id"];

    export const DATABASE = CONFIG["database"];
    export const DB_USERNAME = CONFIG["db_username"];
    export const DB_PASSWORD = CONFIG["db_password"];

    export const DEFAULT_CALENDAR = CONFIG["default_calendar"];

}

export default Globals;