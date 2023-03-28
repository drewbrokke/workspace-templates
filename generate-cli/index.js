const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const Mustache = require('mustache');
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
	const templateType = process.argv[2];

	if (!templateType) {
		const answer = await inquirer.prompt({
			name: 'templateType',
			choices: TEMPLATES_AVAILABLE,
			message: 'Which template would you like to use?',
			type: 'rawlist'
		});

		templateType = answer.templateType;
	}

	if (!TEMPLATES_AVAILABLE.includes(templateType)) {
		console.error("Template Doesn't exist.");
	}
	
	const templateDirectoryPath = path.join(TEMPLATE_TYPES_DIRECTORY, templateType);

	const prompts = require(path.join(templateDirectoryPath, 'prompts.json'));

	const answers = await inquirer.prompt(prompts);

	answers.nameKebabCase = kebabCase(answers.name);
	answers.nameSnakeCase = camelToSnakeCase(answers.nameKebabCase);

	answers.projectDir = PROJECT_DIRECTORY || answers.nameKebabCase;

	const NEW_PROJECT_PATH = path.join(process.cwd(), answers.projectDir);

	if (fs.existsSync(NEW_PROJECT_PATH)) {
		console.error('Project directory already exists');

		return;
	}

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
			const relativePath = mustacheFile.replace(templateDirectoryPath, '');

			const newFilePath = path
				.join(NEW_PROJECT_PATH, relativePath)
				.replace('.mustache', '');

			fs.mkdirSync(path.dirname(newFilePath), {recursive: true});

			fs.writeFileSync(
				newFilePath,
				Mustache.render(fs.readFileSync(mustacheFile, 'utf8'), answers)
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
