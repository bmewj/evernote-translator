Evernote Translator
===================

Node module that turns Evernote .ENEX documents into pretty web pages.
This module is particularly useful for writing simple static site
generators where you can write up your site content with Evernote
(which is what I do).

## Usage

### The simplest usage

If all you want to do is convert Evernote documents to HTML you can
do the following:

```javascript
var evernoteTranslator = require('evernote-translator');

evernoteTranslator.translate({
    inputFile: /* file name of ENEX document */,
    outputFile: /* file name of HTML document */,
    resourceDir: /* directory where resources should be copied to */,
    onFailure: function() {},
    onSuccess: function() {}
});
```

Keep in mind, though, that the resulting HTML documents will be no
different from exporting HTMl documents straight out of Evernote in
the first place. The next section covers how you can manipulate the
output data.

### Manipulating the HTML (naively)

For simple changes you might want to consider the naive approach,
which would be to manipulate the output string:

```javascript
var fs = require('fs');
var evernoteTranslator = require('evernote-translator');

var customStyles = '<style>body { font-family: \'Helvetica Neue\', sans-serif; }</style>';

evernoteTranslator.translate({
    inputFile: /* file name of ENEX document */,
    resourceDir: /* directory where resources should be copied to */,
    onFailure: function() {},
    onSuccess: function(outputString) {
        var i = outputString.indexOf('</head>');

        var newString = outputString.substring(0, i) + customStyles + outputString.substring(i);
        fs.writeFileSync(/* file name of HTML document */, newString);
    }
});
```

### Manipulating the HTML (correctly)

If you're going to make more complex changes to the output document,
you should start using the `ProcessorPipeline`. After the document
has been parsed and its content converted into a plain JS object
structure, it is passed through the processor pipeline.

The default pipeline looks a bit like this:

1. `mediaTranslator`: Converts `<en-media/>` tags into correct HTML.
2. `cryptTranslator`: Replaces `<en-crypt/>` tags with `[Encrypted in Evernote]`.
3. `todoTranslator`: Replaces `<en-todo/>` tags with checkboxes.
4. `htmlWrapper`: Wraps the document with `<html>` and `<body>` tags and such.

In order to inject our custom CSS like before, we have to add a
new processor to the processor pipeline:

```javascript
var evernoteTranslator = require('evernote-translator');

var customPipeline = new evernoteTranslator.ProcessorPipeline();
customPipeline.insertAfter('htmlWrapper', {
    name: 'cssInjector',
    fn: function(dom) {
        dom[0].tag === '!DOCTYPE'; // true
        dom[1].tag === 'html'; // true
        dom[1].children[0].tag === 'head'; // true

        var headTag = dom[1].children[0];
        headTag.children.push({
            tag: 'style',
            children: ['body { font-family: \'Helvetica Neue\', sans-serif; }'];
        });

        return dom;
    }
});

evernoteTranslator.translate({
    inputFile: /* file name of ENEX document */,
    outputFile: /* file name of HTML document */,
    resourceDir: /* directory where resources should be copied to */,
    processorPipeline: customPipeline,
    onFailure: function() {},
    onSuccess: function() {}
});

```