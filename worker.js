#!/usr/bin/env node

var util = require('util');
var path = require('path');
var net = require('net');
var levelup = require('levelup');
var multilevel = require('multilevel');
var argv = require('optimist').argv;
var sleep = require('sleep');
var ffmpeg = require('fluent-ffmpeg');
var winston = require('winston');

var manifest = require('./manifest.json');
var UpStream = require('./upstream.js');

var config = require('./config.js');

var jobserver = multilevel.client(manifest);
var con = net.connect(3000);

con.pipe(jobserver.createRpcStream()).pipe(con);

var magic = new Magic();
var upstream = UpStream('plugins/upstream');


var config = {
    port: 3000,
    outpath: 'out'
};

config.port = argv.port || config.port;

function debug(msg) {
    if(argv.debug) {
        console.log("DEBUG: " + msg);
    }
}

function usage() {
    process.stderr.write("\n");
    process.stderr.write("Usage: " + path.basename(__filename));
    process.stderr.write("\n");
    process.stderr.write("Parameters:\n");
    process.stderr.write("\n");
    process.stderr.write("  --port: Port where jobserver is runing (default: 3000)\n");
    process.stderr.write("\n");
}

if(process.argv.length != 2) {
    usage();
    process.exit(1);
}

function work(job, stream, callback) {
    callback = callback || function() {};

    if(!job.id || !job.infilepath || !stream) {
        callback("job must have both id and infilepath");
        return;
    }

    var ff = new ffmpeg({
        source: job.infilepath,
        timeout: 0,
        priority: 0,
        logger: new (winston.Logger)({
            transports: [
                new (winston.transports.Console)(),
            ]}),
        nolog: false
    });
    
    ff.getCommand(null, function(cmd) {
        debug("ffmpeg cmd: " + cmd);
    });

    job.outfilepath = path.join(config.outpath, job.id+'.webm');

    ff.saveToFile(job.outfilepath, function(stdout, stderr) {
        debug("stdout: " + stdout);
        debug("stderr: " + stderr);
        debug('file has been converted succesfully');
        callback();
    });
}

jobserver.getJob(function(err, job) {
    if(err) {
        console.log("Error: " + err);
        return;
    }
    
    debug("Got job: " + job.infilepath);
    var stream = jobserver.getStream(job.infilepath);

    work(job, stream, function(err) {
        if(err) {
            console.log("Abandoning job: " + job.infilepath);
            jobserver.abandonJob(job);
            return;
        }
        
        jobserver.completeJob(job, function(err, job) {
            console.log("Completed job: " + job.outfilepath);
        });
    });
});

