import discord from "discord.js";
import { SlashCommandSubcommandBuilder } from "discord.js";
import { IANATimeZones } from "../../../util/timezones";
import FuzzyTz from "../../../util/fuzzy_tz";

const MAX_RESULTS_IN_PAGE = 25;

async function execute(interaction: discord.ChatInputCommandInteraction){
    let page = interaction.options.getNumber("page");

    if (page === null) page = 0;
    else page--;

    let search = interaction.options.getString("search");
    
    let res: FuzzyTz.SearchResultsPage;

    await interaction.deferReply();

    try {
        if (search === null){
            res = FuzzyTz.createPage(IANATimeZones, page, MAX_RESULTS_IN_PAGE);
        } else {
            res = FuzzyTz.fuzzySearchPageTz(search, page, MAX_RESULTS_IN_PAGE);
        }
    } catch (error){
        if (error instanceof RangeError) {
            await interaction.reply("Invalid page number!");
            return;
        }
        return;
    }

    if ((page + 1) <= 0){
        await interaction.followUp("Page number cannot be **lower than 1**!")
        return;
    }

    if ((page + 1) > res.totalPages){
        await interaction.followUp("Page number is **too high**! Please enter a lower page number")
        return;
    }
    
    if (res.totalResultsCount === 0 ){
        await interaction.followUp("No results found.");
        return;
    }

    // Construct results
    let resp: string = `### Page ${res.page + 1}/${res.totalPages}\n`
    res.results.forEach(element => {
        resp += `- \`${element}\`\n`
    });

    resp += `-# Showing \`${res.startIndex+1}-${res.endIndex}\` (\`${res.results.length}\`) out of \`${res.totalResultsCount}\` results.`

    await interaction.followUp(resp);
}

let cmd = new SlashCommandSubcommandBuilder()
        .setName("list")
        .setDescription("List and search timezones")
        .addStringOption(option => 
            option
            .setName("search")
            .setDescription("Search for specific timezones")
        )
        .addNumberOption(option => 
            option
            .setName("page")
            .setDescription("The page within the list")
        );

module.exports = {
    data: cmd,
    execute
}