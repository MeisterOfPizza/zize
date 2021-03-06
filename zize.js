const fs    = require('fs');
const path  = require('path');
const chalk = require('chalk');
const {
    getParam,
    hasOption,
    hasOptionWithValue,
    formatSize,
    autoFormatSize,
} = require('./utils');

const [, assets, ...args] = process.argv;

const p_path = getParam(args, 0);

const o_abort             = hasOption(args, 'abort', 'A');
const o_extra_verbose     = hasOption(args, 'extra-verbose', 'E');
const o_help              = hasOption(args, 'help', 'H');
const o_large_dirs        = hasOption(args, 'large-dirs', 'D');
const o_large_dirs_count  = parseInt(hasOptionWithValue(args, 'large-dirs-count', 'N', '10'));
const o_large_files       = hasOption(args, 'large-files', 'F');
const o_large_files_count = parseInt(hasOptionWithValue(args, 'large-files-count', 'M', '10'));
const o_verbose           = hasOption(args, 'verbose', 'V');

if (o_help) {
    console.log(fs.readFileSync(path.resolve(assets, '../help.txt'), { encoding: 'ascii' }));
    return;
}

const getSize = require('.');

let lastDirCount  = 0;
let lastFileCount = 0;

const options = {
    onUpdateCount: (dirCount, fileCount) => {
        lastDirCount  = dirCount;
        lastFileCount = fileCount;
        if (process.stdout.cursorTo) {
            process.stdout.cursorTo(0);
            process.stdout.write(chalk.yellow(`${dirCount.toLocaleString()} directories counted, ${fileCount.toLocaleString()} files counted`));
        }
    },
};

if (o_verbose) {
    options.onStatDir = (dir, size) => {
        if (process.stdout.clearLine) {
            process.stdout.clearLine();
        }
        if (process.stdout.cursorTo) {
            process.stdout.cursorTo(0);
        }
        process.stdout.write(`${chalk.yellow(`[${autoFormatSize(size, false)}]`.padEnd(20, ' '))}${chalk.cyan(dir)}\n`);
        options.onUpdateCount(lastDirCount, lastFileCount);
    };
}

if (o_extra_verbose) {
    options.onStatFile = (file, size) => {
        if (process.stdout.clearLine) {
            process.stdout.clearLine();
        }
        if (process.stdout.cursorTo) {
            process.stdout.cursorTo(0);
        }
        process.stdout.write(`${chalk.yellow(`[${autoFormatSize(size, false)}]`.padEnd(20, ' '))}${chalk.gray(file)}\n`);
        options.onUpdateCount(lastDirCount, lastFileCount);
    };
}

if (o_abort) {
    options.abort = true;
} else {
    options.abort = false;
    options.onError = (err) => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(chalk.red(err));
        process.stdout.write('\n');
    };
}

if (o_large_dirs) {
    options.collectDirs = true;
}

if (o_large_files) {
    options.collectFiles = true;
}

getSize(path.resolve(process.cwd(), p_path || ''), options)
    .then(({ dirSize, dirSizePairs, fileSizePairs }) => {
        if (process.stdout.cursorTo) {
            process.stdout.cursorTo(0);
        }
        if (process.stdout.clearLine) {
            process.stdout.clearLine();
        }
        process.stdout.write(chalk.yellow(`${lastDirCount.toLocaleString()} directories counted, ${lastFileCount.toLocaleString()} files counted\n`));

        if (o_large_dirs) {
            process.stdout.write(chalk.green('=== Largest directories ===\n'));
            const sortedDirSizePairs = dirSizePairs.sort(([, sizeA], [, sizeB]) => sizeB - sizeA);
            for (let i = 0; i < Math.min(o_large_dirs_count, sortedDirSizePairs.length); i++) {
                const [dir, size] = sortedDirSizePairs[i];
                process.stdout.write(`#${(i + 1).toString().padEnd(4, ' ')}${chalk.yellow(`[${autoFormatSize(size, false)}]`.padEnd(20, ' '))}${chalk.cyan(dir)}\n`);
            }
        }

        if (o_large_files) {
            process.stdout.write(chalk.green('=== Largest files ===\n'));
            const sortedFileSizePairs = fileSizePairs.sort(([, sizeA], [, sizeB]) => sizeB - sizeA);
            for (let i = 0; i < Math.min(o_large_files_count, sortedFileSizePairs.length); i++) {
                const [file, size] = sortedFileSizePairs[i];
                process.stdout.write(`#${(i + 1).toString().padEnd(4, ' ')}${chalk.yellow(`[${autoFormatSize(size, false)}]`.padEnd(20, ' '))}${chalk.cyan(file)}\n`);
            }
        }

        process.stdout.write(chalk.green('=== Summary ===\n'));
        const gb        = formatSize(dirSize, 'gb');
        const mb        = formatSize(dirSize, 'mb');
        const kb        = formatSize(dirSize, 'kb');
        const gib       = formatSize(dirSize, 'gib');
        const mib       = formatSize(dirSize, 'mib');
        const kib       = formatSize(dirSize, 'kib');
        const bytes     = formatSize(dirSize);
        const lhsLength = Math.max('Decimal'.length, gb.length, mb.length, kb.length, bytes.length);
        const rhsLength = Math.max('Binary'.length, gib.length, mib.length, kib.length, '--'.length);

        process.stdout.write(`${chalk.cyan('Decimal'.padEnd(lhsLength, ' '))} | ${chalk.cyan('Binary')}\n`);
        process.stdout.write(`${''.padEnd(lhsLength, '-')} | ${''.padEnd(rhsLength, '-')}\n`);
        process.stdout.write(`${gb.padEnd(lhsLength, ' ')} | ${gib}\n`);
        process.stdout.write(`${mb.padEnd(lhsLength, ' ')} | ${mib}\n`);
        process.stdout.write(`${kb.padEnd(lhsLength, ' ')} | ${kib}\n`);
        process.stdout.write(`${bytes.padEnd(lhsLength, ' ')} | --\n`);
    })
    .catch((err) => console.error(chalk.red(err)));