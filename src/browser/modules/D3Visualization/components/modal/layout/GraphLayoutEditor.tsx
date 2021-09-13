import * as React from 'react'
import { SimpleButton } from '../../modal/styled'
import styled from 'styled-components'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { DragStartEvent } from '@dnd-kit/core/dist/types'
import GraphLayoutSortableItem from 'project-root/src/browser/modules/D3Visualization/components/modal/layout/GraphLayoutSortableItem'
import GraphLayoutItem from 'project-root/src/browser/modules/D3Visualization/components/modal/layout/GraphLayoutItem'

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
const AbsoluteDiv = styled.div`
  position: absolute;
  opacity: 0;
`
const GraphLayoutEditor: React.FC<{
  closeSortEditing: () => void
  labels: ILabel[]
}> = ({ closeSortEditing, labels }) => {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [items, setItems] = React.useState(
    labels.map(t => Object.assign({ id: t.key }, t))
  )
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )
  React.useEffect(() => {
    setItems(items => {
      for (let i = 0; i < 100; i++) {
        items.push({
          key: i + '',
          id: i + '',
          count: Math.floor(Math.random() * 100)
        })
      }
      return items.slice()
    })
  }, [])
  const handleDragStart: (event: DragStartEvent) => void = React.useCallback(
    event => {
      const { active } = event
      setActiveId(active.id)
    },
    [setActiveId]
  )

  const handleDragEnd: (event: DragEndEvent) => void = React.useCallback(
    event => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        setItems(items => {
          const oldIndex = items.findIndex(t => t.id === active.id)
          const newIndex = items.findIndex(t => t.id === over.id)

          return arrayMove(items, oldIndex, newIndex)
        })
      }

      setActiveId(null)
    },
    [setActiveId]
  )

  const activeItem = React.useMemo(() => items.find(t => t.id === activeId), [
    items,
    activeId
  ])
  return (
    <div>
      <p>
        <SimpleButton onClick={closeSortEditing}>Back</SimpleButton>
      </p>
      <h5>Drag nodes to change their display order in the graph:</h5>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <LabelsContainer>
            {items.map(item => (
              <GraphLayoutSortableItem key={item.id} item={item} />
            ))}
          </LabelsContainer>
        </SortableContext>

        <DragOverlay>
          {activeItem ? (
            <GraphLayoutItem item={activeItem} hide={true} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default GraphLayoutEditor
