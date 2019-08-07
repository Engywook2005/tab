import React from 'react'
import { Route, Router, Switch } from 'react-router-dom'
import { filter } from 'lodash/collection'
import { get } from 'lodash/object'
import { Helmet } from 'react-helmet'
import { browserHistory } from 'js/navigation/navigation'
import BaseContainer from 'js/components/General/BaseContainer'
import ErrorBoundary from 'js/components/General/ErrorBoundary'
import { initializeFirebase } from 'js/authentication/firebaseConfig'
import logger from 'js/utils/logger'

// This is a hack to generate separate apps for the new tab
// page and search. We do this because create-react-app does
// not currently support more than one entry point. See:
// https://github.com/facebook/create-react-app/issues/1084#issuecomment-365495580
// Our goal is to use load only the necessary assets for the
// root new tab and search pages without downloading any
// critical JS asynchronously, while not switching away from
// CRA, ejecting from CRA, or dealing with the overhead of
// managing distinct codebases. In the future, it would be
// better for us to have a monorepo structure of some kind
// (see: https://github.com/facebook/create-react-app/issues/1492),
// use the built-in multiple entry points (if CRA supports
// it down the line), or switching to another framework.
// See this pull request for details:
// https://github.com/gladly-team/tab/pull/466
var TheApp
var appPath
if (process.env.REACT_APP_WHICH_APP === 'newtab') {
  TheApp = require('js/components/App/App').default
  appPath = '/newtab/'
} else if (process.env.REACT_APP_WHICH_APP === 'search') {
  TheApp = require('js/components/Search/SearchApp').default
  appPath = '/search/'
} else {
  throw new Error(
    `Env var "REACT_APP_WHICH_APP" should be set to "newtab" or "search". Received: "${
      process.env.REACT_APP_WHICH_APP
    }"`
  )
}

class Root extends React.Component {
  constructor(props) {
    super(props)

    // Initialize Firebase.
    try {
      initializeFirebase()
    } catch (e) {
      logger.error(e)
    }
  }

  componentDidMount() {
    // Measure time to interactive (TTI):
    // https://developers.google.com/web/fundamentals/performance/user-centric-performance-metrics#time_to_interactive
    // https://github.com/GoogleChromeLabs/tti-polyfill
    try {
      if (process.env.REACT_APP_MEASURE_TIME_TO_INTERACTIVE === 'true') {
        import('tti-polyfill').then(ttiPolyfill => {
          ttiPolyfill.getFirstConsistentlyInteractive().then(tti => {
            console.log(`Time to interactive: ${tti}`)
          })
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    // TODO: Show 404 page
    return (
      <ErrorBoundary>
        <BaseContainer>
          <Helmet
            // Handle a react-helmet bug that doesn't replace or remove
            // existing favicon <link /> elements when a new favicon is set.
            // https://github.com/nfl/react-helmet/issues/430
            onChangeClientState={(newState, addedTags) => {
              // TODO: clean up
              try {
                const linkTags = get(newState, 'linkTags', [])
                const favicons = filter(linkTags, { rel: 'icon' })

                // Remove all link[rel="icon"] elements except the last one.
                // This assumes that the last react-helmet link tag in the
                // array is the one added most recently.
                for (var i = 0; i < favicons.length - 1; i++) {
                  let extraFavicon = favicons[i]
                  const extraFaviconElem = document.querySelector(
                    `link[rel="icon"][href="${extraFavicon.href}"`
                  )
                  extraFaviconElem.parentNode.removeChild(extraFaviconElem)
                }
              } catch (e) {
                console.error(e)
              }
            }}
          />
          <Router history={browserHistory}>
            <Switch>
              <Route path={appPath} component={TheApp} />
            </Switch>
          </Router>
        </BaseContainer>
      </ErrorBoundary>
    )
  }
}

export default Root
