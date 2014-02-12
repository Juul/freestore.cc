
var util = require('util');
var levelup = require('levelup');
var MapReduce = require('map-reduce');
var timestamp = require('monotonic-timestamp');
var uuid = require('node-uuid').v4;

var JobQuery = function(db, completed_cb) {

    this.db = db;
    this.completed_cb = completed_cb;

    this.add = function(job, callback) {
        job.state = 'waiting';
        job.submitted = Date.now();
        job.id = uuid();
        this.db.put(timestamp(), job, callback);
    };

    this.complete = function(job, callback) {
        this.db.del(job.key, function(err) {
            if(err) {
                callback(err);
                return;
            }
            job.completed = Date.now();
            job.state = 'completed';
            callback(null, job);
            if(this.completed_cb) this.completed_cb(job);
        });
    };

    this.abandon = function(job, callback) {
        job.state = 'failed';
        this.db.put(job.key, job, callback);
    };

    // get the next job 
    this.get = function(callback) {
        var stream = this.db.createReadStream();
            stream.on('data', function(data) {
                var job = data.value;
                if(job.state != 'waiting') return;
                stream.destroy();
                job.key = data.key;
                job.state = 'working';
                job.started = Date.now();
                this.db.put(data.key, job, function(err) {
                    callback(err, job);
                });
            }.bind(this)).on('close', function(err) {
                callback(null, null);
            }.bind(this)).on('error', function(err) {
                callback(err);
                stream.destroy();
            });
    };

    this.countMap = MapReduce(
        this.db,
        'countmap',
        function(key, val, emit) {
            if(val.state) {
                emit(val.state, 1)
            }
        },
        function(acc, val, key) {
            return Number(acc || 0) + Number(val);
        });

    this.counts = {};

    this.countMap.on('reduce', function(group, val) {
        group = group[0];
        if(group) {
            this.counts[group] = val;
            return;
        } else {
            this.counts.total = val;
        }
    }.bind(this));
        
    
    this.countMap.start();

/*
    this.activeCount = function(callback) {
        var count = 0;
        this.db.createReadStream()
            .on('data', function(data) {
                if(data.status == 'waiting') {
                    count++;
                }
            }.bind(this))
            .on('error', function(err) {
                callback(err);
            }.bind(this))
            .on('end', function() {
                callback(null, count);
            });
    };
*/
};

module.exports = JobQuery;