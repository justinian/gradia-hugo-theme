#!/usr/bin/env bash

set -o errexit

VERSION=$(date +'%y.%j.%H%M')
echo "Version is ${VERSION}"

if [ -f "${GITHUB_OUTPUT}" ]; then
    echo "version=${VERSION}" >> "${GITHUB_OUTPUT}"
fi

mkdir -p out/packs/

python3 ./themes/gradia/id_replacer.py public/fvtt
sed "s/__version__/${VERSION}/g" assets/fvtt/module.json > out/module.json
cp -r assets/fvtt/ui out/ui
cp -r public/maps out/maps

env bun x @foundryvtt/foundryvtt-cli package pack \
    --id gradia-org --type Module -n info \
    --in public/fvtt --out out/packs/ -v -r

[[ -f out/gradia-org.zip ]] && rm out/gradia-org.zip
cd out; zip -v -r gradia-org.zip module.json maps packs ui
