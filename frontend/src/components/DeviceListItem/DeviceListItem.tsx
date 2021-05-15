import React from 'react'
import { DeviceValue } from '../DeviceValue'
import { DeviceLabel } from '../DeviceLabel'
import { ServiceName } from '../ServiceName'
import { RestoreButton } from '../../buttons/RestoreButton'
import { ListItemLocation } from '../ListItemLocation'
import { ServiceIndicators } from '../ServiceIndicators'
import { ConnectionStateIcon } from '../ConnectionStateIcon'
import { makeStyles, Box, ListItemIcon, ListItemText, ListItemSecondaryAction, useMediaQuery } from '@material-ui/core'
import { spacing } from '../../styling'

type Props = {
  device?: IDevice
  connections?: IConnection[]
  thisDevice?: boolean
  restore?: boolean
  setContextMenu: React.Dispatch<React.SetStateAction<IContextMenu>>
  primary: string
  columns?: string[]
}

export const DeviceListItem: React.FC<Props> = ({
  device,
  connections,
  thisDevice,
  setContextMenu,
  primary,
  columns,
  restore,
}) => {
  const connected = connections && connections.find(c => c.enabled)
  const largeScreen = useMediaQuery('(min-width:600px)')
  const css = useStyles({ columns })

  if (!device) return null

  return (
    <ListItemLocation pathname={`/devices/${device.id}`} className={css.columns}>
      <DeviceLabel device={device} />
      <ListItemIcon>
        <ConnectionStateIcon device={device} connection={connected} size="lg" thisDevice={thisDevice} />
      </ListItemIcon>
      <ListItemText primary={<DeviceValue device={device} connection={connected} name={primary} />} />
      {restore ? (
        <ListItemSecondaryAction>
          <RestoreButton device={device} />
        </ListItemSecondaryAction>
      ) : (
        largeScreen &&
        columns?.map(column => (
          <DeviceValue
            key={column}
            className={css.column}
            device={device}
            connection={connected}
            connections={connections}
            name={column}
          />
        ))
        /* <ServiceIndicators device={device} connections={connections} setContextMenu={setContextMenu} /> */
      )}
    </ListItemLocation>
  )
}

const useStyles = makeStyles({
  columns: ({ columns }: { columns: Props['columns'] }) => ({
    gridGap: spacing.sm,
    gridTemplateColumns: `auto 2fr ${new Array(columns?.length).fill('1fr').join(' ')}`,
    display: 'grid',
    alignItems: 'center',
    marginRight: spacing.sm,
    '& > *': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  }),
  column: {
    textAlign: 'right',
  },
})
