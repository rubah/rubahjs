![logo](http://static.averism.com/rubahjs_banner.png)

![version](https://img.shields.io/badge/version-0.3.0-brightgreen.svg)
![coverage](https://img.shields.io/badge/coverage-27%25-ff0000.svg)
---
file template and reverse template service that watches and sync for changes

this project inspired by [plop js](https://plopjs.com/) and aims to bring project templating to a whole new level. 

Rubahjs manage all your data required for templating into a single state tree, and by single function call, you can create all templated file from that single state tree

More over, rubahjs also provide reverse templating (for simple [handlebar](https://handlebarsjs.com/) template) using [reversible handlebar](https://github.com/averman/reversible-handlebars). Using Rubahjs you can scan all the files in your project folder, and create a single state tree
## Installation
``` npm install --save rubahjs```

## Features

##### [Handlebar multi templating](documentation/feature/handlebarMultiTemplating.md): 

Create multiple files from single template and the state tree


##### [State extraction](documentation/feature/stateExtraction.md): 

Extract state data from multiple files


##### [Multiple extractor of single file](documentation/feature/multipleExtractorOfSingleFile.md): 

Define multiple overlaping templates to extract a file in various means


##### [File exclusion](documentation/feature/fileExclusion.md): 

Exclude files from data extraction by rubahjs


##### [Custom reducer](documentation/feature/customReducer.md): 

Use redux reducer to merge extraction data into the state tree


##### [State subscriber](documentation/feature/stateSubscriber.md): 

Create a redux action listener that will trigger on specific action


##### [Non file source](documentation/feature/nonFileSource.md): 

Extend rubahjs to extract state data from anything


