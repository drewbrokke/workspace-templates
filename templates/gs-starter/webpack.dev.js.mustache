import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import Dotenv from 'dotenv-webpack';

export default merge(common, {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		static: './public',
		port: 3000,
		hot: true,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': '*',
			'Access-Control-Allow-Headers':
				'X-Requested-With, content-type, Authorization',
		},
		liveReload: true,
		watchFiles: [
			'src/**/*.tsx',
			'src/**/*.ts',
			'src/**/*.scss',
			'src/**/*.css',
			'src/**/*.js',
			'src/**/*.jsx',
		],
		open: false,
	},
	plugins: [new Dotenv()],
	module: {
		rules: [
			{
				test: /\.css$/,
				exclude: /node_modules/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.s[ac]ss$/i,
				exclude: /node_modules/,
				use: ['style-loader', 'css-loader', 'sass-loader'],
			},
			{
				test: /\.tsx?$/,
				exclude: [/node_modules/],
				use: {
					loader: 'ts-loader',
					options: {
						configFile: 'tsconfig.dev.json',
						...frameworkSettings.common.tsOptions,
					},
				},
			},
		],
	},
	output: {
		filename: '[name].js',
		publicPath: `http://localhost:3000/`,
	},
});
