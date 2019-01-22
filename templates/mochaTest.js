module.exports = function(opts){
    const path = require("path");
    const watch = opts.watch || process.cwd();
    opts.module = opts.module || module;
    const template =
`{{{comment comment}}}
//=================
describe("{{{sentenceCase key}}}", function() {
{{{setup}}}
//=== setup ===
{{#each cases}}
it("{{{sentenceCase description}}}", function() {
{{{content}}}
});
{{/each}}
});
//END OF TESTFILE
`;
    return {
        templateName: 'mochaTest',
        filename: path.resolve(watch,'./test/{{{camelCase key}}}Test.js'),
        template: template,
        stateToData: function(state){
            const res = [];
            for(const key in state.test)
                res.push(state.test[key]);
            return res;
        },    
        dataToState: function(data){
            const res = {};
            res[data.key]= data;
            return {test: res};
        },
    }
}