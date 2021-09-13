import * as React from 'react'
import GenericModal from 'browser/modules/D3Visualization/components/modal/GenericModal'
import { IGraphLayoutStats } from 'browser/modules/D3Visualization/components/Graph'
import { SimpleButton } from 'browser/modules/D3Visualization/components/modal/styled'
import styled from 'styled-components'
import GraphLayoutEditor from './GraphLayoutEditor'
import GraphLayoutButtons from './GraphLayoutButtons'

export interface IGraphLayoutModalProps {
  isOpen: boolean
  onClose: () => void
  stats: IGraphLayoutStats
  onDirectionalLayoutClick: (persist: boolean) => void
  onDefaultLayoutClick: (persist: boolean) => void
}

const MarginDiv = styled.div`
  margin-top: 20px;
`
const CheckboxContainer = styled.div`
  margin: 20px;
`
const CheckboxInput = styled.input`
  margin-right: 5px;
`

const GraphLayoutModal: React.FC<IGraphLayoutModalProps> = props => {
  const { stats, isOpen, onClose } = props

  const checkboxRef = React.useRef<HTMLInputElement>(null)

  const labels = React.useMemo(() => {
    return Object.keys(stats.labels)
      .filter(key => key !== '*')
      .map(key => {
        return {
          key,
          count: stats.labels[key].count
        }
      })
  }, [stats])
  const [isSortEditing, setIsSortEditing] = React.useState(false)
  const openSortEditing = React.useCallback(() => setIsSortEditing(true), [])
  const closeSortEditing = React.useCallback(() => setIsSortEditing(false), [])

  return (
    <GenericModal isOpen={isOpen} onRequestClose={onClose}>
      <h2>Graph Layout</h2>
      {isSortEditing ? (
        <GraphLayoutEditor
          closeSortEditing={closeSortEditing}
          labels={labels}
        />
      ) : (
        <GraphLayoutButtons
          {...props}
          checkboxRef={checkboxRef}
          openSortEditing={openSortEditing}
        />
      )}
      <CheckboxContainer>
        <label>
          <CheckboxInput type={'checkbox'} ref={checkboxRef} />
          Use selected layout for future requests
        </label>
      </CheckboxContainer>
      <MarginDiv>
        <SimpleButton onClick={onClose}>Cancel</SimpleButton>
      </MarginDiv>
    </GenericModal>
  )
}

export default GraphLayoutModal
