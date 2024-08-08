import discord from "discord.js";
import { CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";

let time_set = function (subcommand: SlashCommandSubcommandBuilder){
    return subcommand
        .setName("set")
        .setDescription("Set your timezone")
        .addStringOption(option => 
            option
            .setName("timezone")
            .setDescription("Your timezone of choice")
            .setRequired(true)
        ).addUserOption(option => 
            option
            .setName("user")
            .setDescription("A user to set timezone of (requires permissions)")
        );
}

let cmd = new SlashCommandBuilder()
    .setName("time")
    .setDescription("Timezone management command")
    .addSubcommand(time_set);

async function exc_time_set(interaction: discord.ChatInputCommandInteraction) {
    let tz = interaction.options.getString("timezone")
    interaction.reply(`/time set ${tz}`);
}


async function execute(interaction: discord.ChatInputCommandInteraction){
    let subcommand = interaction.options.getSubcommand();
    let func: Function;
    switch (subcommand){
        case "set": 
            func = exc_time_set;
            break;
        
        default:
            func = async function(interaction: discord.ChatInputCommandInteraction){
                await interaction.reply("Unrecognized subcommand (how did we get here?)")
            }
            break;
    }

    await func(interaction);
}

module.exports = {
    data: cmd,
    execute
}
