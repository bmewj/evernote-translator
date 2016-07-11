function annotationRemover(dom, metadata, resources, options) {
	dom.forEach(function(node, i) {
		if (node.annotations) {
			delete node.annotations;
		}
		if (node.children) {
			annotationRemover(node.children, metadata, resources, options);
		}
	});

	return dom;
}

module.exports = {
	name: 'annotationRemover',
	fn: annotationRemover
};