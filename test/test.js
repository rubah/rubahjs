const assert = require("assert");
const fs = require("fs");
const templ1 = require("./templates/template1");
const rubahjs = require("../index");

describe('Rubah', function() {
    
    const data1 = {
        var1: 'a',
        var2: {
            var3: 'b',
            var4: 'c'
        }
    }
    const rubah = Object.assign({},rubahjs);
    
    before(function(done){
        // rubah.watch('test/');
        rubah.state = data1;
        rubah.register(templ1);
        rubah.applyToFile('test');
        rubah.state={};
        done();
    });
    
    it('should produce correct state', function(){
        rubah.scan('test/content/b/',function(data){
            assert.deepEqual(data,data1);
            
        })
    })
});

describe('watcher', function() {
    
    this.timeout(10000);
    
    const data2 = {
        var1: 'x',
        var2: {
            var3: 'y',
            var4: 'z'
        }
    }
    const rubah = Object.assign({},rubahjs);
    before(function(){
        
        try{
            fs.unlinkSync('test/content/y/x--test.txt');
        }catch(e){console.log(e)};
    })
    
    it('should produce correct state', function(){
        rubah.folder='test/content/y';
        rubah.interval = 0.1;
        return new Promise((v,j)=>{
            rubah.watch('test/content/y',function(x){
                assert.deepEqual(x,data2)
                rubah.monitor[rubah.folder].stop();
                v();
                // setInterval(function(){
                //     process.exit(0);
                // },200);
            });
            setInterval(function(){
                rubah.register(templ1);
                rubah.state=data2;
                rubah.materialize();
            },500)
        });
    })
    
    // after(function(){
    //     require('why-is-node-running')();
    // })
});