const fs = require("node:fs");
const path = require("node:path");
/*
 ************************************************************************************
 *                 OOPS! I accidentally ran "tsc" without --outDir!                 *
 ************************************************************************************
 * This is a script with the purpose of clearing any files that have the ".js"      *
 * file extension from this project's source directory, and any subdirectories.     *
 * Yes, I find it hilarious to include these things in the GitHub commit. Sue me.   *
 ************************************************************************************
 */

function iterateDir(dirpath, depth){
    // Get all files/dirs in this dir, and increase the depth.
    objsnames = fs.readdirSync(dirpath);
    depth++;

    // Perform task for all objects in the directory
    for (const objname of objsnames){
        // Prepare vars (curpath for current path, rest is formatting)
        const curpath = path.join(dirpath, objname);
        const indent = ("│ ".repeat(depth-1));
        const pref = "├─╴ ";

        if (objname.endsWith(".js") && fs.lstatSync(curpath).isFile()) {
            // If we have found a .js file, log it to the terminal, delete it, and continue to next iteration
            console.log(`${indent}${pref}\x1b[31;1m${objname}\x1b[0m`);
            fs.rmSync(curpath);
            continue;
        } else if (fs.lstatSync(curpath).isDirectory()){
            // If this is a directory, recursively perform this function on it as well.
            console.log(`${indent}${pref}${objname}`);
            iterateDir(curpath, depth);
        }
    }
}


iterateDir("./src", 0);

