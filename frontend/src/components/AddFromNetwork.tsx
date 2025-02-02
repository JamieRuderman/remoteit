import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { ApplicationState } from '../store'
import { useSelector } from 'react-redux'
import { Link } from './Link'
import { IconButton } from '../buttons/IconButton'

type Props = {
  allowScanning?: boolean
  button?: boolean
}

export const AddFromNetwork: React.FC<Props> = ({ allowScanning, button }) => {
  const { deviceID } = useParams<{ deviceID: string }>()
  const { scanEnabled } = useSelector((state: ApplicationState) => state.ui)
  const history = useHistory()

  if (!allowScanning || !scanEnabled) return null

  return button ? (
    <IconButton
      icon="radar"
      size="md"
      title="Scan for Services"
      onClick={() => history.push(`/devices/${deviceID}/add/scan`)}
    />
  ) : (
    <Link to={`/devices/${deviceID}/add/scan`}>Scan&nbsp;network</Link>
  )
}
