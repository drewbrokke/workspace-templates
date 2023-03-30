const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function writeContainerConfig(configDir, projectConfigContent, projectName) {
	const configPath = path.join(configDir, 'client-extension.yaml')

	let sharedYamlConfig = {assemble: []}

	if (fs.existsSync(configPath)){
		sharedYamlConfig = {
			...sharedYamlConfig,
			...yaml.load(
				fs.readFileSync(configPath, 'utf8')
			)
		};
	}

	const projectYamlConfig = yaml.load(projectConfigContent);

	const {assemble, ...otherSharedConfig} = sharedYamlConfig

	fs.writeFileSync(
		configPath || 'client-extension.yaml',
		yaml.dump({
			assemble: [...assemble, ...projectYamlConfig.assemble],
			...otherSharedConfig,
			[projectName]: projectYamlConfig[projectName]
		})
	);
}

module.exports = {writeContainerConfig}