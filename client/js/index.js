import {BaseStart} from './base.js';
var ENTERKEY = '13';
var UPKEY = '38';
var DOWNKEY = '40';
var EMPTYSTRING = '';
var DEBUG = true;
var log = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (DEBUG)
        console.log.apply(console, args);
};
var loge = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (DEBUG)
        console.error.apply(console, args);
};
var MessageQ = {
    limit: 20,
    list: [],
    is_full: function () { return this.list.length >= this.limit; },
    is_empty: function () { return this.list.length == 0; },
    add: function (msg) {
        this.list.push(msg);
    },
    get: function () { return this.list[this.list.length - 1]; },
    pop: function () { return this.list.pop(); },
    ask: function (options) {
        // asks each interval
        var Q = options.Q;
        if (!Q.is_empty()) {
            var msg = Q.get();
            var bot = options.bot;
            var ui = options.ui;
            bot.ask(msg, options);
            // if(Q.is_full()){
            // this.toggleBlock(false);
            // }
        }
    }
};
var UI = {
    input: null,
    output: null,
    input_outer: null,
    _message_template: null,
    MD: null,
    history: [],
    history_i: 0,
    _history_limit: 50,
    init_message: function (msg, bot) {
        if (bot === void 0) { bot = false; }
        var message = this._message_template.clone();
        if (bot) {
            message.addClass('bot');
        }
        var html = this.MD.makeHtml(msg);
        message.find('.txt').html(html);
        return message;
    },
    on_UD: function (e) {
        var keycode = e.keyCode || e.which;
        if (keycode == UPKEY || keycode == DOWNKEY) {
            e.preventDefault();
            var ui = e.data.ui;
            var a = keycode == UPKEY ? -1 : 1;
            var hlen = ui.history.length;
            var old_i = ui.history_i;
            var i = ui.history_i = Math.min(Math.max(0, old_i + a), hlen);
            if (i != old_i) {
                var msg = EMPTYSTRING;
                if (i < hlen) {
                    msg = ui.history[i];
                }
                ui.input.val(msg);
            }
        }
    },
    on_enter: function (e) {
        var keycode = e.keyCode || e.which;
        if (keycode == ENTERKEY) {
            var ui = e.data.ui;
            var msg = ui.input.val().trim();
            var Q = e.data.Q;
            var valid = !(msg == EMPTYSTRING || Q.is_full());
            if (valid) {
                ui.enter_message(msg);
                ui.add_history(msg);
                // input bar is emptied
                ui.input.val(EMPTYSTRING);
                // message is stored in Queue
                Q.add(msg);
                // ask the bot
                var bot = e.data.bot;
                bot.ask(e.data);
                // if queue is full, block it
                if (Q.is_full()) {
                    ui.toggleBlock(true);
                }
            }
        }
    },
    add_history: function (msg) {
        //don't add if same as last
        var last = this.history[this.history.length - 1];
        this.history_i = this.history.length;
        if (msg == last)
            return;
        // continue as normal
        this.history.push(msg);
        if (this.history.length > this._history_limit) {
            this.history.shift();
            this.history_i--;
        }
        localStorage.setItem('chatbot-input-history', JSON.stringify(this.history));
    },
    init: function (options) {
        this.input = $('input');
        this.output = $('main #out');
        this._message_template = $('#templates .msg');
        this.toggleBlock(false);
        // set what happens when pressing enter on input
        this.input.keypress(options, this.on_enter).keydown(options, this.on_UD);
        // get back history
        var json_string = localStorage.getItem('chatbot-input-history');
        this.history = json_string ? JSON.parse(json_string) : [];
        this.history_i = this.history.length;
        //
        this.MD = new showdown.Converter();
    },
    enter_message: function (msg, bot, scroll) {
        log(msg)
        if (bot === void 0) { bot = false; }
        if (scroll === void 0) { scroll = true; }
        var message = this.init_message(msg, bot);
        // send to html
        var out = this.output;
        out.append(message);
        // scroll to bottom
        if (scroll)
            out.animate({ scrollTop: out.prop("scrollHeight") });
    },
    toggleBlock: function (b) {
        // blocked if true
        this.input.prop('disabled', b);
    }
};
var Bot = {
    ask_again_wait_time: 200,
    ask_again: function (options) {
        setTimeout(function (options) {
            options.bot.ask(options);
        }, this.ask_again_wait_time, options);
    },
    ask: function (options) {
        var ui = options.ui;
        var Q = options.Q;
        var bot = options.bot;
        var msg = Q.get();
        var html = ui.MD.makeHtml(msg);
        // create post JSON
        var data = {
            type: 'ask',
            message: $(html).text()
        };
        var data_string = JSON.stringify(data);
        // request server /ask
        fetch("/ask", {
            method: "POST",
            body: data_string,
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
            if (res.ok) {
                return res.json();
            }
            loge("BAD CODE:", res);
            throw "-ERROR-";
        }).then(function (data_string) {
            var data = JSON.parse(data_string);
            var msg = data.message;
            var html = ui.MD.makeHtml(msg);
            if (data.success) {
                // display bot message
                ui.enter_message(html, true, true);
                // unblock input if blocked
                if (Q.is_full()) {
                    ui.toggleBlock(false);
                }
                // remove from queue
                Q.pop();
            }
            else {
                if (data.error == 'busy') {
                    loge(data.message);
                }
                // ask again later
                bot.ask_again(options);
            }
        })["catch"](function (err) {
            loge(err);
            // ask again later
            bot.ask_again(options);
        });
    },
    train: function () {
        fetch('/train', {
            method: "POST"
        }).then(function (res) {
            if (res.ok) {
                log("\n================");
                log("Training success");
                log("================\n");
                return;
            }
            throw "SERVER ERROR";
        })["catch"](function (err) {
            log("\n================");
            log("Training failed!");
            log("================\n");
        });
    }
};
// main
function main() {
    $('icon').addClass('material-symbols-outlined');
    //
    var options = {
        bot: Bot,
        ui: UI,
        Q: MessageQ
    };
    UI.init(options);
    //Bot.train();
}
// start
$(document).ready(function () {
    BaseStart();
    main();
});
