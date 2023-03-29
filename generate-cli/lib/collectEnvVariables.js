const {camelToSnakeCase} = require('./textUtils')

function collectEnvVariables(answers) {
	return Object.keys(answers).reduce(
		(acc, key) => ({
			...acc,
			['PROMPTS_' + camelToSnakeCase(key)]: answers[key],
		}),
		{...process.env}
	);
}

module.exports = {collectEnvVariables}