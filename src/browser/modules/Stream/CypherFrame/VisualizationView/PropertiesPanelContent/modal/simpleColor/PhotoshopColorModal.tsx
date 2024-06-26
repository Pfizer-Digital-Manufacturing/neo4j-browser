import * as React from 'react'

import GenericModal from '../GenericModal'
import { ApplyButton, StyledDivMarginTopBottom } from '../styled'
import PhotoshopColorModalBody, {
  IPhotoshopColorModalBodyProps
} from './PhotoshopColorModalBody'

const PhotoshopColorModal: React.FC<
  Omit<IPhotoshopColorModalBodyProps, 'onClose'>
> = props => {
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])
  return (
    <StyledDivMarginTopBottom>
      <ApplyButton onClick={doOpen} backgroundColor={'#3e7218'}>
        Custom Color
      </ApplyButton>
      {open && (
        <GenericModal
          isOpen={open}
          onRequestClose={doClose}
          contentLabel={'Pick Color'}
        >
          <PhotoshopColorModalBody onClose={doClose} {...props} />
        </GenericModal>
      )}
    </StyledDivMarginTopBottom>
  )
}

export default PhotoshopColorModal
