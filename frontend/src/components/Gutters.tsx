import React from 'react'
import classnames from 'classnames'
import { makeStyles } from '@mui/styles'
import { spacing, Spacing } from '../styling'

type Props = {
  inset?: Spacing | 'icon' | null
  size?: Spacing | null
  bottom?: Spacing | null
  top?: Spacing | null
  center?: boolean
  className?: string
  children?: React.ReactNode
}

export const Gutters: React.FC<Props> = ({ inset, size, center, className, bottom, top, children, ...props }) => {
  const css = useStyles({ inset, size, bottom, top, center })
  return (
    <div className={classnames(css.gutters, className)} {...props}>
      {children}
    </div>
  )
}

const useStyles = makeStyles({
  gutters: ({ inset, size = 'xl', bottom = 'md', top = 'md', center }: Props) => ({
    margin: `${top ? spacing[top] : 0}px ${size ? spacing[size] : 0}px ${bottom ? spacing[bottom] : 0}px`,
    paddingLeft: inset ? (inset === 'icon' ? 44 : spacing[inset]) : 0,
    textAlign: center ? 'center' : undefined,
  }),
})
