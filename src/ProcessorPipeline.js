function ProcessorPipeline(copy) {
	this.processors = copy ? copy.processors.slice(0) : [
		require('./processors/mediaTranslator'),
		require('./processors/cryptTranslator'),
		require('./processors/todoTranslator'),
		require('./processors/htmlWrapper'),
	];

	return this;
}

ProcessorPipeline.prototype.append = function(processor) {
	this.processors.push(processor);
};
ProcessorPipeline.prototype.prepend = function(processor) {
	this.processors.splice(0, 0, processor);
};
ProcessorPipeline.prototype.insertBefore = function(name, processor) {
	for (var i = 0; i < this.processors.length; i++) {
		if (this.processors[i].name === name) {
			break;
		}
	}

	this.processors.splice(i, 0, processor);
};
ProcessorPipeline.prototype.insertAfter = function(name, processor) {
	for (var i = 0; i < this.processors.length; i++) {
		if (this.processors[i].name === name) {
			break;
		}
	}

	if (i + 1 < this.processors.length) {
		this.processors.splice(i + 1, 0, processor);
	} else {
		this.processors.push(processor);
	}
};
ProcessorPipeline.prototype.replace = function(name, processor) {
	for (var i = 0; i < this.processors.length; i++) {
		if (this.processors[i].name === name) {
			this.processors[i] = processor;
			return;
		}
	}
};
ProcessorPipeline.prototype.remove = function(name) {
	for (var i = 0; i < this.processors.length; i++) {
		if (this.processors[i].name === name) {
			this.processors.slice(i, 1);
			return;
		}
	}
};
ProcessorPipeline.prototype.clear = function() {
	this.processors = [];
};

module.exports = ProcessorPipeline;