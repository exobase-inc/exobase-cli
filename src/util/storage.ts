import localstorage from 'node-localstorage'
import os from 'os'
import path from 'path'

export const store = new localstorage.LocalStorage(path.join(os.homedir(), '.exobase'))

export default store