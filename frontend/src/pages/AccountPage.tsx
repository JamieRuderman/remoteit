import React from 'react'
import { List, Typography, Tooltip, ButtonBase } from '@mui/material'
import { selectLicenseIndicator } from '../models/plans'
import { selectRemoteitLicense } from '../selectors/organizations'
import { ApplicationState } from '../store'
import { ListItemLocation } from '../components/ListItemLocation'
import { useSelector } from 'react-redux'
import { windowOpen } from '../services/Browser'
import { Container } from '../components/Container'
import { Logo } from '../components/Logo'

export const AccountPage: React.FC = () => {
  const { billing, preferences, licenseIndicator } = useSelector((state: ApplicationState) => ({
    billing: !!selectRemoteitLicense(state)?.plan?.billing,
    licenseIndicator: selectLicenseIndicator(state),
    preferences: state.backend.preferences,
  }))

  if (!preferences) return null

  return (
    <Container
      gutterBottom
      header={
        <>
          <Typography variant="h1">
            <Tooltip title="Visit Remote.It on the web">
              <ButtonBase onClick={() => windowOpen('https://remote.it')}>
                <Logo width={110} />
              </ButtonBase>
            </Tooltip>
          </Typography>
        </>
      }
    >
      <List>
        <ListItemLocation
          title="Profile"
          pathname="/account/overview"
          match={['/account', '/account/overview']}
          icon="user-large"
          exactMatch
          dense
        />
        <ListItemLocation title="Security" pathname="/account/security" icon="lock" dense />
        <ListItemLocation title="Subscription" pathname="/account/plans" icon="shopping-cart" dense />
        {billing && <ListItemLocation title="Billing" pathname="/account/billing" icon="credit-card-front" dense />}
        <ListItemLocation
          title="Licensing"
          pathname="/account/licensing"
          icon="id-badge"
          badge={licenseIndicator}
          dense
        />
        <ListItemLocation title="Access Keys" pathname="/account/accessKey" icon="key" dense />
      </List>
    </Container>
  )
}
