import React from 'react'
import { INITIATOR_PLATFORMS } from '../InitiatorPlatform/InitiatorPlatform'
import { Collapse } from '@material-ui/core'
import { DataDisplay } from '../DataDisplay'
import { Gutters } from '../Gutters'

type Props = {
  connection?: IConnection
  session?: ISession
  show?: boolean
}

export const ServiceConnected: React.FC<Props> = ({ show, connection, session }) => {
  return (
    <Collapse in={show} timeout={800}>
      {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}
      <DataDisplay
        width={100}
        data={[
          // { label: 'URL', value: connection && hostName(connection) },
          { label: 'Address', value: connection?.address },
          {
            label: 'Connection',
            value: connection?.public
              ? 'Public Proxy'
              : connection?.isP2P === undefined && session?.isP2P === undefined
              ? 'Idle'
              : connection?.isP2P || session?.isP2P
              ? 'Peer to peer'
              : 'Proxy',
          },
          {
            label: 'Duration',
            value: connection?.startTime && {
              start: connection?.startTime ? new Date(connection.startTime || 0) : session?.timestamp,
              end: connection?.endTime && connection?.endTime > connection?.startTime && new Date(connection.endTime),
            },
            format: 'duration',
          },
          { label: 'Location', value: session?.geo, format: 'location' },

          { label: 'Platform', value: session && INITIATOR_PLATFORMS[session.platform] },
          // { label: 'Device ID', value: session?.target.deviceId },
          // { label: 'Service ID', value: session?.target.id },
        ]}
      />
    </Collapse>
  )
}
