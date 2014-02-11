/*

  This is just some code snippets that
  show how magic can be used within an express app
  with multiparty.

*/

var Magic = require('mmmagic').Magic;

var magic = new Magic();


    form.on('part', function(part) {
        if(!part.filename) return;
        console.log("got  part: " + util.inspect(part));
        var filetype_detected = false;
        var buf = new Buffer(config.receive_before_filedetect);
        var offset = 0;
        part.on('data', function(chunk) {
            if(filetype_detected) {
                // TODO write to disk
                return;
            }
            var to_copy = buf.length - offset;
            if(to_copy <= 0) return;
            if(to_copy > chunk.length-1) {
                to_copy = chunk.length-1;
            }
            chunk.copy(buf, offset, 0, to_copy);
            offset += chunk.length;
            magic.detect(buf, function(err, result) {
                if(err) {
                    return;
                }
                // yes this extra check is actually required
                if(filetype_detected) {
                    return;
                }
                filetype_detected = true;
                // write buffer to disk
                console.log("filetype: " + result);
            });
        });
    });