const assert = require("assert");
const fs = require("fs");
const templ1 = require("./templates/template1");
const rubahjs = require("../index");
const fileSource = require("../fileSource");

describe('Exclude', function() {
    
    const data1 = {
        var1: 'a',
        var2: {
            var3: 'b',
            var4: 'c'
        }
    }
    const rubah = rubahjs.new();
    
    before(function(done){
        // rubah.watch('test/');
        let fs = fileSource.new();
        rubah.source.register(fs);
        rubah.state.dispatch({type: 'apply', data: data1});
        rubah.register(templ1);
        rubah.create('test');
        rubah.state.dispatch({type: 'reset'});
        fs.exclude('./test/content/b/');
        // rubah.exclude.folder.push('./test/content/b/');
        done();
    });
    
    it('should ignore file creation', function(){
        return rubah.scan('test/content/b/',function(data){
            return assert.fail(JSON.stringify(data));
        })
    })
});

// describe('Exclude2', function() {
    
//     this.timeout(20000);
    
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
    
//     it('should ignore file deletion2', function(){
//         const a = new Promise((v,j)=>{
//             const rubah = Object.assign({},rubahjs);
//             rubah.folder='test/content/y';
//             rubah.exclude.file.push('test/content/y/x--test.txt');
//             rubah.interval = 0.1;
//             rubah.watch('test/content/y',function(x){
//                 assert.deepEqual(x,data2);
//                 rubah.monitor[rubah.folder].stop();
//             });
//             setTimeout(function(){
//                 rubah.register(templ1);
//                 rubah.state.dispatch({type: 'apply', data: data2});
//                 rubah.materialize();
//                 rubah.state.dispatch({type: 'reset'});
//             },500)
//             setInterval(function(){v()},5000)
//         });
//         // return a
//         return a.then(function(){
//             return new Promise((v,j)=>{
//             const rubah = Object.assign({},rubahjs);
//                 rubah.folder='test/content/b';
//                 rubah.interval = 0.1;
//                 rubah.exclude.file.push('test/content/b/a--test.txt');
//                 rubah.watch('test/content/b',function(x){
//                     assert.fail(JSON.stringify(x))
//                     rubah.monitor[rubah.folder].stop();
//                     v();
//                 });
//                 setTimeout(function(){
//                     fs.unlinkSync('test/content/b/a--test.txt')
//                 },1500)
//                 setTimeout(function(){
//                     rubah.monitor[rubah.folder].stop();
//                     v();
//                 },5000)
//             });
            
//         });
//     })
// });