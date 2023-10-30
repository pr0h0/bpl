#!/bin/bash

# check if we're in tests folder, if we are, then go up one lever
if [ $(basename $(pwd)) == "tests" ]; then
    cd ..
fi

# get files from examples folder and save into variable
files=$(ls -f */*.bpl)

# array of failing test to test them specifically
#files=("examples/functions.bpl" "examples/objects.bpl")

# loop through files and execute "node dist/file {filename}"
# check if exit code is 0, if is then print "OK", else print "FAIL" and file name after that
# save failed files into variable and print them at the end
for file in ${files[@]}; do
    echo "Running $file"
    node dist/file $file
    if [ $? -eq 0 ]; then
        echo "OK $file"
    else
        echo "FAIL $file"
        failed="$failed $file"
    fi
done

# if there are failed files, print them
if [ -n "$failed" ]; then
    echo "Failed files:$failed"
fi
