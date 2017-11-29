
import BaseModel from '../base/BaseModel'
import types from '../fieldTypes'
import tableNames from '../tables'
import { USER_TABS_LOG } from '../constants'
import {
  permissionAuthorizers
} from '../../utils/authorization-helpers'

/*
 * @extends BaseModel
 */
class userTabsLog extends BaseModel {
  static get name () {
    return USER_TABS_LOG
  }

  static get hashKey () {
    return 'userId'
  }

  static get tableName () {
    return tableNames.userTabsLog
  }

  static get schema () {
    return {
      userId: types.string().required()
    }
  }

  static get permissions () {
    return {
      create: permissionAuthorizers.userIdMatchesHashKey
    }
  }
}

userTabsLog.register()

export default userTabsLog
