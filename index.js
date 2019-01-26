const hb = require("reversible-handlebars");
const lodash = require("lodash");
const redux = require("./redux");
const fs = require("fs");
const source = require("./source");
const fileSource = require("./fileSource");

Error.stackTraceLimit = Infinity;
const silentError = function(e, additionalInfo, logfile) {
    additionalInfo = additionalInfo || '';
    if (additionalInfo && additionalInfo.toString().length > 0)
        additionalInfo = additionalInfo.toString() + '\n';
    logfile = logfile || 'error';
    logfile += '.log';
    const time = (new Date(Date.now()));
    fs.appendFile(logfile, time + ':   ' + e.message + '\n' +
        additionalInfo +
        e.stack + '\n\n', 'utf8', x => x);
}

const rubahjsFactory = function(opts) {
    opts = opts || {};
    const rjs = {
        source,
        new: rubahjsFactory,
        templates: {},
        register: function(template) {
            if (!template.stateToData) template.stateToData = function(x) { return [x] };
            if (!template.dataToState) template.dataToState = function(x) { return x };
            if (template.reducers) {
                for (const k of Object.keys(template.reducers)) {
                    this.reducers[k] = template.reducers[k];
                }
            }
            if (template.listeners) {
                for (const k of Object.keys(template.listeners)) {
                    this.state.subscribe(template.listeners[k](this));
                }
            }
            if (typeof template.read == "undefined") template.read = true;
            if (typeof template.write == "undefined") template.write = true;
            template.priority = template.priority || 100;
            this.templates[template.templateName] = template;
        },
        state: redux.store,
        apply: function(templateName, data, templateId) {
            const template = this.templates[templateName];
            if (!template) {
                silentError(new Error('unknown template ' + templateName));
                return '';
            }
            const templateBody = template[templateId ? templateId : 'template'];
            if (!templateBody) {
                silentError(new Error('unknown templateid'));
                return '';
            }
            if (template.partials)
                for (const partial of template.partials) hb.registerPartial(partial.name, partial.template);
            if (template.helpers)
                for (const helper of template.helpers) hb.registerHelper(helper);
            try {
                return hb.apply(templateBody, data);
            }
            catch (e) {
                silentError(e);
                return '';
            }
        },
        reverse: function(templateName, content, templateId) {
            const template = this.templates[templateName];
            if (!template) {
                silentError(new Error('unknown template ' + templateName));
                return {};
            }
            const templateBody = template[templateId ? templateId : 'template'];
            if (!templateBody) {
                silentError(new Error('unknown templateid'));
                return {};
            }
            if (template.partials)
                for (const partial of template.partials) hb.registerPartial(partial);
            if (template.helpers)
                for (const helper of template.helpers) hb.registerHelper(helper);
            return hb.reverse(templateBody, content);
        },
        create: function(templateName) {
            const template = this.templates[templateName];
            if (!template.write) return;
            if (!template) throw new Error('unknown template ' + templateName);
            const states = template.stateToData(this.state.getState());
            let res = [];
            for (const state of states) {
                const fn = this.apply(templateName, state, 'filename');
                const content = this.apply(templateName, state);
                const source = template.source || 'file';
                res.push({
                    source,
                    id: fn,
                    body: () => content
                });
            }
            const promises = [];
            for (const rbo of res) {
                if (!this.source.sources[rbo.source]) {
                    silentError(new Error('unknown source: ' + rbo.source));
                    return Promise.reject(new Error('unknown source: ' + rbo.source));
                }
                promises.push(this.source.sources[rbo.source].create(rbo));
            }
            return Promise.all(promises);
        },
        extract: function(rbo) {
            let res = [];
            const templates = Object.values(this.templates).sort((a, b) => b.priority - a.priority).map(x => x.templateName);
            for (const tn of templates) {
                if (!this.templates[tn].read) continue;
                let v, v2;
                try {
                    let key = 'filename';
                    if (rbo.key) key = rbo.key;
                    v = this.reverse(tn, rbo.id, key);
                    if (v) {
                        let content = rbo.body();
                        v2 = Object.assign({}, v, this.reverse(tn, content));
                        v2 = this.templates[tn].dataToState(v2);
                        if (v2) {
                            if(this.templates[tn].action)
                                res.push(this.templates[tn].action(v2));
                            else
                                res.push({ type: "apply", data: v2 });
                        }
                        // if (v2) this.state.dispatch({ type: "apply", data: v2 });
                    }
                }
                catch (e) {
                    if (v)
                        silentError(e, rbo.id + '\n' + tn);
                    if (process.env.rubahlog && process.env.rubahlog == "trace")
                        silentError(e, rbo.id + '\n' + tn, 'trace');
                };
            };
            return res;
        },
        scan: function(id, callback) {
            const rubah = this;
            return rubah.source.scan(id).then(v => {
                let rbos = [];
                for (const res of v) rbos = rbos.concat(res);
                let actions = [];
                for (const rbo of rbos) actions = actions.concat(rubah.extract(rbo));
                for(const action of actions) rubah.state.dispatch(action);
                if (callback && actions.length > 0) return callback(rubah.state.getState());
                else return rubah.state.getState();
            });
        },
        materialize: function() {
            const templates = Object.values(this.templates).sort((a, b) => b.priority - a.priority).map(x => x.templateName);
            const promises = [];
            for (const tn of templates)
                promises.push(this.create(tn));
            return Promise.all(promises);
        },
    };
    if(Array.isArray(opts.source)){
        for(const src of opts.source)
            rjs.source.register(src);
    }else
        rjs.source.register(fileSource);
    return rjs;
}

module.exports = rubahjsFactory();
