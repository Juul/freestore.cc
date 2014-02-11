#!/usr/bin/env node

var util = require('util');
var path = require('path');
var net = require('net');
var levelup = require('levelup');
var multilevel = require('multilevel');
var manifest = require('./manifest.json');
var argv = require('optimist').argv;

var db = multilevel.client(manifest);
var con = net.connect(3000);

var port = argv.port || 3000;

function usage() {
    process.stderr.write("\n");
    process.stderr.write("Usage: " + path.basename(__filename) + " <file_to_transcode>\n");
    process.stderr.write("\n");
    process.stderr.write("Parameters:\n");
    process.stderr.write("\n");
    process.stderr.write("  --port: Port where jobserver is runing (default: 3000)\n");
    process.stderr.write("\n");
}

if(process.argv.length < 3) {
    usage();
    process.exit(1);
}

var filepath = process.argv[2];

con.pipe(db.createRpcStream()).pipe(con);

db.addJob(
    {
        infilepath: filepath
    },function(err) {
        if(err) {
            console.log("Erraw: " + err);
            return;
        }
        console.log('Successfully added job');
        process.exit(0);
    });




