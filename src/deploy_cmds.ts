import dotenv, { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import discord, { REST } from "discord.js";
const configdata = require("../config.json");

dotenv.config();

const TOKEN: string = configdata["token"];

const CLIENT_ID: string = configdata["client_id"];

export async function deploy_cmds(client: discord.Client){
    const commands = prepare_commands(client);
    await sync_commands(client, commands);
}

/**
 * This function only sets the command for the CLIENT, without registering them against the Discord gateway.
 * @param client Client to set commands for.
 */
export async function set_client_commands(client: discord.Client){

    client.commands = new discord.Collection();

    const foldersPath = path.join(__dirname, "commands");
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders){
        const commandsPath = path.join(foldersPath, folder)
        const commandFiles = fs.readdirSync(commandsPath).filter(file => {
            return file.endsWith(".js");
        })

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            
            const command = require(filePath)
            if ('data' in command && 'execute' in command){
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] Command missing required property "data" or "exclude"at ${filePath}`);
            }
        }
    }

}

function prepare_commands(client: discord.Client){

    let commands = [];

    client.commands = new discord.Collection();

    const foldersPath = path.join(__dirname, "commands");
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders){
        const commandsPath = path.join(foldersPath, folder)
        const commandFiles = fs.readdirSync(commandsPath).filter(file => {
            return file.endsWith(".js");
        })

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            
            const command = require(filePath)
            if ('data' in command && 'execute' in command){
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
                console.log("/" + command.data.name)
            } else {
                console.log(`[WARNING] Command missing required property "data" or "exclude"at ${filePath}`);
            }
        }
    }

    return commands;
}

async function sync_commands(client: discord.Client, commands: any[]){
    const rest = new REST().setToken(TOKEN);
    try {
        console.log("Started syncing commands...");
        const data: Object = await client.rest.put(
            discord.Routes.applicationCommands(CLIENT_ID),
            {body: commands}
        ) as Object
        console.log(`Successfully synced ${Object.keys(data).length} commands.`);
    } catch (error: unknown){
        console.error(error);
        throw error;
    }
}