import { MysqlError, Pool, PoolConnection } from "mysql";
import * as pm from "./pool_manager";
import { time } from "discord.js";

function handleError(err: MysqlError){
    throw err;
}

async function queryDatabase(query: string, params: any){

    return new Promise((resolve, reject) => {
        pm.getConnection((err: MysqlError, conn: PoolConnection) => {
        if (err) {
            return reject(err);
        }

        conn.query(query, params, (queryErr, results) => {
                conn.release();

                if (queryErr) {
                    return reject(queryErr);
                }

                resolve(results);
            });
        });
    })
}

async function addUser(discord_id: number, timezone: string){
    try {
        await queryDatabase("REPLACE INTO timezones (discord_id, timezone) VALUES (%s, %s)", [discord_id, timezone]);
    } catch (error) {
        console.error(error);
    }
}
