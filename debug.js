#!/usr/bin/env node

var util = require('util');
var net = require('net');
var levelup = require('levelup');
var timestamp = require('monotonic-timestamp');
var multilevel = require('multilevel');
var sublevel = require('level-sublevel')
var argv = require('optimist').argv;
var jobquery = require('./lib/jobquery');

var waiters = []; // remote clients waiting for jobs

function usage() {
    process.stderr.write("\n");
    process.stderr.write("Usage: " + path.basename(__filename) + " <db_file_to_list>\n");
    process.stderr.write("\n");
}

var dbpath = process.argv[2];

var db = levelup(dbpath, {
    createIfMissing: true,
    keyEncoding: 'json',
    valueEncoding: 'json'
    
}, function(err, db) {

    if(err) {
        console.log("failed to open/create database: " + err);
        return;
    }

    db = sublevel(db);

    db.createReadStream()
        .on('data', function(data) {
            console.log(data);
        }).on('error', function(err) {
            console.log("ERROR: " + err);
        }).on('end', function(end) {
            console.log("--end--");
        });

});