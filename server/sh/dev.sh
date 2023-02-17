start "Client TS" npx tsc -w ./client/ts/index.ts --outFile ./client/js/index.js --esModuleInterop
start "Server TS" npx tsc -w ./server/ts/index.ts --outFile ./server/js/index.js --esModuleInterop
start "Sass" npx sass ./server/sass/style.sass:./client/css/style.css -w
start "Server" nodemon main