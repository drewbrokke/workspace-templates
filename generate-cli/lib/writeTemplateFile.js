const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');

function writeTemplateFile(templateFilePath, variables, destDir, srcDir) {
	const template = fs.readFileSync(templateFilePath, 'utf8')

	const content = Mustache.render(template, variables);

	const relativePath = templateFilePath.replace(srcDir, '');

	const newFilePath = path
		.join(destDir, relativePath)
		.replace('.mustache', '');

	fs.mkdirSync(path.dirname(newFilePath), {recursive: true});

	fs.writeFileSync(
		newFilePath,
		content
	);
}

module.exports = {writeTemplateFile}