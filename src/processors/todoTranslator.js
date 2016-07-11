function todoTranslator(dom, metadata, resources, options) {
	dom.forEach(function(node, i) {
		if (node.tag === 'en-todo') {
			dom[i] = {
				tag: 'input',
				type: 'checkbox'
			};
			if (node.checked) {
				dom[i].checked = true;
			}
		} else if (node.children) {
			todoTranslator(node.children);
		}
	});

	return dom;
}

module.exports = {
	name: 'todoTranslator',
	fn: todoTranslator
};