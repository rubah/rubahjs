const md = require("markdown");
const td = new (require("turndown"))();
module.exports = {
    helperName: 'md',
    handlebars: function(data) {
        data = ['markdown'].concat(data);
        data = md.markdown.toHTML(data);
        return td.turndown(data);
    },
    map: function(value) {
        let res = md.markdown.parse(value);
        res.shift();
        return res;
    }
}