/* libs */
const fs = require('fs');
const Path = require('path');
const { spawn } = require('child_process');
const minimist = require('minimist');

const logger = new (require('./logger'));

const data = require('./data');
const { exists, canExecute, isFile } = require('./utils');
const { VFSSource, VFSArchive, VFSFileSystem } = require('./helper');

/* args */
const args = minimist(Object.create(process.argv).splice(2));

/**
 * Run function
 * @param {minimist.ParsedArgs} args 
 */
function run(args) {
    const debug = args.debug || args.d || false;
    const exePath = args.path || args.p || './JustCause4.exe';
    const lang = args.lang || args.l || 'eng';
    const launchArgs = args.args || args.a || "";

    !debug || logger.debug("Debug mode is enabled");
    !debug || logger.debug(`Parameters:\n exePath: "${exePath}"\n lang: "${lang}"\n launchArgs: "${launchArgs}"`);

    if (data.langs.indexOf(lang) < 0) {
        return logger.error(`language "${lang}" does not exists, supported langs: ${data.langs.join(", ")}`);
    }
    if (!exists(exePath) || !isFile(exePath)) {
        return logger.error("could not find JustCause4 executable, please put this launcher inside your Just Cause 4 game folder or launch with the --path \"path/to/game\" option, --help for more infos.");
    }
    if (!canExecute(exePath)) {
        return logger.error("file cannot be executed please check your permissions.")
    }

    logger.log("Loading sources...");

    const installPath = Path.dirname(exePath);

    /**
     * @type {Array.<VFSSource>}
     */
    const defaultSources = [
        new VFSArchive(Path.join('archives_win64', 'boot'), 1000),
        new VFSArchive(Path.join("archives_win64", "boot_patch"), 999),
        new VFSArchive(Path.join("archives_win64", "main"), 1000),
        new VFSArchive(Path.join("archives_win64", "main_patch"), 999)
    ];

    /**
     * @type {Array.<VFSSource>}
     */
    const sources = [];
    sources.push(new VFSFileSystem("dropzone", -1000));
    !debug || logger.debug('added dropzone VFSFileSystem');
    sources.push(...defaultSources);
    !debug || logger.debug('added all default VFSArchives');

    const archivesPath = Path.join(installPath, "archives_win64");
    for (let contentPack of fs.readdirSync(archivesPath)) {
        if (contentPack.startsWith('cp_')) {
            sources.push(new VFSArchive(Path.join("archives_win64", contentPack), 1001));
            sources.push(new VFSArchive(Path.join("archives_win64", contentPack, lang), 1001));
            !debug || logger.debug(`added ContentPack '${contentPack}' VFSArchive`);
        }
    }

    sources.sort((a, b) => { a.priority - b.priority });
    !debug || logger.debug('VFS Sources sorted by priority');

    /**
     * @type {Array.<String>}
     */
    const parsedFaunchArgs = launchArgs == "" ? [] : launchArgs.split(" ");

    /**
     * @type {Array.<String>}
     */
    const finalArgs = [...Object.create(sources).map((/** @type {VFSSource} */ v) => v.getCommandLine()), ...parsedFaunchArgs];

    !debug || logger.debug(`final arguments: ${finalArgs.join(" ")}`);

    logger.log("Starting the game...");
    const game_proc = spawn(exePath, finalArgs, { cwd: installPath, env: process.env });
    if (game_proc) {
        game_proc.stderr.pipe(process.stderr);
        game_proc.stdout.pipe(process.stdout);
        game_proc.on('close', (code) => {
            logger.log(`Game process exited with code ${code}`);
            process.exit(0);
        });
    }
    else {
        logger.error("Could not start the game!");
    }
}

/**
 * Start
 * @param {minimist.ParsedArgs} args Parsed minimist args
 */
function start(args) {
    if (args.help || args._.join("") == "help") {
        logger.log("Help for launcher cli options:");
        logger.log();
        logger.log(" Argument                      Description                                      Default value")
        logger.log("  help, --help, -h              Shows this page");
        logger.log("  --lang, -l                    Selects the game lang                            eng");
        logger.log("  --path, -p                    Changes the path of JustCause4 exe file          \"./JustCause4.exe\"");
        logger.log("  --debug, -d                   Shows debug logs                                 false");
        logger.log("  --args, -a                    Adds custom arguments to launch                  -");
    }
    else {
        run(args);
    }
}

/* module was called directly or required as module */
if (require.main == module) {
    /* execute run */
    try {
        /* logs console output in the dropzone-launcher-latest.log */
        /* TODO
        let logFile = fs.createWriteStream('./dropzone-launcher-latest.log');

        process.stderr.on("data", data => {
            logFile.write(data);
        });
        process.stdout.on("data", data => {
            logFile.write(data);
        });

        process.on('SIGINT', () => {
            logFile.close();
            process.exit();
        });  */

        start(args);
    } catch (ex) {
        logger.fatal(ex);
    }
}
else {
    /* export run */
    module.exports = start;
    
    /**
     * Parses args array with minimist
     * @param {Array.<String>} [args] An optional argument array (typically `process.argv.slice(2)`)
     * @param {minimist.Opts} [opts] An optional options object to customize the parsing
     */
    function fromArray(args, opts) {
        return start(minimist(args, opts));
    }
    module.exports.fromArray = fromArray;
}
