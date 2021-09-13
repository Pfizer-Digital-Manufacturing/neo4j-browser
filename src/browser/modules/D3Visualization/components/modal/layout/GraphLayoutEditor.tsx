import * as React from 'react'
import { SimpleButton } from 'project-root/src/browser/modules/D3Visualization/components/modal/styled'
import styled from 'styled-components'
const LabelsContainer = styled.div`
  margin: 5px 20px;
  @media screen and (min-width: 900px) {
    min-width: 500px;
  }
`
const NodeDiv = styled.div`
  background: white;
  color: black;
  border: 1px solid black;
  border-radius: 50%;
  padding: 10px;
  text-align: center;
  display: inline-block;
  margin: 5px 3px;
`
interface ILabel {
  key: string
  count: number
}
const GraphLayoutEditor: React.FC<{
  closeSortEditing: () => void
  labels: ILabel[]
}> = ({ closeSortEditing, labels }) => {
  return (
    <div>
      <p>
        <SimpleButton onClick={closeSortEditing}>Back</SimpleButton>
      </p>
      <h5>Preview:</h5>
      <LabelsContainer>
        {labels.map(label => (
          <NodeDisplay key={label.key} label={label} />
        ))}
      </LabelsContainer>
    </div>
  )
}

const FlexContainer = styled.div`
  display: flex;
  text-align: center;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  }
`
const FirstCol = styled.div`
  flex: 1;
  line-height: 40px;
`
const SecondCol = styled.div`
  flex: 6;
`
const PlaceholderSpan = styled.span`
  font-size: 169%;
  margin: 0 5px;
`
const NodeDisplay: React.FC<{ label: ILabel }> = ({ label }) => {
  const nodes: React.ReactNode[] = React.useMemo(() => {
    const result: React.ReactNode[] = []
    for (let i = 0; i < Math.min(label.count, 5); i++) {
      result.push(<NodeDiv key={i}>{label.key}</NodeDiv>)
    }
    if (label.count > 5) {
      result.push(<PlaceholderSpan key={'end'}>...</PlaceholderSpan>)
      result.unshift(<PlaceholderSpan key={'start'}>...</PlaceholderSpan>)
    }
    return result
  }, [label])

  return (
    <FlexContainer>
      <FirstCol>({label.count})</FirstCol>
      <SecondCol>{nodes}</SecondCol>
    </FlexContainer>
  )
}
export default GraphLayoutEditor
