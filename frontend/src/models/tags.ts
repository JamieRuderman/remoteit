import { createModel } from '@rematch/core'
import { AxiosResponse } from 'axios'
import { DEFAULT_TARGET, DESKTOP_EPOCH } from '../shared/constants'
import { graphQLCreateTag, graphQLAddTag, graphQLRemoveTag, graphQLRenameTag } from '../services/graphQLMutation'
import { graphQLBasicRequest } from '../services/graphQL'
import { RootModel } from './rootModel'

type ITagState = ILookup<ITag[]> & {
  all: ITag[]
  removing?: string
  renaming?: string
}

const defaultState: ITagState = {
  all: [
    {
      name: 'Gray',
      color: 1,
      created: DESKTOP_EPOCH,
    },
    {
      name: 'Red',
      color: 2,
      created: DESKTOP_EPOCH,
    },
    {
      name: 'Orange',
      color: 3,
      created: DESKTOP_EPOCH,
    },
    {
      name: 'Yellow',
      color: 4,
      created: DESKTOP_EPOCH,
    },
    {
      name: 'Green',
      color: 5,
      created: DESKTOP_EPOCH,
    },
    {
      name: 'Blue',
      color: 6,
      created: DESKTOP_EPOCH,
    },
    {
      name: 'Purple',
      color: 7,
      created: DESKTOP_EPOCH,
    },
  ],
}

export default createModel<RootModel>()({
  state: { ...defaultState },
  effects: dispatch => ({
    async fetch(_, globalState) {
      const result = await graphQLBasicRequest(
        ` query {
            login {
              tags {
                name
                color
                created
              }
            }
          }`
      )
      if (result === 'ERROR') return
      const all = await dispatch.tags.parse(result)
      dispatch.tags.set({ all })
    },
    async parse(result: AxiosResponse<any> | undefined) {
      const all = result?.data?.data?.login?.tags
      const parsed = all
        .map(t => ({ ...t, created: new Date(t.created) }))
        .filter(t => !defaultState.all.find(d => d.name === t.name))
      return defaultState.all.concat(parsed)
    },
    async create(tag: ITag, globalState) {
      const tags = globalState.tags.all
      const result = await graphQLCreateTag({ name: tag.name, color: tag.color })
      if (result === 'ERROR') return
      dispatch.tags.set({ all: [...tags, tag] })
    },
    async add({ tag, device }: { tag: ITag; device: IDevice }) {
      const result = await graphQLAddTag(device.id, tag.name)
      if (result === 'ERROR') return
      device.tags.push(tag)
      dispatch.accounts.setDevice({ id: device.id, device })
    },
    async rename({ tag, name }: { tag: ITag; name: string }, globalState) {
      const tags = globalState.tags.all
      dispatch.tags.set({ renaming: tag.name })
      const result = await graphQLRenameTag(tag.name, name)
      if (result === 'ERROR') return
      const index = tags.findIndex(t => t.name === tag.name)
      tags[index].name = name
      dispatch.tags.set({ all: [...tags], renaming: undefined })
    },
    async remove(tag: ITag, globalState) {
      const tags = globalState.tags.all
      dispatch.tags.set({ removing: tag.name })
      const result = await graphQLRemoveTag(tag.name)
      if (result === 'ERROR') return
      const index = tags.findIndex(t => t.name === tag.name)
      tags.splice(index, 1)
      dispatch.tags.set({ all: [...tags], removing: undefined })
      dispatch.devices.fetch()
    },
  }),
  reducers: {
    reset(state: ITagState) {
      state = { ...defaultState }
      return state
    },
    set(state: ITagState, params: ILookup<any>) {
      Object.keys(params).forEach(key => (state[key] = params[key]))
      return state
    },
  },
})

export function findType(all: IApplicationType[], typeId?: number) {
  return all.find(t => t.id === typeId) || all[0] || emptyServiceType
}

export function getTypeId(all: IApplicationType[], port: number) {
  const type = all.find(t => t.port === port)
  return type ? type.id : DEFAULT_TARGET.type
}

const emptyServiceType = {
  id: 1,
  name: '',
  port: null,
  proxy: false,
  protocol: 'TCP',
  description: '',
}
