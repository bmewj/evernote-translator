var annotationPattern = /!\[.*?\]/g;

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

function annotationReader(dom, metadata, resources, options) {
	for (var i = 0; i < dom.length - 1; i++) {
		var node = dom[i];
		if (node.tag !== 'div' || !node.children || node.children.length !== 1) {
			continue;
		}

		var text = unwrapText(node.children[0]);
		if (!text) {
			continue;
		}

		var matches = text.match(annotationPattern);
		if (!matches) {
			continue;
		}

		var annotations = {};
		matches.forEach(function(match) {
			var annotation = match.substring(2, match.length - 1);

			var index = annotation.indexOf(':');
			if (index !== -1) {
				annotations[strip(annotation.substring(0, index))] = strip(annotation.substring(index + 1));
			} else {
				annotations[strip(annotation)] = true;
			}
		});

		dom[i + 1].annotations = annotations;
		dom.splice(i, 1);
		--i;
	}

	return dom;
}

module.exports = {
	name: 'annotationReader',
	fn: annotationReader
};