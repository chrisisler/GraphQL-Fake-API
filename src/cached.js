let isNodeEnvironment = typeof process !== 'undefined'
let isBrowserEnvironment = typeof window !== 'undefined'

function expectTwo (cacheKeyName, asyncFn) {
  if (arguments.length !== 2) {
    throw Error(`Expected two arguments, received ${arguments.length}.`)
  }
}

let cached = expectTwo

if (isBrowserEnvironment) {
  if (localStorageIsAvailable()) {
    cached = async function cached (cacheKeyName, asyncFn) {
      // expectTwo.apply(this, arguments)
      let previous = window.localStorage.getItem(cacheKeyName)

      if (previous) {
        return JSON.parse(previous)
      }

      let result = await asyncFn()

      window.localStorage.setItem(cacheKeyName, JSON.stringify(result))
      return result
    }
  } else {
    // Can't cache if ya can't cache.
    console.warn('`window.localStorage` is not available.')
    cached = async function cached (cacheKeyName, asyncFn) {
      // expectTwo.apply(this, arguments)
      return asyncFn()
    }
  }
} else if (isNodeEnvironment) {
  let { promisify } = require('util')
  let path = require('path')
  let fs = require('fs')

  let readFile = file => promisify(fs.readFile)(file, 'utf8')
  let writeFile = (file, string) => promisify(fs.writeFile)(file, string, 'utf8')

  let cacheDirectoryName = 'cached'

  cached = async function cached (cacheKeyName, asyncFn) {
    // expectTwo.apply(this, arguments)
    if (!fs.existsSync(cacheDirectoryName)) {
      fs.mkdirSync(cacheDirectoryName)
    }

    let cacheFile = path.join(cacheDirectoryName, `${cacheKeyName}.json`)

    if (fs.existsSync(cacheFile)) {
      let cached = JSON.parse(await readFile(cacheFile))

      if (cached.cacheKeyName === cacheKeyName) {
        return cached.result
      }
    }

    let result = await asyncFn()
    let dataToCache = { cacheKeyName, result }

    writeFile(cacheFile, JSON.stringify(dataToCache, null, 2))
    return result
  }
}

module.exports = cached

/**
 * Only safe to call this function when known to be in browser environment.
 * @see 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API'
 * @returns {Boolean} - Whether `window.localStorage` is safe to use or not.
 */
function localStorageIsAvailable () {
  try {
    let storage = window.localStorage
    let x = '__storage_test__'

    storage.setItem(x, x)
    storage.removeItem(x)

    return true
  } catch (error) {
    return error instanceof DOMException && (
      // everything except Firefox
      error.code === 22 ||
      // Firefox
      error.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      error.name === 'QuotaExceededError' ||
      // Firefox
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  }
}
