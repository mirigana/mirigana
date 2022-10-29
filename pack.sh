#!/bin/bash
set -e # exit when any command fails

VER=`cat src/manifest.json| jq -r '.version'`

CHROME_PKG=mirigana_${VER}_chrome_unsigned.zip
FIREFOX_PKG=mirigana_${VER}_firefox_unsigned.zip
ZIP_FILE_PATH=../${CHROME_PKG}

FF_EXTENSION_ID="cde2f82c-3312-444a-b544-c0b8a758cfb6"
FF_ADDITIONAL_PROPERTY=". + { \"browser_specific_settings\": { \"gecko\": { \"id\": \"{${FF_EXTENSION_ID}}\", \"strict_min_version\": \"70.0\" } } }"


# create manifest for firefox
jq "${FF_ADDITIONAL_PROPERTY}" src/manifest.json > manifest.json


if [[ -f $CHROME_PKG ]]; then
  rm $CHROME_PKG
fi
if [[ -f $FIREFOX_PKG ]]; then
  rm $FIREFOX_PKG
fi

cd src
zip -r $ZIP_FILE_PATH * -x "*.DS_Store" -x "__MACOSX" -x "background/*" -x "vendors/*"
cd ..

cp $CHROME_PKG $FIREFOX_PKG
zip $FIREFOX_PKG manifest.json

# cleanup
rm manifest.json
