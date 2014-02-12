#!/usr/bin/env node

var util = require('util');
var path = require('path');
var argv = require('optimist').argv;
var net = require('net');
var express = require('express');
var multiparty = require('multiparty');
var uuid = require('node-uuid').v4;
var levelup = require('levelup');
var multilevel = require('multilevel');

var manifest = require('./manifest.json');
var sanefiles = require('./sanefiles');
var permission = require('./permission.js');

var config = require('./config.js');

config.http_port = argv.port || config.http_port;

function usage() {
    process.stderr.write("The freestore backend server.\n");
    process.stderr.write("\n");
    process.stderr.write("Usage: " + path.basename(__filename) + "\n");
    process.stderr.write("\n");
    process.stderr.write("Parameters:\n");
    process.stderr.write("\n");
    process.stderr.write("  --port: Port where freestore is running (default: 8000)\n");
    process.stderr.write("\n");
}

if(process.argv.length < 2) {
    usage();
    process.exit(1);
}

function fail(msg) {
    process.stderr.write(msg);
    process.exit(1);
}

function sanity_check() {
    var insanities = [];
    if(!config.jobserver_port) {
        insanities.push("jobserver_port must be set in the config file\n");
    }
    if(!permission.toReadDir(config.www_path)) {
        insanities.push("I don't have read access to config.www_path which is currently set to: " + config.www_path);
    }
    if(config.upload_enabled && !permission.toWriteDir(config.upload_path)) {
        insanities.push("Uploads are enabled but I don't have write access to config.upload_path which is set to: " + config.www_path);
    }
    if(insanities.length > 0) {
        fail("Sanity check failed with " + insanities.length + " error(s): \n\n" + insanities.join("\n") + "\n\n");
    }
}

// run a few basic sanity checks
sanity_check();

// initiate jobserver connection
var jobserver = multilevel.client(manifest);
var jcon = net.connect(3000);
jcon.pipe(jobserver.createRpcStream()).pipe(jcon);

var app = express();

// serve static content from www dir
app.use('/', express.static(config.www_path));

//app.use(express.json());
//app.use(express.urlencoded());

app.post('/upload', function(req, res) {

    console.log('received upload form');

    // parse a file upload
    var form = new multiparty.Form();

    form.on('part', function(part) {
        if(!part.filename) return;
        filename = sanefiles.sanitizeAndUniquify(part.filename);
        console.log("incoming file: " + util.inspect(part));
        var filepath = path.join(config.upload_path, filename);

        var out = fs.createWriteStream(filepath);
        part.pipe(out);

        jobserver.addJob(
            {
                infilepath: filename
            },function(err, job) {
                if(err) {
                    console.log("Erraw: " + err);
                    return;
                }
                console.log('Successfully added job');
                process.exit(0);
            });
        
    });

    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(util.inspect({fields: fields, files: files}));
    });


});

app.get('/hello.txt', function(req, res){
  res.send('Hello World');
});

app.listen(config.port);
