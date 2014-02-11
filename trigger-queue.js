#!/usr/bin/env node

var sleep = require('sleep');
var util = require('util');
var LevelUp = require('levelup');
var SubLevel = require('level-sublevel')
var Trigger = require('level-trigger');
var argv = require('optimist').argv;

var db = SubLevel(LevelUp('db/trigger-queue.leveldb'));

var trigdb = Trigger(db, 'main', function(change) {

    console.log("mapping function called");

    return change.key;

}, function(value, done) {

    console.log("doing work");
    sleep.sleep(5);
    console.log("done with work");
    done();
});

if(argv.batch) {
  trigdb.start()
}

console.log('got here');
db.put('foo', 'bar', function(err) {
    if(err) {
        console.log("Aaah: " + err);
        return;
    }
    console.log("completed job 0");
});

console.log('got here 1');
db.put('foo1', 'bar', function(err) {
    if(err) {
        console.log("Aaah: " + err);
        return;
    }
    console.log("completed job 1");
});

console.log('got here 2');
db.put('foo2', 'bar', function(err) {
    if(err) {
        console.log("Aaah: " + err);
        return;
    }
    console.log("completed job 2");
});
