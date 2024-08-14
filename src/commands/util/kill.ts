import { CommandInteraction, SlashCommandBuilder } from "discord.js";
const configdata = require("../../../config.json");

let cmd = new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Bot author only");


async function execute(interaction: CommandInteraction){
    if (interaction.user.id !== configdata["author_id"]) {
        await interaction.reply("No permission");
        return;
    }
    await interaction.reply("Killing bot");
    console.log("Bot killed by author.")
    process.exit(0);
}

module.exports = {
    data: cmd,
    execute
}
