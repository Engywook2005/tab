/* eslint-env jest */

import React from 'react'
import { mount, shallow } from 'enzyme'
import toJson from 'enzyme-to-json'
import { logout, sendVerificationEmail } from 'js/authentication/user'
import { goTo, loginURL } from 'js/navigation/navigation'

jest.mock('js/authentication/user')
jest.mock('js/navigation/navigation')

describe('VerifyEmailMessage tests', function() {
  it('renders without error', function() {
    const VerifyEmailMessage = require('js/components/Authentication/VerifyEmailMessage')
      .default
    shallow(<VerifyEmailMessage />)
  })

  it('restarts the auth flow when clicking cancel button', done => {
    const VerifyEmailMessage = require('js/components/Authentication/VerifyEmailMessage')
      .default
    const wrapper = mount(<VerifyEmailMessage />)
    const button = wrapper
      .find('[data-test-id="verify-email-message-cancel-button"]')
      .first()
    button.simulate('click')

    // Dealing with async methods triggered by `simulate`:
    // https://stackoverflow.com/a/43855794/1332513
    setImmediate(() => {
      expect(logout).toHaveBeenCalled()
      expect(goTo).toHaveBeenCalledWith(loginURL, null, { keepURLParams: true })
      done()
    })
  })

  it('the "resend email" button calls to send a new verification email', done => {
    const VerifyEmailMessage = require('js/components/Authentication/VerifyEmailMessage')
      .default
    const wrapper = mount(<VerifyEmailMessage />)
    const button = wrapper
      .find('[data-test-id="verify-email-message-resend-button"]')
      .last()
    button.simulate('click')

    setImmediate(() => {
      expect(sendVerificationEmail).toHaveBeenCalled()
      done()
    })
  })

  it('matches expected snapshot', function() {
    const VerifyEmailMessage = require('js/components/Authentication/VerifyEmailMessage')
      .default
    const wrapper = shallow(<VerifyEmailMessage />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })
})
