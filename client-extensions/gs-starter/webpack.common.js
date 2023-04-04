import ESLintWebpackPlugin from 'eslint-webpack-plugin';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
	entry: {
		"my-app": "./src/my-app"
	},
	plugins: [
		new ESLintWebpackPlugin(),
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	experiments: {
		outputModule: true,
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		clean: true,
		module: true,
	},
};
