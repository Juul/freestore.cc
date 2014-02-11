ven#!/usr/bin/env node

var util = require('util');
var path = require('path');
var argv = require('optimist').argv;
var express = require('express');
var multiparty = require('multiparty');

var UpStream = require('./upstream.js');

var config = require('./config.js');

config.port = argv.port || config.port;

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

var magic = new Magic();
var upstream = UpStream('plugins/upstream');

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
        console.log("incoming file: " + util.inspect(part));

        part.on('data', function(chunk) {
            
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
