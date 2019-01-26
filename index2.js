const hb = require("reversible-handlebars");
const watch = require("watch");
const fs = require("fs");
const lodash = require("lodash");
const ft = require('files-tree');
const recursive = require("recursive-readdir");
const isDirectory = require('is-directory');
const path = require("path")
const redux = require("redux");
const beautifier = require("./beautifier");
const mkdir = require("./mkdir");

const reducers = {
    apply: (state,action)=>{return lodash.merge({},state,action.data)}
};
const reducer = function(state = {}, action){
    if(reducers[action.type]){
        return reducers[action.type](state,action);
    }
}

const rubahjs = {
    helpers: {
        json: require("./helpers/jsonHelper"),
        comment: require("./helpers/commentHelper"),
        md: require("./helpers/mdHelper")
    },
    reducers: reducers,
    templates: {},
    state: redux.createStore(reducer,{}),
    resetState: function(){
        this.state = redux.createStore(reducer,{})
        this.state.dispatch({type: "apply", data: {}})
    },
    monitor: {},
    exclude: {folder: [], file: []},
    folder: '.',
    apply: function(templateName, data, templateId){
        const fileTemplate = this.templates[templateName];
        if(!fileTemplate)throw new Error('unknown template '+templateName);
        const template = fileTemplate[templateId?templateId:'template'];
        if(!template)throw new Error('unknown templateid');
        if(fileTemplate.partials)for(const partial of fileTemplate.partials)hb.registerPartial(partial.name, partial.template);
        for(const helper in this.helpers){hb.registerHelper(this.helpers[helper])};
        if(fileTemplate.helpers)for(const helper of fileTemplate.helpers)hb.registerHelper(helper);
        return hb.apply(template, data);
    },
    reverse: function(templateName, content, templateId){
        const fileTemplate = this.templates[templateName];
        if(!fileTemplate)throw new Error('unknown template '+templateName);
        const template = fileTemplate[templateId?templateId:'template'];
        if(!template)throw new Error('unknown templateid');
        if(fileTemplate.partials)for(const partial of fileTemplate.partials)hb.registerPartial(partial);
        for(const helper in this.helpers){hb.registerHelper(this.helpers[helper])};
        if(fileTemplate.helpers)for(const helper of fileTemplate.helpers)hb.registerHelper(helper);
        return hb.reverse(template, content);
    },
    applyToFile: function(templateName){
        const fileTemplate = this.templates[templateName];
        if(!fileTemplate.write)return;
        if(!fileTemplate)throw new Error('unknown template '+templateName);
        const states = fileTemplate.stateToData(this.state.getState());
        for(const state of states){
            const fn = this.apply(templateName,state, 'filename');
            // console.log('applying to',fn);
            const content = this.apply(templateName,state);
            mkdir(fn);
            fs.writeFileSync(fn,content);
            beautifier(fn);
        }
    },
    fileCheck: function(fn){
        let changed = false;
        const templates = Object.values(this.templates).sort((a,b)=>b.priority - a.priority).map(x=>x.templateName);
        for(const tn of templates){
            if(!this.templates[tn].read) continue;
            let v, v2;
            try{
               v = this.reverse(tn,fn,'filename');
               if(v){
                    let content = fs.readFileSync(fn).toString('utf8');
                    v2 = Object.assign({},v,this.reverse(tn,content));
                    v2 = this.templates[tn].dataToState(v2);
                    if(v2) this.state.dispatch({type: "apply", data: v2});
                    // this.state = lodash.merge(this.state,v);
                    
                    changed = true;
               }
            }catch(e){
                if(v)
                    fs.appendFile('scan.log',new Date(Date.now()) + ':   ' + fn+'\n'+e.stack+'\n','utf8',x=>x);
                if(process.env.rubahlog && process.env.rubahlog=="trace"){
                    console.log(fn);
                    console.log(e);
                }
            };
        };
        return changed;
    },
    register: function(fileTemplate){
        if(!fileTemplate.stateToData)fileTemplate.stateToData = function(x){return [x]};
        if(!fileTemplate.dataToState)fileTemplate.dataToState = function(x){return x};
        if(fileTemplate.reducers){
            for(const k of Object.keys(fileTemplate.reducers)){
                this.reducers[k] = fileTemplate.reducers[k];
            }
        }
        if(fileTemplate.listeners){
            for(const k of Object.keys(fileTemplate.listeners)){
                this.state.subscribe(fileTemplate.listeners[k](this));
            }
        }
        if(typeof fileTemplate.read == "undefined")fileTemplate.read = true;
        if(typeof fileTemplate.write == "undefined")fileTemplate.write = true;
        fileTemplate.priority = fileTemplate.priority || 100;
        this.templates[fileTemplate.templateName]=fileTemplate;
    },

    isExcluded: function(f){
        // console.log("checking exclusion of",f);
        const file = f.startsWith('.')?path.resolve(process.cwd(),this.folder,f):f;
        let skipFlag = false;
        for(let k of this.exclude.folder){
            const check = k.startsWith('.')?path.resolve(process.cwd(),this.folder,k):k;
            // console.log(check, file);
            if(file.startsWith(check)){
                // console.log('skipping '+file+' on rule folder of '+check);
                skipFlag = true;
                break;
            }
        }
        if(!skipFlag)
            for(let k of this.exclude.file){
                const check = k.startsWith('.')?path.resolve(process.cwd(),this.folder,k):k;
                // console.log(check, file);
                if(file == check){
                // console.log('skipping '+file+' on rule file of '+check);
                    skipFlag = true;
                    break;
                }
            }
        return skipFlag;
    },
    scan: function(folder, callback, forced){
        if(!callback && this.callback)callback=this.callback;
        fs.writeFileSync('scan.log','');
        folder = folder || this.folder;
        let changed = false;
        recursive(folder,(err,files)=>{
            if(err)throw(err);
            // console.log(f);
            for(let f of files){
                if(f.startsWith(folder))f=path.relative(folder,f);
                // console.log(folder,f);
                if(!this.isExcluded(path.resolve(folder,f))){
                    changed = this.fileCheck(path.resolve(folder,f)) || changed;
                }
            }
            if(changed || forced)
                callback(this.state.getState());
        });
    },
    materialize: function(folder){
        folder = folder || this.folder;
        const templates = Object.values(this.templates).sort((a,b)=>b.priority - a.priority).map(x=>x.templateName);
        for(const tn of templates)
            this.applyToFile(tn);
    },
    watch: function(folder, callback){
        if(!callback && this.callback)callback=this.callback;
        folder = folder || this.folder;
        const parent = this;
        watch.createMonitor(folder, {interval: this.interval || 5}, function (monitor) {
            monitor.files[folder];
            parent.monitor[folder]=monitor;
            const update = function(force){force = force || false; parent.scan(folder,callback, force)};
            let updatePromise = false;
            monitor.on("created", function (f, stat) {
                if(!updatePromise && !parent.isExcluded(f)){
                    updatePromise = new Promise((v,j)=>{setTimeout(function() {update(); updatePromise=false}, 1000);});
                }
            })
            monitor.on("changed", function (f, curr, prev) {
                if(!updatePromise && !parent.isExcluded(f)){
                    updatePromise = new Promise((v,j)=>{setTimeout(function() {update(); updatePromise=false}, 1000);});
                }
            })
            monitor.on("removed", function (f, stat) {
                if(!updatePromise && !parent.isExcluded(f)){
                    updatePromise = new Promise((v,j)=>{setTimeout(function() {update(true); updatePromise=false}, 1000);});
                }
            })
        })
    }
};

module.exports = rubahjs;