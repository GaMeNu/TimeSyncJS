import { MysqlError, Pool, PoolConnection } from "mysql";
import * as pm from "./pool_manager";
import { time, User } from "discord.js";
import discord from "discord.js";

module DBAPI {

    export type User = {
        discord_id: number;
        timezone: string;
        calendar?: string;
    }

    function handleError(err: MysqlError | unknown){
        throw err;
    }

    async function queryDatabase(query: string, params: any[]): Promise<any>{

        return new Promise((resolve, reject) => {
            pm.getConnection((err: MysqlError, conn: PoolConnection) => {
            if (err) {
                return reject(err);
            }

            conn.query(query, params, (queryErr, results) => {
                    conn.commit();

                    conn.release();

                    if (queryErr) {
                        return reject(queryErr);
                    }

                    resolve(results);
                });
            });

        })
    }

    export async function setUserTimezone(discord_id: number, timezone: string) {
        try {
            await queryDatabase("REPLACE INTO timezones (discord_id, timezone) VALUES (?, ?);", [discord_id, timezone]);
        } catch (error) {
            // Catch-n-throw! Everyone's favorite game!
            handleError(error);
        }
    }

    export async function setUserCalendar(discord_id: number, calendar: string) {
        try {
            await queryDatabase("UPDATE timezones SET calendar=? WHERE discord_id=?;", [calendar, discord_id]);
        } catch (error) {
            // Catch-n-throw! Everyone's favorite game!
            handleError(error);
        }
    }

    export async function getUserData(discord_id: number): Promise<User | null>{
        let res;
        try {
            res = await queryDatabase("SELECT * FROM timezones WHERE discord_id=?", [discord_id])
        } catch (error){
            handleError(error);
        }

        if (res.length === 0) return null;

        let user: User = {
            discord_id: res[0].discord_id,
            timezone: res[0].timezone
        };
        if (res[0].calendar !== null){
            user.calendar = res[0].calendar
        };

        return user;
    }

    export async function getUserTimezone(discord_id: number): Promise<string | null>{
        let res;
        try {
            res = await queryDatabase("SELECT * FROM timezones WHERE discord_id=?", [discord_id])
        } catch (error){
            handleError(error);
        }

        if (res.length === 0) return null;

        return res[0];
    }

    export async function deleteUserData(discord_id: number) {
        let res;
        try {
            res = await queryDatabase("DELETE FROM timezones WHERE discord_id=?", [discord_id]);
        } catch (error){
            handleError(error);
        }
    }
}

export {DBAPI as default};