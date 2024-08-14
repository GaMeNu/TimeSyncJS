import Fuse from "fuse.js";
import { FuseResult } from "fuse.js";
import { IANATimeZones } from "./timezones";

const SEARCH_TRIM_FACTOR = 0.4;

module FuzzyTz {
    export type SearchResults = string[];

    /**
     * Represents a single search results page
     */
    export type SearchResultsPage = {
        /** The actual search results on this page */
        results: SearchResults;
        /** The index of this page, starting at 0 */
        page: number;
        /** The total number of results across all pages */
        totalResultsCount: number;
        /** The total number of pages */
        totalPages: number;
        /** The starting index (inclusive) (in all results) of this page */
        startIndex: number;
        /** The ending index (exclusive) (in all results) of this page */
        endIndex: number;
    }


    export function fuzzySearchTz(tz: string): SearchResults {
        let fuse = new Fuse(IANATimeZones, {
            includeScore: true,
            shouldSort: true
        });
        let tzRes = fuse.search(tz).filter((val) => {
            if (val.score == undefined) return true;
            return (val.score <= SEARCH_TRIM_FACTOR);
        });

        return tzRes.map(element => element.item);
    }

    /**
     * Creates a new results page object.
     * @param results A list of search results to list
     * @param page The page to show
     * @param resultsPerPage The amount of results to show in a page
     * @returns a SearchResultPage object containing all data
     */
    export function createPage(results: SearchResults, page: number, resultsPerPage: number): SearchResultsPage{
        let tooManyResults = results.length > resultsPerPage;
        let originalLen = results.length;

        let startIndex = page * resultsPerPage;
        let endIndex = startIndex + resultsPerPage;
        if (endIndex > originalLen) endIndex = originalLen;

        if (tooManyResults) results = results.slice(startIndex, endIndex);
        let totalPages: number = Math.ceil((originalLen / resultsPerPage));
        return {
            results: results,
            page: page,
            totalResultsCount: originalLen,
            totalPages: totalPages,
            startIndex: startIndex,
            endIndex: endIndex
        };
    }

    export function fuzzySearchPageTz(tz: string, page: number, resultsPerPage: number): SearchResultsPage {
        // Perform fuzzy search for closest IANA timezone
        let tzRes = fuzzySearchTz(tz);
        return createPage(tzRes, page, resultsPerPage);
        
    }

}

export {FuzzyTz as default};