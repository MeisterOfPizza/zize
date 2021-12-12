const {
    getParam,
    hasOption,
    hasOptionWithValue,
    formatSize,
    autoFormatSize,
} = require('../utils');

describe('getParam', () => {
    test('no input', () => {
        expect(getParam()).toBe(undefined);
    });
    test('invalid array', () => {
        expect(getParam({}, 0)).toBe(undefined);
    });
    test('invalid position', () => {
        expect(getParam([], -1)).toBe(undefined);
    });
    test('invalid position', () => {
        expect(getParam([], 1)).toBe(undefined);
    });
    test('empty', () => {
        expect(getParam([], 0)).toBe(undefined);
    });
    test('valid', () => {
        expect(getParam(['foo', 'bar'], 0)).toBe('foo');
    });
    test('valid', () => {
        expect(getParam(['foo', 'bar'], 1)).toBe('bar');
    });
    test('valid with option', () => {
        expect(getParam(['-option', 'foo', 'bar'], 1)).toBe('foo');
    });
    test('invalid with option', () => {
        expect(getParam(['-option', '-foo', 'bar'], 0)).toBe(undefined);
    });
    test('invalid with option', () => {
        expect(getParam(['-option', '-foo', 'bar'], 1)).toBe(undefined);
    });
    test('valid with option', () => {
        expect(getParam(['-option', '-foo', 'bar'], 2)).toBe('bar');
    });
});

describe('hasOption', () => {
    test('no input', () => {
        expect(hasOption()).toBe(false);
    });
    test('invalid array', () => {
        expect(hasOption({}, null, null)).toBe(false);
    });
    test('empty', () => {
        expect(hasOption([], 'foo')).toBe(false);
    });
    test('long', () => {
        expect(hasOption(['foo', '--bar', '-A'], 'foo')).toBe(false);
    });
    test('long', () => {
        expect(hasOption(['foo', '--bar', '-A'], 'bar')).toBe(true);
    });
    test('short', () => {
        expect(hasOption(['foo', '--bar', '-A'], 'all', 'A')).toBe(true);
    });
});

describe('hasOptionWithValue', () => {
    test('no input', () => {
        expect(hasOptionWithValue()).toBe(undefined);
    });
    test('invalid array', () => {
        expect(hasOptionWithValue({}, null, null, 'abc')).toBe('abc');
    });
    test('empty', () => {
        expect(hasOptionWithValue([], 'foo')).toBe(undefined);
    });
    test('empty with fallback', () => {
        expect(hasOptionWithValue([], 'foo', null, 'abc')).toBe('abc');
    });
    test('long', () => {
        expect(hasOptionWithValue(['fizzbuzz', 'foo=000', '--bar=123', '-A=xyz'], 'foo', null, 'abc')).toBe('abc');
    });
    test('long', () => {
        expect(hasOptionWithValue(['fizzbuzz', 'foo=000', '--bar=123', '-A=xyz'], 'bar', null, 'abc')).toBe('123');
    });
    test('short', () => {
        expect(hasOptionWithValue(['fizzbuzz', 'foo=000', '--bar=123', '-A=xyz'], 'all', 'A', 'abc')).toBe('xyz');
    });
});

describe('formatSize', () => {
    test('no input', () => {
        expect(formatSize()).toBe('UNKNOWN');
    });
    test('bad input', () => {
        expect(formatSize(-1)).toBe('UNKNOWN');
    });
    test('0 bytes', () => {
        expect(formatSize(0)).toBe('0 bytes');
    });

    // bytes
    test('0 bytes', () => {
        expect(formatSize(0, 'bytes')).toBe('0 bytes');
    });
    test('1000 bytes', () => {
        expect(formatSize(1000, 'bytes')).toBe(`${(1000).toLocaleString()} bytes`);
    });
    test('1024 bytes', () => {
        expect(formatSize(1024, 'bytes')).toBe(`${(1024).toLocaleString()} bytes`);
    });
    test('1100 bytes', () => {
        expect(formatSize(1100, 'bytes')).toBe(`${(1100).toLocaleString()} bytes`);
    });

    // bytes -> kb
    test('1000 bytes -> kb', () => {
        expect(formatSize(1000, 'kb')).toBe('1 kB');
    });
    test('1024 bytes -> kb', () => {
        expect(formatSize(1024, 'kb')).toBe('1 kB');
    });
    test('1100 bytes -> kb', () => {
        expect(formatSize(1100, 'kb')).toBe('1 kB');
    });

    // bytes -> mb
    test('1 000 000 bytes -> mb', () => {
        expect(formatSize(1_000_000, 'mb')).toBe(`${(1.0).toLocaleString()} MB`);
    });
    test('1 048 576 bytes -> mb', () => {
        expect(formatSize(1_048_576, 'mb')).toBe(`${(1.0).toLocaleString()} MB`);
    });
    test('1 100 000 bytes -> mb', () => {
        expect(formatSize(1_100_000, 'mb')).toBe(`${(1.1).toLocaleString()} MB`);
    });

    // bytes -> gb
    test('1 000 000 000 bytes -> gb', () => {
        expect(formatSize(1_000_000_000, 'gb')).toBe(`${(1.00).toLocaleString()} GB`);
    });
    test('1 073 741 824 bytes -> gb', () => {
        expect(formatSize(1_073_741_824, 'gb')).toBe(`${(1.07).toLocaleString()} GB`);
    });
    test('1 100 000 000 bytes -> gb', () => {
        expect(formatSize(1_100_000_000, 'gb')).toBe(`${(1.10).toLocaleString()} GB`);
    });

    // bytes -> kib
    test('1000 bytes -> kib', () => {
        expect(formatSize(1024, 'kib')).toBe('1 KiB');
    });
    test('1024 bytes -> kib', () => {
        expect(formatSize(1024, 'kib')).toBe('1 KiB');
    });
    test('1100 bytes -> kib', () => {
        expect(formatSize(1100, 'kib')).toBe('1 KiB');
    });

    // bytes -> mib
    test('1 000 000 bytes -> mib', () => {
        expect(formatSize(1_000_000, 'mib')).toBe(`${(1.0).toLocaleString()} MiB`);
    });
    test('1 048 576 bytes -> mib', () => {
        expect(formatSize(1_048_576, 'mib')).toBe(`${(1.0).toLocaleString()} MiB`);
    });
    test('1 100 000 bytes -> mib', () => {
        expect(formatSize(1_100_000, 'mib')).toBe(`${(1.0).toLocaleString()} MiB`);
    });

    // bytes -> gib
    test('1 000 000 000 bytes -> gib', () => {
        expect(formatSize(1_000_000_000, 'gib')).toBe(`${(0.93).toLocaleString()} GiB`);
    });
    test('1 073 741 824 bytes -> gib', () => {
        expect(formatSize(1_073_741_824, 'gib')).toBe(`${(1.00).toLocaleString()} GiB`);
    });
    test('1 100 000 000 bytes -> gib', () => {
        expect(formatSize(1_100_000_000, 'gib')).toBe(`${(1.02).toLocaleString()} GiB`);
    });
});

