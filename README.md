# Templates

**Workflow:**
Ideally the user could run something like

```sh
gw createClientExtension // pulls from "templates" directory

gw createClientExtension theme-spritemap
```

**Default Prompt:**
"Should this client extension in a shared container or it own?"

>A default prompt for all client extensions asking if the client extension is going to be in its own container or a shared container. If it is a shared container, we would move it's client-extension.yaml to an existing one. If it is it's own container, we create a new yaml file.

see "shared component" for reference [ce-cli](https://www.npmjs.com/package/ce-cli)

**Template Structure:**
- Uses the "prompts.json" to get user inputted values
- Runs before-templating-process executable
- Copies .hbs templating files to project
- Runs after-templating-process executable

`prompts.json`
Runs from top -> down

See [inquirer](https://www.npmjs.com/package/inquirer#questions) for prompt options for each question.


`before-templating-process / after-templating-process`
- User values provided as environment variables. `name` -> `PROMPTS_NAME`

`*.mustache`
- Variables available as `name` -> `{{ name }}`

Workflow for adding a new Template:
- User could copy/paste existing template and then modify for their specific need. For example, copy/paste react template and then add jest config.
- User could add an entirely new Template structure with their own prompts.

# Running Generator

Install Node dependencies
```sh
cd ./generate-cli && npm i && cd ..
```

Running CLI

```sh
cd ./client-extensions

node ../generate-cli/index.js [TEMPLATE_NAME] [DIRECTORY_NAME(optional)]
```
