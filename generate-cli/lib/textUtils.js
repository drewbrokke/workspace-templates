function kebabCase(val) {
	return val
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/[\s_]+/g, '-')
		.toLowerCase();
}
function camelToSnakeCase(str) {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).toUpperCase();
}

function capitalCase(str) {
	return str;
}

module.exports = {
	camelToSnakeCase,
	capitalCase,
	kebabCase
}