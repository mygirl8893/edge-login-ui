// @flow

import * as React from 'react'
import { Platform, Text, TouchableOpacity } from 'react-native'
import IonIcon from 'react-native-vector-icons/Ionicons'

const isIos = Platform.OS === 'ios'

type Props = {
  styles: Object,
  label: string,
  onPress(): void
}
class HeaderBackButton extends React.Component<Props> {
  render() {
    const withArrow = true
    const icon = isIos ? 'ios-arrow-back' : 'md-arrow-back'
    const styles = this.props.styles
    return (
      <TouchableOpacity style={styles.backButton} onPress={this.props.onPress}>
        {withArrow && <IonIcon name={icon} style={styles.backIconStyle} />}
        {withArrow && !isIos ? null : (
          <Text style={[styles.sideText]}>{this.props.label}</Text>
        )}
      </TouchableOpacity>
    )
  }
}

export { HeaderBackButton }
