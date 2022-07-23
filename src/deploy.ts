import _ from 'radash'
import client from '@exobase/client-js'
import store from './util/storage'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import cmd from 'cmdish'
import axios from 'axios'
import { createReadStream, statSync } from "fs"
import archive from '@exobase/archiver'

export default async function deploy({
  url,
  root,
  follow
}: {
  url: string
  root: string
  follow: boolean
}): Promise<void> {
  const api = client(url)
  const idToken = store.getItem('idToken')
  if (!idToken) {
    console.error(chalk.red('Not authenticated. Run exobase login to authenticate'))
    return
  }

  const configFilePath = path.join(root, '.exobase')
  const configString = await fs.promises.readFile(configFilePath, 'utf-8')
  if (!configString) {
    console.error(chalk.red('No .exobase config file at ${configFilePath}. Run exobase init to configure.'))
    return
  }

  const {
    workspaceId,
    platformId,
    unitId
  } = JSON.parse(configString)

  const zipFilePath = path.join(root, 'archive.zip')
  await archive({
    source: '.',
    destination: 'archive.zip',
    exclude: ['archive.zip'],
    cwd: root
  })

  const getUploadLinkResponse = await api.deployments.preUploadSource({
    workspaceId,
    platformId,
    unitId
  }, { token: idToken })
  const upload = getUploadLinkResponse.data

  const payload = createReadStream(zipFilePath);
  await axios.put(upload.url, payload, {
    method: "PUT",
    headers: {
      'Content-Length': `${statSync(zipFilePath).size}`
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  })

  const response = await api.units.deployFromCLI({
    workspaceId,
    platformId,
    unitId,
    upload: {
      id: upload.id,
      timestamp: upload.timestamp
    }
  }, { token: idToken })

  if (response.error) {
    console.error(chalk.red(response.error.details))
    return
  }

  if (!follow) {
    console.log(chalk.green('Build submitted'))
    return
  }

  const deploy = response.data.deployment
  let latestTimestamp = 0

  while (true) {
    await new Promise(res => setTimeout(res, 1000))
    const logResponse = await api.logs.pull({ 
      logId: deploy.logId,
      after: latestTimestamp 
    }, { token: idToken })
    if (logResponse.error) {
      console.error(chalk.red(logResponse.error.details))
      return
    }
    const logs = logResponse.data.stream
    for (const log of logs) {
      console.log(log.content)
    }
    const latestLog = _.boil(logs, (a, b) => a.timestamp > b.timestamp ? a : b)
    latestTimestamp = latestLog?.timestamp ?? latestTimestamp
  }

}
