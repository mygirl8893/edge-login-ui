// @flow

import * as React from 'react'
import { Image, View } from 'react-native'

type Props = {
  small?: boolean,
  style: { image: any, container: any },
  src: any // require(image)
}

class ImageHeaderComponent extends React.Component<Props> {
  render() {
    return (
      <View style={this.props.style.container}>
        <Image source={this.props.src} style={this.props.style.image} />
      </View>
    )
  }
}

export { ImageHeaderComponent }
