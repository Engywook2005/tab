
import { find, sortBy } from 'lodash/collection'
import BaseWidgetModel from './widget/BaseWidgetModel'
import UserWidgetModel from './userWidget/UserWidgetModel'
import getFullWidget from './getFullWidget'
import getUserWidgetsByEnabledState from './userWidget/getUserWidgetsByEnabledState'

/**
 * Fetch the widgets for a user. The result includes the widget data
 * as well as the user-widget related data.
 * The user-widget data field gets serialized into a string.
 * @param {string} userId - The user id.
 * @return {Object[]}  Returns a list of object that with the widget and
 * the user data on the widget information.
 */
const getUserWidgets = async (userContext, userId, enabled = false) => {
  // Get user widgets.
  var userWidgets
  if (enabled) {
    userWidgets = await getUserWidgetsByEnabledState(userContext, userId, true)
  } else {
    userWidgets = await UserWidgetModel
      .query(userContext, userId)
      .execute()
  }

  // Get base widgets.
  const keys = []
  userWidgets.forEach((userWidget) => {
    keys.push({
      id: userWidget.widgetId
    })
  })
  if (!keys || keys.length === 0) {
    return []
  }
  const baseWidgets = await BaseWidgetModel.getBatch(userContext, keys)

  // Merge user widgets with base widgets.
  const mergedWidgets = []
  userWidgets.forEach((userWidget) => {
    const baseWidget = find(baseWidgets, (baseWidget) => {
      return baseWidget.id === userWidget.widgetId
    })
    mergedWidgets.push(getFullWidget(userWidget, baseWidget))
  })

  // Sort widgets.
  const sortedWidgets = sortBy(mergedWidgets, (obj) => obj.position)
  return sortedWidgets
}

export default getUserWidgets
