#!/usr/bin/env node

var util = require('util');
var net = require('net');
var levelup = require('levelup');
var multilevel = require('multilevel');
var sublevel = require('level-sublevel')
var argv = require('optimist').argv;
var jobquery = require('./lib/jobquery');
var fifo = require('./lib/fifo');

var waiting = fifo(); // remote clients waiting for jobs

var port = argv.port || 3000;

function debug(msg) {
    if(argv.debug) {
        console.log("DEBUG: " + msg);
    }
}

var db = levelup('db/jobs.leveldb', {
    createIfMissing: true,
    keyEncoding: 'utf8',
    valueEncoding: 'json'
    
}, function(err, db) {

    if(err) {
        console.log("failed to open/create database: " + err);
        return;
    }

    db = sublevel(db);
    var jobs = new jobquery(db);
    
    db.getJob = function(callback) {
        debug("getJob called");
        // if others are already waiting
        // then assume there are no jobs
        if(!waiting.isEmpty()) {
            debug("No jobs. Queuing worker");
            waiting.push(callback);
            return;
        }
        jobs.get(function(err, job) {
            if(err) {
                debug("Error: " + err);
                callback(err);
                return;
            }
            if(!job) { // no jobs available
                debug("No jobs. Queuing worker");
                waiting.push(callback);
                return;
            }
            debug("Handing job to worker: " + util.inspect(job));
            callback(null, job);
        });
    };

    db.addJob = function(job, callback) {
        debug("addJob called with: " + util.inspect(job));
        jobs.add(job, function(err) {
            if(err) {
                debug("Error: " + err);
                callback(err);
                return;
            }
            var worker = waiting.pop();
            if(worker) {
                worker(null, job);
                debug("new job given to worker");
                callback();
                return;
            } else {
                debug("new job queued");
            }
            callback();
        });
    };

    // batch add jobs
    db.addJobs = function(jobs, callback) {
        debug("addJobs called with: " + util.inspect(jobs));
        // TODO write me
        callback("not implemented");
    };

    db.completeJob = function(job, callback) {
        debug("completeJob called with: " + util.inspect(job));
        jobs.complete(job, callback);
    };

    db.abandonJob = function(job, callback) {
        debug("abandonJob called with: " + util.inspect(job));
        jobs.abandon(job, callback);
    };

    /*
      Get some statistics about how many jobs are
      waiting and being processed, and how many
      workers are waiting.
    */
    db.getStats = function(callback) {
        debug("getStats called");
        var stats = jobs.counts;
        stats.waiting_workers = waiting.length();
        if(callback) {
            callback(stats);
        }
        return stats;
    };

    db.getStream = function(filename) {
        // TODO could use some extra checks
        // to ensure that no files outside upload dir
        // are ever read
        filename = path.basename(filename);
        var filepath = path.join(config.upload_path, filename);
        return fs.createReadStream(filepath);
    };

    db.methods['getJob'] = { type: 'async' };
    db.methods['getStream'] = { type: 'readable' };
    db.methods['addJob'] = { type: 'async' };
    db.methods['addJobs'] = { type: 'async' };
    db.methods['completeJob'] = { type: 'async' };
    db.methods['abandonJob'] = { type: 'async' };
    db.methods['getStats'] = { type: 'async' };

    multilevel.writeManifest(db, 'manifest.json');

    net.createServer(function (con) {
        con.pipe(multilevel.server(db)).pipe(con);
        console.log("jobserver started on port " + port);
    }).listen(port);

});

