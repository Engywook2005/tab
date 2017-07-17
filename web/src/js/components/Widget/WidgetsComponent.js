import React from 'react'
import WidgetIcon from './WidgetIconContainer'
import Widget from './WidgetContainer'
import PropTypes from 'prop-types'

import CenteredWidgetsContainer from 'general/CenteredWidgetsContainer'
import SetUserActiveWidgetMutation from 'mutations/SetUserActiveWidgetMutation'

class Widgets extends React.Component {
  onWidgetIconClicked (widget) {
    const { user } = this.props

    if (user.activeWidget === widget.id) {
      widget = {
        id: 'no-active-widget'
      }
    }

    SetUserActiveWidgetMutation.commit(
      this.props.relay.environment,
      user,
      widget
    )
  }

  render () {
    const { user } = this.props

    const widgetsContainer = {
      position: 'absolute',
      top: 5,
      display: 'flex',
      justifyContent: 'flex-start'
    }

    const separator = {
      width: 5
    }

    return (
      <div>
        <div style={widgetsContainer}>
          <div style={separator} />
          {user.widgets.edges.map((edge, index) => {
            return (<WidgetIcon
              key={index}
              widget={edge.node}
              active={user.activeWidget && edge.node.id === user.activeWidget}
              onWidgetIconClicked={this.onWidgetIconClicked.bind(this)} />)
          })}
        </div>
        <CenteredWidgetsContainer>
          {user.widgets.edges.map((edge, index) => {
            if (edge.node.type === 'clock' ||
                  edge.node.type === 'search') {
              return (
                <Widget
                  key={index}
                  user={user}
                  widget={edge.node} />
              )
            }
          })}
        </CenteredWidgetsContainer>
        {user.widgets.edges.map((edge, index) => {
          if (user.activeWidget &&
                edge.node.id === user.activeWidget) {
            return (
              <Widget
                key={index}
                user={user}
                widget={edge.node} />
            )
          }
        })}
      </div>
    )
  }
}

Widgets.propTypes = {
  user: PropTypes.object.isRequired
}

export default Widgets
