declare module DBAPI{
    export function queryDatabase(query: string, params: any[]): Promise<any>;

    export function addUser(discord_id: number, timezone: string): Promise<boolean>;
}

export {DBAPI as default};