module.exports = function(opts){
    const path = require("path");
    const watch = opts.watch || process.cwd();
    opts.module = opts.module || module;
    const template = 
`# {{{title}}}
![Version](https://img.shields.io/badge/version-{{{version}}}-green.svg)
---
{{{description.package}}}

[comment]: <> (extra description)

{{{description.extra}}}
## Installation
\`\`\` npm install --save {{{title}}}\`\`\`

## Features
{{#each features}}

##### {{{sentenceCase key}}}: 
{{{data}}}

[comment]: <> (===examples===)
{{#if examples}}
[comment]: <> (===examples start===)
{{#each examples}}

{{{description}}}:

[comment]: <> (===example start===)

\`\`\`
{{{example}}}
\`\`\`

[comment]: <> (===example end===)
{{/each}}
{{/if}}
[comment]: <> (===examples ends===)

[comment]: <> (===)
{{/each}}
[comment]: <> (end of features)


`;
    return {
        templateName: 'readmeMD',
        filename: path.resolve(watch,'./README.md'),
        template: template,
        stateToData: function(state){
            const pd = state.packageJson.data || {};
            const doc = state.doc || {description: {}};
            let features;
            if(state.test){
                features = Object.values(state.test)
            }
            return [{
                title: pd.name,
                version: pd.version,
                description: {
                    package: pd.description,
                    extra: doc.description.data
                },
                features: features
            }];
        },    
        dataToState: function(data){
            return {};
        },
        priority: Number.MAX_VALUE,
        read: false
    }
}