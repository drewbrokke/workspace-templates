const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function writeYamlConfig() {
	let sharedYamlConfig = {assemble: []}

	if (existingContainerConfigPath){
		sharedYamlConfig = {
			...sharedYamlConfig,
			...yaml.load(
				fs.readFileSync(existingContainerConfigPath, 'utf8')
			)
		};
	}

	const projectYamlConfig = yaml.load(content);

	const {assemble, ...otherSharedConfig} = sharedYamlConfig

	fs.writeFileSync(
		existingContainerConfigPath || 'client-extension.yaml',
		yaml.dump({
			assemble: [...assemble, ...projectYamlConfig.assemble],
			...otherSharedConfig,
			[answers.nameKebabCase]: projectYamlConfig[answers.nameKebabCase]
		})
	);
}

module.exports = {writeYamlConfig}