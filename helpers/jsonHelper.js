module.exports = {
    helperName: 'json',
    handlebars: function(data) {
        return JSON.stringify(data,null,'\t');
    },
    map: function(value) {
        return JSON.parse(value);
    }
}