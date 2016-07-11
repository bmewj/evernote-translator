var fs = require('fs');
var md5 = require('md5');
var path = require('path');
var xml2js = require('xml2js');
var generateDOM = require('./generateDOM');
var stringifyDOM = require('./stringifyDOM');
var ProcessorPipeline = require('./ProcessorPipeline');

function translate(options) {

	// Failure mechanism
	var hasFailed = false;
	var async = function(fn) {
		return function() {
			if (!hasFailed) {
				fn.apply(null, arguments);
			}
		};
	};
	var fail = function(err) {
		if (!hasFailed) {
			hasFailed = true;
			if (options.onFailure) {
				options.onFailure(err);
			} else {
				throw err;
			}
		}
	};

	// Reading in input files
	if (!options.inputData) {
		if (!options.inputFile) {
			throw 'No input file or input data given.';
		}

		fs.readFile(options.inputFile, 'utf8', async(function(err, data) {
			if (err) {
				fail(err);
				return;
			}

			options.inputData = data;
			translate(options);
		}));

		return;
	}

	// Sorting out resource handling
	if (!options.handleResource) {
		if (!options.nameResource) {
			if (!options.resourceDir) {
				options.nameResource = function() { return false; };
			} else {
				options.nameResource = function(fileName, mimeType, checksum) {
					return path.join(options.resourceDir, checksum + path.extname(fileName));
				};
			}
		}

		options.handleResource = function(fileName, mimeType, buffer, checksum) {
			var resourceName = options.nameResource(fileName, mimeType, checksum);
			if (resourceName === false) {
				return false;
			}

			fs.writeFile(resourceName, buffer, function(err) {
				if (err) {
					fail(err);
				}
			});

			var outputDir = options.outputFile ? path.dirname(options.outputFile) : options.outputDir;
			return path.relative(outputDir, resourceName).split(path.sep).join('/');
		};
	}

	// Processor pipeline
	if (!options.processorPipeline) {
		options.processorPipeline = new ProcessorPipeline();
	}

	// XML parsing
	var parser = new xml2js.Parser({
		explicitCharkey: true,
		explicitArray: true,
		explicitChildren: true,
		preserveChildrenOrder: true
	});

	// attributes: $
	// text content: _
	// children: $$

	parser.parseString(options.inputData, async(function(err, result) {
		if (err) {
			fail(err);
			return;
		}

		try {
			var enExport = result['en-export'];
			var note = enExport['note'][0];

			// Collect metadata
			var metadata = {};
			metadata['title'] = note['title'][0]._;
			metadata['created'] = note['created'][0]._;
			metadata['updated'] = note['updated'][0]._;
			note['note-attributes'][0].$$.forEach(function(child) {
				metadata[child['#name']] = child._;
			});

			// Collect resources
			var resources = {};

			if (note['resource']) {
				note['resource'].forEach(function(child) {
					var buffer = Buffer.from(child['data'][0]._, 'base64');

					var fileName = '';
					if (child['resource-attributes'] && child['resource-attributes'][0]['file-name']) {
						fileName = child['resource-attributes'][0]['file-name'][0]._;
					}

					var resource = {
						fileName: fileName,
						mimeType: child['mime'][0]._,
						width: child['width'] ? parseInt(child['width'][0]._, 10) || 0 : 0,
						height: child['height'] ? parseInt(child['height'][0]._, 10) || 0 : 0,
						duration: child['duration'] ? parseInt(child['duration'][0]._, 10) || 0 : 0,
						checksum: md5(buffer)
					};

					var url = options.handleResource(resource.fileName, resource.mimeType,
													 buffer, resource.checksum);

					if (url !== false) {
						resource.url = url;
						resources[resource.checksum] = resource;
					}
				});
			}

			// Process content
			var content = note['content'][0]._;
			var parser2 = new xml2js.Parser({
				explicitCharkey: true,
				explicitArray: true,
				explicitChildren: true,
				preserveChildrenOrder: true,
				charsAsChildren: true
			});

			parser2.parseString(content, async(function(err, result) {
				if (err) {
					fail(err);
					return;
				}

				var dom;
				try {
					dom = generateDOM(result['en-note'].$$);
				} catch (e) {
					fail('File could not be processed (invalid format).\nUnderlying error: ' + e.toString());
					return;
				}

				options.processorPipeline.processors.forEach(function(processor) {
					try {
						dom = processor.fn(dom, metadata, resources, options);
					} catch (e) {
						fail('DOM processing failed on at ' + processor.name + ': ' + e.toString());
						return;
					}
				});

				if (options.outputFile) {
					fs.writeFile(options.outputFile, stringifyDOM(dom), 'utf8', async(function(err) {
						if (err) {
							fail(err);
						} else if (options.onSuccess) {
							options.onSuccess();
						}
					}));
				} else if (options.onSuccess) {
					options.onSuccess(stringifyDOM(dom));
				}
			}));

		} catch (e) {
			fail('File could not be processed (invalid format).\nUnderlying error: ' + e.toString());
			return;
		}
	}));

}

module.exports = translate;