import { MysqlError, Pool, PoolConnection } from "mysql";
import * as pm from "./pool_manager";
import { time } from "discord.js";
import discord from "discord.js";

module DBAPI {

    function handleError(err: MysqlError){
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

    export async function addUser(discord_id: number, timezone: string) {
        try {
            await queryDatabase("REPLACE INTO timezones (discord_id, timezone) VALUES (?, ?);", [discord_id, timezone]);
        } catch (error) {
            // Catch-n-throw! Everyone's favorite game!
            throw error;
        }
    }
}

export {DBAPI as default};