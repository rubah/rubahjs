const rubah = require("./index");
const recursive = require("recursive-readdir");
rubah.exclude.folder.push('./node_modules');
rubah.exclude.folder.push('./.git');
rubah.exclude.folder.push('./.nyc_output');
rubah.exclude.folder.push('./templates');
recursive('./templates',function(err,files){
    if(err)throw new Error(err);
    for(const file of files){
        if(file.endsWith('.js'))
            rubah.register(require('./'+file.substr(0,file.length-3))({
                module: module
                
            }));
    }
    rubah.scan('.',(x)=>{
        // console.log(x);
        rubah.materialize();
    });
})