import { ListItem, ListItemIcon } from '@material-ui/core'
import React from 'react'
import { EventIcon } from './EventIcon'
import { EventMessage } from './EventMessage'

const options = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}

export function EventItem({ item, device, user }: { item: IEvent; device?: IDevice; user?: IUser }): JSX.Element {
  return (
    <ListItem>
      <span>{new Date(item.timestamp).toLocaleDateString('en-US', options)}</span>
      <ListItemIcon>
        <EventIcon {...item} />
      </ListItemIcon>
      <EventMessage item={item} device={device} loggedInUser={user} />
    </ListItem>
  )
}
