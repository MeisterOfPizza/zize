const fs   = require('fs');
const path = require('path');

const getSize = (rootDir, options = null) => new Promise((resolveGetSize, rejectGetSize) => {
    const {
        abort = false,
        collectDirs,
        collectFiles,
        onUpdateCount,
        onStatDir,
        onStatFile,
        onError,
    } = options || {};

    let totalDirCount  = 0;
    let totalFileCount = 0;

    let hasAborted = false;

    const getSizeOfDir = (dir) => new Promise((resolveGetSizeOfDir, rejectGetSizeOfDir) => {
        let   dirSize       = 0;
        let   fileCount     = 0;
        const dirSizePairs  = [];
        const fileSizePairs = [];

        if (hasAborted) {
            rejectGetSizeOfDir();
        }

        fs.readdir(dir, (readDirErr, files) => {
            if (!readDirErr) {
                Promise.all(files.map((file) => new Promise((resolveFile, rejectFile) => {
                    if (hasAborted) {
                        rejectFile();
                        return;
                    }

                    const filePath = path.resolve(dir, file);
                    fs.lstat(filePath, (statErr, stats) => {
                        if (!statErr) {
                            if (stats.isDirectory()) {
                                getSizeOfDir(filePath)
                                    .then(({ dirSize: subDirSize, dirSizePairs: subDirSizePairs, fileSizePairs: subFileSizePairs }) => {
                                        if (hasAborted) {
                                            rejectFile();
                                            return;
                                        }

                                        if (onStatDir) {
                                            onStatDir(filePath, subDirSize);
                                        }

                                        dirSize += subDirSize;

                                        if (collectDirs) {
                                            dirSizePairs.push([filePath, subDirSize], ...subDirSizePairs);
                                        }
                                        if (collectFiles) {
                                            fileSizePairs.push(...subFileSizePairs);
                                        }

                                        resolveFile();
                                    })
                                    .catch((getSizeOfSubDirErr) => {
                                        if (!abort) {
                                            if (onError) {
                                                onError(getSizeOfSubDirErr);
                                            }
                                            resolveFile();
                                        } else {
                                            hasAborted = true;
                                            rejectFile(getSizeOfSubDirErr);
                                        }
                                    });
                            } else {
                                if (onStatFile) {
                                    onStatFile(filePath, stats.size);
                                }

                                dirSize += stats.size;
                                fileCount++;

                                if (collectFiles) {
                                    fileSizePairs.push([filePath, stats.size]);
                                }

                                resolveFile();
                            }
                        } else {
                            if (!abort) {
                                if (onError) {
                                    onError(statErr);
                                }
                                resolveFile();
                            } else {
                                hasAborted = true;
                                rejectFile(statErr);
                            }
                        }
                    });
                })))
                    .then(() => {
                        if (onUpdateCount) {
                            totalDirCount++;
                            totalFileCount += fileCount;
                            onUpdateCount(totalDirCount, totalFileCount);
                        }

                        resolveGetSizeOfDir({ dirSize, dirSizePairs, fileSizePairs });
                    })
                    .catch((getSizeOfDirErr) => {
                        if (onUpdateCount) {
                            totalDirCount++;
                            totalFileCount += fileCount;
                            onUpdateCount(totalDirCount, totalFileCount);
                        }

                        if (!abort) {
                            if (onError) {
                                onError(getSizeOfDirErr);
                            }
                            resolveGetSizeOfDir({ dirSize, dirSizePairs, fileSizePairs });
                        } else {
                            hasAborted = true;
                            rejectGetSizeOfDir(getSizeOfDirErr);
                        }
                    });
            } else {
                if (onUpdateCount) {
                    totalDirCount++;
                    totalFileCount += fileCount;
                    onUpdateCount(totalDirCount, totalFileCount);
                }

                if (!abort) {
                    if (onError) {
                        onError(readDirErr);
                    }
                    resolveGetSizeOfDir({ dirSize, dirSizePairs, fileSizePairs });
                } else {
                    hasAborted = true;
                    rejectGetSizeOfDir(readDirErr);
                }
            }
        });
    });
    getSizeOfDir(rootDir)
        .then(({ dirSize, dirSizePairs, fileSizePairs }) => resolveGetSize({ dirSize, dirSizePairs, fileSizePairs }))
        .catch((getSizeOfDirErr) => rejectGetSize(getSizeOfDirErr));
});

module.exports = getSize;
