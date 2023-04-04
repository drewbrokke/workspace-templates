import { defineConfig } from 'cypress';
import WebpackDevConfig from './webpack.dev.js';
import dotenv from 'dotenv';
import { expand } from 'dotenv-expand';

const env = dotenv.config();
expand(env);

const CYPRESS_PREFIX = 'CYPRESS_';

export default defineConfig({
	component: {
		devServer: {
			framework: "react",
			bundler: 'webpack',
			webpackConfig: WebpackDevConfig,
		},
	},

	e2e: {
		env: Object.keys(process.env)
			.filter(env_var => env_var.startsWith('CYPRESS_'))
			.map(key => key.replace(CYPRESS_PREFIX, ''))
			.reduce((env, key) => {
				env[key] = process.env[`${CYPRESS_PREFIX}${key}`];
				return env;
			}, {}),

		setupNodeEvents(on, config) {
			// events here
		},
	},
});
