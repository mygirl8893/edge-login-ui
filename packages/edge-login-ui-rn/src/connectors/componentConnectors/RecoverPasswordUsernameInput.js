// @flow

import s from '../../common/locales/strings.js'
import { FormField } from '../../components/common/index.js'
import { connect } from '../../components/services/ReduxStore.js'
import { type Dispatch, type RootState } from '../../types/ReduxTypes.js'

type OwnProps = {
  onSubmitEditing(): void
}

const mapStateToProps = (state: RootState) => ({
  value: state.login.username,
  label: s.strings.username,
  error: state.passwordRecovery.recoveryErrorMessage,
  returnKeyType: 'go',
  forceFocus: true
})
const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) => ({
  onChangeText: (data: string) =>
    dispatch({ type: 'AUTH_UPDATE_USERNAME', data: data }),
  onSubmitEditing: ownProps.onSubmitEditing
})

export const RecoverPasswordUsernameInput = connect<
  $Call<typeof mapStateToProps, RootState>,
  $Call<typeof mapDispatchToProps, Dispatch, OwnProps>,
  OwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(FormField)
