// @flow

import pathToRegexp from 'path-to-regexp'
import { NOT_FOUND } from '../actions'
import type { RouteValues, RouteNames, PlainAction as Action } from '../flow-types'


export default function pathToAction(path: string, routes: RouteValues, routeNames: RouteNames): Action {
  let i = 0
  let match
  const keys = []

  while (!match && i < routes.length) {
    keys.length = 0 // empty the array and start over
    const routePath = routes[i].path || routes[i] // route may be an object containing a route or a route string itself
    const reg = pathToRegexp(routePath, keys)
    match = reg.exec(path)
    i++
  }

  if (match) {
    i--
    const route = routeNames[i]
    const capitalizedWords = routes[i] && routes[i].capitalizedWords
    const fromPath = routes[i] && typeof routes[i].fromPath === 'function' && routes[i].fromPath

    const params = keys.reduce((params, key, index) => {
      let value = match[index + 1] // item at index 0 is the overall match, whereas those after correspond to the key's index

      value = !isNaN(value) ? parseFloat(value) : value // make sure pure numbers aren't passed to reducers as strings

      value = capitalizedWords && typeof value === 'string'
        ? value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) // 'my-category' -> 'My Category'
        : value

      value = fromPath ? fromPath(value, key.name) : value

      params[key.name] = value

      return params
    }, {})

    return { type: route, payload: params }
  }

    // This will basically will only end up being called if the developer is manually calling history.push().
    // Or, if visitors visit an invalid URL, the developer can use the NOT_FOUND type to show a not-found page to
  return { type: NOT_FOUND, payload: {} }
}
