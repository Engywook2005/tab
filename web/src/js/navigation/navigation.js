import createBrowserHistory from 'history/createBrowserHistory'
import { externalRedirect, isURLForDifferentApp } from 'js/navigation/utils'
import { getUrlParameters } from 'js/utils/utils'
import qs from 'qs'

export const browserHistory = createBrowserHistory()

export const goTo = (path, paramsObj = {}) => {
  const queryString = qs.stringify(paramsObj)
  if (isURLForDifferentApp(path)) {
    let externalURL = queryString ? `${path}?${queryString}` : path
    externalRedirect(externalURL)
  } else {
    browserHistory.push({
      pathname: path,
      search: queryString ? `?${queryString}` : null,
    })
  }
}

export const replaceUrl = (path, paramsObj = {}) => {
  const queryString = qs.stringify(paramsObj)
  if (isURLForDifferentApp(path)) {
    let externalURL = queryString ? `${path}?${queryString}` : path
    externalRedirect(externalURL)
  } else {
    browserHistory.replace({
      pathname: path,
      search: qs.stringify(paramsObj) ? `?${qs.stringify(paramsObj)}` : null,
    })
  }
}

export const modifyURLParams = (paramsObj = {}) => {
  const newParamsObj = Object.assign({}, getUrlParameters(), paramsObj)
  browserHistory.push({
    pathname: window.location.pathname,
    search: qs.stringify(newParamsObj)
      ? `?${qs.stringify(newParamsObj)}`
      : null,
  })
}

export const absoluteUrl = path => {
  // If the passed path is already an absolute URL,
  // just return it.
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  const protocol = process.env.REACT_APP_WEBSITE_PROTOCOL
    ? process.env.REACT_APP_WEBSITE_PROTOCOL
    : 'https'
  const baseUrl = `${protocol}://${process.env.REACT_APP_WEBSITE_DOMAIN}`
  return `${baseUrl}${path}`
}

// ROUTES

export const dashboardURL = '/newtab/'
export const introURL = '/newtab/intro/'

// Auth routes
export const loginURL = '/newtab/auth/'
export const verifyEmailURL = '/newtab/auth/verify-email/'
export const enterUsernameURL = '/newtab/auth/username/'
export const authMessageURL = '/newtab/auth/welcome/'
export const missingEmailMessageURL = '/newtab/auth/missing-email/'

// Settings and profile
export const settingsURL = '/newtab/settings/widgets/'
export const widgetSettingsURL = '/newtab/settings/widgets/'
export const backgroundSettingsURL = '/newtab/settings/background/'
export const donateURL = '/newtab/profile/donate/'
export const statsURL = '/newtab/profile/stats/'
export const inviteFriendsURL = '/newtab/profile/invite/'
export const accountURL = '/newtab/account/'

// Search
export const searchBaseURL = '/search'

// Homepage

export const homeURL = absoluteUrl('/')
export const privacyPolicyURL = absoluteUrl('/privacy/')
export const termsOfServiceURL = absoluteUrl('/terms/')
export const contactUsURL = absoluteUrl('/contact/')
export const financialsURL = absoluteUrl('/financials/')
export const teamURL = absoluteUrl('/team/')
export const jobsURL = absoluteUrl('/jobs/')
export const adblockerWhitelistingURL = absoluteUrl('/adblockers/')
export const adblockerWhitelistingForSearchURL = absoluteUrl(
  '/adblockers/search/'
)

// External links

// Surveys
export const postUninstallSurveyURL = 'https://goo.gl/forms/XUICFx9psTwCzEIE2'
export const searchPostUninstallSurveyURL =
  'https://forms.gle/A3Xam2op2gFjoQNU6'
export const searchBetaFeedback = 'https://forms.gle/B97aCWA6A68Qfe4u5'

// Zendesk
export const externalHelpURL =
  'https://gladly.zendesk.com/hc/en-us/categories/201939608-Tab-for-a-Cause'
export const externalContactUsURL =
  'https://gladly.zendesk.com/hc/en-us/requests/new'

// Social
export const facebookPageURL = 'https://www.facebook.com/TabForACause'
export const twitterPageURL = 'https://twitter.com/TabForACause'

// Browser extension pages
export const searchFirefoxExtensionPage =
  'https://addons.mozilla.org/en-US/firefox/addon/search-for-a-cause/'
export const searchChromeExtensionPage =
  'https://chrome.google.com/webstore/detail/search-for-a-cause/eeiiknnphladbapfamiamfimnnnodife/'

// TODO: stop using these and replace the existing uses.
//   They only cause additional complication during testing.
// CONVENIENCE FUNCTIONS

export const goToHome = () => {
  goTo(dashboardURL)
}

export const goToLogin = () => {
  // Use replace by default because likely redirecting when
  // user is not authenticated.
  replaceUrl(loginURL)
}

export const goToDashboard = () => {
  goTo(dashboardURL)
}

export const goToSettings = () => {
  goTo(settingsURL)
}

export const goToDonate = () => {
  goTo(donateURL)
}

export const goToStats = () => {
  goTo(statsURL)
}

export const goToInviteFriends = () => {
  goTo(inviteFriendsURL)
}
