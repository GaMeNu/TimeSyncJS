import { CommandInteraction, SlashCommandBuilder } from "discord.js";

let cmd = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("🏓");


async function execute(interaction: CommandInteraction){
    interaction.reply("Pong! 🏓");
}

module.exports = {
    data: cmd,
    execute
}
