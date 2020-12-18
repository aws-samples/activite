#!/bin/bash

# Build script is to be run from the root directory 

set -ev


echo 'Copy test harness'
if [ -f "./src/__tests__/db.json" ]; then rm ./src/__tests__/db.json; fi # 
cp ./src/___test_data__/db.json ./src/__tests__/.
