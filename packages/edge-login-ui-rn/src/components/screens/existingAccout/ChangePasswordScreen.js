// @flow

import { type EdgePasswordRules } from 'edge-core-js'
import * as React from 'react'
import { KeyboardAvoidingView, View } from 'react-native'

import {
  changePassword,
  recoveryChangePassword
} from '../../../actions/ChangePasswordPinActions.js'
import { validateConfirmPassword } from '../../../actions/CreateAccountActions.js'
import { cancel } from '../../../actions/WorkflowActions.js'
import s from '../../../common/locales/strings.js'
import PasswordConfirmConnector from '../../../connectors/componentConnectors/PasswordConfirmConnector'
import PasswordConnector from '../../../connectors/componentConnectors/PasswordConnector.js'
import * as Styles from '../../../styles/index.js'
import { type Dispatch, type RootState } from '../../../types/ReduxTypes.js'
import { scale } from '../../../util/scaling.js'
import { PasswordStatus } from '../../abSpecific/PasswordStatusComponent.js'
import { Button } from '../../common/Button.js'
import { Header } from '../../common/Header.js'
import SafeAreaView from '../../common/SafeAreaViewGradient.js'
import { ChangePasswordModal } from '../../modals/ChangePasswordModal.js'
import { connect } from '../../services/ReduxStore.js'

type OwnProps = {
  showHeader?: boolean
}
type StateProps = {
  confirmPassword: string,
  error?: string,
  error2?: string,
  password: string,
  passwordStatus: EdgePasswordRules | null,
  showModal: boolean
}
type DispatchProps = {
  checkTheConfirmPassword(): void,
  changePassword(string): void,
  onBack?: () => void,
  onSkip?: () => void
}
type Props = OwnProps & StateProps & DispatchProps

type State = {
  focusFirst: boolean,
  focusSecond: boolean,
  isProcessing: boolean
}

class ChangePasswordScreenComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      isProcessing: false,
      focusFirst: true,
      focusSecond: false
    }
  }

  onSetNextFocus = () => {
    this.setState({
      focusFirst: false,
      focusSecond: true
    })
  }

  onNextPress = () => {
    this.setState({
      isProcessing: true
    })
    if (!this.props.passwordStatus) {
      // TODO Skip component
      this.setState({
        isProcessing: false
      })
      return
    }
    if (this.props.error !== '' || this.props.error2 !== '') {
      this.setState({
        isProcessing: false
      })
      return
    }
    if (
      this.props.password &&
      this.props.password !== this.props.confirmPassword
    ) {
      this.setState({
        isProcessing: false
      })
      this.props.checkTheConfirmPassword()
      return
    }
    this.props.changePassword(this.props.password)
  }

  renderHeader = () => {
    if (this.props.showHeader) {
      return <Header onBack={this.props.onBack} onSkip={this.props.onSkip} />
    }
    return null
  }

  renderInterior = (styles: typeof NewAccountPasswordScreenStyle) => {
    return (
      <View style={styles.innerView}>
        <PasswordStatus style={styles.status} />
        <PasswordConnector
          style={styles.inputBox}
          autoFocus={this.state.focusFirst}
          label={s.strings.new_password}
          onFinish={this.onSetNextFocus}
        />
        <View style={{ height: scale(20) }} />
        <PasswordConfirmConnector
          style={styles.inputBox}
          label={s.strings.re_enter_new_password}
          isSelected={this.state.focusSecond}
          autoFocus={this.state.focusSecond}
          onFinish={this.onNextPress}
        />
        <View style={{ height: scale(40) }} />
        <Button
          onPress={this.onNextPress}
          downStyle={styles.nextButton.downStyle}
          downTextStyle={styles.nextButton.downTextStyle}
          upStyle={styles.nextButton.upStyle}
          upTextStyle={styles.nextButton.upTextStyle}
          label={s.strings.done}
          isThinking={this.state.isProcessing}
          doesThink
        />
      </View>
    )
  }

  renderMain = (styles: typeof NewAccountPasswordScreenStyle) => {
    if (this.state.focusSecond) {
      return (
        <KeyboardAvoidingView
          style={styles.pageContainer}
          contentContainerStyle={styles.pageContainer}
          behavior="position"
          keyboardVerticalOffset={-150}
        >
          {this.renderInterior(styles)}
        </KeyboardAvoidingView>
      )
    }
    return (
      <View style={styles.pageContainer}>{this.renderInterior(styles)}</View>
    )
  }

  renderModal = (style: typeof NewAccountPasswordScreenStyle) => {
    if (this.props.showModal) {
      return <ChangePasswordModal style={style.modal.skip} />
    }
    return null
  }

  render() {
    return (
      <SafeAreaView>
        <View style={NewAccountPasswordScreenStyle.screen}>
          {this.renderHeader()}
          {this.renderMain(NewAccountPasswordScreenStyle)}
          {this.renderModal(NewAccountPasswordScreenStyle)}
        </View>
      </SafeAreaView>
    )
  }
}

const NewAccountPasswordScreenStyle = {
  screen: { ...Styles.ScreenStyle },
  pageContainer: {
    ...Styles.PageContainerWithHeaderStyle,
    alignItems: 'center',
    flex: 1
  },
  innerView: { ...Styles.InnerView, alignItems: 'center' },
  status: {
    ...Styles.PasswordStatusScaledStyle,
    checkboxContainer: {
      ...Styles.PasswordStatusScaledStyle.checkboxContainer,
      height: scale(16)
    }
  },
  nextButton: {
    upStyle: Styles.PrimaryButtonUpScaledStyle,
    upTextStyle: Styles.PrimaryButtonUpTextScaledStyle,
    downTextStyle: Styles.PrimaryButtonUpTextScaledStyle,
    downStyle: Styles.PrimaryButtonDownScaledStyle
  },
  inputBox: {
    ...Styles.MaterialInputOnWhiteScaled,
    marginTop: scale(15)
  },
  modal: Styles.SkipModalStyle
}

export const PublicChangePasswordScreen = connect<
  StateProps,
  DispatchProps,
  OwnProps
>(
  (state: RootState) => ({
    confirmPassword: state.create.confirmPassword || '',
    error: state.create.confirmPasswordErrorMessage || '',
    error2: state.create.createPasswordErrorMessage || '',
    password: state.create.password || '',
    passwordStatus: state.create.passwordStatus,
    showModal: state.create.showModal
  }),
  (dispatch: Dispatch) => ({
    checkTheConfirmPassword() {
      dispatch(validateConfirmPassword())
    },
    changePassword(data: string) {
      dispatch(changePassword(data))
    },
    onBack() {
      dispatch(cancel())
    }
  })
)(ChangePasswordScreenComponent)

export const ResecurePasswordScreen = connect<
  StateProps,
  DispatchProps,
  OwnProps
>(
  (state: RootState) => ({
    confirmPassword: state.create.confirmPassword || '',
    error: state.create.confirmPasswordErrorMessage || '',
    error2: state.create.createPasswordErrorMessage || '',
    password: state.create.password || '',
    passwordStatus: state.create.passwordStatus,
    showHeader: true,
    showModal: state.create.showModal
  }),
  (dispatch: Dispatch) => ({
    checkTheConfirmPassword() {
      dispatch(validateConfirmPassword())
    },
    changePassword(data: string) {
      dispatch(recoveryChangePassword(data))
    },
    onSkip() {
      dispatch(dispatch({ type: 'WORKFLOW_NEXT' }))
    }
  })
)(ChangePasswordScreenComponent)
