const hb = require("reversible-handlebars");
const watch = require("watch");
const fs = require("fs");
const lodash = require("lodash");
const ft = require('files-tree');
const recursive = require("recursive-readdir");
const isDirectory = require('is-directory');
const path = require("path")

const rubahjs = {
    templates: {},
    state: {},
    monitor: {},
    exclude: {folder: [], file: []},
    folder: '.',
    apply: function(templateName, data, templateId){
        const fileTemplate = this.templates[templateName];
        if(!fileTemplate)throw new Error('unknown template '+templateName);
        const template = fileTemplate[templateId?templateId:'template'];
        if(!template)throw new Error('unknown templateid');
        if(fileTemplate.partials)for(const partial of fileTemplate.partials)hb.registerPartial(partial.name, partial.template);
        if(fileTemplate.helpers)for(const helper of fileTemplate.helpers)hb.registerHelper(helper);
        return hb.apply(template, data);
    },
    reverse: function(templateName, content, templateId){
        const fileTemplate = this.templates[templateName];
        if(!fileTemplate)throw new Error('unknown template '+templateName);
        const template = fileTemplate[templateId?templateId:'template'];
        if(!template)throw new Error('unknown templateid');
        if(fileTemplate.partials)for(const partial of fileTemplate.partials)hb.registerPartial(partial);
        if(fileTemplate.helpers)for(const helper of fileTemplate.helpers)hb.registerHelper(helper);
        return hb.reverse(template, content);
    },
    applyToFile: function(templateName){
        const fileTemplate = this.templates[templateName];
        if(!fileTemplate)throw new Error('unknown template '+templateName);
        const states = fileTemplate.stateToData(this.state);
        for(const state of states){
            const fn = this.apply(templateName,this.state, 'filename');
            const content = this.apply(templateName,this.state);
            fs.writeFileSync(fn,content);
        }
    },
    fileCheck: function(fn){
        let changed = false;
        for(const x in this.exclude){
            if(this.exclude[x]=='prefix' && fn.startsWith(x))return;
            if(this.exclude[x]=='exact' && fn==x)return;
        }
        for(const tn in this.templates){
            try{
               let v = this.reverse(tn,fn,'filename');
               if(v){
                    let content = fs.readFileSync(fn).toString('utf8');
                    v = Object.assign({},v,this.reverse(tn,content));
                    v = this.templates[tn].dataToState(v);
                    this.state = lodash.merge(this.state,v,function(oV,sV){
                        if (Array.isArray(oV)) {
                            return oV.concat(sV);
                        }
                        if(typeof oV != 'object' && oV != sV)
                            throw new Error('inconsistent value '+oV+' != '+sV);
                    });
                    
                    changed = true;
               }
            }catch(e){
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
        this.templates[fileTemplate.templateName]=fileTemplate;
    },

    isExcluded: function(f){
        const file = path.resolve(process.cwd(),f);
        let skipFlag = false;
        for(let k of this.exclude.folder){
            const check = path.resolve(process.cwd(),k);
            if(file.startsWith(check)){
                // console.log('skipping '+file+' on rule folder of '+check);
                skipFlag = true;
                break;
            }
        }
        if(!skipFlag)
            for(let k of this.exclude.file){
                const check = path.resolve(process.cwd(),k);
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
        folder = folder || this.folder;
        let changed = false;
        recursive(folder,(err,files)=>{
            if(err)throw(err);
            // console.log(f);
            for(const f of files){
                if(!this.isExcluded(f, this))
                    changed = changed || this.fileCheck(path.resolve(process.cwd(),f));
            }
            if(changed || forced)
                callback(this.state);
        });
    },
    materialize: function(folder){
        folder = folder || this.folder;
        for(const tn in this.templates)
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