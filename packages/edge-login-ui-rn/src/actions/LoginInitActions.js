// @flow

import { type EdgeLoginMessages } from 'edge-core-js'
import * as React from 'react'

import { SecurityAlertsModal } from '../components/modals/SecurityAlertsModal.js'
import { Airship } from '../components/services/AirshipInstance.js'
import { getSupportedBiometryType } from '../keychain.js'
import {
  type Dispatch,
  type GetState,
  type Imports
} from '../types/ReduxTypes.js'
import { getPreviousUsers } from './PreviousUsersActions.js'

/**
 * Fires off all the things we need to do to get the login scene up & running.
 */
export const initializeLogin = () => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const touchPromise = dispatch(getTouchMode())
  const usersPromise = dispatch(getPreviousUsers())
  dispatch(checkSecurityMessages()).catch(error => console.log(error))

  await Promise.all([touchPromise, usersPromise])
  const state = getState()

  // Loading is done, so send the user to the initial route:
  const { previousUsers, touch } = state
  const { startupUser } = previousUsers

  if (imports.recoveryKey) {
    dispatch({
      type: 'SET_RECOVERY_KEY',
      data: imports.recoveryKey
    })
  } else if (startupUser == null) {
    dispatch({ type: 'WORKFLOW_START', data: 'landingWF' })
  } else if (
    startupUser.pinEnabled ||
    (startupUser.touchEnabled && touch !== 'none')
  ) {
    dispatch({ type: 'WORKFLOW_START', data: 'pinWF' })
  } else {
    dispatch({ type: 'WORKFLOW_START', data: 'passwordWF' })
  }
}

const checkSecurityMessages = () => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const { context } = imports
  const messages = await context.fetchLoginMessages()

  const relevantMessages: EdgeLoginMessages = {}
  for (const username of Object.keys(messages)) {
    const message = messages[username]

    // Skip users who haven't fully logged in:
    const info = context.localUsers.find(info => info.username === username)
    if (info == null || !info.keyLoginEnabled) continue

    const { otpResetPending, pendingVouchers = [] } = message
    if (otpResetPending || pendingVouchers.length > 0) {
      relevantMessages[username] = message
    }
  }

  if (Object.keys(relevantMessages).length > 0) {
    Airship.show(bridge => (
      <SecurityAlertsModal
        bridge={bridge}
        messages={relevantMessages}
        selectUser={username =>
          dispatch({ type: 'AUTH_UPDATE_USERNAME', data: username })
        }
      />
    ))
  }
}

/**
 * Figures out whether or not biometric logins are available.
 */
const getTouchMode = () => async (dispatch: Dispatch, getState: GetState) => {
  try {
    const touch = await getSupportedBiometryType()
    switch (touch) {
      case 'FaceID':
      case 'TouchID':
        return dispatch({ type: 'SET_TOUCH', data: touch })
      case 'Fingerprint':
        return dispatch({ type: 'SET_TOUCH', data: 'TouchID' })
      default:
        return dispatch({
          type: 'SET_TOUCH',
          data: touch ? 'TouchID' : false
        })
    }
  } catch (error) {
    console.log(error)
    return dispatch({ type: 'SET_TOUCH', data: false })
  }
}
