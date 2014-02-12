var uuid = require('node-uuid').v4;

module.exports = {
    sanitizeAndUniquify: // This function creates a unique filename
    // by sanitizing the existing filename and
    // appending a globally unique id (uuid v4)
    function (filename) {
        
        // replace whitespace with underscore 
        // and only keep a few standard characters
        filename = filename.replace(/\s+/g, '_').replace(/[^\d\w\.\-\_]/g, '');
        
        if(filename.length <= 0) {
            return uuid();
        }
        
        var lastDot = filename.lastIndexOf("\.");
        var base = '';
        var ext = '';
        if(lastDot > 0) {
            base = filename.substr(0, lastDot);
            if(lastDot < filename.length - 1) {
                ext = filename.substr(lastDot+1, filename.length);
            }
        } else {
            base = filename;
        }
        
        // append a globally unique id
        // and ensure the filename length stays under 255
        
        var id = '-'+uuid();
        var len = 255 - id.length;
        if(ext.length > 10) {
            ext = ext.substr(ext.length - 11, 10);
        }
        if(ext.length > 0) {
            ext = '.' + ext;
            len -= ext.length;
        }
        if(base.length > len) {
            base = base.substr(0, len);
        }
        return base + ext + id;
    }

};