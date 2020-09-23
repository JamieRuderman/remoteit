import React from 'react'
import { List } from '@material-ui/core'
import { ContactCard } from './ContactCard'
import { useParams } from 'react-router-dom'
import { getPermissions } from '../../helpers/userHelper'
import { SharingDetails } from './SharingForm'

export function DeviceShareDetails({
  device,
  share,
  selectedContacts,
  updateSharing,
  changing,
  setChanging,
}: {
  device: IDevice
  share: (share: SharingDetails, isNew: boolean) => void
  selectedContacts: string[]
  updateSharing: (share: SharingDetails, isNew: boolean) => void
  changing: boolean
  setChanging: React.Dispatch<React.SetStateAction<boolean>>
}): JSX.Element {
  const { email = '', serviceID = '' } = useParams<{ email: string; serviceID: string }>()

  const formComponent = (email: string, sharedService: string[], scripting?: boolean) => {
    return (
      <ContactCard
        device={device}
        share={share}
        scripting={scripting || false}
        sharedServices={sharedService}
        selectedContacts={selectedContacts}
        email={email}
        updateSharing={updateSharing}
        changing={changing}
        setChanging={setChanging}
      />
    )
  }

  const detailByEmail = (email: string) => {
    const detail = getPermissions(device, email)
    return formComponent(
      email,
      detail.services.map(s => s.id),
      detail.scripting
    )
  }

  return <List>{email === '' ? formComponent('', [serviceID]) : detailByEmail(email)}</List>
}
