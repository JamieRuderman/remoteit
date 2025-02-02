import React, { useEffect, useState, useContext } from 'react'
import { DeviceContext } from '../../services/Context'
import { useDispatch, useSelector } from 'react-redux'
import { ApplicationState, Dispatch } from '../../store'
import {
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  Typography,
} from '@mui/material'
import { IconButton } from '../../buttons/IconButton'
import { Title } from '../Title'
import { Icon } from '../Icon'

export const NotificationSettings: React.FC = () => {
  const { device } = useContext(DeviceContext)
  const { devices } = useDispatch<Dispatch>()
  const { globalNotificationEmail, globalNotificationSystem } = useSelector((state: ApplicationState) => ({
    globalNotificationEmail: state.user.notificationSettings?.emailNotifications,
    globalNotificationSystem: state.user.notificationSettings?.desktopNotifications,
  }))
  const [emailNotification, setEmailNotification] = useState<boolean | undefined | null>(
    device?.notificationSettings?.emailNotifications
  )
  const [inAppNotification, setInAppNotification] = useState<boolean | undefined | null>(
    device?.notificationSettings?.desktopNotifications
  )
  const [inAppOverridden, setInAppOverridden] = useState<boolean>()
  const [emailOverridden, setEmailOverridden] = useState<boolean>()

  useEffect(() => {
    setInAppOverridden(typeof inAppNotification === 'boolean')
  }, [inAppNotification])

  useEffect(() => {
    setEmailOverridden(typeof emailNotification === 'boolean')
  }, [emailNotification])

  if (!device) return null // TODO refactor and make undefined check in devicerouter

  const handleEmailNotifications = async () => {
    const currentEmailNotification = emailOverridden ? emailNotification || false : globalNotificationEmail
    setEmailNotification(!currentEmailNotification)
    const item = {
      ...device,
      notificationSettings: {
        ...device.notificationSettings,
        emailNotifications: !currentEmailNotification,
      },
    }
    await devices.setNotificationDevice(item)
  }

  const handleInAppNotifications = async () => {
    const currentDesktopNotification = inAppOverridden ? inAppNotification || false : globalNotificationSystem
    setInAppNotification(!currentDesktopNotification)
    const item = {
      ...device,
      notificationSettings: {
        ...device.notificationSettings,
        desktopNotifications: !currentDesktopNotification,
      },
    }
    await devices.setNotificationDevice(item)
  }

  const onClose = (value: string) => {
    switch (value) {
      case 'inapp':
        setInAppOverridden(false)
        setInAppNotification(undefined)
        const itemInApp = {
          ...device,
          notificationSettings: {
            desktopNotifications: null,
          },
        }
        devices.setNotificationDevice(itemInApp)
        break

      case 'email':
        setEmailOverridden(false)
        setEmailNotification(undefined)
        const itemEmail = {
          ...device,
          notificationSettings: {
            emailNotifications: null,
          },
        }
        devices.setNotificationDevice(itemEmail)
        break
    }
  }

  const chipOverridden = (value: string = 'inapp') => {
    return (
      <Chip
        label="Custom"
        size="small"
        deleteIcon={<IconButton icon="times" size="xs" />}
        onDelete={() => onClose(value)}
      />
    )
  }

  if (!device) return null

  const inapp = inAppOverridden ? inAppNotification || false : globalNotificationSystem
  const email = emailOverridden ? emailNotification || false : globalNotificationEmail

  return (
    <>
      <Typography variant="subtitle1">
        <Title>Device Notifications</Title>
        <IconButton
          title="Global Settings"
          to="/settings/notifications"
          icon="sliders-h"
          color="grayDark"
          size="sm"
          shiftDown
        />
      </Typography>
      <List>
        <ListItem button onClick={handleInAppNotifications} dense>
          <ListItemIcon>
            <Icon name={inapp ? 'bell-on' : 'bell-slash'} size="md" />
          </ListItemIcon>
          <ListItemText primary="System notification" />
          <ListItemSecondaryAction>
            {inAppOverridden && chipOverridden('inapp')}
            <Switch edge="end" color="primary" checked={inapp} onClick={handleInAppNotifications} />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem button onClick={handleEmailNotifications} dense>
          <ListItemIcon>
            <Icon name={email ? 'bell-on' : 'bell-slash'} size="md" />
          </ListItemIcon>
          <ListItemText primary="Email" />
          <ListItemSecondaryAction>
            {emailOverridden && chipOverridden('email')}
            <Switch edge="end" color="primary" checked={email} onClick={handleEmailNotifications} />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </>
  )
}
