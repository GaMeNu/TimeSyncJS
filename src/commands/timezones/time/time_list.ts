import discord, { ActionRow, ActionRowBuilder, ButtonBuilder } from "discord.js";
import { SlashCommandSubcommandBuilder } from "discord.js";
import { IANATimeZones } from "../../../util/timezones";
import FuzzyTz from "../../../util/fuzzy_tz";

const MAX_RESULTS_IN_PAGE = 25;

class SearchPageError extends Error{
    constructor(message: string){
        super(message);
        this.name = "SearchPageError"
    }
}

export function buildSearchPage(searchPage: FuzzyTz.SearchResultsPage): string{

    let page = searchPage.page;

    if (searchPage.totalResultsCount === 0 ){
        return "No results found.";
    }

    if ((page + 1) <= 0){
        return "Page number cannot be **lower than 1**!";
    }

    if ((page + 1) > searchPage.totalPages){
        return "Page number is **too high**! Please enter a lower page number";
    }

    // Construct results
    let resp: string = `### Page ${searchPage.page + 1}/${searchPage.totalPages}\n`
    searchPage.results.forEach(element => {
        resp += `- \`${element}\`\n`
    });

    resp += `-# Showing \`${searchPage.startIndex+1}-${searchPage.endIndex}\` (\`${searchPage.results.length}\`) out of \`${searchPage.totalResultsCount}\` results.`
    return resp;
}

async function execute(interaction: discord.ChatInputCommandInteraction){
    let page = interaction.options.getNumber("page");
    await interaction.deferReply();

    if (page === null) page = 0;
    else page--;

    let tz = interaction.options.getString("search");

    let res: FuzzyTz.SearchResultsPage;
    
    try {
        if (tz === null){
            res = FuzzyTz.createPage(IANATimeZones, page, MAX_RESULTS_IN_PAGE);
        } else {
            res = FuzzyTz.fuzzySearchPageTz(tz, page, MAX_RESULTS_IN_PAGE);
        }
    } catch (error){
        if (error instanceof RangeError) {
            return "Invalid page number!";
        }
        throw error;
    }

    let resp = buildSearchPage(res);

    let btnPrev = new ButtonBuilder()
    .setCustomId("list_page_prev")
    .setLabel("◀");

    let btnNext = new ButtonBuilder()
    .setCustomId("list_page_next")
    .setLabel("▶");

    if ((page + 1) <= 0){
        btnPrev.setStyle(discord.ButtonStyle.Secondary);
    } else {
        btnPrev.setStyle(discord.ButtonStyle.Primary)
    }

    if ((page + 1) > res.totalPages){
        btnNext.setStyle(discord.ButtonStyle.Secondary);
    } else {
        btnNext.setStyle(discord.ButtonStyle.Primary)
    }

    let actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(btnPrev, btnNext);


    await interaction.followUp({
        content: resp,
        components: [ actionRow ]
    });
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