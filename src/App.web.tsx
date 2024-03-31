import 'lib/sentry' // must be near top
import 'view/icons'

import React, {useEffect, useState} from 'react'
import {RootSiblingParent} from 'react-native-root-siblings'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client'
import {createWeb3Modal, defaultWagmiConfig} from '@web3modal/wagmi/react'
import {mainnet, polygonMumbai} from 'viem/chains'
import {WagmiConfig} from 'wagmi'

import {Provider as StatsigProvider} from '#/lib/statsig/statsig'
import {init as initPersistedState} from '#/state/persisted'
import * as persisted from '#/state/persisted'
import {Provider as LabelDefsProvider} from '#/state/preferences/label-defs'
import {useIntentHandler} from 'lib/hooks/useIntentHandler'
import {
  asyncStoragePersister,
  dehydrateOptions,
  queryClient,
} from 'lib/react-query'
import {ThemeProvider} from 'lib/ThemeContext'
import {Provider as DialogStateProvider} from 'state/dialogs'
import {Provider as InvitesStateProvider} from 'state/invites'
import {Provider as LightboxStateProvider} from 'state/lightbox'
import {Provider as ModalStateProvider} from 'state/modals'
import {Provider as MutedThreadsProvider} from 'state/muted-threads'
import {Provider as PrefsStateProvider} from 'state/preferences'
import {Provider as UnreadNotifsProvider} from 'state/queries/notifications/unread'
import {
  Provider as SessionProvider,
  useSession,
  useSessionApi,
} from 'state/session'
import {Provider as ShellStateProvider} from 'state/shell'
import {Provider as LoggedOutViewProvider} from 'state/shell/logged-out'
import {Provider as SelectedFeedProvider} from 'state/shell/selected-feed'
import {ToastContainer} from 'view/com/util/Toast.web'
import {Shell} from 'view/shell/index'
import {ThemeProvider as Alf} from '#/alf'
import {useColorModeTheme} from '#/alf/util/useColorModeTheme'
import {Provider as PortalProvider} from '#/components/Portal'
import I18nProvider from './locale/i18nProvider'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'cfc0e32a6ba39613abc4432c1089498b'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

const chains = [mainnet, polygonMumbai]
const wagmiConfig = defaultWagmiConfig({chains, projectId, metadata})

// 3. Create modal
createWeb3Modal({wagmiConfig, projectId, chains})

function InnerApp() {
  const {isInitialLoad, currentAccount} = useSession()
  const {resumeSession} = useSessionApi()
  const theme = useColorModeTheme()
  useIntentHandler()

  // init
  useEffect(() => {
    const account = persisted.get('session').currentAccount
    resumeSession(account)
  }, [resumeSession])

  // wait for session to resume
  if (isInitialLoad) return null

  return (
    <Alf theme={theme}>
      <React.Fragment
        // Resets the entire tree below when it changes:
        key={currentAccount?.did}>
        <StatsigProvider>
          <LabelDefsProvider>
            <LoggedOutViewProvider>
              <SelectedFeedProvider>
                <UnreadNotifsProvider>
                  <ThemeProvider theme={theme}>
                    {/* All components should be within this provider */}
                    <RootSiblingParent>
                      <SafeAreaProvider>
                        <Shell />
                      </SafeAreaProvider>
                    </RootSiblingParent>
                    <ToastContainer />
                  </ThemeProvider>
                </UnreadNotifsProvider>
              </SelectedFeedProvider>
            </LoggedOutViewProvider>
          </LabelDefsProvider>
        </StatsigProvider>
      </React.Fragment>
    </Alf>
  )
}

function App() {
  const [isReady, setReady] = useState(false)

  React.useEffect(() => {
    initPersistedState().then(() => setReady(true))
  }, [])

  if (!isReady) {
    return null
  }

  /*
   * NOTE: only nothing here can depend on other data or session state, since
   * that is set up in the InnerApp component above.
   */
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{persister: asyncStoragePersister, dehydrateOptions}}>
      <SessionProvider>
        <ShellStateProvider>
          <PrefsStateProvider>
            <MutedThreadsProvider>
              <InvitesStateProvider>
                <ModalStateProvider>
                  <DialogStateProvider>
                    <LightboxStateProvider>
                      <I18nProvider>
                        <PortalProvider>
                          <WagmiConfig config={wagmiConfig}>
                            <InnerApp />
                          </WagmiConfig>
                        </PortalProvider>
                      </I18nProvider>
                    </LightboxStateProvider>
                  </DialogStateProvider>
                </ModalStateProvider>
              </InvitesStateProvider>
            </MutedThreadsProvider>
          </PrefsStateProvider>
        </ShellStateProvider>
      </SessionProvider>
    </PersistQueryClientProvider>
  )
}

export default App
