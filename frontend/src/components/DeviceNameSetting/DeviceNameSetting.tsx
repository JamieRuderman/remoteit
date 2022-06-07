import React from 'react'
import { MAX_NAME_LENGTH } from '../../shared/constants'
import { useSelector, useDispatch } from 'react-redux'
import { ApplicationState, Dispatch } from '../../store'
import { InlineTextFieldSetting } from '../InlineTextFieldSetting'
import { attributeName } from '../../shared/nameHelper'
import { safeHostname } from '../../shared/nameHelper'
import { getDevices } from '../../models/accounts'

export const DeviceNameSetting: React.FC<{ device: IDevice }> = ({ device }) => {
  const { devices } = useDispatch<Dispatch>()
  const { hostname, nameBlacklist } = useSelector((state: ApplicationState) => ({
    hostname: state.backend.environment.hostname,
    nameBlacklist: getDevices(state)
      .filter((device: IDevice) => !device.shared)
      .map((d: IDevice) => d.name.toLowerCase()),
  }))

  if (!device) return null

  const name = attributeName(device)
  const defaultValue = device.thisDevice ? safeHostname(hostname, nameBlacklist) : device.name

  return (
    <InlineTextFieldSetting
      required
      value={name}
      icon="i-cursor"
      label="Device Name"
      disabled={!device.permissions.includes('MANAGE')}
      resetValue={defaultValue}
      maxLength={MAX_NAME_LENGTH}
      onSave={name => {
        devices.renameDevice({ ...device, name: name.toString() })
      }}
    />
  )
}
