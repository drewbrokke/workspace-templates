const fs = require('fs');
const path = require('path');

function checkForSharedConfig(dir) {
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

module.exports = {checkForSharedConfig}