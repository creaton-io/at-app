import React, {useRef} from 'react'
import {View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import * as EmailValidator from 'email-validator'

import {logEvent} from '#/lib/statsig/statsig'
import {logger} from '#/logger'
import {ScreenTransition} from '#/screens/Login/ScreenTransition'
import {is13, is18, useSignupContext} from '#/screens/Signup/state'
import {Policies} from '#/screens/Signup/StepInfo/Policies'
import {atoms as a} from '#/alf'
import * as DateField from '#/components/forms/DateField'
import {FormError} from '#/components/forms/FormError'
import {HostingProvider} from '#/components/forms/HostingProvider'
import * as TextField from '#/components/forms/TextField'
import {Envelope_Stroke2_Corner0_Rounded as Envelope} from '#/components/icons/Envelope'
import {Ticket_Stroke2_Corner0_Rounded as Ticket} from '#/components/icons/Ticket'
import {Zap_Stroke2_Corner0_Rounded as Zap} from '#/components/icons/Zap'
import {Loader} from '#/components/Loader'
import {BackNextButtons} from '../BackNextButtons'

function sanitizeDate(date: Date): Date {
  if (!date || date.toString() === 'Invalid Date') {
    logger.error(`Create account: handled invalid date for birthDate`, {
      hasDate: !!date,
    })
    return new Date()
  }
  return date
}

export function StepInfo({
  onPressBack,
  isServerError,
  refetchServer,
  isLoadingStarterPack,
}: {
  onPressBack: () => void
  isServerError: boolean
  refetchServer: () => void
  isLoadingStarterPack: boolean
}) {
  const {_} = useLingui()
  const {state, dispatch} = useSignupContext()

  const inviteCodeValueRef = useRef<string>(state.inviteCode)
  const emailValueRef = useRef<string>(state.email)
  const ethAddressValueRef = useRef<string>(state.ethAddress)

  const onNextPress = React.useCallback(async () => {
    const inviteCode = inviteCodeValueRef.current
    const email = emailValueRef.current
    const ethAddress = ethAddressValueRef.current

    if (!is13(state.dateOfBirth)) {
      return
    }

    if (state.serviceDescription?.inviteCodeRequired && !inviteCode) {
      return dispatch({
        type: 'setError',
        value: _(msg`Please enter your invite code.`),
      })
    }
    if (!email) {
      return dispatch({
        type: 'setError',
        value: _(msg`Please enter your email.`),
      })
    }
    if (!EmailValidator.validate(email)) {
      return dispatch({
        type: 'setError',
        value: _(msg`Your email appears to be invalid.`),
      })
    }
    if (!ethAddress) {
      return dispatch({
        type: 'setError',
        value: _(msg`Please put in an Ethereum Address.`),
      })
    }

    dispatch({type: 'setInviteCode', value: inviteCode})
    dispatch({type: 'setEmail', value: email})
    dispatch({type: 'setEthAddress', value: ethAddress})
    dispatch({type: 'next'})
    logEvent('signup:nextPressed', {
      activeStep: state.activeStep,
    })
  }, [
    _,
    dispatch,
    state.activeStep,
    state.dateOfBirth,
    state.serviceDescription?.inviteCodeRequired,
  ])

  return (
    <ScreenTransition>
      <View style={[a.gap_md]}>
        <FormError error={state.error} />
        <View>
          <TextField.LabelText>
            <Trans>Hosting provider</Trans>
          </TextField.LabelText>
          <HostingProvider
            serviceUrl={state.serviceUrl}
            onSelectServiceUrl={v =>
              dispatch({type: 'setServiceUrl', value: v})
            }
          />
        </View>
        {state.isLoading || isLoadingStarterPack ? (
          <View style={[a.align_center]}>
            <Loader size="xl" />
          </View>
        ) : state.serviceDescription ? (
          <>
            {state.serviceDescription.inviteCodeRequired && (
              <View>
                <TextField.LabelText>
                  <Trans>Invite code</Trans>
                </TextField.LabelText>
                <TextField.Root>
                  <TextField.Icon icon={Ticket} />
                  <TextField.Input
                    onChangeText={value => {
                      inviteCodeValueRef.current = value.trim()
                    }}
                    label={_(msg`Required for this provider`)}
                    defaultValue={state.inviteCode}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                  />
                </TextField.Root>
              </View>
            )}
            <View>
              <TextField.LabelText>
                <Trans>Email</Trans>
              </TextField.LabelText>
              <TextField.Root>
                <TextField.Icon icon={Envelope} />
                <TextField.Input
                  testID="emailInput"
                  onChangeText={value => {
                    emailValueRef.current = value.trim()
                  }}
                  label={_(msg`Enter your email address`)}
                  defaultValue={state.email}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                />
              </TextField.Root>
            </View>
            <View>
              <TextField.LabelText>
                <Trans>Ethereum Address</Trans>
              </TextField.LabelText>
              <TextField.Root>
                <TextField.Icon icon={Zap} />
                <TextField.Input
                  testID="ethAddressInput"
                  onChangeText={value => {
                    ethAddressValueRef.current = value
                  }}
                  label={_(msg`Put in your Ethereum Address`)}
                  defaultValue={state.ethAddress}
                  autoComplete="additional-name"
                />
              </TextField.Root>
            </View>
            <View>
              <DateField.LabelText>
                <Trans>Your birth date</Trans>
              </DateField.LabelText>
              <DateField.DateField
                testID="date"
                value={DateField.utils.toSimpleDateString(state.dateOfBirth)}
                onChangeDate={date => {
                  dispatch({
                    type: 'setDateOfBirth',
                    value: sanitizeDate(new Date(date)),
                  })
                }}
                label={_(msg`Date of birth`)}
                accessibilityHint={_(msg`Select your date of birth`)}
              />
            </View>
            <Policies
              serviceDescription={state.serviceDescription}
              needsGuardian={!is18(state.dateOfBirth)}
              under13={!is13(state.dateOfBirth)}
            />
          </>
        ) : undefined}
      </View>
      <BackNextButtons
        hideNext={!is13(state.dateOfBirth)}
        showRetry={isServerError}
        isLoading={state.isLoading}
        onBackPress={onPressBack}
        onNextPress={onNextPress}
        onRetryPress={refetchServer}
      />
    </ScreenTransition>
  )
}
