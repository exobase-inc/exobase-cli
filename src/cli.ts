#!/usr/bin/env node
import prompt from 'prompt-sync'
import { program } from 'commander'
import publish from './publish'
import deploy from './deploy'
import login from './login'
import init from './init'
import chalk from 'chalk'

// const API_URL = 'https://api.exobase.cloud'
const API_URL = 'http://localhost:8440'

program
  .version('0.1.0')
  .name('exobase')
  .description('CLI providing publish and deploy function for Exobase packages and services')

program.command('login')
  .description('Authenticate with exobase to enable publish and deploy')
  .option('-u, --url <url>', 'Optional, override the exobase api url', API_URL)
  .action(async (args: {
    url: string
  }) => {
    const email = prompt()('email: ')
    const password = prompt()('password: ', { echo: '*' })
    await login({ email, password, url: args.url })
  })

program.command('init')
  .option('-u, --url <url>', 'Optional, override the exobase api url', API_URL)
  .description('Initalize configuration for the project in the current directory')
  .action(async (args: {
    url: string
  }) => {
    await init({ url: args.url })
  })

program.command('deploy')
  .description('Deploy a service to via exobase')
  .option('-u, --url <url>', 'Optional, override the exobase api url', API_URL)
  .option('-f, --follow', 'Optional, listen for logs and stream to console', false)
  .argument('[path]', 'Optional directory path to the service source. Default: cwd', process.cwd())
  .action(async (root, args) => {
    await deploy({
      url: args.url,
      root: root,
      follow: args.follow
    })
  })

program.parseAsync(process.argv).then(() => {
  console.log('done!')
}).catch((err) => {
  console.error(err)
})
