import * as dblib from "mysql2/promise";
import * as pm from "./pool_manager";

module DBAPI {

    export interface User extends dblib.RowDataPacket {
        discord_id: number;
        timezone: string;
        calendar?: string;
    }

    /**
     * This will probably be used to add a setUserData action that all DBAPI funcs will eventually pipe down to
     */
    export interface UserOptions {
        timezone?: string | null,
        calendar?: string | null
    }

    function handleError(err: Error | unknown){
        throw err;
    }

    async function queryDatabase<T extends dblib.QueryResult>(query: string, params: any[]): Promise<[T, dblib.FieldPacket[]]>{

        let conn;
        try {
            conn = await pm.getConnection();
        } catch (error){
            throw error;
        }

        let results;
        let fields;
        try {
            [results, fields] = await conn.query<T>(query, params);
        } catch (error) {
            throw error;
        }

        await conn.commit();
        conn.release();
        
        return [results, fields];
    }

    export async function recreateUser(discord_id: number, timezone: string) {
        try {
            await queryDatabase("INSERT INTO timezones (discord_id, timezone) VALUES (?, ?);", [discord_id, timezone]);
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * This reconfigures a user's options
     * @param discord_id User's Discord ID to reconfigure for
     * @param options UserOptions object
     */
    export async function reconfigureUser(discord_id: number, options: UserOptions){
        let sqlKeys= Object.keys(options).map(val => `${val}=?`).join(",");
        let sqlStatement = `UPDATE timezones SET ${sqlKeys} WHERE discord_id=?`
        let sqlValues = Object.values(options).map(val => {
            return val == null ? val : val.toString()
        });
        sqlValues.push(discord_id.toString());
        await queryDatabase(sqlStatement, sqlValues);
    }

    /**
     * Sets a user timezone IF THE USER ALREADY EXISTS
     * @param discord_id Discord ID of the user to set timezone for
     * @param timezone Timezone to set
     */
    async function setUserTimezone(discord_id: number, timezone: string){
        try {
            await reconfigureUser(discord_id, {timezone: timezone});
        } catch (error) {
            handleError(error);
        }
    }

    export async function setUserCalendar(discord_id: number, calendar: string) {
        try {
            await reconfigureUser(discord_id, {calendar: calendar});
        } catch (error) {
            handleError(error);
        }
    }

    export async function deleteUserCalendar(discord_id: number) {
        try {
            await reconfigureUser(discord_id, {calendar: null});
        } catch (error) {
            handleError(error)
        }
    }

    /**
     * This function will set a user's timezone if it exists, and recreate a user if it does not exist.
     * @param discord_id Discord ID to set timezone of
     * @param timezone Timezone to set
     */
    export async function safeSetUserTimezone(discord_id: number, timezone: string){
        let res;
        let fields;
        try {
            res = await queryDatabase("INSERT INTO timezones (discord_id, timezone) VALUES (?, ?) " +
                "ON DUPLICATE KEY UPDATE timezone=VALUES(timezone);", 
                [discord_id, timezone]
            );
        } catch (error) {
            handleError(error);
        }
        
    }

    export async function getUserData(discord_id: number): Promise<User | null>{
        let res;
        let fields;
        try {
            [res, fields] = await queryDatabase<User[]>("SELECT * FROM timezones WHERE discord_id=?", [discord_id])
        } catch (error){
            handleError(error);
            return null;
        }

        if (res.length === 0) return null;

        return res[0];
    }

    export async function getUserTimezone(discord_id: number): Promise<string | null>{
        let res;
        let fields;
        try {
            [res, fields] = await queryDatabase<User[]>("SELECT * FROM timezones WHERE discord_id=?", [discord_id])
        } catch (error){
            handleError(error);
            return null;
        }

        if (res.length === 0) return null;

        return res[0].timezone;
    }

    export async function deleteUserData(discord_id: number) {
        try {
            await queryDatabase("DELETE FROM timezones WHERE discord_id=?", [discord_id]);
        } catch (error){
            handleError(error);
            return;
        }
    }
}

export {DBAPI as default};