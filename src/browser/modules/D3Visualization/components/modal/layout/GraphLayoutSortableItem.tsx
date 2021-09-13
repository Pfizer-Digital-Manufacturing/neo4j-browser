import * as React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import GraphLayoutItem from './GraphLayoutItem'
interface IProps {
  item: {
    key: string
    count: number
    id: string
  }
}
const GraphLayoutSortableItem: React.FC<IProps> = ({ item }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: item.id })

  const style = React.useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition: transition!
    }),
    [transform, transition]
  )
  return (
    <GraphLayoutItem
      ref={setNodeRef}
      item={item}
      style={style}
      {...attributes}
      {...listeners}
    />
  )
}

export default GraphLayoutSortableItem
