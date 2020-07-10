#!/bin/bash

zipfile=mirigana-unsigned.zip

rm $zipfile
zip -r $zipfile src/ -x "*.DS_Store" -x "__MACOSX"