describe('autoFormatSize', () => {
    test('no input', () => {
        expect(autoFormatSize()).toBe('UNKNOWN');
    });
    test('bad input', () => {
        expect(autoFormatSize(-1)).toBe('UNKNOWN');
    });
    test('0 bytes', () => {
        expect(autoFormatSize(0)).toBe('0 bytes');
    });

    // bytes
    test('0 bytes', () => {
        expect(autoFormatSize(0, false)).toBe(autoFormatSize(0, true));
    });
    test('999 bytes', () => {
        expect(autoFormatSize(999, false)).toBe(autoFormatSize(999, true));
    });

    // kb/kib
    test('1000 bytes (decimal)', () => {
        expect(autoFormatSize(1000, false)).toBe('1 kB');
    });
    test('1000 bytes (binary)', () => {
        expect(autoFormatSize(1000, true)).toBe(`${(1000).toLocaleString()} bytes`);
    });
    test('1024 bytes (decimal)', () => {
        expect(autoFormatSize(1024, false)).toBe('1 kB');
    });
    test('1024 bytes (binary)', () => {
        expect(autoFormatSize(1024, true)).toBe('1 KiB');
    });
    test('1100 bytes (decimal)', () => {
        expect(autoFormatSize(1100, false)).toBe('1 kB');
    });
    test('1100 bytes (binary)', () => {
        expect(autoFormatSize(1100, true)).toBe('1 KiB');
    });

    // mb/mib
    test('1 000 000 bytes (decimal)', () => {
        expect(autoFormatSize(1_000_000, false)).toBe(`${(1.0).toLocaleString()} MB`);
    });
    test('1 000 000 bytes (binary)', () => {
        expect(autoFormatSize(1_000_000, true)).toBe(`${(977).toLocaleString()} KiB`);
    });
    test('1 048 576 bytes (decimal)', () => {
        expect(autoFormatSize(1_048_576, false)).toBe(`${(1.0).toLocaleString()} MB`);
    });
    test('1 048 576 bytes (binary)', () => {
        expect(autoFormatSize(1_048_576, true)).toBe(`${(1.0).toLocaleString()} MiB`);
    });
    test('1 100 000 bytes (decimal)', () => {
        expect(autoFormatSize(1_100_000, false)).toBe(`${(1.1).toLocaleString()} MB`);
    });
    test('1 100 000 bytes (binary)', () => {
        expect(autoFormatSize(1_100_000, true)).toBe(`${(1.0).toLocaleString()} MiB`);
    });

    // gb/gib
    test('1 000 000 000 bytes (decimal)', () => {
        expect(autoFormatSize(1_000_000_000, false)).toBe(`${(1.00).toLocaleString()} GB`);
    });
    test('1 000 000 000 bytes (binary)', () => {
        expect(autoFormatSize(1_000_000_000, true)).toBe(`${(953.7).toLocaleString()} MiB`);
    });
    test('1 073 741 824 bytes (decimal)', () => {
        expect(autoFormatSize(1_073_741_824, false)).toBe(`${(1.07).toLocaleString()} GB`);
    });
    test('1 073 741 824 bytes (binary)', () => {
        expect(autoFormatSize(1_073_741_824, true)).toBe(`${(1.00).toLocaleString()} GiB`);
    });
    test('1 100 000 000 bytes (decimal)', () => {
        expect(autoFormatSize(1_100_000_000, false)).toBe(`${(1.10).toLocaleString()} GB`);
    });
    test('1 100 000 000 bytes (binary)', () => {
        expect(autoFormatSize(1_100_000_000, true)).toBe(`${(1.02).toLocaleString()} GiB`);
    });
});
