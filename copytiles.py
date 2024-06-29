#!/usr/bin/env python3

import click

LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def handle_dir(srcdir, width, height, dest):
    from PIL import Image

    for y in range(height):
        for x in range(width):
            src = f"{srcdir}/{LETTERS[y]}{x+1}.png"
            dst = f"{dest}/0_{x}_-{width-y}.webp"
            print(dst)
            im = Image.open(src).convert("RGB")
            im.save(dst, "webp")


@click.command()
@click.option('-s', '--size', nargs=2, default=(10, 10), type=(int, int),
              help="Dimension of map in tiles (x * y)")
@click.option('-d', '--dest', default="static/tiles", type=click.Path(),
              help="Destination directory")
@click.argument('path', type=click.Path(exists=True))
def run(size, dest, path):
    """Import a zip file or directory of tiles from Azgaar's Fantasy Map
    Generator into a directory of leaflet tiles in WebP format."""

    from os import makedirs
    from os.path import isdir

    makedirs(dest, exist_ok=True)

    if isdir(path):
        handle_dir(path, *size, dest)
        return

    from tempfile import TemporaryDirectory
    from zipfile import ZipFile

    with TemporaryDirectory() as srcdir:
        with ZipFile(path, 'r') as archive:
            archive.extractall(path=srcdir)
        handle_dir(srcdir, *size, dest)


if __name__ == "__main__": run()
