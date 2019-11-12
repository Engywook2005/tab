/* eslint-env jest */

import {
  DatabaseOperation,
  getMockUserContext,
  getMockUserInfo,
  setMockDBResponse,
} from '../../test-utils'

import ReferralDataModel from '../ReferralDataModel'
import UserModel from '../../users/UserModel'

jest.mock('../../databaseClient')
const userContext = getMockUserContext()

afterEach(() => {
  jest.clearAllMocks()
})

describe('getRecruits', () => {
  test('getRecruits calls the database', async () => {
    const referringUserId = getMockUserInfo().id
    const { getRecruits } = require('../getRecruits')

    // Spy on query methods
    const query = jest.spyOn(ReferralDataModel, 'query')
    const queryExec = jest.spyOn(ReferralDataModel, '_execAsync')

    await getRecruits(userContext, referringUserId)

    expect(query).toHaveBeenCalledWith(userContext, referringUserId)
    expect(queryExec).toHaveBeenCalled()
  })

  test('getRecruits (with startTime filter) forms ReferralDataLog database queries as expected', async () => {
    const referringUserId = getMockUserInfo().id
    const { getRecruits } = require('../getRecruits')

    // Mock ReferralDataModel query
    const referralLogQueryMock = setMockDBResponse(DatabaseOperation.QUERY, {
      Items: [],
    })
    await getRecruits(userContext, referringUserId, '2017-07-19T03:05:12Z')

    expect(referralLogQueryMock.mock.calls[0][0]).toEqual({
      ExpressionAttributeNames: {
        '#created': 'created',
        '#referringUser': 'referringUser',
      },
      ExpressionAttributeValues: {
        ':created': '2017-07-19T03:05:12Z',
        ':referringUser': referringUserId,
      },
      IndexName: 'ReferralsByReferrer',
      KeyConditionExpression:
        '(#created >= :created) AND (#referringUser = :referringUser)',
      TableName: ReferralDataModel.tableName,
    })
  })

  test('getRecruits (with endTime filter) forms ReferralDataLog database query as expected', async () => {
    const referringUserId = getMockUserInfo().id
    const { getRecruits } = require('../getRecruits')

    // Mock ReferralDataModel query
    const referralLogQueryMock = setMockDBResponse(DatabaseOperation.QUERY, {
      Items: [],
    })
    await getRecruits(
      userContext,
      referringUserId,
      null,
      '2017-07-20T12:29:03Z'
    )

    expect(referralLogQueryMock.mock.calls[0][0]).toEqual({
      ExpressionAttributeNames: {
        '#created': 'created',
        '#referringUser': 'referringUser',
      },
      ExpressionAttributeValues: {
        ':created': '2017-07-20T12:29:03Z',
        ':referringUser': referringUserId,
      },
      IndexName: 'ReferralsByReferrer',
      KeyConditionExpression:
        '(#created <= :created) AND (#referringUser = :referringUser)',
      TableName: ReferralDataModel.tableName,
    })
  })

  test('getRecruits (with both startTime and endTime filter) forms ReferralDataLog database query as expected', async () => {
    const referringUserId = getMockUserInfo().id
    const { getRecruits } = require('../getRecruits')

    // Mock ReferralDataModel query
    const referralLogQueryMock = setMockDBResponse(DatabaseOperation.QUERY, {
      Items: [],
    })
    await getRecruits(
      userContext,
      referringUserId,
      '2017-07-19T03:05:12Z',
      '2017-07-20T12:29:03Z'
    )

    expect(referralLogQueryMock.mock.calls[0][0]).toEqual({
      ExpressionAttributeNames: {
        '#created': 'created',
        '#referringUser': 'referringUser',
      },
      ExpressionAttributeValues: {
        ':created': '2017-07-19T03:05:12Z',
        ':created_2': '2017-07-20T12:29:03Z',
        ':referringUser': referringUserId,
      },
      IndexName: 'ReferralsByReferrer',
      KeyConditionExpression:
        '(#created BETWEEN :created AND :created_2) AND (#referringUser = :referringUser)',
      TableName: ReferralDataModel.tableName,
    })
  })

  test('getRecruits (with no time filters) forms database queries and returns expected value', async () => {
    const referringUserId = getMockUserInfo().id
    const { getRecruits } = require('../getRecruits')

    // Mock ReferralDataModel query
    const referralDataLogsToReturn = [
      {
        userId: 'efghijklmnopqrs',
        referringUser: referringUserId,
        created: '2017-07-19T03:05:12Z',
        updated: '2017-07-19T03:05:12Z',
      },
      {
        userId: 'pqrstuvwxyzabcd',
        referringUser: referringUserId,
        created: '2017-08-20T17:32:01Z',
        updated: '2017-08-20T17:32:01Z',
      },
    ]
    const referralLogQueryMock = setMockDBResponse(DatabaseOperation.QUERY, {
      Items: referralDataLogsToReturn,
    })

    // Mock User query
    const recruitedUsersToReturn = [
      {
        id: 'efghijklmnopqrs',
        lastTabTimestamp: '2017-07-21T05:15:00Z', // >2 days after joining
        tabs: 302,
      },
      {
        id: 'pqrstuvwxyzabcd',
        lastTabTimestamp: '2017-08-20T17:40:52Z', // <1 hour after joining
        tabs: 12,
      },
    ]
    setMockDBResponse(DatabaseOperation.GET_BATCH, {
      Responses: {
        [UserModel.tableName]: recruitedUsersToReturn,
      },
    })

    const returnedVal = await getRecruits(userContext, referringUserId)
    expect(referralLogQueryMock.mock.calls[0][0]).toEqual({
      ExpressionAttributeNames: {
        '#referringUser': 'referringUser',
      },
      ExpressionAttributeValues: {
        ':referringUser': referringUserId,
      },
      IndexName: 'ReferralsByReferrer',
      KeyConditionExpression: '(#referringUser = :referringUser)',
      TableName: ReferralDataModel.tableName,
    })

    const expectedReturn = [
      {
        recruitedAt: '2017-07-19T03:05:12Z',
        lastActive: '2017-07-21T05:15:00Z',
        hasOpenedOneTab: true,
      },
      {
        recruitedAt: '2017-08-20T17:32:01Z',
        lastActive: '2017-08-20T17:40:52Z',
        hasOpenedOneTab: true,
      },
    ]
    expect(returnedVal).toEqual(expectedReturn)
  })

  test('getRecruits (with missing tabs and lastTabTimestamp values) returns expected value', async () => {
    const referringUserId = getMockUserInfo().id
    const { getRecruits } = require('../getRecruits')

    // Mock ReferralDataModel query
    const referralDataLogsToReturn = [
      {
        userId: 'efghijklmnopqrs',
        referringUser: referringUserId,
        created: '2017-07-19T03:05:12Z',
        updated: '2017-07-19T03:05:12Z',
      },
      {
        userId: 'pqrstuvwxyzabcd',
        referringUser: referringUserId,
        created: '2017-08-20T17:32:01Z',
        updated: '2017-08-20T17:32:01Z',
      },
      {
        userId: 'tuvwxyzabcdefgh',
        referringUser: referringUserId,
        created: '2017-07-23T01:18:11Z',
        updated: '2017-07-23T01:18:11Z',
      },
    ]
    setMockDBResponse(DatabaseOperation.QUERY, {
      Items: referralDataLogsToReturn,
    })

    // Mock User query
    const recruitedUsersToReturn = [
      {
        id: 'efghijklmnopqrs',
        lastTabTimestamp: null, // no timestamp
        tabs: undefined,
      },
      {
        id: 'pqrstuvwxyzabcd',
        lastTabTimestamp: '2017-08-20T17:40:52Z', // valid
        tabs: 4,
      },
      {
        // missing lastTabTimestamp and tabs fields
        id: 'tuvwxyzabcdefgh',
      },
    ]
    setMockDBResponse(DatabaseOperation.GET_BATCH, {
      Responses: {
        [UserModel.tableName]: recruitedUsersToReturn,
      },
    })

    const returnedVal = await getRecruits(userContext, referringUserId)

    const expectedReturn = [
      {
        recruitedAt: '2017-07-19T03:05:12Z',
        lastActive: null,
        hasOpenedOneTab: false,
      },
      {
        recruitedAt: '2017-08-20T17:32:01Z',
        lastActive: '2017-08-20T17:40:52Z',
        hasOpenedOneTab: true,
      },
      {
        recruitedAt: '2017-07-23T01:18:11Z',
        lastActive: null,
        hasOpenedOneTab: false,
      },
    ]
    expect(returnedVal).toEqual(expectedReturn)
  })

  test('getRecruits (with no recruits) returns expected value', async () => {
    const referringUserId = getMockUserInfo().id
    const { getRecruits } = require('../getRecruits')

    // Mock ReferralDataModel query
    const referralDataLogsToReturn = []
    setMockDBResponse(DatabaseOperation.QUERY, {
      Items: referralDataLogsToReturn,
    })

    // Mock User query
    const recruitedUsersToReturn = []
    const recruitedUsersQueryMock = setMockDBResponse(
      DatabaseOperation.GET_BATCH,
      {
        Responses: {
          [UserModel.tableName]: recruitedUsersToReturn,
        },
      }
    )

    const returnedVal = await getRecruits(userContext, referringUserId)
    expect(recruitedUsersQueryMock).not.toHaveBeenCalled()
    expect(returnedVal).toEqual([])
  })

  test('getTotalRecruitsCount works as expected', async () => {
    const { getTotalRecruitsCount } = require('../getRecruits')
    const recruitsEdgesTestA = [
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-05-19T13:59:46.000Z',
          lastActive: '2017-12-19T08:23:40.532Z',
          hasOpenedOneTab: false,
        },
      },
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-02-07T13:59:46.000Z',
          lastActive: '2017-02-07T18:00:09.031Z',
          hasOpenedOneTab: true,
        },
      },
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-02-07T17:69:46.000Z',
          lastActive: null,
          hasOpenedOneTab: false,
        },
      },
    ]
    expect(getTotalRecruitsCount(recruitsEdgesTestA)).toBe(3)

    const recruitsEdgesTestB = [
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-05-19T13:59:46.000Z',
          lastActive: '2017-12-19T08:23:40.532Z',
          hasOpenedOneTab: true,
        },
      },
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-02-07T13:59:46.000Z',
          lastActive: '2017-02-09T08:23:40.532Z',
          hasOpenedOneTab: true,
        },
      },
    ]
    expect(getTotalRecruitsCount(recruitsEdgesTestB)).toBe(2)

    const recruitsEdgesTestC = []
    expect(getTotalRecruitsCount(recruitsEdgesTestC)).toBe(0)

    expect(getTotalRecruitsCount(null)).toBe(0)
  })

  test('getRecruitsActiveForAtLeastOneDay works as expected', async () => {
    const { getRecruitsActiveForAtLeastOneDay } = require('../getRecruits')
    const recruitsEdgesTestA = [
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-05-19T13:59:46.000Z',
          lastActive: '2017-12-19T08:23:40.532Z',
          hasOpenedOneTab: true,
        },
      },
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-02-07T13:59:46.000Z',
          lastActive: '2017-02-07T18:00:09.031Z',
          hasOpenedOneTab: true,
        },
      },
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-02-07T17:69:46.000Z',
          lastActive: null,
          hasOpenedOneTab: true,
        },
      },
    ]
    expect(getRecruitsActiveForAtLeastOneDay(recruitsEdgesTestA)).toBe(1)

    const recruitsEdgesTestB = [
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-05-19T13:59:46.000Z',
          lastActive: '2017-12-19T08:23:40.532Z',
          hasOpenedOneTab: true,
        },
      },
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-02-07T13:59:46.000Z',
          lastActive: '2017-02-09T08:23:40.532Z',
          hasOpenedOneTab: true,
        },
      },
    ]
    expect(getRecruitsActiveForAtLeastOneDay(recruitsEdgesTestB)).toBe(2)

    const recruitsEdgesTestC = []
    expect(getRecruitsActiveForAtLeastOneDay(recruitsEdgesTestC)).toBe(0)

    expect(getRecruitsActiveForAtLeastOneDay(null)).toBe(0)

    const recruitsEdgesTestD = [
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-05-19T13:59:46.000Z',
          lastActive: '2017-05-20T13:59:47.000Z',
          hasOpenedOneTab: true,
        },
      },
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-05-19T13:59:46.000Z',
          lastActive: '2017-05-20T13:59:45.499Z',
          hasOpenedOneTab: true,
        },
      },
    ]
    expect(getRecruitsActiveForAtLeastOneDay(recruitsEdgesTestD)).toBe(1)
  })

  test('getRecruitsWithAtLeastOneTab works as expected', async () => {
    const { getRecruitsWithAtLeastOneTab } = require('../getRecruits')
    const recruitsEdgesTestA = [
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-05-19T13:59:46.000Z',
          lastActive: '2017-12-19T08:23:40.532Z',
          hasOpenedOneTab: true,
        },
      },
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-02-07T13:59:46.000Z',
          lastActive: '2017-02-07T18:00:09.031Z',
          // hasOpenedOneTab: true, // missing field
        },
      },
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-02-07T17:69:46.000Z',
          lastActive: null,
          hasOpenedOneTab: true,
        },
      },
    ]
    expect(getRecruitsWithAtLeastOneTab(recruitsEdgesTestA)).toBe(2)

    const recruitsEdgesTestB = [
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-05-19T13:59:46.000Z',
          lastActive: '2017-12-19T08:23:40.532Z',
          hasOpenedOneTab: true,
        },
      },
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-02-07T13:59:46.000Z',
          lastActive: '2017-02-09T08:23:40.532Z',
          hasOpenedOneTab: false,
        },
      },
    ]
    expect(getRecruitsWithAtLeastOneTab(recruitsEdgesTestB)).toBe(1)

    const recruitsEdgesTestC = []
    expect(getRecruitsWithAtLeastOneTab(recruitsEdgesTestC)).toBe(0)

    expect(getRecruitsWithAtLeastOneTab(null)).toBe(0)

    const recruitsEdgesTestD = [
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-05-19T13:59:46.000Z',
          lastActive: '2017-05-20T13:59:47.000Z',
          hasOpenedOneTab: true,
        },
      },
      {
        cursor: 'abc',
        node: {
          recruitedAt: '2017-05-19T13:59:46.000Z',
          lastActive: '2017-05-20T13:59:45.499Z',
          hasOpenedOneTab: true,
        },
      },
    ]
    expect(getRecruitsWithAtLeastOneTab(recruitsEdgesTestD)).toBe(2)
  })
})
