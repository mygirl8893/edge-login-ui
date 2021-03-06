// @flow

import s from '../../common/locales/strings.js'
import * as Constants from '../../constants/index.js'
import { type Dispatch, type RootState } from '../../types/ReduxTypes.js'
import { MyModal } from '../common/index.js'
import { connect } from '../services/ReduxStore.js'

type OwnProps = {
  action(): void
}

const mapStateToProps = (state: RootState) => ({
  headerText: s.strings.send_email_error_header,
  middleText: s.strings.email_error_modal,
  icon: Constants.EXCLAMATION,
  iconType: Constants.MATERIAL_ICONS,
  actionLabel: s.strings.ok,
  hideCancelX: true,
  singleButton: true
})
const mapDispatchToProps = (dispatch: Dispatch) => ({})

export const EmailAppFailedModal = connect<
  $Call<typeof mapStateToProps, RootState>,
  $Call<typeof mapDispatchToProps, Dispatch>,
  OwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(MyModal)
