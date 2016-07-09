var sanitizeText = require('./sanitizeText');
var singularTag = {
	'br': true,
	'meta': true,
	'link': true,
	'input': true,
	'img': true,
	'!DOCTYPE': true
};
var unsanitizedTag = {
	'script': true,
	'style': true,
	'pre': true
};

function stringifyNode(node) {
	if (node.constructor === Array) {
		return node.map(stringifyNode).join('');
	}
	if (typeof node === 'string') {
		return sanitizeText(node);
	}

	var parts = [];

	parts.push('<', node.tag);
	Object.keys(node).forEach(function(attr) {
		if (attr === 'className') {
			parts.push(' class=' + JSON.stringify(node[attr]));
		} else if (attr !== 'tag' && attr !== 'children') {
			if (typeof node[attr] !== 'boolean') {
				parts.push(' ' + attr + '=' + JSON.stringify(node[attr]));
			} else if (node[attr]) {
				parts.push(' ' + attr);
			}
		}
	});
	if (singularTag[node.tag]) {
		parts.push('>');
	} else if (!node.children || node.children.length === 0) {
		parts.push('/>');
	} else {
		parts.push('>');
		if (unsanitizedTag[node.tag] &&
			node.children.length === 1 &&
			typeof node.children[0] === 'string') {
			parts.push(node.children[0]);
		} else if (node.children && node.children.length > 0) {
			parts.push(stringifyNode(node.children));
		}
		parts.push('</', node.tag, '>');
	}

	return parts.join('');
}

module.exports = stringifyNode;