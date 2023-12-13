import React from 'react'
import {StyleProp, TextStyle, View} from 'react-native'
import {observer} from 'mobx-react-lite'
import {AppBskyActorDefs} from '@atproto/api'
import {Button, ButtonType} from '../util/forms/Button'
import * as Toast from '../util/Toast'
import {FollowState} from 'state/models/cache/my-follows'
import {useFollowProfile} from 'lib/hooks/useFollowProfile'

export const SubscribeButton = observer(function SubscribeButtonImpl({
  unsubscribedType = 'inverted',
  subscribedType = 'default',
  profile,
  onToggleSubscribe,
  labelStyle,
}: {
  unsubscribedType?: ButtonType
  subscribedType?: ButtonType
  profile: AppBskyActorDefs.ProfileViewBasic
  onToggleSubscribe?: (v: boolean) => void
  labelStyle?: StyleProp<TextStyle>
}) {
  const {state, following, toggle} = useFollowProfile(profile)

  const onPress = React.useCallback(async () => {
    try {
      const {following} = await toggle()
      onToggleSubscribe?.(following)
    } catch (e: any) {
      Toast.show('An issue occurred, please try again.')
    }
  }, [toggle, onToggleSubscribe])

  if (state === FollowState.Unknown) {
    return <View />
  }

  return (
    <Button
      type={following ? subscribedType : unsubscribedType}
      labelStyle={labelStyle}
      onPress={onPress}
      label={following ? 'Unsubscribe' : 'Subscribe'}
      withLoading={true}
    />
  )
})
