/* eslint-disable jsx-a11y/href-no-hash */
import React from 'react'
import VcUser from '../User/VcUserView'
import MoneyRaised from '../MoneyRaised/MoneyRaisedView'
import UserBackgroundImage from '../User/UserBackgroundImageView'
import WidgetsView from '../Widget/WidgetsView'
import InviteFriend from '../InviteFriend/InviteFriendView'
import Ad from '../Ad/Ad'

// import { FormattedMessage } from 'react-intl'
import { goToSettings, goToDonate } from 'navigation/navigation'

import FadeInAnimation from 'general/FadeInAnimation'

import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'

import {
  grey300
} from 'material-ui/styles/colors'

class Dashboard extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      bkgSelectorOpened: false,
      donateDialogOpened: false
    }
  }

  _goToSettings () {
    goToSettings()
  }

  _goToDonate () {
    goToDonate()
  }

  changeBkgSelectorState (state) {
    this.setState({
      bkgSelectorOpened: state
    })
  }

  changeDonateDialogState (state) {
    this.setState({
      donateDialogOpened: state
    })
  }

  render () {
    const content = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 'auto',
      backgroundColor: 'rgba(0,0,0,.2)'
    }

    const topRightItems = {
      main: {
        position: 'absolute',
        top: 0,
        right: 0,
        display: 'flex',
        zIndex: 2147483647
      },
      leftContainer: {
        padding: 5
      },
      rightContainer: {
        marginLeft: 5,
        display: 'flex',
        flexDirection: 'column'
      }
    }

    return (
      <FadeInAnimation>
        <div
          data-test-id={'app-dashboard-id'}
          key={'dashboard-key'}>
          <UserBackgroundImage />
          <div style={content}>
            <div style={topRightItems.main}>
              <div style={topRightItems.leftContainer}>
                <MoneyRaised />
                <VcUser />
              </div>
              <div style={topRightItems.rightContainer}>
                <IconButton
                  tooltip='Settings'
                  tooltipPosition='bottom-left'
                  onClick={this._goToSettings.bind(this)}>
                  <FontIcon
                    color={grey300}
                    hoverColor={'#FFF'}
                    className='fa fa-cog fa-lg' />
                </IconButton>

                <IconButton
                  tooltip='Donate'
                  tooltipPosition='top-left'
                  onClick={this._goToDonate.bind(this)}>
                  <FontIcon
                    color={grey300}
                    hoverColor={'#FFF'}
                    className='fa fa-heart fa-lg' />
                </IconButton>
                <InviteFriend />
              </div>
            </div>
          </div>
          <WidgetsView />
          <Ad
            adId='div-gpt-ad-1464385742501-0'
            adSlotId='/43865596/HBTR'
            width={300}
            height={250}
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              display: 'block'
            }} />
          <Ad
            adId='div-gpt-ad-1464385677836-0'
            adSlotId='/43865596/HBTL'
            width={728}
            height={90}
            style={{
              position: 'absolute',
              bottom: 10,
              right: 320,
              display: 'block'
            }} />
        </div>
      </FadeInAnimation>
    )
  }
}

// <h1>
//   <FormattedMessage
//     id={'app.quote'}
//     defaultMessage={'“Surf the web, save the world.”'} />
// </h1>

export default Dashboard
