import React from 'react'

import * as Dialog from '#/components/Dialog'

type Control = Dialog.DialogOuterProps['control']

type ControlsContext = {
  mutedWordsDialogControl: Control
  signinDialogControl: Control
  subscriptionSettingsDialogControl: Control
}

const ControlsContext = React.createContext({
  mutedWordsDialogControl: {} as Control,
  signinDialogControl: {} as Control,
  subscriptionSettingsDialogControl: {} as Control,
})

export function useGlobalDialogsControlContext() {
  return React.useContext(ControlsContext)
}

export function Provider({children}: React.PropsWithChildren<{}>) {
  const mutedWordsDialogControl = Dialog.useDialogControl()
  const signinDialogControl = Dialog.useDialogControl()
  const subscriptionSettingsDialogControl = Dialog.useDialogControl()
  const ctx = React.useMemo<ControlsContext>(
    () => ({
      mutedWordsDialogControl,
      signinDialogControl,
      subscriptionSettingsDialogControl,
    }),
    [
      mutedWordsDialogControl,
      signinDialogControl,
      subscriptionSettingsDialogControl,
    ],
  )

  return (
    <ControlsContext.Provider value={ctx}>{children}</ControlsContext.Provider>
  )
}
