const beautify = require('js-beautify').js,
    fs = require('fs');

module.exports = function(fn) {
    if (fn.endsWith('.js'))
        fs.readFile(fn, 'utf8', function(err, data) {
            if (err) {
                throw err;
            }
            const formatted = beautify(data, { indent_size: 2, space_in_empty_paren: true });
            fs.writeFile(fn, formatted, 'utf8', function(err, data) {
                if (err) {
                    throw err;
                }
            });
        });
}