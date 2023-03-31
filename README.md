# Create Client Extension POC

Project Structure:
- Basic liferay workspace intialized with `blade`
- `./generate-cli`: POC for template management, this will eventually be merged into the workspace tools.
- Added `./templates` directory to store client extension templates. (Necessary for `createClientExtension`)
- Added `./client-extensions` directory to store actively developed extensions. (Can be anything)

Setup:
1. Clone this repo
2. `./gradlew yarnInstall`


Creating a new Client Extension:
1. `cd ./client-extensions`
2. `yarn exec createClientExtension` (POC way to call our tool)
3. Choose your project and follow the prompts


## Template Directory Structure

Templates have a basic anatomy with four parts.
1. `prompts.json`: questions that are asked when project is generated
2. `before-templating-process`: executable that is run after prompts but before template files
3. `*.mustache` files: these are templates that take values from your prompts and copy to new project.
	- **Note:** One of these `*.mustache` files must be a `client-extension.yaml.mustache` with a supported `type`. See existing templates for examples.
4. `after-templating-process`: executable that is run after template files are generated.

Every template project may have a `prompts.json` for setting up yoru template and providing variables for template creation. See [inquirer API](https://www.npmjs.com/package/inquirer#questions) for specific details.

Example:
```json
[
	{
		"name": "name",
		"message":"What is the name of your Client Extension?",
		"type": "string"
	}
]
```

### Variables.

- For `*.mustache` files, see mustache templating documentation. Prompt answers will be available like `{{ name }}` in your template.
- For executables, use env variables `PROMPTS_*`, for example `PROMPTS_NAME`.


### Creating New Templates

If you would like to create your own template, you can do so and the CLI tool will pick up that template as an option.