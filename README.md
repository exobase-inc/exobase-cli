# Exobase CLI

> CLI for working with the Exobase cloud platform

Run
```sh
exobase login

# then

exobase workspaces list
exobase workspaces select [workspace:slug]
exobase platforms list
exobase platforms select [platform:slug]
exobase services list
exobase services select [service:slug]

# or

exobase init

# then

exobase deploy
```

## Usage

### **dev**

`npm run dev`

Runs the CLI application.

You can pass arguments to your application by running `npm run dev -- --your-argument`. The extra `--` is so that your arguments are passed to your CLI application, and not `npm`.

### **clean**

`npm run clean`

Removes any built code and any built executables.

### **build**

`npm run build`

Cleans, then builds the TypeScript code.

Your built code will be in the `./dist/` directory.

### **test**

`npm run test`

Cleans, then builds, and tests the built code.

### **bundle**

`npm run bundle`

Cleans, then builds, then bundles into native executables for Windows, Mac, and Linux.

Your shareable executables will be in the `./exec/` directory.
