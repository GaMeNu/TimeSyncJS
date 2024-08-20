import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import Globals from "../../util/globals";

let cmd = new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Bot author only");


async function execute(interaction: CommandInteraction){
    if (interaction.user.id !== Globals.AUTHOR_ID) {
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
