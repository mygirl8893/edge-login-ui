import { connect } from 'react-redux'
import LinkedComponent from '../../../components/screens/existingAccout/ChangeAccountPinScreenComponent'
import * as actions from '../../../../common/actions'
// import * as Constants from '../../../../common/constants'
export const mapStateToProps = (state, ownProps) => {
  return {
    styles: ownProps.styles,
    pin: state.create.pin,
    pinError: state.create.pinError,
    workflow: state.workflow,
    showHeader: true,
    showModal: state.create.showModal,
    forgotPasswordModal: true
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changePin: data => dispatch(actions.recoveryChangePIN(data)),
    login: () => dispatch(actions.recoveryLoginComplete())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkedComponent)
