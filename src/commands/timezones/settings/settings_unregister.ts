import discord, { SlashCommandSubcommandBuilder } from "discord.js";
import DBAPI from "../../../db/db_api";
import GM from "../../../util/globals";



let cmd = new SlashCommandSubcommandBuilder()
.setName("unregister")
.setDescription("Unregister and delete your TimeSync data")
.addStringOption(option => option
    .setName("confirmation")
    .setDescription("Enter confirmation string")
    .setRequired(false)
)
.addUserOption(option => option
    .setName("user")
    .setDescription("Specific user to unregister (Author only)")
    .setRequired(false)
);



async function execute(interaction: discord.ChatInputCommandInteraction){
    let confirmation = interaction.options.getString("confirmation");

    let user = interaction.options.getUser("user");
    if (user != null && interaction.user.id !== GM.INSTANCE.AUTHOR_ID){
        await interaction.reply("No permission.");
        return;
    }
    if (user == null) user = interaction.user;
    
    const userID = parseInt(user.id, 10);
    const confirmedString = user.username;

    const userData = await DBAPI.getUserData(userID);
    if (userData == null){
        await interaction.reply("You haven't registered your timezone yet!");
        return;
    }

    if (confirmation == null){
        interaction.reply(`This action will **delete all data** registered with your discord ID.
**WARNING:** This action is **IRREVERSIBLE**!
Type the command again with your username in the confirmation box to confirm unregistration
(\`/settings unregister confirmation:${confirmedString}\`)`)
            return;
    }

    if (confirmation !== confirmedString){
        interaction.reply("Invalid confirmation string!")
        return;
    }

    try {
        await DBAPI.deleteUserData(userID);
    } catch (error) {
        await interaction.reply(`An error occured while trying to delete your data.\n${error}`);
        console.error(error);
    } finally {
        interaction.reply("Succesfully deleted your data!")
    }
}

module.exports = {
    data: cmd,
    execute
}
