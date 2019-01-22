module.exports = function(opts){
    const path = require("path");
    const watch = opts.watch || process.cwd();
    opts.module = opts.module || module;
    return {
        templateName: 'state',
        filename: path.resolve(watch,'./templates/state.json'),
        template: '{{{json data}}}',
        stateToData: function(state){
            return [{data: state}];
        },    
        dataToState: function(data){
            return data;
        },
        priority: Number.MAX_VALUE,
        read: false,
        write: true
    }
}