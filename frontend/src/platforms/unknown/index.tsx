import React from 'react'
import { platforms } from '..'

const Index = ({ darkMode, ...props }) => {
  return (
    <svg viewBox="0 -60 576 570" version="1.1" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M384 320a32 32 0 1 0 32 32 32 32 0 0 0-32-32zm175.88-88.18L462.25 85.37A48 48 0 0 0 422.31 64H153.69a48 48 0 0 0-39.94 21.37L16.12 231.82A96 96 0 0 0 0 285.07V304a48 48 0 0 1 48-48h480a48 48 0 0 1 48 48v-18.93a96 96 0 0 0-16.12-53.25z"
        fill={darkMode ? '#444' : '#bbb'}
      />
      <path
        d="M528 256H48a48 48 0 0 0-48 48v96a48 48 0 0 0 48 48h480a48 48 0 0 0 48-48v-96a48 48 0 0 0-48-48zM384 384a32 32 0 1 1 32-32 32 32 0 0 1-32 32zm96 0a32 32 0 1 1 32-32 32 32 0 0 1-32 32z"
        fill="#808080"
      />
    </svg>
  )
}

platforms.register({
  id: 'unknown',
  name: 'Unknown',
  component: Index,
  types: { 65535: 'Unknown' },
  installation: {
    label: 'Registration Code',
    command: '[CODE]',
    qualifier: 'For generic device registration',
    instructions: 'This unique code allows any device to register with your account, keep it safe.',
  },
})
