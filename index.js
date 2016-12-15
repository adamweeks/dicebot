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
  if (trigger.args && trigger.args.indexOf('roll') !== -1){
    const rollIndex = trigger.args.indexOf('roll');
    const parmsIndex = rollIndex + 1;
    var max = 6;
    var min = 1;
    var options = [];
    // If it has an option after `roll`
    if (trigger.args[parmsIndex]){
      // If it is an integer, roll that many sides
      if (Number.isInteger(trigger.args[parmsIndex])){
        max = parseInt(trigger.args[parmsIndex]);
      }
      // If it is a comma separated array pick one of them
      else if (trigger.args[parmsIndex].split(`,`).length > 1) {
        options = trigger.args[parmsIndex].split(`,`);
        min = 0;
        max = options.length;
      }
    }
    const pick = random.integer(min, max);
    var roll = pick;
    if (options.length > 0) {
      roll = options[pick];
    }
    bot.say(`You rolled a ${roll}`);
  }
  else {
    bot.say(`Uh, I can 'roll' or 'roll 10' or 'roll red,blue,green'`);
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