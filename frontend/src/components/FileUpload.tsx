import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { makeStyles, Typography, Box, ButtonBase } from '@material-ui/core'
import { spacing } from '../styling'

export const FileUpload: React.FC<{ onUpload: (data: any) => void }> = ({ onUpload }) => {
  const onDrop = useCallback(files => {
    console.log('FILE DROPPED', files)
    onUpload(files[0])
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
  const css = useStyles({ isDragActive })

  return (
    <ButtonBase className={css.paper} {...getRootProps()}>
      <input {...getInputProps()} />
      <Box>
        <Typography variant="body2">Upload metadata file</Typography>
        <Typography variant="caption">Drag and drop or click to upload</Typography>
      </Box>
    </ButtonBase>
  )
}

type styleProps = { isDragActive: boolean }

const useStyles = makeStyles(({ palette }) => ({
  paper: ({ isDragActive }: styleProps) => ({
    border: `2px dotted ${isDragActive ? palette.primary.main : palette.grayLightest.main}`,
    background: palette.grayLightest.main,
    padding: `${spacing.lg}px ${spacing.xl}px`,
    width: '100%',
    '&:hover': { background: palette.primaryHighlight.main, borderColor: palette.primaryHighlight.main },
  }),
}))
