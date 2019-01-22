const assert = require("assert");
const fs = require("fs");
const templ1 = require("./templates/template1");
const rubahjs = require("../index");

describe('watcher2', function() {
    
    this.timeout(10000);
    
    const data2 = {
        var1: 'x',
        var2: {
            var3: 'y',
            var4: 'z'
        }
    }
    
    it('should produce correct state', function(){
        const a = new Promise((v,j)=>{
            const rubah = Object.assign({},rubahjs);
            // const rubah = rubahjs;
            rubah.resetState();
            rubah.folder='test/content/y';
            rubah.interval = 0.1;
            rubah.watch('test/content/y',function(x){
                assert.deepEqual(x,data2);
                rubah.monitor[rubah.folder].stop();
                setInterval(function(){v()},1000)
            });
            setTimeout(function(){
                rubah.register(templ1);
                rubah.state.dispatch({type: 'apply', data: data2});
                rubah.materialize();
            },500)
        });
        // return a
        return a.then(function(){
            return new Promise((v,j)=>{
                const rubah = Object.assign({},rubahjs);
                // const rubah = rubahjs;
                rubah.resetState();
                // const rubah = require("../index");
                rubah.folder='test/content/b';
                rubah.interval = 0.1;
                rubah.watch('test/content/b',function(x){
                    assert.deepEqual(x,{})
                    rubah.monitor[rubah.folder].stop();
                    v();
                });
                setTimeout(function(){
                    fs.unlinkSync('test/content/b/a--test.txt')
                },2500)
            });
            
        });
    })
    
    // after(function(){
    //     require('why-is-node-running')();
    // })
});