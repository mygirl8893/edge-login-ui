// @flow

import * as React from 'react'
import { Image, Text, View } from 'react-native'

import { LOGO_DOT } from '../../assets/'
import s from '../../common/locales/strings.js'
import { Button } from '../common/Button.js'

type Props = {
  style: any,
  cancelFunc(): void
}

class ChangePasswordModalComponent extends React.Component<Props> {
  render() {
    const Style = this.props.style
    return (
      <View style={Style.container}>
        <View style={Style.backgroundContainer}>
          <View style={Style.backgroundBox} />
        </View>
        <View style={Style.foreground}>
          <View style={Style.logoContainer}>
            <Image source={LOGO_DOT} />
          </View>
          <View style={Style.headlineContainer}>
            <Text style={Style.headlineText}>{s.strings.password_changed}</Text>
          </View>
          <View style={Style.textContainer}>
            <Text style={Style.copyText}>
              {s.strings.password_successfully_changed}
            </Text>
          </View>
          <View style={Style.buttonsContainer}>
            <Button
              onPress={this.onSkipPress}
              downStyle={Style.skipButton.downStyle}
              downTextStyle={Style.skipButton.downTextStyle}
              upStyle={Style.skipButton.upStyle}
              upTextStyle={Style.skipButton.upTextStyle}
              label="OK"
            />
          </View>
        </View>
      </View>
    )
  }

  onSkipPress = () => {
    this.props.cancelFunc()
  }
}

export { ChangePasswordModalComponent }
