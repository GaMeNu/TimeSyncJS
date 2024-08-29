import fs from "node:fs";
import path from "node:path";

console.log("CURRENT WORKING DIRECTORY: " + process.cwd());

if (!fs.readdirSync(process.cwd()).includes("src")){
    throw Error("Current working directory MUST be the HOME directory! (same level as config.json)");
}
const DATAPATH = path.join(process.cwd(), "config.json");
const AUTOCONFIGPATH = path.join(process.cwd(), "autoconfig.json");

console.log(`CONFIG PATH: ${DATAPATH}`);
console.log(`AUTOCONFIG PATH: ${AUTOCONFIGPATH}`);

export class GlobalsManager {
    private static _GLOBALS_INSTANCE: GlobalsInstance;

    private static createAutoConfig(){
        console.log("Recreating AUTOCONFIG file!");
        fs.writeFileSync(AUTOCONFIGPATH, "{}")
    }

    public static reloadGlobals() {
        try {
            if (require(AUTOCONFIGPATH) == null){
                this.createAutoConfig();
            }
        } catch {
            this.createAutoConfig();
        }

        GlobalsManager._GLOBALS_INSTANCE = new GlobalsInstance();
    }

    public static updateValue(key: string, value: any){
        let currentData = require(AUTOCONFIGPATH);
        currentData[key] = value;
        fs.writeFileSync(AUTOCONFIGPATH, JSON.stringify(currentData));
        GlobalsManager.reloadGlobals();
    }

    
    public static get INSTANCE(): GlobalsInstance {
        return GlobalsManager._GLOBALS_INSTANCE
    }
    
}

class GlobalsInstance {

    private _CONFIGDATA: Object;

    private _BOT_TOKEN: string;
    private _CLIENT_ID: string;
    private _AUTHOR_ID: string;
    

    private _DATABASE: string;
    private _DB_USERNAME: string;
    private _DB_PASSWORD: string;
    private _DB_VERSION: string;

    private _DEFAULT_CALENDAR: string;

    constructor(){
        let CONFIG = require(DATAPATH);
        let AUTOCONFIG = require(AUTOCONFIGPATH);

        this._CONFIGDATA = CONFIG;
        
        this._BOT_TOKEN = CONFIG["token"];
        this._CLIENT_ID = CONFIG["client_id"];
        this._AUTHOR_ID = CONFIG["author_id"];

        this._DATABASE = CONFIG["database"];
        this._DB_USERNAME = CONFIG["db_username"];
        this._DB_PASSWORD = CONFIG["db_password"];
        this._DB_VERSION = AUTOCONFIG["db_version"];
        
        this._DEFAULT_CALENDAR = CONFIG["default_calendar"];
    }

    public get CONFIGDATA(): Object {
        return this._CONFIGDATA;
    }

    

    public get CLIENT_ID(): string {
        return this._CLIENT_ID;
    }

    public get BOT_TOKEN(): string {
        return this._BOT_TOKEN
    }

    public get AUTHOR_ID(): string {
        return this._AUTHOR_ID;
    }
    


    public get DATABASE(): string {
        return this._DATABASE;
    }

    public get DB_USERNAME(): string {
        return this._DB_USERNAME;
    }
    
    public get DB_PASSWORD(): string {
        return this._DB_PASSWORD;
    }

    public get DB_VERSION(): string {
        return this._DB_VERSION
    }

    public set DB_VERSION(version: string){
        GlobalsManager.updateValue("db_version", version);
    }

    public get DEFAULT_CALENDAR(): string {
        return this._DEFAULT_CALENDAR;
    }
    
}

GlobalsManager.reloadGlobals();


export default GlobalsManager;