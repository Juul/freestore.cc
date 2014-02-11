#!/usr/bin/env node

var levelup = require('levelup');
var levelQueue = require('level-queue')()
//var hooks = require('level-hooks');

levelup('db/queue.leveldb', {createIfMissing: true}, function(err, db) {

    if(err) {
        console.log("fail: " + err);
        return;
    }

    levelQueue(db);

  // add a worker, for a given job name.
  db.queue.add('job', function (value, done) {

    setTimeout(function () {
      console.log(value)
      // call done() to delete this job from the database.
      done()
    }, Math.random() * 1000)

  })

  db.queue('job', 'todo - may be any string or buffer')
  db.queue('job', 'lol')
  db.queue('job', 'what is up')


})

