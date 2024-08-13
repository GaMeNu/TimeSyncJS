import discord, { SlashCommandSubcommandBuilder } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";

import DBAPI from "../../db/db_api";



let cmd = new SlashCommandBuilder()
.setName("time")
.setDescription("Timezone management command");

// Command dispatcher ("_" is default value)
const subcFuncs: { [key: string]: ((interaction: discord.ChatInputCommandInteraction) => Promise<void>) } = {
    "_": async function(interaction: discord.ChatInputCommandInteraction){
        await interaction.reply("Unrecognized subcommand (how did we get here?)")
    }
}

// Get subcommands dir
const timePath = path.join(__dirname, "time")
const timeDir = fs.readdirSync(timePath);

// Iterate over and add each command to the dispatcher
for (const subcName of timeDir){
    const subcPath = path.join(timePath, subcName);
    const subc = require(subcPath);

    if ('data' in subc && 'execute' in subc){
        let data: SlashCommandSubcommandBuilder = subc.data;
        cmd.addSubcommand(subc.data);
        subcFuncs[data.name] = subc.execute;
    } else {
        console.log(`[WARNING] Missing 'data' or 'execute' properties in subcommand file ${subcName}`)
    }
}


async function execute(interaction: discord.ChatInputCommandInteraction){
    let subcommand = interaction.options.getSubcommand();
    let func;

    if (!(subcommand in subcFuncs)) func = subcFuncs["_"];
    else func = subcFuncs[subcommand];
    
    await func(interaction);

}

module.exports = {
    data: cmd,
    execute
}
