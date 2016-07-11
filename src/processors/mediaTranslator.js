function mediaTranslator(dom, metadata, resources, options) {
	dom.forEach(function(node, i) {
		if (node.tag === 'en-media') {
			var resource = resources[node.hash];
			if (resource) {
				if (resource.mimeType.indexOf('image') === 0) {
					dom[i] = {
						tag: 'img',
						width: resource.width,
						height: resource.height,
						src: resource.url
					};
				} else {
					dom[i] = {
						tag: 'a',
						href: resource.url,
						children: [resource.fileName]
					};
				}
			} else {
				dom[i] = '';
			}
		} else if (node.children) {
			mediaTranslator(node.children, metadata, resources, options);
		}
	});

	return dom;
}

module.exports = {
	name: 'mediaTranslator',
	fn: mediaTranslator
};