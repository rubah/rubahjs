const assert = require("assert");
const fs = require("fs");
const templ1 = require("./templates/template1");
const rubahjs = require("../index");

describe('Exclude', function() {
    
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
        rubah.exclude.folder.push('test/content/b/');
        done();
    });
    
    it('should ignore file creation', function(){
        rubah.scan('test/content/b/',function(data){
            assert.fail(JSON.stringify(data));
            
        })
    })
});

describe('Exclude2', function() {
    
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
    
    it('should ignore file deletion', function(){
        const a = new Promise((v,j)=>{
            const rubah = Object.assign({},rubahjs);
            rubah.folder='test/content/y';
            rubah.exclude.file.push('test/content/y/x--test.txt')
            rubah.interval = 0.1;
            rubah.watch('test/content/y',function(x){
                assert.deepEqual(x,data2);
                rubah.monitor[rubah.folder].stop();
            });
            setTimeout(function(){
                rubah.register(templ1);
                rubah.state=data2;
                rubah.materialize();
            },500)
            setInterval(function(){v()},3000)
        });
        // return a
        return a.then(function(){
            return new Promise((v,j)=>{
            const rubah = Object.assign({},rubahjs);
                rubah.folder='test/content/b';
                rubah.interval = 0.1;
                rubah.watch('test/content/b',function(x){
                    assert.fail(JSON.stringify(x))
                    rubah.monitor[rubah.folder].stop();
                    v();
                });
                setTimeout(function(){
                    fs.unlinkSync('test/content/b/a--test.txt')
                },2500)
                setTimeout(function(){
                    v();
                },5000)
            });
            
        });
    })
});