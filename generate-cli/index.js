const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const Mustache = require('mustache');
const yaml = require('js-yaml');
const {glob} = require('glob');
const {spawn} = require('child_process');

const PROJECT_DIRECTORY = process.argv[3];

const TEMPLATE_TYPES_DIRECTORY = path.join(__dirname, '..', 'templates');

const TEMPLATES_AVAILABLE = fs.readdirSync(
	TEMPLATE_TYPES_DIRECTORY,
	{withFileTypes: true}
).filter(file => file.isDirectory());

const kebabCase = (val) =>
	val
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/[\s_]+/g, '-')
		.toLowerCase();

const camelToSnakeCase = (str) =>
	str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).toUpperCase();

async function main() {
	let templateType = process.argv[2];

	let answers = {};

	if (!templateType) {
		answers = await inquirer.prompt({
			name: 'templateType',
			choices: TEMPLATES_AVAILABLE,
			message: 'Which template would you like to use?',
			type: 'rawlist'
		}, answers);

		templateType = answers.templateType;
	}

	if (!TEMPLATES_AVAILABLE.includes(templateType)) {
		console.error("Template Doesn't exist.");
	}
	
	const templateDirectoryPath = path.join(TEMPLATE_TYPES_DIRECTORY, templateType);

	const prompts = require(path.join(templateDirectoryPath, 'prompts.json'));

	answers = await inquirer.prompt(prompts, answers);

	answers.nameKebabCase = kebabCase(answers.name);
	answers.nameSnakeCase = camelToSnakeCase(answers.nameKebabCase);

	answers.projectDir = PROJECT_DIRECTORY || answers.nameKebabCase;

	const newProjectPath = path.join(process.cwd(), answers.projectDir);

	if (fs.existsSync(newProjectPath)) {
		console.error('Project directory already exists');

		return;
	}

	const existingContainerConfigPath = checkForContainerConfig(newProjectPath);

	const sharedConfigMessage = existingContainerConfigPath ? `\n >>> (found '${path.relative(process.cwd(), existingContainerConfigPath)}')` : '';

	answers = await inquirer.prompt({
		name: 'sharedContainer',
		message:
			`Should this client extension use a shared container?${sharedConfigMessage}`,
		type: 'confirm',
	}, answers);

	const envVariables = Object.keys(answers).reduce(
		(acc, key) => ({
			...acc,
			['PROMPTS_' + camelToSnakeCase(key)]: answers[key],
		}),
		{...process.env}
	);

	const preScriptPath = path.join(
		templateDirectoryPath,
		'before-templating-process'
	);

	if (fs.existsSync(preScriptPath)) {
		console.log('Running `before-templating-process`...');

		await run_script(preScriptPath, {env: envVariables});
	}

	const mustacheFiles = await glob(
		path.join(templateDirectoryPath, '**/*.mustache'),
		{
			dot: true,
			ignore: 'node_modules/**',
		}
	);

	if (mustacheFiles.length) {
		console.log('Writing files...');

		for (const mustacheFile of mustacheFiles) {
			const content = Mustache.render(fs.readFileSync(mustacheFile, 'utf8'), answers);

			if (mustacheFile.includes('client-extension.yaml') && answers.sharedContainer) {
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

				continue;
			}

			const relativePath = mustacheFile.replace(templateDirectoryPath, '');

			const newFilePath = path
				.join(newProjectPath, relativePath)
				.replace('.mustache', '');

			fs.mkdirSync(path.dirname(newFilePath), {recursive: true});

			fs.writeFileSync(
				newFilePath,
				content
			);
		}
	}

	const postScriptPath = path.join(
		templateDirectoryPath,
		'after-templating-process'
	);

	if (fs.existsSync(postScriptPath)) {
		console.log('Running `after-templating-process`...');

		await run_script(postScriptPath, {env: envVariables});
	}
}

function checkForContainerConfig(dir) {
	while (true) {
		const containerConfigPath = path.join(dir, 'client-extension.yaml');

		if (fs.existsSync(containerConfigPath)) {
			return containerConfigPath
		}

		if (fs.existsSync(path.join(dir, 'gradle.properties'))) {
			return;
		}

		const parentDir = path.dirname(dir);

		dir = parentDir;
	}
}

function run_script(command, options = {}, callback = () => {}) {
	return new Promise((resolve) => {
		const child = spawn(command, [], options);

		let allOutput = '';

		child.stdout.setEncoding('utf8');
		child.stdout.on('data', function (data) {
			console.log(data);

			allOutput += data;
		});

		child.stderr.setEncoding('utf8');
		child.stderr.on('data', function (data) {
			console.log(data);

			allOutput += data;
		});

		child.on('close', function (data) {
			console.log('Exit Code: ' + data);

			resolve();
		});
	});
}

main();
