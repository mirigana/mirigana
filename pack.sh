#!/bin/bash

VER=`cat src/manifest.json| jq -r '.version'`

ZIP_FILE=mirigana_${VER}_unsigned.zip

if [[ -f $ZIP_FILE ]]; then
  rm $ZIP_FILE
fi

zip -r $ZIP_FILE src/ -x "*.DS_Store" -x "__MACOSX"

echo $ZIP_FILE
