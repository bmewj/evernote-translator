function annotationRemover(dom) {
	dom.forEach(function(node, i) {
		if (node.annotations) {
			delete node.annotations;
		}
		if (node.children) {
			annotationRemover(node.children);
		}
	});

	return dom;
}

module.exports = {
	name: 'annotationRemover',
	fn: annotationRemover
};