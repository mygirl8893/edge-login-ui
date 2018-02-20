import React, { Component } from 'react'
import { connect } from 'react-redux'

import Username from './Username/Username.js'
import PinNumber from './PinNumber/PinNumber.js'
import Password from './Password/Password.js'
import ReviewDetails from './ReviewDetails/ReviewDetails.js'

class Container extends Component {
  render () {
    switch (this.props.page) {
      case 'username':
        return <Username {...this.props} />
      case 'pin':
        return <PinNumber {...this.props} />
      case 'password':
        return <Password {...this.props} />
      case 'review':
        return <ReviewDetails {...this.props} />
      default:
        return <Username {...this.props} />
    }
  }
}

export default connect(state => ({
  page: state.signupPage
}))(Container)
