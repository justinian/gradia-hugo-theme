#!/usr/bin/env python3

import re
hasher_re = re.compile(r'__linktitlehash__\(([^\)]*)\)')

BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def make_id(name):
    from struct import unpack_from
    from hashlib import sha224

    data = sha224(name.encode('utf-8')).digest()

    num = 0
    for off in range(0, len(data)-7, 8):
        part = unpack_from("Q", data, off)[0]
        num = (num << 64) + part

    arr = []
    while num:
        num, rem = divmod(num, 62)
        arr.append(BASE62[rem])

    arr.reverse()
    return ''.join(arr)[:16]

def hasher(match):
    return make_id(match.group(1))

def replace_in_folder(folder):
    from os import walk
    from pathlib import Path
    for (dirpath, dirnames, filenames) in walk(folder):
        dirpath = Path(dirpath)
        for filename in filenames:
            if not filename.endswith(".json"): continue
            with open(dirpath / filename, 'r') as f:
                content = f.read()

            content = hasher_re.sub(hasher, content)
            with open(dirpath / filename, 'w') as f:
                f.write(content)

if __name__ == "__main__":
    import sys
    for path in sys.argv[1:]:
        replace_in_folder(path)
