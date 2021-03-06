// @flow

import { type EdgeAccount, type EdgePendingVoucher } from 'edge-core-js'
import * as React from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { cacheStyles } from 'react-native-patina'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

import { submitLogin } from '../../../actions/LoginCompleteActions.js'
import s from '../../../common/locales/strings.js'
import { type Dispatch, type RootState } from '../../../types/ReduxTypes.js'
import { showError } from '../../services/AirshipInstance.js'
import { connect } from '../../services/ReduxStore.js'
import {
  type Theme,
  type ThemeProps,
  withTheme
} from '../../services/ThemeContext.js'
import { PrimaryButton } from '../../themed/ThemedButtons.js'
import { ThemedScene } from '../../themed/ThemedScene.js'

type OwnProps = {}
type StateProps = {
  account: EdgeAccount
}
type DispatchProps = {
  startResecure(account: EdgeAccount): void,
  submitLogin(account: EdgeAccount): void
}
type Props = OwnProps & StateProps & DispatchProps & ThemeProps

type State = {
  needsResecure: boolean,
  otpResetDate: string | void,
  pendingVouchers: EdgePendingVoucher[],
  spinDeny: boolean,
  spinReset: boolean,
  spinVoucher: { [voucherId: string]: boolean }
}

export class SecurityAlertsScreenComponent extends React.Component<
  Props,
  State
