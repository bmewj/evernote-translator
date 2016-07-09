function generateDOM(childNodes) {
	return childNodes.map(function(childNode) {
		if (childNode['#name'] == '__text__') {
			return childNode._;
		}
		var obj = {
			tag: childNode['#name']
		};
		if (childNode.$) {
			Object.keys(childNode.$).forEach(function(attr) {
				obj[attr] = childNode.$[attr];
			});
		}
		if (childNode.$$) {
			obj.children = generateDOM(childNode.$$);
		} else if (childNode._) {
			obj.children = [childNode._];
		} else {
			obj.children = [];
		}
		return obj;
	});
}

module.exports = generateDOM;