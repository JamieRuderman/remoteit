import md5 from 'md5'
import React from 'react'
import fallbackImage from './user.png'
import { makeStyles, Avatar as MuiAvatar } from '@material-ui/core'

export interface Props {
  email?: string
  size?: number
  button?: boolean
  label?: boolean
}

export const Avatar: React.FC<Props> = ({ email, size = 40, button, label }) => {
  const css = useStyles(size)()
  const url = `https://www.gravatar.com/avatar/${md5(email || '')}?s=${size * 2}&d=force-fail`
  const style = { height: size, width: size }

  return (
    <span className={label ? css.label : ''}>
      <MuiAvatar component="span" className={button ? css.avatar : ''} alt={email} style={style} src={url}>
        <img src={fallbackImage} alt={email} className={css.img} style={style} />
      </MuiAvatar>
      {label && email}
    </span>
  )
}

const useStyles = size =>
  makeStyles(({ palette }) => ({
    label: {
      display: 'flex',
      borderRadius: '50%',
    },
    avatar: {
      borderWidth: 3,
      borderStyle: 'solid',
      borderColor: palette.white.main,
      '&:hover': { borderColor: palette.primaryLight.main },
      backgroundColor: `${palette.primary.main} !important`,
    },
    img: {
      backgroundColor: `${palette.primary.main} !important`,
    },
  }))
