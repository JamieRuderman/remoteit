import React from 'react'
import { Link } from 'react-router-dom'
import { AttributeValue } from '../AttributeValue'
import { DeviceLabel } from '../DeviceLabel'
import { RestoreButton } from '../../buttons/RestoreButton'
import { ConnectionStateIcon } from '../ConnectionStateIcon'
import { Attribute } from '../../helpers/attributes'
import { Icon } from '../Icon'
import { makeStyles, Checkbox, Box, ListItemIcon, ListItem, useMediaQuery } from '@material-ui/core'

type Props = {
  device?: IDevice
  connections?: IConnection[]
  primary?: Attribute
  attributes?: Attribute[]
  restore?: boolean
  select?: boolean
}

export const DeviceListItem: React.FC<Props> = ({ device, connections, primary, attributes = [], restore, select }) => {
  const connected = connections && connections.find(c => c.enabled)
  const largeScreen = useMediaQuery('(min-width:600px)')
  const css = useStyles({ attributes, primary })
  if (!device) return null

  return (
    <ListItem to={`/devices/${device.id}`} component={Link} button>
      {/* <pre style={{ backgroundColor: 'black' }}> attributes: {JSON.stringify(attributes.map(a => a.id))}</pre> */}
      {select && (
        <Checkbox
          // checked={checked}
          // indeterminate={indeterminate}
          // inputRef={inputRef}
          // onChange={event => onClick(event.target.checked)}
          className={css.checkbox}
          onClick={event => event.stopPropagation()}
          checkedIcon={<Icon name="check-square" size="md" type="solid" />}
          indeterminateIcon={<Icon name="minus-square" size="md" type="solid" />}
          icon={<Icon name="square" size="md" />}
          color="primary"
        />
      )}
      <DeviceLabel device={device} />
      <ListItemIcon>
        <ConnectionStateIcon device={device} connection={connected} size="lg" />
      </ListItemIcon>
      <Box>
        <AttributeValue device={device} connection={connected} attribute={primary} />
      </Box>
      {restore ? (
        <RestoreButton device={device} />
      ) : (
        largeScreen &&
        attributes?.map(attribute => (
          <Box>
            <AttributeValue
              key={attribute.id}
              device={device}
              connection={connected}
              connections={connections}
              attribute={attribute}
            />
          </Box>
        ))
      )}
    </ListItem>
  )
}

const useStyles = makeStyles({
  button: {
    position: 'absolute',
    height: '100%',
    zIndex: 0,
  },
  checkbox: {
    maxWidth: 60,
  },
})
