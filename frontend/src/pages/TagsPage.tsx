import React, { useEffect } from 'react'
import { Tag } from '../components/Tag'
import { Icon } from '../components/Icon'
import { Title } from '../components/Title'
import { TagEditor } from '../components/TagEditor'
import { Container } from '../components/Container'
import { Typography, List } from '@material-ui/core'
import { InlineTextFieldSetting } from '../components/InlineTextFieldSetting'
import { ApplicationState, Dispatch } from '../store'
import { useSelector, useDispatch } from 'react-redux'
import { REGEX_TAG_SAFE } from '../shared/constants'
import analyticsHelper from '../helpers/analyticsHelper'

export const TagsPage: React.FC = () => {
  const dispatch = useDispatch<Dispatch>()
  const { removing, renaming, labels, tags } = useSelector((state: ApplicationState) => ({
    removing: state.tags.removing,
    renaming: state.tags.renaming,
    labels: state.labels,
    tags: state.tags.all,
  }))

  useEffect(() => {
    analyticsHelper.page('TagsPage')
  }, [])

  return (
    <Container
      gutterBottom
      header={
        <>
          <Typography variant="h1">
            <Title>Tags</Title>
            <TagEditor button />
          </Typography>
        </>
      }
    >
      <List>
        {tags.map((tag, index) => (
          <InlineTextFieldSetting
            key={index}
            value={tag.name}
            icon={
              renaming === tag.name ? (
                <Icon name="spinner-third" spin />
              ) : (
                <Tag dot tag={tag} labels={labels} size="base" />
              )
            }
            resetValue={tag.name}
            filter={REGEX_TAG_SAFE}
            disabled={removing === tag.name || renaming === tag.name}
            warning="This can not be undone. All devices will have this tag removed from them."
            onDelete={() => dispatch.tags.delete(tag)}
            onSave={value => dispatch.tags.rename({ tag, name: value.toString() })}
          />
        ))}
      </List>
    </Container>
  )
}
