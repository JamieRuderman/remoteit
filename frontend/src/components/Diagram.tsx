import React from 'react'
import {} from '../shared/constants'
import { Paper } from '@mui/material'
import { useParams } from 'react-router-dom'
import { makeStyles } from '@mui/styles'
import { DiagramIcon } from './DiagramIcon'
import { DiagramPath } from './DiagramPath'
import { isForward, connectionState } from '../helpers/connectionHelper'
import { DeviceContext, DiagramContext } from '../services/Context'
import { DiagramGroup, DiagramGroupType } from './DiagramGroup'
import { DiagramDivider } from './DiagramDivider'
import { TestUI } from './TestUI'
import { Pre } from './Pre'

type Props = {
  to?: { [key in DiagramGroupType]?: string }
  forward?: boolean
  highlightTypes?: DiagramGroupType[]
}

export const Diagram: React.FC<Props> = ({ to: toTypes, forward, highlightTypes = [] }) => {
  const { connections, device } = React.useContext(DeviceContext)
  const { serviceID } = useParams<{ serviceID: string }>()
  const css = useStyles()

  const service = device?.services?.find(s => s.id === serviceID)
  const connection = connections?.find(c => c.id === serviceID)

  const state = connectionState(service, connection)
  const proxy =
    connection && ((connection.isP2P !== undefined && !connection.isP2P && connection.enabled) || connection.public)
  forward = forward || isForward(service)
  let activeTypes: DiagramGroupType[] = []

  switch (state) {
    case 'ready':
      activeTypes = ['initiator']
      break
    case 'connected':
      activeTypes = ['target', 'initiator', 'tunnel', 'forward']
      break
    case 'online':
      activeTypes = ['target', 'forward']
      break
    case 'offline':
  }

  // const { connection } = useSelector((state: ApplicationState) => ({
  //   connection: selectConnection(state, service),
  // }))

  return (
    <TestUI>
      <DiagramContext.Provider value={{ state, toTypes, activeTypes, highlightTypes }}>
        {/* <Pre {...{ connection }} /> */}
        <Paper elevation={0} className={css.diagram}>
          <DiagramGroup type="initiator">
            <DiagramIcon type="initiator" />
            <DiagramPath type="initiator" />
          </DiagramGroup>
          {proxy && (
            <DiagramGroup type="proxy">
              <DiagramPath type="proxy" />
              <DiagramIcon type="proxy" />
              <DiagramPath type="proxy" flexGrow={2} />
            </DiagramGroup>
          )}
          <DiagramDivider start />
          <DiagramGroup type="tunnel">
            <DiagramPath type="tunnel" />
          </DiagramGroup>
          <DiagramDivider end />
          {forward && (
            <DiagramGroup type="forward">
              <DiagramPath type="forward" />
              <DiagramIcon type="forward" />
              <DiagramPath type="forward" flexGrow={2} />
            </DiagramGroup>
          )}
          <DiagramGroup type="target">
            <DiagramPath type="target" />
            <DiagramIcon type="target" />
          </DiagramGroup>
        </Paper>
      </DiagramContext.Provider>
    </TestUI>
  )
}

const useStyles = makeStyles(({ palette }) => ({
  diagram: () => ({
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    position: 'relative',
    '& .MuiPaper-root + .MuiPaper-root': { marginLeft: 1 },
  }),
}))
