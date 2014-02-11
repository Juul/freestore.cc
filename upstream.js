
// path is the path to search for plugins
var UpStream = function(path) {

    this.plugins = [];

    /*
      a descriptor should look like:
        {
          // handlesType is called with the detected filetype
          // as the sole argument.
          // The function should return true if it can handle
          // a certain filetype and false if not.
          handlesType: <func>, 

          // createWriteStream is optional, and only used for
          // plugins that want to handle the writing of the
          // file to disk on their own.
          // 1st arg is file info (including filename)
          // 2nd arg is callback for when it has been created
          createWriteStream: <func>,

          // uploadComplete is optional and is called when
          // an upload successfully completes
          uploadComplete: <func>
        }
    */
    this.addPlugin = function(desc) {
        if(!desc || !desc.handlesType) {

        }
        this.plugins.push(desc);
    };

    // attempt to find a plugin that handles the filetype
    // returns the descriptor if a plugin is found
    // returns null if no suitable plugin is found
    this.findPlugin = function(filetype) {
        var i;
        for(i=0; i < this.plugins.length; i++) {
            if(this.plugins[i].handlesType(filetype)) {
                return this.plugins[i];
            }
        }
        return null;
    };
};

module.exports = function(arguments) {
    return new UpStream(arguments);
};