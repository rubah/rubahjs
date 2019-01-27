/**
 *
 * Create multiple files from single template and the state tree
 *
 **/
//<featureid>1</featureid>
describe("Feature handlebar multi templating", function() {
  const fs = require("fs");
  it("Should create multiple files from single template", function() {
    const assert = require("assert");
    /**
     *
     * Setting up rubahjs
     * ---
     * We are importing rubahjs using standard require. By default the result returned are already instantiated and
     * ready to use. If you want to instantiate rubahjs manualy, you can use the constructor in ```new rubahjs.new(opts)```.
     * For more info on rubahjs constructor refer to [constructor manual](../reference/core.md#constructor)
     *
     **/
    //example:
    const rubahjs = require("../index");
    //:example
    /**
     *
     * Creating and registering template
     * ---
     * Templates are the lifeblood of rubah js. Rubahjs template can be varied from simple js object, to complex package with
     * dependency to other package. Here we're trying to create a very simple template, for creating a txt file which name defined
     * by ```id``` and the content of the file is the string of ```this is <data will be pasted here>```. 
     * ---
     * The stateToData property are a function that governs how the state tree will be mapped into the template. If the stateToData
     * function returns an array, then the template will be applied for each element of the array, thus enabling the creation of multiple
     * files from a single template and state tree.
     * In this example we are simply returning the branch of ```test``` from the state tree
     * ---
     * For more templating with ```{{handlebars}}```
     * you can refer to [handlebars js](https://handlebarsjs.com/). For more **rubahjs** templating options refer to 
     * [rubahjs templating reference](../reference/templates.md)
     * ---
     * The register function will register the template into rubahjs instance, making it ready to use with subsequent rubahjs api call
     * For more **rubahjs** api refer to 
     * [rubahjs templating reference](../reference/core.md#api)
     *
     **/
    //example:
    const template = {
      templateName: "testTemplate",
      filename: "{{{id}}}.txt",
      template: "this is {{{data}}}!!",
      stateToData: function(state) {
        return state.test;
      },
    };
    rubahjs.register(template);
    //:example
    /**
     *
     * Setting up the state tree and running rubahjs
     * ---
     * Here we are setting up the initial value of the state tree, with a single branch object test which is an array containing 3 other objects.
     * Since the template picking the test branch, and the test branch is an array, each elements of the array will be applied to the template.
     * The materialize function will apply the state tree to all the templates registered, which will materialize the files.
     * The materialize function will return a collection of promises which for every templates should return their creation response
     *
     **/
    //example:
    rubahjs.state.dispatch({
      type: 'apply',
      data: {
        test: [
          { id: 1, data: 'number one' },
          { id: 'test', data: 'test' },
          { id: 'abc', data: 'abc' }
        ]
      }
    });
    let result = rubahjs.materialize();
    //:example
    function assertFile(fn, content) {
      return new Promise((v, j) => {
        fs.readFile(fn, function(err, data) {
          if (err) return j(err);
          v(assert.equal(data.toString('utf8'), content));
        })
      })
    }
    return result.then(v => {
      /**
       *
       * The Result
       * ---
       * the result would be a creation of three files: 1.txt, test.txt, abc.txt with their content as stated in 
       * the state tree. the assertFile is an expression that asserting that the content of the file is correct
       *
       **/
      //example:
      assertFile('1.txt', 'this is number one!!');
      assertFile('test.txt', 'this is test!!');
      assertFile('abc.txt', 'this is abc!!');
      //:example
      return Promise.all([
        assertFile('1.txt', 'this is number one!!'),
        assertFile('test.txt', 'this is test!!'),
        assertFile('abc.txt', 'this is abc!!')
      ])
    })
  });
  
  after(function(){
    if(fs.existsSync('1.txt'))
      fs.unlinkSync('1.txt');
    if(fs.existsSync('test.txt'))
      fs.unlinkSync('test.txt');
    if(fs.existsSync('abc.txt'))
      fs.unlinkSync('abc.txt');
  })
});
