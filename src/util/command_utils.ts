import discord, { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";

namespace CmdUtils {
    /**
     * This represents an async function that handles the command interaction.
     * 
     * The function takes in a `discord.ChatInputCommandInteraction` and returns `Promise<void>`
     */
    type SubcommandHandler = ((interaction: discord.ChatInputCommandInteraction) => Promise<void>);

    /**
     * This represents a dictionary of string keys and corresponding handlers
     */
    type SubcommandDictionary = { [key: string]: SubcommandHandler };

    /**
     * 
     * @param dirPath 
     * @param cmd 
     * @returns 
     */
    export function generateSubcommands(dirPath: string, cmd: SlashCommandBuilder): SubcommandDictionary {
        // Create a new subcommand dictionary, with all subcommands and their names.
        const subcFuncs: SubcommandDictionary = {
            "_": async (interaction: discord.ChatInputCommandInteraction) => {
                await interaction.reply("Unrecognized subcommand (how did we get here?)")
            }
        }
        const timeDir = fs.readdirSync(dirPath);

        // Iterate over and add each command to the dispatcher
        for (const subcName of timeDir){
            const subcPath = path.join(dirPath, subcName);
            const subc = require(subcPath);

            if ('data' in subc && 'execute' in subc){
                let data: SlashCommandSubcommandBuilder = subc.data;
                console.log(`subc ${data.name} @ ${subcPath}`);
                cmd.addSubcommand(subc.data);
                subcFuncs[data.name] = subc.execute;
            } else {
                console.log(`[WARNING] Missing 'data' or 'execute' properties in subcommand file ${subcName}`)
            }
        }

        return subcFuncs;
    }

    export function chooseFunction(dispatcher: SubcommandDictionary){
        
    }

    export class SubcommandDispatcher {
        subcommands: SubcommandDictionary;

        constructor(subcommands: SubcommandDictionary){
            this.subcommands = subcommands;
        }

        public static fromPath(dirPath: string, cmd: SlashCommandBuilder){
            return new SubcommandDispatcher(generateSubcommands(dirPath, cmd));
        }

        public async execute(interaction: discord.ChatInputCommandInteraction){
            let subcommand = interaction.options.getSubcommand();
            let func;
            
            if (!(subcommand in this.subcommands)) func = this.subcommands["_"];
            else func = this.subcommands[subcommand];

            await func(interaction);
            
        }
    }

}

export const SubcommandDispatcher = CmdUtils.SubcommandDispatcher;

export default CmdUtils;