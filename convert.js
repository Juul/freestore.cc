#!/usr/bin/env node

var util = require('util');
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
var winston = require('winston');

if(process.argv.length != 3) {
    console.log("Usage: " + path.basename(__filename) + " <video_file>")
    process.exit(1);
}

var infile = process.argv[2];
var outfile = path.join('out', path.basename(infile));

var proc = new ffmpeg({
    source: infile,
    timeout: 0,
    priority: 0,
    logger: new (winston.Logger)({
        transports: [
            new (winston.transports.Console)(),
        ]}),
    nolog: false
});

proc.withVideoBitrate(1024)
    .withVideoCodec('libvpx')
//    .withSize('640x?')
//    .withAspect('16:9')
//    .withFps(24)
    .withAudioBitrate('128k')
    .withAudioCodec('libvorbis')
    .withAudioChannels(2)
    .toFormat('webm');

proc.getCommand(null, function(cmd) {
    console.log(cmd);
});

proc.getMeta(function(metaData) {

    console.log(metaData);
})

console.log("transcoding to " + outfile);

proc.saveToFile(outfile, function(stdout, stderr) {
        console.log("stdout: " + stdout);
        console.log("stderr: " + stderr);
        console.log('file has been converted succesfully');
    });
