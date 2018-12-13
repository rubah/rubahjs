module.exports = {
    templateName: 'test',
    template: '###{{var1}}@@@{{#with var2}}---{{var3}}%%%{{var4}}!@#${{/with}}+++',
    filename: 'test/content/{{var2.var3}}/{{var1}}--test.txt'
}