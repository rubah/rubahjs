![logo](http://static.averism.com/rubahjs_banner.png)

![version](https://img.shields.io/badge/version-0.3.1-brightgreen.svg)
![coverage](https://img.shields.io/badge/coverage-49%25-c23d00.svg)
---
file template and reverse template service that watches and sync for changes

this project inspired by [plop js](https://plopjs.com/) and aims to bring project templating to a whole new level. 

Rubahjs manage all your data required for templating into a single state tree, and by single function call, you can create all templated file from that single state tree

More over, rubahjs also provide reverse templating (for simple [handlebar](https://handlebarsjs.com/) template) using [reversible handlebar](https://github.com/averman/reversible-handlebars). Using Rubahjs you can scan all the files in your project folder, and create a single state tree

Rubah is indonesian word for fox, and also have a different - non formal - meaning of **change**. Fox demon is also a mythical creature capable of shapeshifting in japanese folklore. Thus Rubahjs embrace the concept of change, and shapeshifting of data from one form into another
## Installation
``` npm install --save rubahjs```

## Features

- [Handlebar multi templating](documentation/feature/handlebarMultiTemplating.md)


- [State extraction](documentation/feature/stateExtraction.md)


- [Multiple extractor of single file](documentation/feature/multipleExtractorOfSingleFile.md)


- [File exclusion](documentation/feature/fileExclusion.md)


- [Custom reducer](documentation/feature/customReducer.md)


- [State subscriber](documentation/feature/stateSubscriber.md)


- [Non file source](documentation/feature/nonFileSource.md)


