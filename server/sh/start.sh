cd ../..
npx sass ./server/sass:./client/css
echo "Compiled SASS"
npx tsc ./server/ts/index.ts --outDir ./server/js/
npx tsc ./client/ts/index.ts --outDir ./client/js/
echo "Generates JS from TS"
echo "Starting Server..."
read "Press any key to exits..."