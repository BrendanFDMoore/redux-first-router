import { applyMiddleware, createStore, compose } from 'redux'
import createHistory from 'history/createMemoryHistory'
import connectRoutes from '../src/connectRoutes'

const setup = (
  path = '/',
  options = { title: 'title', location: 'location' },
  routesMap
) => {
  routesMap = routesMap || {
    FIRST: '/first',
    SECOND: '/second/:param',
    THIRD: '/third'
  }

  const history = createHistory({
    initialEntries: [path],
    initialIndex: 0,
    keyLength: 6
  })

  options.extra = 'extra-arg'
  const tools = connectRoutes(history, routesMap, options)
  return { ...tools, routesMap }
}

export default setup

export const setupAll = (
  path,
  options,
  { rootReducer, preLoadedState, routesMap } = {}
) => {
  const tools = setup(path, options, routesMap)
  const { middleware, reducer, enhancer } = tools
  const middlewares = applyMiddleware(middleware)
  const enhancers = compose(enhancer, middlewares)

  rootReducer =
    rootReducer ||
    ((state = {}, action = {}) => ({
      location: reducer(state.location, action),
      title: action.type
    }))

  const store = createStore(rootReducer, preLoadedState, enhancers)
  return {
    ...tools,
    store
  }
}
