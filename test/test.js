const assert = require("assert");
const fs = require("fs");
const templ1 = require("./templates/template1");
const rubahjs = require("../index");
const fileSource = require("../fileSource");

describe('Rubah', function() {
    
    const data1 = {
        var1: 'a',
        var2: {
            var3: 'b',
            var4: 'c'
        }
    }
    const rubah = rubahjs.new();
    rubah.source.register(fileSource);
    
    before(function(done){
        // rubah.watch('test/');
        if(fs.existsSync('error.log'))
            fs.unlinkSync('error.log');
        rubah.state.dispatch({type: 'apply', data: data1});
        rubah.register(templ1);
        rubah.create('test');
        // rubah.state.dispatch({type: 'set', data: {}});
        rubah.state.redux.resetState();
        done();
    });
    
    it('should produce correct state', function(){
        return rubah.scan('test/content/b/',function(data){
            return assert.deepEqual(data,data1);
        })
    })
});

// describe('watcher', function() {
    
//     this.timeout(10000);
    
//     const data2 = {
//         var1: 'x',
//         var2: {
//             var3: 'y',
//             var4: 'z'
//         }
//     }
//     const rubah = Object.assign({},rubahjs);
//     before(function(){
        
//         try{
//             fs.unlinkSync('test/content/y/x--test.txt');
//         }catch(e){
//             // console.log(e)
//         };
//     })
    
//     it('should produce correct state for materialize', function(){
//         rubah.folder='./test/content/y';
//         rubah.interval = 0.1;
//         return new Promise((v,j)=>{
//             rubah.watch('test/content/y',function(x){
//                 assert.deepEqual(x,data2)
//                 rubah.monitor['test/content/y'].stop();
//                 v();
//                 // setInterval(function(){
//                 //     process.exit(0);
//                 // },200);
//             });
//             setTimeout(function(){
//                 rubah.register(templ1);
//                 rubah.state.dispatch({type: 'apply', data: data2});
//                 rubah.materialize();
//             },500)
//         });
//     })
    
//     // after(function(){
//     //     require('why-is-node-running')();
//     // })
// });