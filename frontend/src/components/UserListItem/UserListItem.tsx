import React, { Fragment } from 'react'
import { ListItemText, ListItemIcon } from '@material-ui/core'
import { ListItemLocation } from '../ListItemLocation'
import { InitiatorPlatform } from '../InitiatorPlatform'
import { Duration } from '../Duration'
import { useLocation } from 'react-router-dom'

interface Props {
  index?: number
  user: IUser
  isConnected?: boolean
}

export const UserListItem: React.FC<Props> = ({ index, user, isConnected, children }) => {
  const location = useLocation()

  return (
    <Fragment key={index}>
      <ListItemLocation pathname={location.pathname + '/' + user.email} dense>
        <ListItemIcon>
          <InitiatorPlatform id={user.platform} connected={isConnected} />
        </ListItemIcon>
        {isConnected ? (
          <ListItemText
            primaryTypographyProps={{ color: 'primary' }}
            primary={user.email}
            secondary={<Duration startTime={user.timestamp?.getTime()} ago />}
          />
        ) : (
          <ListItemText primary={user.email} />
        )}
        {children}
      </ListItemLocation>
    </Fragment>
  )
}
