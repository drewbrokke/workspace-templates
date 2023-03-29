const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const Mustache = require('mustache');
const {glob} = require('glob');
const {kebabCase, camelToSnakeCase, capitalCase} = require('./lib/textUtils');
const { runExecutable } = require('./lib/runExecutable');
const { writeContainerConfig } = require('./lib/writeContainerConfig');
const { writeTemplateFile } = require('./lib/writeTemplateFile');
const { collectEnvVariables } = require('./lib/collectEnvVariables');
const { checkForSharedConfig } = require('./lib/checkForSharedConfig');

const PROJECT_DIRECTORY = process.argv[3];

const TEMPLATE_TYPES_DIRECTORY = path.join(__dirname, '..', 'templates');

const TEMPLATES_AVAILABLE = fs.readdirSync(
	TEMPLATE_TYPES_DIRECTORY,
	{withFileTypes: true}
).filter(file => file.isDirectory());

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

	answers = await inquirer.prompt([
		{
			"default": templateType,
			"name": "name",
			"message":`What is the name of your ${capitalCase(templateType)} Client Extension?`,
			"type": "string"
		},
		...prompts], answers);

	answers.nameKebabCase = kebabCase(answers.name);
	answers.nameSnakeCase = camelToSnakeCase(answers.nameKebabCase);

	answers.projectDir = PROJECT_DIRECTORY || answers.nameKebabCase;

	const newProjectPath = path.join(process.cwd(), answers.projectDir);

	if (fs.existsSync(newProjectPath)) {
		console.error('Project directory already exists');

		return;
	}

	const existingContainerConfigPath = checkForSharedConfig(newProjectPath);

	answers = await inquirer.prompt({
		name: 'sharedContainer',
		message:
			`Should this client extension use a shared container?${
				existingContainerConfigPath ? `\n >>> (found '${path.relative(process.cwd(), existingContainerConfigPath)}')` : ''
			}`,
		type: 'confirm',
	}, answers);

	const envVariables = collectEnvVariables(answers);

	const preScriptPath = path.join(
		templateDirectoryPath,
		'before-templating-process'
	);

	if (fs.existsSync(preScriptPath)) {
		console.log('Running `before-templating-process`...');

		await runExecutable(preScriptPath, {env: envVariables});
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

			if (mustacheFile.includes('client-extension.yaml') && answers.sharedContainer) {
				writeContainerConfig(
					existingContainerConfigPath,
					Mustache.render(
						fs.readFileSync(mustacheFile, 'utf8'),
						answers
					),
					answers.nameKebabCase
				)
			} else {
				writeTemplateFile(
					mustacheFile,
					answers,
					newProjectPath,
					templateDirectoryPath
				);
			}
		}
	}

	const postScriptPath = path.join(
		templateDirectoryPath,
		'after-templating-process'
	);

	if (fs.existsSync(postScriptPath)) {
		console.log('Running `after-templating-process`...');

		await runExecutable(postScriptPath, {env: envVariables});
	}
}

main();
