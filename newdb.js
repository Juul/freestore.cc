#!/usr/bin/env node

var util = require('util');
var net = require('net');
var levelup = require('levelup');
var timestamp = require('monotonic-timestamp');
var multilevel = require('multilevel');
var sublevel = require('level-sublevel')
var argv = require('optimist').argv;
var jobquery = require('./lib/jobquery');
var rmdir = require('rimraf');


var dbpath = 'db/queue.multilevel';

rmdir(dbpath, function() {


var db = levelup(dbpath, {
    createIfMissing: true,
    keyEncoding: 'utf8',
    valueEncoding: 'json'
    
}, function(err, db) {

    if(err) {
        console.log("failed to open/create database: " + err);
        return;
    }

    db = sublevel(db);
    
    console.log("created new db");

    db.put('a', {state: 'waiting'});
    db.put('b', {state: 'failed'});
    db.put('c', {state: 'waiting'});
    db.put('d', {state: 'waiting'});
    db.put('e', {state: 'waiting'});
    db.put('f', {state: 'working'});
    db.put('g', {state: 'working'}, function() {

        db.createReadStream()
            .on('data', function(data) {
                console.log(data);
            }).on('error', function(err) {
                console.log("ERROR: " + err);
            }).on('end', function(end) {
                console.log("--end--");
            });
    });
});

});