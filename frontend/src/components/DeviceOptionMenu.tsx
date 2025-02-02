import React from 'react'
import { PROTOCOL } from '../shared/constants'
import { Dispatch } from '../store'
import { useDispatch } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { Divider, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import { DeleteServiceMenuItem } from '../buttons/DeleteServiceMenuItem'
import { ListItemLocation } from './ListItemLocation'
import { CopyAsyncMenuItem } from './CopyAsyncMenuItem'
import { CopyMenuItem } from './CopyMenuItem'
import { DeleteDevice } from './DeleteDevice'
import { LeaveDevice } from './LeaveDevice'
import { Icon } from './Icon'

type Props = { device?: IDevice; service?: IService; user?: IUser }

export const DeviceOptionMenu: React.FC<Props> = ({ device, service }) => {
  const { deviceID } = useParams<{ deviceID?: string }>()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const handleClick = event => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const dispatch = useDispatch<Dispatch>()
  const devicesSection = !!deviceID
  const deviceOnly = device && !service

  if (!device) return null

  return (
    <>
      <IconButton onClick={handleClick}>
        <Icon name="ellipsis-v" size="md" fixedWidth />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        disableScrollLock
        autoFocus={false}
        elevation={2}
      >
        {(!devicesSection || service) && (
          <ListItemLocation
            title="Device Details"
            icon="router"
            pathname={`/devices/${device.id}/details`}
            menuItem
            dense
          />
        )}
        {service && (
          <CopyMenuItem
            key="link"
            icon="link"
            title="Service Link"
            value={`${PROTOCOL}devices/${device.id}/${service.id}`}
          />
        )}
        {devicesSection && deviceOnly && (
          <CopyMenuItem key="link" icon="link" title="Device Link" value={`${PROTOCOL}devices/${device.id}`} />
        )}
        {device.permissions.includes('MANAGE') &&
          devicesSection &&
          deviceOnly && [
            <CopyAsyncMenuItem
              key="restore"
              icon="wave-pulse"
              title="Restore Code"
              request={async () => (await dispatch.devices.getRestoreCommand(device.id)).restoreCode}
            />,
            <MenuItem dense key="transfer" to={`/devices/${device.id}/transfer`} component={Link}>
              <ListItemIcon>
                <Icon name="arrow-turn-down-right" size="md" />
              </ListItemIcon>
              <ListItemText primary="Transfer Device" />
            </MenuItem>,
            <Divider key="divider" />,
            <DeleteDevice key="deleteDevice" device={device} menuItem />,
          ]}
        {device.permissions.includes('MANAGE') &&
          service &&
          devicesSection && [
            <Divider key="divider" />,
            <DeleteServiceMenuItem key="deleteService" device={device} service={service} />,
          ]}
        <LeaveDevice key="leaveDevice" device={device} menuItem />
      </Menu>
    </>
  )
}
