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
    inputFile: '/file/name/of/input/document.enex',
    outputFile: '/file/name/of/output/index.html',
    resourceDir: '/file/name/of/output/resources/',
    onFailure: function() {},
    onSuccess: function() {}
});
```

`inputFile` is the file name of the .ENEX document to be read.  
`outputFile` is the file name of the resulting HTML document.  
`resourceDir` is the directory where you want the embedded resources
to be stored.

Keep in mind, though, that the resulting HTML documents will be no
different from exporting HTML documents straight out of Evernote in
the first place. The next section covers how you can manipulate the
output data.

### Manipulating the HTML (naively)

For simple changes you might want to consider the naive approach,
which would be to manipulate the output string:

```javascript
evernoteTranslator.translate({
    /* ... */
    outputDir: '/file/name/of/output/',
    /* ... */
    onSuccess: function(outputString) {
        var i = outputString.indexOf('</head>');

        var customStyles = '<style>body { font-family: \'Helvetica Neue\', sans-serif; }</style>';

        var newString = outputString.substring(0, i) + customStyles + outputString.substring(i);
        fs.writeFile('/file/name/of/output/index.html', newString, 'utf8');
    }
});
```

Note that you have to specify an `outputDir` instead of an `outputFile`
when doing the writing to disk yourself. It is necessary to tell the
translator about the output directory so that it can generate correct
URLs for embedded resources.

### Manipulating the HTML (correctly)

If you're going to make more complex changes to the output document,
you should start using the `ProcessorPipeline`. After the document
has been parsed and its content converted into a plain JS object
structure, it is passed through the processor pipeline.

The default pipeline looks a bit like this:
```
mediaTranslator -> cryptTranslator -> todoTranslator -> annotationReader -> annotationRemover -> htmlWrapper
```


1. `mediaTranslator`: Converts `<en-media/>` tags into correct HTML.
2. `cryptTranslator`: Replaces `<en-crypt/>` tags with `[Encrypted in Evernote]`.
3. `todoTranslator`: Replaces `<en-todo/>` tags with checkboxes.
4. `annotationReader`: Finds annotations present in the file (explained below).
5. `annotationRemover`: Removes all annotations found.
4. `htmlWrapper`: Wraps the document with `<html>` and `<body>` tags and such.

In order to inject our custom CSS like before, we have to add a
new processor to the processor pipeline:

```javascript
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
            children: ['body { font-family: \'Helvetica Neue\', sans-serif; }']
        });

        return dom;
    }
});

evernoteTranslator.translate({
    /* ... */
    processorPipeline: customPipeline,
    /* ... */
});
```

We use the `.insertAfter()` because we want to apply our changes to the DOM
*after* `htmlWrapper` has done its work. The order of processors in the pipeline
is important. For example, the `annotationReader` processor parses annotations
and attaches them as metadata to DOM nodes whilst the very next processor,
`annotationRemover`, removes the metadata so that it doesn't show up in the
output file. If you want to make use of the metadata, you'll have to place
your processor between the `annotationReader` and `annotationRemover`.

### Dealing with resources

If you specify a `resourceDir` then embedded resources will be dealt with
automatically. All resources will be placed in the specified directory with
this naming convention:

```
./(md5 checksum of file).(extension)
```

For more versatility, you can pass a `nameResource` function to the translator
instead of a `resourceDir`.

```javascript
evernoteTranslator.translate({
    /* ... */
    nameResource: function(fileName, mimeType, checksum) {
        if (mimeType === 'image/jpeg') {
            return checksum + '.jpg';
        } else {
            return false; // you can conditionally ignore certain resources
        }
    },
    /* ... */
});
```

For maximum versatility, you can pass a `handleResource` function to the translator
instead of a `nameResource` function.

```javascript
evernoteTranslator.translate({
    /* ... */
    handleResource: function(fileName, mimeType, buffer, checksum) {
        if (mimeType === 'image/jpeg') {
            fs.writeFile(checksum + '.jpg', buffer);
            return checksum + '.jpg';
        } else {
            return false;
        }
    },
    /* ... */
});
```

With this last option you have the responsibility of writing the resources
to the file system yourself. You must return the URL for the resource relative
to the HTML document (or `false`, if you've chosen to ignore the resource).

### The annotation system

The annotation system is a powerful tool when processing documents and making
them fit for the web. You can annotate a certain line/paragraph/object in your
Evernote document by writing something of the form `![  ]` on the line above it.

For example, writing this in Evernote:

> !\[hello\]  
> Some content

...which translates to this HTML code...

```html
<div>![position: absolute]</div>
<div>Some content</div>
```

...which is parsed into this JS object...

```javascript
[{
    tag: 'div',
    children: ['![position: absolute]']
},{
    tag: 'div',
    children: ['Some content']
}]
```

After passing through the `annotationReader` the JS object will look like
this:

```javascript
[{
    tag: 'div',
    children: ['Some content'],
    annotations: {
        position: 'absolute'
    }
}]
```

Now, let's write a small processor that uses this annotation to manipulate
the DOM:

```javascript
var customPipeline = new evernoteTranslator.ProcessorPipeline();
customPipeline.insertAfter('annotationReader', {
    name: 'divPosition',
    fn: function(dom) {
        dom.forEach(function(node) {

            if (node.annotations && node.annotations.position) {
                node.style = 'position: ' + node.annotations.position;
            }

        });

        return dom;
    }
});

evernoteTranslator.translate({
    /* ... */
    processorPipeline: customPipeline,
    /* ... */
});
```

The output file will look like this:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Note Title</title>
    </head>
    <body>
        <div style="position: absolute">Some content</div>
    </body>
</html>
```