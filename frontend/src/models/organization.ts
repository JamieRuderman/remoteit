import { createModel } from '@rematch/core'
import {
  graphQLSetOrganization,
  graphQLRemoveOrganization,
  graphQLSetMembers,
  graphQLSetSAML,
  graphQLCreateRole,
  graphQLUpdateRole,
  graphQLRemoveRole,
} from '../services/graphQLMutation'
import { getActiveAccountId, getActiveUser } from './accounts'
import { graphQLBasicRequest } from '../services/graphQL'
import { graphQLLicenses, getRemoteitLicense, parseLicense } from './licensing'
import { ApplicationState } from '../store'
import { AxiosResponse } from 'axios'
import { RootModel } from './rootModel'

export const PERMISSION: ILookup<{ name: string; description: string; icon: string; system?: boolean }> = {
  VIEW: { name: 'View', description: 'See devices and their current state', icon: 'eye', system: true },
  CONNECT: { name: 'Connect', description: 'Connect to devices', icon: 'arrow-right' },
  SCRIPTING: { name: 'Script', description: 'Run device scripts', icon: 'code' },
  MANAGE: { name: 'Manage', description: 'Manage devices', icon: 'pencil' },
  ADMIN: { name: 'Administrator', description: 'Manage organization users', icon: 'user-hard-hat' },
}

export const DEFAULT_ROLE: IOrganizationRole = {
  id: '',
  name: '',
  tag: { operator: 'ANY', values: [] },
  permissions: ['CONNECT'],
}

export const SYSTEM_ROLES: IOrganizationRole[] = [
  {
    id: 'OWNER',
    name: 'Owner',
    system: true,
    permissions: ['VIEW', 'MANAGE', 'CONNECT', 'SCRIPTING', 'ADMIN'],
    disabled: true,
  },
  {
    id: 'NONE',
    name: 'No Access',
    system: true,
    permissions: [],
  },
  {
    id: 'MEMBER',
    name: 'Member',
    system: true,
    permissions: ['VIEW', 'CONNECT'],
  },
]

export type IOrganizationState = IOrganization & {
  initialized: boolean
  updating: boolean
  require2FA: boolean
  domain?: string
  samlEnabled: boolean
  providers: null | IOrganizationProvider[]
  verificationCNAME?: string
  verificationValue?: string
  verified: boolean
}

const defaultState: IOrganizationState = {
  initialized: false,
  updating: false,
  id: '',
  name: '',
  require2FA: false,
  domain: undefined,
  samlEnabled: false,
  providers: null,
  verificationCNAME: undefined,
  verificationValue: undefined,
  verified: false,
  created: undefined,
  members: [],
  roles: [...SYSTEM_ROLES],
  licenses: [],
}

export const graphQLOrganization = `
  organization {
    id
    name
    require2FA
    domain
    samlEnabled
    providers
    verificationCNAME
    verificationValue
    verified
    created
    roles {
      id
      name
      permissions
      tag {
        operator
        values
      }
    }
    members {
      created
      role
      customRole {
        id
        name
      }
      license
      user {
        id
        email
      }
    }
    ${graphQLLicenses}
  }`

