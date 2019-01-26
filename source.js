const source = {
    sources: {},
    register: function(newSource){
        this.sources[newSource.sourceName] = newSource;
    },
    scan: function(id){
        const promises = [];
        for(const sourceName in this.sources){
            promises.push(this.sources[sourceName].scan(id));
        }
        return Promise.all(promises);//.then(v=>v.reduce((a,b)=>a.concat(b),[]))
    }
};
module.exports = source;