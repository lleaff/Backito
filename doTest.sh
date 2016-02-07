#!/bin/bash

wd=$PWD
echo $PWD

cd ~/.backito_store
./clean.sh

cd $wd

reset() {
    rm -r dir 2>/dev/null
    rm -r resultDir* 2>/dev/null
}

reset
if [[ $1 == "reset" ]]; then
    exit;
fi

mkdir -p dir

cpdir() {
    rm -r dir/* 2>/dev/null
    cp -r "dir$1/"* dir
    echo -e "________________________\n[dir $1]\n________________________"
}

showdir() {
    echo "sof:"
    echo -n "   >>> "; cat "resultDir$1"/dir/sof
}

sleep 1
cpdir 1
../backito.js -r dir -d lcl resultDir1
showdir 1

sleep 1
cpdir 2
../backito.js -r dir -d lcl resultDir2
showdir 2

sleep 1
cpdir 3
../backito.js -r dir -d lcl resultDir3
showdir 3

sleep 1
echo -e "________________________\n"
../backito.js -r dir -R -p '~' -d lcl resultDir4
showdir 4
