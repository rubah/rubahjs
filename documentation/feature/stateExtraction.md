# State extraction
---

Extract state data from multiple files


Setting up rubahjs
We are importing rubahjs using standard require. By default the result returned are already instantiated and
ready to use. If you want to instantiate rubahjs manualy, you can use the constructor in ```new rubahjs.new(opts)```.
For more info on rubahjs constructor refer to [constructor manual](doc/compiled/constructor.md)

```js
let rubahjs = require("rubahjs");
```




Next we're going to create the files that will be extracted. In this example, there will be 3 json files that initialized
with:

```js
const fs = require("fs");
fs.writeFileSync('test1.json', JSON.stringify({
    key1: 1,
    key2: 2
}));
fs.writeFileSync('test2.json', JSON.stringify({
    key3: {
        a: 1
    }
}));
fs.writeFileSync('test3.json', JSON.stringify({
    key3: {
        b: 2
    }
}));
```

We are importing rubahjs using standard require. By default the result returned are already instantiated and
ready to use. If you want to instantiate rubahjs manualy, you can use the constructor in ```new rubahjs.new(opts)```.
For more info on rubahjs constructor refer to [constructor manual](doc/compiled/constructor.md)


We'll define the template which will extract the state data from the 3 files we created earlier.

```js
const template = {
    templateName: "testTemplate",
    filename: process.cwd() + "/test{{{id}}}.json",
    template: "{{{data}}}",
    dataToState: function(state) {
        let res = {};
        res[state.id] = JSON.parse(state.data);
        return res;
    },
};
rubahjs.register(template);
```

The template will extract id from the filename, and data from the content.

The dataToState property will be called everytime rubahjs finished extracting data from **a** file. Rubahjs are using
lodash.merge to merge the state from multiple extraction process. To avoid overwriting state because of same branch/property,
we'll create a unique property name taken from ```state.id```


We'll extract the state data from the 3 files we created earlier by using ```rubahjs.scan``` function.

```js
rubahjs.scan('.', function(state) {
    console.log(state);
})
```




