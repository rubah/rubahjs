module.exports = function(opts){
    const path = require("path");
    const beautify = opts.module.require('js-beautify').js;
    const watch = opts.watch || process.cwd();
    opts.module = opts.module || module;

    const feature = require("../helpers/blockExtractorReadonly")( "feature",
        {type: "comment", start: "/**", end: "**/", inclusive: true, map: require("../helpers/commentHelper").map},
        {type: "code", start: "//example:", end: "//:example", map: x=>beautify(x)},
        );


    return {
        templateName: 'featureCollector',
        filename: path.resolve(watch,'./test/feature{{{properCase key}}}Test.js'),
        template: "{{{feature data}}}",
        stateToData: function(state){
            const res = [];
            for(const key in state.test)
                res.push(state.test[key]);
            return res;
        },    
        dataToState: function(data){
            const res = {};
            res[data.key]= data;
            return {feature: res};
        },
        write: false,
        helpers: [feature]
    }
}