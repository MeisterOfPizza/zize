# Zize
- [Zize](#zize)
  - [Information](#information)
  - [Synopsis](#synopsis)
    - [Options](#options)

## Information
zize is a node.js program that will count the size (bytes, kB, MB, GB, KiB, MiB, GiB) of all directories and files specified.
It can also rank the encountered directories and files to show which take up the most amount of space.

## Synopsis
```bash
zize
zize <relative-path>
zize <absolute-path>

common options: [-A|--abort|-E|--extra-verbose|-H|--help|-D|--large-dirs|-N|--large-dirs-count=<count>|-F|--large-files|-M|--large-files-count=<count>|-V|--verbose]
```
### Options
* `-A, --abort`: Abort the size counting if there are any errors (there are often very many because of privileges).
* `-E, --extra-verbose`: Print each file counted (there are many, will heavily decrease performance).
* `-H, --help`: Print usage and options (this).
* `-D, --large-dirs`: Show a list of the largest directories found.
* `-N, --large-dirs-count=<count>`: Show at least this many large directories.
* `-F, --large-files`: Show a list of the largest files found.
* `-M, --large-files-count=<count>`: Show at least this many large files.
* `-V, --verbose`: Print each directory counted (there are many, *may* decrease performance).
