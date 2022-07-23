import client from '@exobase/client-js'
import store from './util/storage'
import chalk from 'chalk'

export default async function login({
  email,
  password,
  url
}: {
  email: string
  password: string
  url: string
}): Promise<void> {
  const api = client(url)
  const { data, error } = await api.auth.login({
    email,
    password
  })
  if (error) {
    console.error(error.details)
    return
  }
  store.setItem('email', email)
  store.setItem('idToken', data.idToken)
  store.setItem('user', JSON.stringify(data.user))
  console.log(chalk.green('Success. You are now logged in!'))
}
