import discord, { SlashCommandSubcommandBuilder } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";

import DBAPI from "../../db/db_api";
import CmdUtils, {SubcommandDispatcher} from "../../util/command_utils";



let cmd = new SlashCommandBuilder()
.setName("time")
.setDescription("Getting or converting time");

// Get subcommands dir
const timePath = path.join(__dirname, "time")
const dspt = SubcommandDispatcher.fromPath(timePath, cmd);


async function execute(interaction: discord.ChatInputCommandInteraction){
    // Dispatch the command
    dspt.execute(interaction);
}

module.exports = {
    data: cmd,
    execute
}
