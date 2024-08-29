import discord from "discord.js";
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import GM from "../../util/globals";

let cmd = new SlashCommandBuilder()
    .setName("about")
    .setDescription("Info about the bot");


async function execute(interaction: CommandInteraction){
    let embed = new EmbedBuilder()
    .setAuthor({
        name: "GaMeNu's",
        url: "https://github.com/GaMeNu"
    })
    .setTitle("TimeSyncJS")
    .setDescription("A bot to manage timezones")
    .addFields(
        {
            name: "Description",
            value: 
`TimeSync is a Discord bot with the purpose of enabling quick and easy time sharing, conversion, and management between different users and servers.
TimeSyncJS is a JavaScript/TypeScript rewrite of an older Python bot. This version is thus faster, while giving me some JS experience lol.`
        },
        {
            name: "Creating a profile",
            value: 
`To register with the bot and create your own profile, simply register your timezone with \`/settings timezone\`.
TimeSync profiles are shared between all servers that this TimeSync instance is in.`
        },
        {
            name: "Regarding self-hosting",
            value:
`TimeSync can be easily self-hosted, as the source code is available fully, as well as instructions, in the official GitHub repository (see Links)`
        },
        {
            name: "Links",
            value:
`> [GitHub](https://github.com/GaMeNu/TimeSyncJS)
> [Public instance invite link](https://discord.com/oauth2/authorize?client_id=1272670959693725747&permissions=2147493888&integration_type=0&scope=applications.commands+bot)`
        }
    )
    ;

    interaction.reply({
        embeds: [embed]
    })

}

module.exports = {
    data: cmd,
    execute
}
