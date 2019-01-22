module.exports = function(name,...blocks) {
    return {
        blocks,
        helperName: name,
        handlebars: function(data) {
            throw new Error("this is read-only helper");
        },
        map: function(value) {
            let x, remains = value;
            const res = [];
            do{
                x = this.extract(remains);
                if(x) {
                    res.push(...x.data);
                    remains = x.remains;
                }
            }while(x);
            return res;
        },
        extract: function(value) {
            let res = [];
            for (const block of this.blocks) {
                let start = value.indexOf(block.start);
                const begin = start;
                const type = block.type || "unknown";
                if (!block.inclusive) start = start + block.start.length;
                let end = value.indexOf(block.end);
                const remPos = end + block.end.length;
                if (block.inclusive) end = remPos;
                if (start > -1 && end > -1) {
                    let data = value.substring(start, end);
                    if (typeof block.map == 'function') data = block.map(data);
                    const remains = value.substr(remPos);
                    res.push({ start: begin, end: remPos, type, data, remains })
                }
            }
            if(res.length == 0) return null;
            res.sort((a, b) => a.start - b.start);
            const ent = [res[0]];
            for(let i=1; i<res.length; i++){
                if(res[i].start<ent[0].end){
                    ent.push(res[i]);
                }
            }
            res = ent.map(x=>{
                return {type: x.type, data: x.data}
            })
            return {
                data: res,
                remains: ent[0].remains
            }
        }
    }
}
