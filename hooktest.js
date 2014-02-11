#!/usr/bin/env node

var util = require('util');
var LevelUp = require('levelup');
var SubLevel = require('level-sublevel')
var Trigger = require('level-trigger');
var argv = require('optimist').argv;

var db = SubLevel(LevelUp('db/hooktest.leveldb'));

function hark(one, two) {
    console.log('hark called');
}

db.pre(hark);

var subdb = db.sublevel('sub', {encoding: 'utf8'});



subdb.put('foo', 'bar', function(err) {
    if(err) {
        console.log("Aaah: " + err);
        return;
    }
    console.log("put data");
})
