import * as React from 'react'
import {
  PERSIST_LAYOUT_DIRECTION,
  PERSIST_LAYOUT_KEY,
  PERSIST_LAYOUT_TYPE
} from 'project-root/src/browser/modules/D3Visualization/components/Graph'
import { IGraphLayoutModalProps } from './GraphLayoutModal'
import styled from 'styled-components'

const Button = styled.button<{ active: boolean }>`
  padding: 3px 15px;
  border-radius: 1px;
  border: 1px solid ${({ active }) => (active ? '#e86d6d' : '#6f6f6f')};
  margin: 0 20px;

  ${({ theme }) => {
    const { secondaryButtonBackground } = theme
    return {
      background: secondaryButtonBackground
    }
  }}
  &:hover {
    ${({ theme }) => {
      const { secondaryButtonTextHover, secondaryButtonBackgroundHover } = theme
      return {
        color: secondaryButtonTextHover,
        background: secondaryButtonBackgroundHover
      }
    }}
  }
`

const GraphLayoutButtons: React.FC<Pick<
  IGraphLayoutModalProps,
  'onClose' | 'isOpen' | 'onDefaultLayoutClick' | 'onDirectionalLayoutClick'
> & {
  checkboxRef: React.RefObject<HTMLInputElement>
  openSortEditing: () => void
}> = ({
  isOpen,
  onClose,
  checkboxRef,
  onDefaultLayoutClick,
  onDirectionalLayoutClick,
  openSortEditing
}) => {
  const [currentMode, setCurrentMode] = React.useState<string | null>(null)
  React.useEffect(() => {
    setCurrentMode(localStorage.getItem(PERSIST_LAYOUT_KEY))
  }, [isOpen])
  const handleDirectionalClick = React.useCallback(() => {
    onDirectionalLayoutClick(checkboxRef.current?.checked ?? false)
    onClose()
  }, [onClose, onDirectionalLayoutClick, checkboxRef])
  const handleReset = React.useCallback(() => {
    onDefaultLayoutClick(checkboxRef.current?.checked ?? false)
    onClose()
  }, [onClose, onDefaultLayoutClick, checkboxRef])
  return (
    <>
      <Button
        onClick={handleDirectionalClick}
        active={currentMode === PERSIST_LAYOUT_DIRECTION}
      >
        <DirectionalFlowIcon />
        Directional flow from root node
      </Button>
      <Button
        onClick={openSortEditing}
        active={currentMode === PERSIST_LAYOUT_TYPE}
      >
        <TypeSortIcon />
        Sort by node type
      </Button>
      <Button onClick={handleReset} active={currentMode === null}>
        <DefaultIcon />
        Default layout
      </Button>
    </>
  )
}

const SVG = styled.svg`
  display: block;
  margin: 30px auto 20px;
  fill: ${props => props.theme.primaryText}
  stroke: ${props => props.theme.primaryText}
`
const Path = styled.path`
  fill: ${props => props.theme.primaryText};
`

const DefaultIcon = () => (
  <SVG width={100} height={50} viewBox={'0 0 100 50'}>
    <line x1={35} x2={65} y1={40} y2={40} />
    <line x1={50} x2={30} y1={7} y2={40} />
    <line x1={50} x2={70} y1={7} y2={40} />
    <circle cx={50} cy={7} r={5} strokeWidth={2} />
    <circle cx={30} cy={40} r={5} strokeWidth={2} />
    <circle cx={70} cy={40} r={5} strokeWidth={2} />
  </SVG>
)
const TypeSortIcon = () => (
  <SVG width={100} height={50} viewBox={'0 0 100 50'}>
    <line x1={40} x2={30} y1={7} y2={40} />
    <line x1={40} x2={50} y1={7} y2={40} />

    <line x1={60} x2={30} y1={7} y2={40} />
    <line x1={60} x2={70} y1={7} y2={40} />

    <circle cx={40} cy={7} r={5} fill={'#c05959'} strokeWidth={2} />
    <circle cx={60} cy={7} r={5} fill={'#c05959'} strokeWidth={2} />

    <circle cx={30} cy={40} r={5} fill={'#225a6b'} strokeWidth={2} />
    <circle cx={50} cy={40} r={5} fill={'#225a6b'} strokeWidth={2} />
    <circle cx={70} cy={40} r={5} fill={'#225a6b'} strokeWidth={2} />
  </SVG>
)
const DirectionalFlowIcon = () => (
  <SVG width={165} height={30} viewBox={'0 0 110 20'}>
    <line x1={15} x2={45} y1={10} y2={10} />
    <ArrowHead x={45} />
    <line x1={55} x2={85} y1={10} y2={10} />
    <ArrowHead x={85} />
    <circle
      cx={10}
      cy={10}
      r={5}
      fill={'#c05959'}
      stroke={'#f68e8e'}
      strokeWidth={2}
    />
    <circle cx={50} cy={10} r={5} strokeWidth={2} />
    <circle cx={90} cy={10} r={5} strokeWidth={2} />
  </SVG>
)
const ArrowHead: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x}, 0)`}>
    <Path
      d={`
    M 0 10
    L -5 13
    L -5 7
    Z
  `}
      stroke={'transparent'}
    />
  </g>
)
export default GraphLayoutButtons
