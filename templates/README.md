# Contributing Templates

Templates have a basic anatomy with four parts.
1. `prompts.json`: questions that are asked when project is generated
2. `before-templating-process`: executable that is run after prompts but before template files
3. `*.mustache` files: these are templates that take values from your prompts and copy to new project.
4. `after-templating-process`: executable that is run after template files are generated.

Every template project must have a `prompts.json` with at least one question `name`. Everything else is optional.

```json
[
	{
		"name": "name",
		"message":"What is the name of your Client Extension?",
		"type": "string"
	}
]
```

## Variables.

- For `*.mustache` files, see mustache templating documentation
- For executables, use env variables `PROMPTS_*`, for example `PROMPTS_NAME`.