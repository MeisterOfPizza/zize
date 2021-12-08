const getParam = (args, position) => (
    Array.isArray(args)
    && args.length - 1 >= position
    && typeof args[position] === 'string'
    && !args[position].startsWith('-')
    ? args[position] : undefined
);

const hasOption = (args, long, short = null) => (
    Array.isArray(args)
    && (
        args.includes(`--${long}`)
        || (Boolean(short) && args.includes(`-${short}`))
    )
);

const hasOptionWithValue = (args, long, short = null, fallback = undefined) => {
    if (Array.isArray(args)) {
        let results = args.filter((arg) => arg.startsWith(`--${long}=`));
        if (results.length > 0) {
            return results[0].substring(`--${long}=`.length);
        } else if (short) {
            results = args.filter((arg) => arg.startsWith(`-${short}=`));
            if (results.length > 0) {
                return results[0].substring(`-${short}=`.length);
            }
        }
    }
    return fallback;
};

const KB = Math.pow(10, 3);
const MB = Math.pow(10, 6);
const GB = Math.pow(10, 9);

const KIB = Math.pow(2, 10);
const MIB = Math.pow(2, 20);
const GIB = Math.pow(2, 30);

const B_TO_KB_FACTOR = 1 / KB;
const B_TO_MB_FACTOR = 1 / MB;
const B_TO_GB_FACTOR = 1 / GB;

const B_TO_KIB_FACTOR = 1 / KIB;
const B_TO_MIB_FACTOR = 1 / MIB;
const B_TO_GIB_FACTOR = 1 / GIB;

const roundToDecimals = (n, d) => {
    const p = Math.pow(10, d);
    return Math.round((n + Number.EPSILON) * p) / p;
};

const formatSize = (size, format) => {
    switch (format) {
        case 'kb':
            return `${Math.round(size * B_TO_KB_FACTOR).toLocaleString()} kB`;
        case 'mb':
            return `${roundToDecimals(size * B_TO_MB_FACTOR, 1).toLocaleString()} MB`;
        case 'gb':
            return `${roundToDecimals(size * B_TO_GB_FACTOR, 2).toLocaleString()} GB`;
        case 'kib':
            return `${Math.round(size * B_TO_KIB_FACTOR).toLocaleString()} KiB`;
        case 'mib':
            return `${roundToDecimals(size * B_TO_MIB_FACTOR, 1).toLocaleString()} MiB`;
        case 'gib':
            return `${roundToDecimals(size * B_TO_GIB_FACTOR, 2).toLocaleString()} GiB`;
        default:
            return `${size.toLocaleString()} bytes`;
    }
};

const autoFormatSize = (size, binary) => {
    if (binary) {
        if (size >= GIB) {
            return formatSize(size, 'gib');
        } else if (size >= MIB) {
            return formatSize(size, 'mib');
        } else if (size >= KIB) {
            return formatSize(size, 'kib');
        }
        return formatSize(size);
    }
    if (size >= GB) {
        return formatSize(size, 'gb');
    } else if (size >= MB) {
        return formatSize(size, 'mb');
    } else if (size >= KB) {
        return formatSize(size, 'kb');
    }
    return formatSize(size);
};

module.exports = {
    getParam,
    hasOption,
    hasOptionWithValue,
    formatSize,
    autoFormatSize,
};
