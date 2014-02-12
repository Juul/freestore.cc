var fs = require('fs');

// e.g. to check if the current process has 
// read permission to a file use:
//   doWeHasPermission("/my/file", 4);
// to check for read and write and execute for a dir:
//   doWeHasPermission("/my/path", 7, true);
function doWeHasPermission(path, permNumber, checkIfDir) {
    if(!path) return false;
    try {
        var stat = fs.statSync(path);
        if(!stat) return false;
        var pathmode = stat.mode & 0777;
        var wantedmode;
        if(checkIfDir && !stat.isDirectory()) return false;
        if(process.getuid()=== stat.uid) {
            wantedmode = parseInt(permNumber * 100, 8);
            if((pathmode & wantedmode) == wantedmode) {
                return true;

            }
        } else if(process.getgroups().indexOf(stat.gid) >= 0) {
            wantedmode = parseInt(permNumber * 10, 8);
            if((pathmode & wantedmode) == wantedmode) {
                return true;
            }
        } else {
            wantedmode = parseInt(permNumber, 8);
            if((pathmode & wantedmode) == wantedmode) {
                return true;
            }
        }
    } catch(e) {
        return false;
    }
    return false;
}

module.exports = permission = {
    toWriteDir: function(path) {
        return doWeHasPermission(path, 7, true);
    },
    toWriteFile: function(path) {
        return doWeHasPermission(path, 6);
    },
    toReadDir: function(path) {
        return doWeHasPermission(path, 5, true);
    },
    toReadFile: function(path) {
        return doWeHasPermission(path, 4);
    },
    toExecute: function(path) {
        return doWeHasPermission(path, 5);
    }
}