export default createModel<RootModel>()({
  state: { ...defaultState },
  effects: dispatch => ({
    async init() {
      await dispatch.organization.fetch()
      dispatch.organization.set({ initialized: true })
    },

    async fetch() {
      const result = await graphQLBasicRequest(
        ` query {
              login {
                ${graphQLOrganization}
              }
            }`
      )
      if (result === 'ERROR') return
      const data = await dispatch.organization.parse(result)
      if (data) await dispatch.organization.set(data)
      else await dispatch.organization.clear()
    },

    async parse(gqlResponse: AxiosResponse<any> | void, _) {
      if (!gqlResponse) return
      const org = gqlResponse?.data?.data?.login?.organization
      console.log('ORGANIZATION DATA', org)
      return parseOrganization(org)
    },

    async setOrganization(params: IOrganizationSettings, state) {
      let org = state.organization
      await dispatch.organization.set({ ...params, id: org.id || state.auth.user?.id })
      const result = await graphQLSetOrganization(params)
      if (result === 'ERROR') {
        await dispatch.organization.fetch()
      } else if (!org.id) {
        dispatch.ui.set({ successMessage: 'Your organization has been created.' })
      }
    },

    async setSAML(params: { enabled: boolean; metadata?: string }, state) {
      dispatch.organization.set({ updating: true })
      const result = await graphQLSetSAML(params)
      if (result !== 'ERROR') {
        dispatch.ui.set({ successMessage: params.enabled ? 'SAML enabled and metadata uploaded.' : 'SAML disabled.' })
      }
      await dispatch.organization.fetch()
      dispatch.organization.set({ updating: false })
    },

    async setMembers(members: IOrganizationMember[] = [], state) {
      let updated = [...state.organization?.members]

      members.forEach(m => {
        const index = updated.findIndex(u => u.user.email === m.user.email)
        if (index > -1) updated[index] = m
        else updated.push(m)
      })
      await dispatch.organization.set({ members: updated })

      const action = updated.length > state.organization.members.length ? 'added' : 'updated'
      const member = members[0]
      const role = state.organization.roles.find(r => r.id === member.roleId)
      const result = await graphQLSetMembers(
        members.map(member => member.user.email),
        role?.system ? member.roleId : undefined,
        role?.system ? undefined : member.roleId,
        member.license
      )
      if (result === 'ERROR') {
        dispatch.organization.fetch()
      } else if (action === 'added') {
        dispatch.ui.set({
          successMessage:
            members.length > 1
              ? `${members.length} members have been ${action}.`
              : `The member '${members[0].user.email}' has been ${action}.`,
        })
      }
    },

    async removeMember(member: IOrganizationMember, state) {
      const result = await graphQLSetMembers([member.user.email], 'REMOVE')
      if (result !== 'ERROR') {
        dispatch.organization.set({
          members: state.organization.members.filter(m => m.user.email !== member.user.email),
        })
        dispatch.ui.set({ successMessage: `Successfully removed ${member?.user?.email}.` })
      }
    },

    async removeOrganization(_, state) {
      const result = await graphQLRemoveOrganization()
      if (result !== 'ERROR') {
        dispatch.organization.clear()
        dispatch.ui.set({ successMessage: `Your organization has been removed.` })
      }
    },

    async setRole(role: IOrganizationRole, state) {
      let roles = [...state.organization.roles]
      const index = roles.findIndex(r => r.id === role.id)
      const permissions: IPermission[] = ['CONNECT', 'MANAGE', 'SCRIPTING']

      let result
      if (index > -1) {
        roles[index] = role
        result = await graphQLUpdateRole({
          id: role.id,
          name: role.name,
          grant: role.permissions,
          revoke: permissions.filter(p => !role.permissions.includes(p)),
          tag: role.tag,
          accountId: getActiveAccountId(state),
        })
      } else {
        result = await graphQLCreateRole({ ...role, accountId: getActiveAccountId(state) })
        if (result !== 'ERROR') role.id = result?.data?.data?.createRole?.id
        roles.push(role)
      }

      if (result === 'ERROR') {
        dispatch.organization.fetch()
        return
      }

      dispatch.ui.set({
        successMessage: index > -1 ? `Successfully updated ${role.name}.` : `Successfully added ${role.name}.`,
      })

      await dispatch.organization.set({ roles })
      return role.id
    },

    async removeRole(role: IOrganizationRole, state) {
      let roles = [...state.organization.roles]
      const index = roles.findIndex(r => r.id === role.id)
      if (index > -1) roles.splice(index, 1)
      const result = await graphQLRemoveRole(role.id, getActiveAccountId(state))

      if (result === 'ERROR') {
        dispatch.organization.fetch()
        return
      }

      dispatch.ui.set({ successMessage: `Successfully removed ${role.name}.` })
      dispatch.organization.set({ roles })
    },
  }),
  reducers: {
    set(state: IOrganizationState, params: ILookup<any>) {
      Object.keys(params).forEach(key => (state[key] = params[key]))
      return state
    },
    clear(state: IOrganizationState) {
      state = { ...defaultState, initialized: true }
      return state
    },
    reset(state: IOrganizationState) {
      state = { ...defaultState }
      return state
    },
  },
})

export function parseOrganization(data): IOrganizationState | undefined {
  if (!data) return
  return {
    ...data,
    created: new Date(data.created),
    members: [
      ...data.members.map(m => ({
        ...m,
        roleId: m.role === 'CUSTOM' ? m.customRole?.id : m.role,
        roleName: m.role === 'CUSTOM' ? m.customRole?.name : SYSTEM_ROLES.find(r => r.id === m.role)?.name,
        created: new Date(m.created),
      })),
    ],
    roles: [
      ...defaultState.roles,
      ...data.roles.map(r => ({
        ...r,
        created: new Date(r.created),
      })),
    ],
    licenses: data.licenses?.map(l => parseLicense(l)),
  }
}

export function selectOwner(state: ApplicationState): IOrganizationMember | undefined {
  const user = getActiveUser(state)
  const license = getRemoteitLicense(state)
  return (
    user && {
      created: new Date(user.created || ''),
      roleId: 'OWNER',
      license: license?.plan.commercial ? 'LICENSED' : 'UNLICENSED',
      organizationId: user.id,
      user: {
        id: user.id,
        email: user.email,
      },
    }
  )
}
