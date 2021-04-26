import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { IconButton, makeStyles, Tooltip } from '@material-ui/core'
import { ServiceHeaderMenu } from '../../components/ServiceHeaderMenu'
import { ServiceConnected } from '../../components/ServiceConnected'
import { ApplicationState } from '../../store'
import { connectionState } from '../../helpers/connectionHelper'
import { LaunchButton } from '../../buttons/LaunchButton'
import { DataDisplay } from '../../components/DataDisplay'
import { ComboButton } from '../../buttons/ComboButton'
import { CopyButton } from '../../buttons/CopyButton'
import { Gutters } from '../../components/Gutters'
import { Notice } from '../../components/Notice'
import { Icon } from '../../components/Icon'
import analyticsHelper from '../../helpers/analyticsHelper'

export const ServiceDetailPage: React.FC<{ device?: IDevice; targets: ITarget[] }> = ({ device, targets }) => {
  const { serviceID } = useParams<{ serviceID: string }>()
  const service = device?.services.find(s => s.id === serviceID)
  const { connection, licenseChip } = useSelector((state: ApplicationState) => ({
    connection: state.connections.all.find(c => c.id === serviceID),
    licenseChip: state.licensing.chip[service?.license || 0],
  }))
  const target = targets.find(t => t.uid === serviceID)
  const state = connectionState(service, connection)
  const css = useStyles()

  useEffect(() => {
    analyticsHelper.page('ServiceDetailPage')
  }, [])

  if (!service || !device) return null

  let data: IDataDisplay[] = []

  if (state === 'connected') {
    data = data.concat([
      { label: 'Host', value: connection?.host },
      { label: 'Port', value: connection?.port },
      { label: 'Restriction', value: connection?.restriction },
    ])
  }

  data = data.concat([
    { label: 'Last reported', value: { start: service.lastReported, ago: true }, format: 'duration' },
    { label: 'Service Name', value: service.name },
    { label: 'Remote Port', value: service.port },
    { label: 'Remote Protocol', value: service.protocol },
    { label: 'Service Type', value: service.type },
    { label: 'Device Name', value: device.name },
    { label: 'Owner', value: device.owner.email },
    { label: 'Service ID', value: service.id },
    { label: 'License', value: licenseChip, format: 'chip' },
  ])

  return (
    <ServiceHeaderMenu
      device={device}
      service={service}
      target={target}
      footer={
        <>
          <Gutters className={css.gutters}>
            <ComboButton connection={connection} service={service} size="medium" fullWidth />
            {/* <Icon name="neuter" /> */}
            {connection?.enabled ? (
              <>
                <Tooltip title="Connection Details" arrow>
                  <IconButton to={`/connections/${service.id}`} component={Link}>
                    <Icon name="info-circle" size="md" fixedWidth />
                  </IconButton>
                </Tooltip>
                <CopyButton connection={connection} service={service} />
                <LaunchButton connection={connection} service={service} />
              </>
            ) : (
              <>
                <Tooltip title="Configure Connection" arrow>
                  <IconButton to={`/connections/new/${device.id}/${service.id}`} component={Link}>
                    <Icon name="cog" size="md" fixedWidth />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Gutters>
          <ServiceConnected connection={connection} show={connection?.enabled} />
        </>
      }
    >
      {service.state === 'inactive' && (
        <Notice severity="warning" gutterTop>
          Service offline
        </Notice>
      )}
      <Gutters>
        <DataDisplay data={data} />
      </Gutters>
    </ServiceHeaderMenu>
  )
}

const useStyles = makeStyles({
  gutters: {
    display: 'flex',
    marginBottom: '0 !important',
  },
})
