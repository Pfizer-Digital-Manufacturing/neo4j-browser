import * as React from 'react'
import GraphLayoutItemDisplay from 'project-root/src/browser/modules/D3Visualization/components/modal/layout/GraphLayoutItemDisplay'

// eslint-disable-next-line react/display-name
const GraphLayoutItem = React.forwardRef<
  HTMLDivElement,
  {
    item: {
      key: string
      count: number
      id: string
    }
    hide?: boolean
    style?: any
  }
>((props, ref) => (
  <div ref={ref} {...props}>
    <GraphLayoutItemDisplay label={props.item} />
  </div>
))
export default GraphLayoutItem
