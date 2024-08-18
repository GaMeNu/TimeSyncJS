import discord, { ActionRow, ActionRowBuilder, BaseMessageOptions, ButtonBuilder, ButtonComponentData, ButtonInteraction, CacheType, CollectorFilter, ComponentType, InteractionReplyOptions } from "discord.js";
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
        throw new SearchPageError("No results found.");
    }

    if ((page + 1) <= 0){
        throw new SearchPageError("Page number cannot be **lower than 1**!");
    }

    if ((page + 1) > searchPage.totalPages){
        throw new SearchPageError("Page number is **too high**! Please enter a lower page number");
    }

    // Construct results
    let resp: string = `### Page ${searchPage.page + 1}/${searchPage.totalPages}\n`
    searchPage.results.forEach(element => {
        resp += `- \`${element}\`\n`
    });

    resp += `-# Showing \`${searchPage.startIndex+1}-${searchPage.endIndex}\` (\`${searchPage.results.length}\`) out of \`${searchPage.totalResultsCount}\` results.`
    return resp;
}

function generateActionRow(page: FuzzyTz.SearchResultsPage, showButtons: boolean): (ActionRowBuilder<ButtonBuilder> | null) {
    let actionRow = new ActionRowBuilder<ButtonBuilder>();

    if (!showButtons){
        return null;
    }

    let btnPrev = new ButtonBuilder()
    .setCustomId("list_page_prev")
    .setLabel("◀");

    let btnNext = new ButtonBuilder()
    .setCustomId("list_page_next")
    .setLabel("▶");

    if ((page.page + 1) <= 1){
        btnPrev.setStyle(discord.ButtonStyle.Secondary).setDisabled(true);
    } else {
        btnPrev.setStyle(discord.ButtonStyle.Primary);
    }

    if ((page.page + 1) >= page.totalPages){
        btnNext.setStyle(discord.ButtonStyle.Secondary).setDisabled(true);
    } else {
        btnNext.setStyle(discord.ButtonStyle.Primary);
    }

    actionRow.addComponents(btnPrev, btnNext);

    return actionRow;
}

function generateMessage(page: number, tz: string | null): BaseMessageOptions {

    let res: FuzzyTz.SearchResultsPage;
    
    try {
        if (tz === null){
            res = FuzzyTz.createPage(IANATimeZones, page, MAX_RESULTS_IN_PAGE);
        } else {
            res = FuzzyTz.fuzzySearchPageTz(tz, page, MAX_RESULTS_IN_PAGE);
        }
    } catch (error){
        throw error;
    }

    let resp: string;
    let showButtons: boolean = true;


    try {
        resp = buildSearchPage(res);
        showButtons = true;
    } catch (error){
        if (error instanceof SearchPageError){
            resp = error.message;
            showButtons = false;
        } else {
            resp = "";
        }
    }

    let actionRow = generateActionRow(res, showButtons);

    let message: BaseMessageOptions = {
        content: resp
    };

    if (showButtons && actionRow != null){
        message.components = [ actionRow ];
    }

    return message;

}

export async function doTimeList(interaction: discord.ChatInputCommandInteraction<discord.CacheType>, reqPage: number | null, tz: string | null) {
    let page: number;

    if (reqPage === null) page = 0;
    else page = reqPage - 1;

    let response = await interaction.followUp(generateMessage(page, tz));

    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60_000,
        dispose: true
    });

    collector.on("collect", async (i) => {

        switch (i.customId) {
            case "list_page_prev":
                page--;
                break;
            case "list_page_next":
                page++;
                break;
        }

        i.update(generateMessage(page, tz));

    });

    collector.on("end", async (i) => {

    });
}

async function execute(interaction: discord.ChatInputCommandInteraction){
    await interaction.deferReply();

    let reqPage = interaction.options.getNumber("page");
    let tz = interaction.options.getString("search");

    await doTimeList(interaction, reqPage, tz);
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
