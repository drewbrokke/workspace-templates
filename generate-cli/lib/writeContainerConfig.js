const fs = require('fs');
const yaml = require('js-yaml');

function writeContainerConfig(configPath, projectConfigContent, projectName) {
	let sharedYamlConfig = {assemble: []}

	if (configPath){
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