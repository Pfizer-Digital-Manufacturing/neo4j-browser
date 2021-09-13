import * as React from 'react'
import styled from 'styled-components'

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
const GraphLayoutItemDisplay: React.FC<{ label: ILabel }> = ({ label }) => {
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
export default GraphLayoutItemDisplay
