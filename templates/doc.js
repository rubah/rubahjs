module.exports = function(opts){
    const path = require("path");
    const watch = opts.watch || process.cwd();
    opts.module = opts.module || module;
    return {
        templateName: 'doc',
        filename: path.resolve(watch,'./doc/{{{key}}}.md'),
        template: '{{{data}}}',
        stateToData: function(state){
            const res = [];
            for(const key in state.doc)
                res.push(state.doc[key]);
            return res;
        },    
        dataToState: function(data){
            const res = {};
            res[data.key] = {key: data.key, data: data.data};
            return {doc: res};
        },
        write: false
    }
}