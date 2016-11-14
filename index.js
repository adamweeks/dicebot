var Flint = require('node-flint');
var webhook = require('node-flint/webhook');
var express = require('express');
var bodyParser = require('body-parser');
var random = require('random-js')();
var app = express();
app.use(bodyParser.json());

// flint options
var config = require('./config.json');

// init flint
var flint = new Flint(config);
flint.start();

flint.hears(/.*/, function(bot, trigger) {
  if (trigger.args[1] && trigger.args[1].includes('roll')){
    var max = 6;
    if (trigger.args[2] && parseInt(trigger.args[2]) !== NaN){
        max = parseInt(trigger.args[2]);
    }
    const roll = random.integer(1, max);
    bot.say(`You rolled a ${roll}`);
  }
  else {
    bot.say(`Uh, I can 'roll' or 'roll 10'`);
  }
}, 20);

// define express path for incoming webhooks
app.post('/flint', webhook(flint));

// start express server
var server = app.listen(config.port, function () {
  flint.debug('Flint listening on port %s', config.port);
});

// gracefully shutdown (ctrl-c)
process.on('SIGINT', function() {
  flint.debug('stoppping...');
  server.close();
  flint.stop().then(function() {
    process.exit();
  });
});