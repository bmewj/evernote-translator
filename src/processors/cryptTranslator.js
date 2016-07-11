function cryptTranslator(dom, metadata, resources, options) {
	dom.forEach(function(node, i) {
		if (node.tag === 'en-crypt') {
			dom[i] = {
				tag: 'span',
				children: ['[Encrypted in Evernote]']
			};
		} else if (node.children) {
			cryptTranslator(node.children, metadata, resources, options);
		}
	});

	return dom;
}

module.exports = {
	name: 'cryptTranslator',
	fn: cryptTranslator
};