import {AppBskyActorDefs, AtUri} from '@atproto/api'
import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'

import {STALE} from '#/state/queries'
import {useAgent} from '#/state/session'
import {profileBasicQueryKey as RQKEY_PROFILE_BASIC} from './profile'

const RQKEY_ROOT = 'resolved-did'
export const RQKEY = (didOrHandle: string) => [RQKEY_ROOT, didOrHandle]

type UriUseQueryResult = UseQueryResult<{did: string; uri: string}, Error>
export function useResolveUriQuery(uri: string | undefined): UriUseQueryResult {
  const urip = new AtUri(uri || '')
  const res = useResolveDidQuery(urip.host)
  if (res.data) {
    urip.host = res.data
    return {
      ...res,
      data: {did: urip.host, uri: urip.toString()},
    } as UriUseQueryResult
  }
  return res as UriUseQueryResult
}

export function useResolveDidQuery(didOrHandle: string | undefined) {
  const queryClient = useQueryClient()
  const agent = useAgent()

  return useQuery<string, Error>({
    staleTime: STALE.HOURS.ONE,
    queryKey: RQKEY(didOrHandle ?? ''),
    queryFn: async () => {
      if (!didOrHandle) return ''
      // Just return the did if it's already one
      if (didOrHandle.startsWith('did:')) return didOrHandle

      const res = await agent.resolveHandle({handle: didOrHandle})
      return res.data.did
    },
    initialData: () => {
      // Return undefined if no did or handle
      if (!didOrHandle) return

      const profile =
        queryClient.getQueryData<AppBskyActorDefs.ProfileViewBasic>(
          RQKEY_PROFILE_BASIC(didOrHandle),
        )
      return profile?.did
    },
    enabled: !!didOrHandle,
  })
}

export function useResolveDidDocQuery(did: any | undefined) {
  const queryClient = useQueryClient()

  return useQuery<any, Error>({
    staleTime: STALE.HOURS.ONE,
    queryKey: RQKEY(did ?? ''),
    queryFn: async () => {
      if (!did) return ''

      const url = 'https://plc.directory/'
      try {
        const response = await fetch(url + did)
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`)
        }

        const json = await response.json()
        console.log(json)
        return json
      } catch (error) {
        console.error("couldn't fetch DID document:", error)
      }
    },
    initialData: () => {
      // Return undefined if no did or handle
      if (!did) return

      const profile =
        queryClient.getQueryData<AppBskyActorDefs.ProfileViewBasic>(
          RQKEY_PROFILE_BASIC(did),
        )
      return profile?.did
    },
    enabled: !!did,
  })
}

export function precacheResolvedUri(
  queryClient: QueryClient,
  handle: string,
  did: string,
) {
  queryClient.setQueryData<string>(RQKEY(handle), did)
}
