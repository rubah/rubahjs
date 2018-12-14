const hb = require("reversible-handlebars");
const watch = require("watch");
const fs = require("fs");
const lodash = require("lodash");
const ft = require('files-tree');

const rubahjs = {
    templates: {},
    state: {},
    monitor: {},
    folder: '.',
    apply: function(templateName, data, templateId){
        const fileTemplate = this.templates[templateName];
        if(!fileTemplate)throw new Error('unknown template '+templateName);
        const template = fileTemplate[templateId?templateId:'template'];
        if(!template)throw new Error('unknown templateid');
        if(fileTemplate.partials)for(const partial of fileTemplate.partials)hb.registerPartial(partial);
        if(fileTemplate.helpers)for(const helper of fileTemplate.helpers)hb.registerPartial(helper);
        return hb.apply(template, data);
    },
    reverse: function(templateName, content, templateId){
        const fileTemplate = this.templates[templateName];
        if(!fileTemplate)throw new Error('unknown template '+templateName);
        const template = fileTemplate[templateId?templateId:'template'];
        if(!template)throw new Error('unknown templateid');
        if(fileTemplate.partials)for(const partial of fileTemplate.partials)hb.registerPartial(partial);
        if(fileTemplate.helpers)for(const helper of fileTemplate.helpers)hb.registerPartial(helper);
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
               }
            }catch(e){
            };
        }
    },
    register: function(fileTemplate){
        if(!fileTemplate.stateToData)fileTemplate.stateToData = function(x){return [x]};
        if(!fileTemplate.dataToState)fileTemplate.dataToState = function(x){return x};
        this.templates[fileTemplate.templateName]=fileTemplate;
    },
    scan: function(folder, callback){
        folder = folder || this.folder;
        const files = ft.tree(folder);
        for(const f of files){
            if(f.file)
                this.fileCheck(f.path);
        }
        callback(this.state);
    },
    materialize: function(folder){
        folder = folder || this.folder;
        for(const tn in this.templates)
            this.applyToFile(tn);
    },
    watch: function(folder, callback){
        folder = folder || this.folder;
        const parent = this;
        watch.createMonitor(folder, {interval: this.interval || 5}, function (monitor) {
            monitor.files[folder];
            parent.monitor[folder]=monitor;
            const update = function(){parent.scan(folder,callback)};
            monitor.on("created", function (f, stat) {
                update();
            })
            monitor.on("changed", function (f, curr, prev) {
                update();
            })
            monitor.on("removed", function (f, stat) {
                update();
            })
        })
    }
};

module.exports = rubahjs;