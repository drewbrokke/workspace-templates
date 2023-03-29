const {spawn} = require('child_process');

function runExecutable(command, options = {}, callback = () => {}) {
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

module.exports = {runExecutable}