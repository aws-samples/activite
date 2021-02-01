#!/bin/bash

# Build script is to be run from the root directory !

set -ev
# npm run test:all
npm run generate:attribution
npm run lint:fix

echo 'Remove build folder to make sure the npm package only includes clean built components'
if [ -d "./build" ]; then rm -rf ./build; fi # 
tsc --declaration 


echo 'Copy license files'
cp ./LICENSE ./build/
cp ./README.md ./build/
cp ./CONTRIBUTING.md ./build/
cp ./CODE_OF_CONDUCT ./build/
cp ./NOTICE ./build/
cp ./LICENSE-THIRD-PARTY ./build/
cp ./package.json ./build/

rm -rf ./build/__tests__