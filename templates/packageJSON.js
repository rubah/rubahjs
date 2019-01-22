module.exports = function(opts){
    const path = require("path");
    const watch = opts.watch || process.cwd();
    opts.module = opts.module || module;
    return {
        templateName: 'packageJSON',
        filename: path.resolve(watch,'./package.json'),
        template: '{{{json data}}}',
        stateToData: function(state){
            return [state.packageJson];
        },    
        dataToState: function(data){
            return {packageJson: data};
        },
        write: false
    }
}