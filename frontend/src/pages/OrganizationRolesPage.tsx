import React, { useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import { List, ListItemSecondaryAction, Typography, Chip } from '@material-ui/core'
import { selectPermissions, getOrganization } from '../models/organization'
import { ApplicationState } from '../store'
import { ListItemLocation } from '../components/ListItemLocation'
import { useSelector } from 'react-redux'
import { IconButton } from '../buttons/IconButton'
import { Container } from '../components/Container'
import { Title } from '../components/Title'
import { Icon } from '../components/Icon'
import analyticsHelper from '../helpers/analyticsHelper'

export const OrganizationRolesPage: React.FC = () => {
  const { roles, members, permissions } = useSelector((state: ApplicationState) => ({
    ...getOrganization(state),
    permissions: selectPermissions(state),
  }))

  useEffect(() => {
    analyticsHelper.page('OrganizationRolesPage')
  }, [])

  if (!permissions?.includes('ADMIN')) return <Redirect to={'/organization'} />

  return (
    <Container
      gutterBottom
      header={
        <Typography variant="h1">
          <Title>Roles</Title>
        </Typography>
      }
    >
      <Typography variant="subtitle1">
        <Title>Role</Title>
        <IconButton icon="plus" to={'/organization/roles/add'} title="Add role" />
      </Typography>
      <List>
        {roles.map(r => {
          if (r.disabled) return null
          const count = members.filter(m => m.roleId === r.id).length
          return (
            <ListItemLocation
              key={r.id}
              title={
                <>
                  {r.name}
                  {r.system && (
                    <sup>
                      <Icon name="lock" size="xxxs" type="solid" color="grayDark" inline />
                    </sup>
                  )}
                </>
              }
              pathname={`/organization/roles/${r.id}`}
              exactMatch
              disableIcon
              dense
            >
              <ListItemSecondaryAction>
                <Chip label={count ? `${count} member${count === 1 ? '' : 's'}` : 'none'} size="small" />
              </ListItemSecondaryAction>
            </ListItemLocation>
          )
        })}
      </List>
    </Container>
  )
}
