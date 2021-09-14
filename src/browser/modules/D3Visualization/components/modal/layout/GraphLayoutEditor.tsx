import * as React from 'react'
import { SimpleButton } from '../../modal/styled'
import styled from 'styled-components'
import GraphLayoutItemDisplay from 'project-root/src/browser/modules/D3Visualization/components/modal/layout/GraphLayoutItemDisplay'
import { AnimateSharedLayout } from 'framer-motion'

interface ILabel {
  key: string
  count: number
}

const LabelsContainer = styled.div`
  margin: 5px 20px;
  max-height: 400px;
  overflow-y: auto;
  @media screen and (min-width: 900px) {
    min-width: 500px;
  }
`

const GraphLayoutEditor: React.FC<{
  closeSortEditing: () => void
  labels: ILabel[]
}> = ({ closeSortEditing, labels }) => {
  const [items, setItems] = React.useState(labels.slice())
  const moveUp: (item: ILabel) => void = React.useCallback(
    item =>
      setItems(oldItems => {
        const cloned = oldItems.slice()
        const index = cloned.findIndex(t => t === item)
        if (index > 0) {
          const temp = cloned[index - 1]
          cloned[index - 1] = item
          cloned[index] = temp
        }
        return cloned
      }),
    [setItems]
  )

  const moveDown: (item: ILabel) => void = React.useCallback(
    item =>
      setItems(oldItems => {
        const cloned = oldItems.slice()
        const index = cloned.findIndex(t => t === item)
        if (index < cloned.length - 1) {
          const temp = cloned[index + 1]
          cloned[index + 1] = item
          cloned[index] = temp
        }
        return cloned
      }),
    [setItems]
  )
  return (
    <div>
      <p>
        <SimpleButton onClick={closeSortEditing}>Back</SimpleButton>
      </p>
      <h5>Drag nodes to change their display order in the graph:</h5>
      <LabelsContainer>
        <AnimateSharedLayout>
          {items.map(item => (
            <GraphLayoutItemDisplay
              key={item.key}
              label={item}
              onUp={moveUp}
              onDown={moveDown}
            />
          ))}
        </AnimateSharedLayout>
      </LabelsContainer>
    </div>
  )
}

export default GraphLayoutEditor
