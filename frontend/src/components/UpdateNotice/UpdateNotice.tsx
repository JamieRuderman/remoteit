import React, { useState, useEffect } from 'react'
import { emit } from '../../services/Controller'
import { useSelector, useDispatch } from 'react-redux'
import { ApplicationState, Dispatch } from '../../store'
import { Snackbar, Button, IconButton } from '@material-ui/core'
import { selectUpdateNotice } from '../../models/backend'
import { isElectron, isRemote } from '../../services/Browser'
import { Confirm } from '../Confirm'
import { Notice } from '../Notice'
import { Icon } from '../Icon'
import analyticsHelper from '../../helpers/analyticsHelper'

export const UpdateNotice: React.FC = () => {
  const updateReady = useSelector((state: ApplicationState) => selectUpdateNotice(state))
  const [open, setOpen] = useState<boolean>(!!updateReady)
  const { backend } = useDispatch<Dispatch>()

  const [confirm, setConfirm] = useState<boolean>(false)

  const restart = () => {
    analyticsHelper.track('update')
    emit('restart')
  }

  const handleClick = () => {
    setConfirm(true)
  }

  const handleConfirm = () => {
    restart()
    setConfirm(false)
  }

  useEffect(() => {
    if (updateReady) setOpen(true)
  }, [updateReady])

  if (!isElectron() || isRemote()) return null

  return (
    <>
      <Snackbar
        open={open}
        message={`An update is available (v${updateReady}).`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        action={[
          <Button key="restart" variant="contained" color="primary" size="small" onClick={handleClick}>
            Restart
          </Button>,
          <IconButton
            key="close"
            onClick={() => {
              setOpen(false)
              backend.setUpdateNotice(updateReady)
            }}
          >
            <Icon name="times" color="white" size="md" fixedWidth />
          </IconButton>,
        ]}
      />
      {confirm && (
        <Confirm
          open={confirm}
          onConfirm={handleConfirm}
          onDeny={() => setConfirm(false)}
          title="Are you sure?"
          action="Restart"
        >
          <Notice severity="danger" fullWidth gutterBottom>
            Restarting while connected over a remote.it connection will cause the connection to be lost.{' '}
          </Notice>
          You must be locally connected to update.
        </Confirm>
      )}
    </>
  )
}
