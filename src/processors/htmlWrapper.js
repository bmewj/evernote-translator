module.exports = {
	name: 'htmlWrapper',
	fn: function(dom, metadata) {
		return [
			{ tag: '!DOCTYPE', html: true },
			{
				tag: 'html',
				children: [{
			  		tag: 'head',
					children: [
						{ tag: 'title', children: [metadata.title] }
					]
				},{
					tag: 'body',
					children: dom
				}]
			}
		];
	}
};