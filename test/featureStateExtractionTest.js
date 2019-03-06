/**
 *
 * Extract state data from multiple files
 *
 **/
//<featureid>2</featureid>
describe("!!!Feature extract state data", function() {
    it("!!!Should get the correct state", function() {
        /**
         *
         * Setting up rubahjs
         * We are importing rubahjs using standard require. By default the result returned are already instantiated and
         * ready to use. If you want to instantiate rubahjs manualy, you can use the constructor in ```new rubahjs.new(opts)```.
         * For more info on rubahjs constructor refer to [constructor manual](doc/compiled/constructor.md)
         *
         **/
        //example:
        let rubahjs = require("../index");
        //:example
        rubahjs = new rubahjs.new();
        /**
         *
         * Next we're going to create the files that will be extracted. In this example, there will be 3 json files that initialized
         * with:
         * ---
         * We are importing rubahjs using standard require. By default the result returned are already instantiated and
         * ready to use. If you want to instantiate rubahjs manualy, you can use the constructor in ```new rubahjs.new(opts)```.
         * For more info on rubahjs constructor refer to [constructor manual](doc/compiled/constructor.md)
         *
         **/
         process.chdir('test');
        //example:
        const fs = require("fs");
        fs.writeFileSync('test1.json', JSON.stringify({ key1: 1, key2: 2 }));
        fs.writeFileSync('test2.json', JSON.stringify({ key3: { a: 1 } }));
        fs.writeFileSync('test3.json', JSON.stringify({ key3: { b: 2 } }));
        //:example
        /**
         *
         * We'll define the template which will extract the state data from the 3 files we created earlier.
         * ---
         * The template will extract id from the filename, and data from the content.
         * 
         * The dataToState property will be called everytime rubahjs finished extracting data from **a** file. Rubahjs are using
         * lodash.merge to merge the state from multiple extraction process. To avoid overwriting state because of same branch/property,
         * we'll create a unique property name taken from ```state.id```
         *
         **/
        //example:
        const template = {
            templateName: "testTemplate",
            filename: process.cwd()+"/test{{{id}}}.json",
            template: "{{{data}}}",
            dataToState: function(state) {
                let res = {};
                res[state.id]=JSON.parse(state.data);
                return res;
            },
        };
        rubahjs.register(template);
        //:example
        /**
         *
         * We'll extract the state data from the 3 files we created earlier by using ```rubahjs.scan``` function.
         * ---
         * 
         *
         **/
        //example:
        rubahjs.scan('.',function(state){
            console.log(state);
        })
        //:example
        
    });
});
