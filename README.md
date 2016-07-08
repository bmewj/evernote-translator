Evernote Translator
===================

Node module that parses and formats Evernote documents and allows you to
translate them to whatever other format you want. This module is particularly
useful for writing simple static site generators where you can write up your
site content with Evernote (which is what I do).

## Usage

```javascript
var fs = require('fs');
var evernoteTranslator = require('evernote-translator');

var fileData = fs.readFileSync(/* file name */).toString();

var output = evernoteTranslator.translate({
    data: fileData,
    onResource: function(resourceName) {
        /* Handle embedded resources...
         * If you want to ignore the resource
         * return false. If you want to rename
         * it then do so here and return the
         * new name. If you don't want to do
         * anything then do this: */
        return resourceName;
    }
});

var result = '';
result += '<!DOCTYPE html>';
result += '<html><head><title>';
result += evernoteTranslator.sanitize(output.metadata.title);
result += '</title></head><body>';
result += evernoteTranslator.stringify(output.contentDOM);
result += '</body></html>';
```
