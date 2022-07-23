import client, { User } from '@exobase/client-js'
import store from './util/storage'
import chalk from 'chalk'
import inquirer from 'inquirer'
import slugger from 'url-slug'
import fs from 'fs'
import path from 'path'

export default async function login({
  url
}: {
  url: string
}): Promise<void> {
  const api = client(url)
  const idToken = store.getItem('idToken')
  const user = JSON.parse(store.getItem('user') ?? '{}') as User
  if (!idToken || !user.id) {
    console.error(chalk.red('Not authenticated. Run exobase login to authenticate'))
    return
  }

  // Ask the user for the workspace they want to use
  const { workspaceSlug } = await inquirer.prompt([{
    type: 'list',
    name: 'workspaceSlug',
    message: 'What workspace are you working in?',
    choices: user.workspaces.map(w => slugger(w.name))
  }])
  
  const workspaceId = user.workspaces.find(w => slugger(w.name) === workspaceSlug).id

  const { error, data } = await api.workspaces.find({ workspaceId }, { token: idToken })
  if (error) {
    console.error(error.details)
    return
  }

  const workspace = data.workspace

  const platform = await inquirer.prompt([{
    type: 'list',
    name: 'slug',
    message: 'What platform are you working in?',
    choices: workspace.platforms.map(p => slugger(p.name))
  }]).then(({ slug }) => workspace.platforms.find(p => slugger(p.name) === slug))

  const unit = await inquirer.prompt([{
    type: 'list',
    name: 'slug',
    message: 'What service are you working in?',
    choices: platform.units.map(u => slugger(u.name))
  }]).then(({ slug }) => platform.units.find(u => slugger(u.name) === slug))

  await fs.promises.writeFile(path.join(process.cwd(), '.exobase'), JSON.stringify({
    workspaceId,
    platformId: platform.id,
    unitId: unit.id
  }, null, 2), 'utf-8')
  
  console.log(chalk.green('Success. You are ready to deploy!'))
}
