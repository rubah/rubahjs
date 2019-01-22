module.exports = {
    helperName: 'comment',
    handlebars: function(data) {
        if(data)
            return '/**\n *\n * '+data.toString().split('\n').join('\n * ')+'\n *\n **/';
        else 
            return '/**\n *\n * \n *\n **/';
    },
    map: function(value) {
        // console.log(value);
        value = value.trim().substr(4);
        const prefix = value.substr(0,value.indexOf('*'));
        value = value.substr(0,value.length-3);
        // console.log(value);
        value = value.split(prefix+'*').map(x=>x.substr(1,x.length-2));
        // console.log(value);
        value.pop();
        value.shift();
        value.shift();
        value = value.join('\n');
        // console.log(value);
        return value;
    }
}

// const test = 
// `/**
//      *
//      * creating template
//      * creating template
//      *
//      **/`;
// console.log(module.exports.map(test));