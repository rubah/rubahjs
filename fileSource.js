const isDirectory = require('is-directory');
const fs = require("fs");
const path = require("path");
const mkdir = require("./mkdir");
const recursive = require("recursive-readdir");

const fileSource = function() {
    return {
        sourceName: 'file',

        new: fileSource,

        exclude: function(id) {
            if (!fs.existsSync(id)) throw new Error('no file or folder named ' + id + ' to be excluded');
            const fn = fs.realpathSync(id);
            if (isDirectory.sync(id)) {
                this.excludeList.folder.push(fn);
            }
            else {
                this.excludeList.files.push(fn);
            }
        },

        readFile: function(id) {
            return new Promise((v, j) => {
                if (!fs.existsSync(id)) j(new Error('no file with name of: ' + id))
                const fn = fs.realpathSync(id);
                v({
                    source: 'file',
                    id: fn,
                    body: () => fs.readFileSync(fn).toString('utf8')
                });
            })
        },

        excludeList: {
            files: [],
            folder: []
        },
        
        isExcluded: function(id){
            for(const f of this.excludeList.folder){
                if(id.startsWith(f)) return true;
            }
            return this.excludeList.files.indexOf(id) > -1;
        },

        //return promise: array of rbo
        scan: function(id) {
            const fsrc = this;
            if (isDirectory.sync(id)) {
                return new Promise((v, j) => {
                    recursive(id, (err, files) => {
                        const promises = [];
                        if (err) return j(err);
                        for (let f of files) {
                            // console.log(folder,f);
                            if (!fsrc.isExcluded(path.resolve(id, f))) {
                                promises.push(fsrc.readFile(f));
                            }
                        }
                        Promise.all(promises).then(vv => v(vv), jj => j(jj));
                    });
                })
            }
            else {
                return fsrc.readFile(id);
            }
        },
        //return promise: execution response
        create: function(rbo) {
            mkdir(rbo.id);
            return new Promise((v, j) => {
                fs.writeFile(rbo.id, rbo.body(), 'UTF8', function(err, res) {
                    if (err) return j(err);
                    return v(res);
                });
            })
        }
    };
}

module.exports = fileSource();
