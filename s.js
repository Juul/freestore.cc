#!/usr/bin/env node

var util = require('util');
var net = require('net');
var levelup = require('levelup');
var timestamp = require('monotonic-timestamp');
var multilevel = require('multilevel');
var sublevel = require('level-sublevel')
var argv = require('optimist').argv;
var jobquery = require('./lib/jobquery');
var MapReduce = require('map-reduce');

var waiters = []; // remote clients waiting for jobs


var db = levelup('db/queue.multilevel', {
    createIfMissing: true,
    keyEncoding: 'utf8',
    valueEncoding: 'utf8'
    
}, function(err, db) {

    if(err) {
        console.log("failed to open/create database: " + err);
        return;
    }

    db = sublevel(db);  

    var m = MapReduce(
        db,
        'countmap2',
        function(key, val, emit) {
            console.log('map');
            emit(key, val);
        },
        function(acc, val, key) {
            console.log('reduce');
            return Number(acc || 0) + Number(val);
        });
    m.on('reduce', function(group, val) {
        console.log('reduce-event');
    });

    m.start();
});

