import React from 'react'
import { useSelector } from 'react-redux'
import { DeviceListItem } from '../DeviceListItem'
import { getActiveAccountId, getOwnDevices } from '../../models/accounts'
import { masterAttributes, deviceAttributes, Attribute } from '../../helpers/attributes'
import { DeviceSetupItem } from '../DeviceSetupItem'
import { ApplicationState } from '../../store'
import { ServiceContextualMenu } from '../ServiceContextualMenu'
import { List, Divider } from '@material-ui/core'
import { isOffline } from '../../models/devices'
import { LoadMore } from '../LoadMore'
import { Notice } from '../Notice'

export interface DeviceListProps {
  connections: { [deviceID: string]: IConnection[] }
  devices?: IDevice[]
  restore?: boolean
}

export const DeviceList: React.FC<DeviceListProps> = ({ devices = [], connections = {}, restore }) => {
  const { myDevice, loggedInUser, registeredId, attributes } = useSelector((state: ApplicationState) => ({
    registeredId: state.backend.device.uid,
    loggedInUser: getActiveAccountId(state) === state.auth.user?.id,
    myDevice: getOwnDevices(state).find(device => device.id === state.backend.device.uid),
    attributes: masterAttributes.concat(deviceAttributes).filter(a => state.ui.columns.includes(a.id)),
  }))

  return (
    <>
      <List>
        {registeredId ? (
          loggedInUser &&
          (myDevice ? (
            <>
              <DeviceListItem
                key={registeredId}
                device={myDevice}
                connections={connections[registeredId]}
                thisDevice={true}
              />
              <Divider variant="inset" />
            </>
          ) : (
            <>
              <Notice gutterBottom>This device is not registered to you.</Notice>
              <Divider variant="inset" />
            </>
          ))
        ) : (
          <>
            <DeviceSetupItem restore={restore} />
            <Divider variant="inset" />
          </>
        )}
        {devices?.map(device => {
          const canRestore = isOffline(device) && !device.shared
          if (device.id === myDevice?.id || (restore && !canRestore)) return
          return (
            <DeviceListItem
              key={device.id}
              device={device}
              connections={connections[device.id]}
              restore={restore && canRestore}
              attributes={attributes}
            />
          )
        })}
      </List>
      <LoadMore />
      <ServiceContextualMenu />
    </>
  )
}
