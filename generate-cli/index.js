const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const Mustache = require('mustache');
const {glob} = require('glob');
const {spawn} = require('child_process');

const TEMPLATE_TYPE = process.argv[2];
const PROJECT_DIRECTORY = process.argv[3];

const TEMPLATE_TYPES_DIRECTORY = path.join(__dirname, '..', 'templates');

const TEMPLATES_AVAILABLE = fs.readdirSync(TEMPLATE_TYPES_DIRECTORY);
const TEMPLATE_DIRECTORY = path.join(TEMPLATE_TYPES_DIRECTORY, TEMPLATE_TYPE);

const kebabCase = (val) =>
	val
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/[\s_]+/g, '-')
		.toLowerCase();

const camelToSnakeCase = (str) =>
	str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).toUpperCase();

async function main() {
	if (!TEMPLATES_AVAILABLE.includes(TEMPLATE_TYPE)) {
		console.error("Template Doesn't exist.");
	}

	const prompts = require(path.join(TEMPLATE_DIRECTORY, 'prompts.json'));

	const answers = await inquirer.prompt(prompts);

	answers.nameKebabCase = kebabCase(answers.name);
	answers.nameSnakeCase = camelToSnakeCase(answers.nameKebabCase);

	answers.projectDir = PROJECT_DIRECTORY || answers.nameKebabCase;

	const mustacheFiles = await glob(
		path.join(TEMPLATE_DIRECTORY, '**/*.mustache'),
		{
			dot: true,
			ignore: 'node_modules/**',
		}
	);

	console.log(mustacheFiles);

	const preScriptPath = path.join(
		TEMPLATE_DIRECTORY,
		'before-templating-process'
	);
	const postScriptPath = path.join(
		TEMPLATE_DIRECTORY,
		'after-templating-process'
	);

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

	if (fs.existsSync(preScriptPath)) {
		console.log('Running `before-templating-process`...');

		await run_script(preScriptPath, {env: envVariables});
	}

	if (mustacheFiles.length) {
		console.log('Writing files...');

		for (const mustacheFile of mustacheFiles) {
			const relativePath = mustacheFile.replace(TEMPLATE_DIRECTORY, '');

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