> {
  cleanups: Array<() => mixed> | void

  constructor(props: Props) {
    super(props)
    const { otpResetDate, pendingVouchers = [] } = props.account
    this.state = {
      needsResecure: props.account.recoveryLogin,
      otpResetDate,
      pendingVouchers,
      spinDeny: false,
      spinReset: false,
      spinVoucher: {}
    }
  }

  componentDidMount() {
    const { account } = this.props
    this.cleanups = [
      account.watch('otpResetDate', otpResetDate =>
        this.setState({ otpResetDate }, this.checkEmpty)
      ),
      account.watch('pendingVouchers', pendingVouchers =>
        this.setState({ pendingVouchers }, this.checkEmpty)
      )
    ]
  }

  componentWillUnmount() {
    if (this.cleanups != null) this.cleanups.forEach(f => f())
  }

  render() {
    const { theme } = this.props
    const { otpResetDate, pendingVouchers, spinDeny } = this.state
    const styles = getStyles(theme)

    const count = pendingVouchers.length + (otpResetDate != null ? 1 : 0)

    return (
      <ThemedScene>
        <ScrollView style={styles.container}>
          <View style={styles.iconCircle}>
            <FontAwesome
              name="exclamation-triangle"
              size={theme.rem(1)}
              color={theme.primaryText}
            />
          </View>
          <Text style={styles.messageText}>
            {count > 1
              ? s.strings.alert_screen_message_many
              : s.strings.alert_screen_message}
          </Text>
          <Text style={styles.messageText}>
            <Text style={styles.warningColor}>
              {s.strings.alert_screen_warning}
            </Text>
          </Text>
          {this.renderVouchers()}
          {this.renderReset()}
        </ScrollView>
        {spinDeny ? (
          <PrimaryButton marginRem={1} spinner />
        ) : (
          <PrimaryButton
            label={s.strings.alert_screen_deny}
            marginRem={1}
            onPress={this.handleDeny}
          />
        )}
      </ThemedScene>
    )
  }

  renderReset(): React.Node {
    const { theme } = this.props
    const { otpResetDate, spinReset } = this.state
    const styles = getStyles(theme)

    if (otpResetDate == null) return null

    return (
      <View style={styles.tile}>
        <Text style={styles.tileText}>
          {s.strings.alert_screen_reset_message}
        </Text>
        <Text style={styles.tileText}>
          {s.strings.alert_screen_reset_date}
          {otpResetDate.toLocaleString()}
        </Text>
        {spinReset ? (
          <ActivityIndicator
            color={theme.primaryButton}
            style={styles.cardSpinner}
          />
        ) : (
          <TouchableOpacity onPress={this.handleApproveReset}>
            <Text style={styles.cardLink}>
              {s.strings.alert_screen_approve}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  renderVouchers(): React.Node {
    const { theme } = this.props
    const { pendingVouchers, spinVoucher } = this.state
    const styles = getStyles(theme)

    return pendingVouchers.map(voucher => (
      <View style={styles.tile} key={voucher.voucherId}>
        <Text style={styles.tileText}>
          {voucher.deviceDescription != null
            ? s.strings.alert_screen_device + voucher.deviceDescription + '\n'
            : null}
          {s.strings.alert_screen_ip + voucher.ipDescription + '\n'}
          {s.strings.alert_screen_date + voucher.created.toLocaleString()}
        </Text>
        <Text style={styles.tileText}>
          {s.strings.alert_screen_reset_date}
          {voucher.activates.toLocaleString()}
        </Text>
        {spinVoucher[voucher.voucherId] ? (
          <ActivityIndicator
            color={theme.primaryButton}
            style={styles.cardSpinner}
          />
        ) : (
          <TouchableOpacity
            onPress={() => this.handleApproveVoucher(voucher.voucherId)}
          >
            <Text style={styles.cardLink}>
              {s.strings.alert_screen_approve}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    ))
  }

  handleApproveReset = () => {
    const { account } = this.props
    this.setState({ spinReset: true })

    account.disableOtp().catch(error => {
      showError(error)
      this.setState({ spinReset: false })
    })
  }

  handleApproveVoucher = (voucherId: string) => {
    const { account } = this.props
    this.setState(state => ({
      spinVoucher: { ...state.spinVoucher, [voucherId]: true }
    }))

    const { approveVoucher = nopVoucher } = account
    approveVoucher(voucherId).catch(error => {
      showError(error)
      this.setState(state => ({
        spinVoucher: { ...state.spinVoucher, [voucherId]: false }
      }))
    })
  }

  handleDeny = () => {
    const { account } = this.props
    const { otpResetDate, pendingVouchers } = this.state
    this.setState({ needsResecure: true, spinDeny: true })

    const { rejectVoucher = nopVoucher } = account
    const promises = pendingVouchers.map(voucher =>
      rejectVoucher(voucher.voucherId)
    )
    if (otpResetDate != null) {
      promises.push(account.cancelOtpReset())
    }

    Promise.all(promises).catch(error => {
      showError(error)
      this.setState({ spinDeny: false })
    })
  }

  checkEmpty = () => {
    const { account } = this.props
    const { needsResecure, otpResetDate, pendingVouchers } = this.state

    if (otpResetDate == null && pendingVouchers.length <= 0) {
      if (needsResecure) this.props.startResecure(account)
      else this.props.submitLogin(account)
    }
  }
}

function nopVoucher(voucherId: string): Promise<void> {
  return Promise.resolve()
}

const iconRem = 2

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    flex: 1,
    padding: theme.rem(0.5)
  },
  iconCircle: {
    alignSelf: 'center',
    margin: theme.rem(0.5),
    height: theme.rem(iconRem),
    width: theme.rem(iconRem),

    // Visuals:
    backgroundColor: theme.securityAlertModalHeaderCircle,
    borderRadius: theme.rem(iconRem / 2),

    // Children:
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  messageText: {
    color: theme.primaryText,
    fontFamily: theme.fontFamily,
    fontSize: theme.rem(1),
    margin: theme.rem(0.5),
    textAlign: 'left'
  },
  tile: {
    backgroundColor: theme.tileBackground,
    borderRadius: theme.rem(0.5),
    margin: theme.rem(0.5),
    padding: theme.rem(0.5)
  },
  tileText: {
    color: theme.primaryText,
    fontFamily: theme.fontFamily,
    fontSize: theme.rem(1),
    margin: theme.rem(0.5),
    textAlign: 'left'
  },
  cardLink: {
    color: theme.linkText,
    fontFamily: theme.fontFamily,
    fontSize: theme.rem(1),
    lineHeight: theme.rem(1.5),
    margin: theme.rem(0.5),
    textAlign: 'right'
  },
  cardSpinner: {
    alignSelf: 'flex-end',
    height: theme.rem(1.5),
    margin: theme.rem(0.5)
  },
  warningColor: {
    color: theme.dangerText
  }
}))

export const SecurityAlertsScreen = withTheme(
  connect<StateProps, DispatchProps, OwnProps & ThemeProps>(
    (state: RootState) => ({
      account: state.login.account
    }),
    (dispatch: Dispatch) => ({
      startResecure(account) {
        dispatch({ type: 'START_RESECURE', data: account })
      },
      submitLogin(account) {
        dispatch(submitLogin(account))
      }
    })
  )(SecurityAlertsScreenComponent)
)
