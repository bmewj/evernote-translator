var evernoteTranslator = {
	translate: require('./translate'),
	stringifyDOM: require('./stringifyDOM'),
	sanitizeText: require('./sanitizeText'),
	ProcessorPipeline: require('./ProcessorPipeline'),
	processors: {
		mediaTranslator: require('./processors/mediaTranslator'),
		cryptTranslator: require('./processors/cryptTranslator'),
		todoTranslator: require('./processors/todoTranslator'),
		insertProcessor: require('./processors/insertProcessor'),
		annotationReader: require('./processors/annotationReader'),
		annotationRemover: require('./processors/annotationRemover'),
		htmlWrapper: require('./processors/htmlWrapper')
	}
};

module.exports = evernoteTranslator;