var insertPattern = /^\s*!\[\s*(.*?)(\s*:\s*(.*?)\s*)?\s*\]\s*$/;

var stripPattern = /^\s*(.*?)\s*$/;
function strip(text) {
	return text.match(stripPattern)[1];
}

var allowedTag = {
	'span': true,
	'b': true,
	'i': true,
	'u': true,
	'sup': true,
	'sub': true
};
function unwrapText(node) {
	if (typeof node === 'string') {
		return node;
	} else if (allowedTag[node.tag] && node.children && node.children.length === 1) {
		return unwrapText(node.children[0]);
	} else {
		return null;
	}
}

function insertProcessor(dom, metadata, resources, options) {
	if (!options.inserts) {
		return dom;
	}

	for (var i = 0; i < dom.length - 1; i++) {
		var node = dom[i];
		if (node.tag !== 'div' || !node.children || node.children.length !== 1) {
			continue;
		}

		var text = unwrapText(node.children[0]);
		if (!text) {
			continue;
		}

		var match = text.match(insertPattern);
		if (!match) {
			continue;
		}

		var name = match[1],
			value = match[3];

		if (!options.inserts[name]) {
			continue;
		}

		var replacement = options.inserts[name](value);
		if (replacement) {
			dom[i] = replacement;
		} else {
			dom.splice(i, 1);
			--i;
		}
	}

	return dom;
}

module.exports = {
	name: 'insertProcessor',
	fn: insertProcessor
};