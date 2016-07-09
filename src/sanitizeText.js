function sanitizeText(text) {
	var chars = [];
	for (var i = 0; i < text.length; i++) {
		if (text.charCodeAt(i) > 127 || '<>&'.indexOf(text[i]) !== -1) {
			chars.push('&#', text.charCodeAt(i), ';');
		} else {
			chars.push(text[i]);
		}
	}
	return chars.join('');
}

module.exports = sanitizeText;