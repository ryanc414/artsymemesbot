/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Artsy memes bot server. Delivers the freshest artsy meme straight from the
Louvre into your slack workspace.

Built using botkit - read all about it here:
 -> http://howdy.ai/botkit

 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

// Uses the slack button feature to offer a real time bot to multiple teams
var Botkit = require('botkit');

// PythonShell provides an interface to run python scripts from node.js code.
var PythonShell = require('python-shell');

// This is some standard botkit boilerplate...
if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT || !process.env.VERIFICATION_TOKEN) {
    console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
    process.exit(1);
}

var config = {}
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: './db_slackbutton_slash_command/',
    };
}

var controller = Botkit.slackbot(config).configureSlackApp(
    {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        scopes: ['commands'],
    }
);

controller.setupWebserver(process.env.PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });
});


// And here's the interesting part which processes commands. Currently the bot only
// knows one command: `/artsymeme`, which will respond with a link to a random
// meme.
controller.on('slash_command', function (slashCommand, message) {

    switch (message.command) {
        case "/artsymeme":
            // Post a fresh artsymeme, by calling into python backend script.
            slashCommand.replyAcknowledge();
            PythonShell.run('artsymemesbot.py', function (err, results) {
                if (err) throw err;
                console.log('results: %j', results);
                slashCommand.replyPublicDelayed(message, results[0])
            });
            break;

        default:
            slashCommand.replyPublic(message, "I'm afraid I don't know how to " + message.command + " yet.");

    }

});

