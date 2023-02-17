

var express = require('express');
const ai = require('./ai');
const path = require('path');
const busy = {
    training: false,
    processing: false,
};
const DEBUG = true;
const log = (...args) => {if (DEBUG) console.log(...args);}
const loge = (...args) => {if (DEBUG) console.error(...args);}

const PUG_DIR = path.resolve(__dirname, '../pug')
const PORT = 80
var app = express();

app.set('views', PUG_DIR)
app.set('view engine', 'pug')
app.use('/static', express.static('client'))

app.use(express.json());

app.get('/', function (req, res) {
    res.render('index')
})
app.post('/ask', function (req, res) {
    let message = req.body.message;
    let data = {
        original : message,
        error : "",
        success : false,
    };
    if(busy.training || busy.processing){
        data.error = "busy";
        if(busy.training){
            data.message = "The AI is busy training. Please wait.";
        }else{
            data.message = "The AI is busy processing your message, please wait.";
        }
        post_respond(res, data);
        return;
    }
    ai.ask(message).then(response => {
            data.message = response.answer;
            data.success = true;
            post_respond(res, data);
    });
});
app.post('/train', (req, res) => {
    log("\n================");
    log("Training started");
    log("================\n");
    busy.training = true;
    ai.train().then(()=>{
        busy.training = false;
        log("\n=============");
        log("Training done");
        log("=============\n");
        res.end('done!');
    });

});
function post_respond(res, data){
    let data_string = JSON.stringify(data);
    res.json(data_string);
}


// main
function main(){
    ai.setup();
    var server = app.listen(80, function () {
        console.log(`Listening on http://localhost:${PORT}`)
    });
}
main();

