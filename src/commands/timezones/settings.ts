import discord, { SlashCommandBuilder } from "discord.js";
import path from "node:path";
import { SubcommandDispatcher } from "../../util/command_utils";



let cmd = new SlashCommandBuilder()
.setName("settings")
.setDescription("Settings command");

// Get subcommands dir
const timePath = path.join(__dirname, "settings")
const dspt = SubcommandDispatcher.fromPath(timePath, cmd);


async function execute(interaction: discord.ChatInputCommandInteraction){
    // Dispatch the command
    dspt.execute(interaction);
}

module.exports = {
    data: cmd,
    execute
}
