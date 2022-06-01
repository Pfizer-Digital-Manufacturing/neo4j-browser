import * as React from 'react'
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'
import { clone } from 'lodash-es'
import { AddIcon } from 'browser-components/icons/LegacyIcons'
import { ApplyButton } from 'project-root/src/browser/modules/Stream/CypherFrame/VisualizationView/PropertiesPanelContent/modal/styled'

const Container = styled.div`
  padding-top: 10px;
`

const Inline = styled.div`
  display: inline-block;
  vertical-align: middle;
  margin: 0 5px;
`
const AddButtonContainer = styled.div`
  display: inline-block;
  margin: 0 5px;
  cursor: pointer;
  fill: ${({ theme }) => theme.primaryText};
  vertical-align: unset;
`

interface IProps {
  onSelect: (value: string) => void
  properties: string[]
  selectedCaption: string
}

interface IDisplayItem {
  property: string
  textRight: string
  textLeft: string
  id: string
}

function generateDisplayItem(property: string): IDisplayItem {
  return {
    id: uuidv4(),
    property,
    textRight: '',
    textLeft: ''
  }
}
// Reload on caption change
const SetupLabelCompositePropertyWrapper: React.FC<IProps> = props => {
  const { selectedCaption } = props
  const [show, setShow] = React.useState(true)
  React.useEffect(() => {
    setShow(false)
  }, [selectedCaption])
  React.useEffect(() => {
    if (!show) {
      setShow(true)
    }
  }, [show])
  return show ? <SetupLabelCompositePropertyMemoed {...props} /> : null
}
const SetupLabelCompositeProperty: React.FC<IProps> = ({
  properties,
  onSelect,
  selectedCaption
}) => {
  const [items, setItems] = React.useState<IDisplayItem[]>(() => {
    if (selectedCaption === '') {
      return [generateDisplayItem(properties[0])]
    } else {
      const result: IDisplayItem[] = []
      const s = selectedCaption
      const propsInCaption: Array<{
        si: number
        se: number
      }> = []
      let i = 0
      let flag = true
      while (flag) {
        const si = s.indexOf('{', i)
        const se = s.indexOf('}', si)
        if (si !== -1 && se !== -1) {
          propsInCaption.push({
            si,
            se
          })
          i = se
        } else {
          flag = false
        }
      }
      if (propsInCaption.length === 0) {
        return [generateDisplayItem(properties[0])]
      } else {
        let lastSe = s.length
        for (let index = propsInCaption.length - 1; index >= 0; index--) {
          const t = propsInCaption[index]
          const item: IDisplayItem = generateDisplayItem(
            s.substring(t.si + 1, t.se)
          )
          if (index === 0) {
            item.textLeft = s.substring(0, t.si)
          }
          item.textRight = s.substring(t.se + 1, lastSe)
          lastSe = t.si
          result.push(item)
        }
      }
      return result.reverse()
    }
  })
  const addItem = React.useCallback(() => {
    setItems(items => {
      const cloned = clone(items)
      cloned.push(generateDisplayItem(properties[0]))
      return cloned
    })
  }, [properties])
  const removeItem = React.useCallback((item: IDisplayItem) => {
    setItems(items => {
      const cloned = clone(items)
      const index = cloned.findIndex(t => t === item)
      if (index !== -1) {
        cloned.splice(index, 1)
      }
      return cloned
    })
  }, [])
  const handleSet = React.useCallback(() => {
    let output = items[0].textLeft
    items.forEach(item => {
      output += `{${item.property}}` + item.textRight
    })
    onSelect(output)
  }, [items, onSelect])

  if (properties.length === 0) {
    return <div>Element has no properties</div>
  }

  return (
    <Container>
      <PropInput item={items[0]} prop={'textLeft'} />
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <PropSelect
            item={item}
            properties={properties}
            onDelete={removeItem}
            showDelete={index !== 0}
          />
          <PropInput item={item} prop={'textRight'} />
        </React.Fragment>
      ))}
      <AddButtonContainer onClick={addItem}>
        <AddIcon />
      </AddButtonContainer>
      <Inline>
        <ApplyButton onClick={handleSet}>Set</ApplyButton>
      </Inline>
    </Container>
  )
}
const SetupLabelCompositePropertyMemoed = React.memo(
  SetupLabelCompositeProperty
)
const Select = styled.select`
  color: black;
  vertical-align: middle;
  padding: 0 3px;
`
const SpecialOption = styled.option`
  font-weight: bold;
`
const deleteOptionValue = '$delete$'
const PropSelect: React.FC<{
  properties: string[]
  item: IDisplayItem
  onDelete: (item: IDisplayItem) => void
  showDelete: boolean
}> = ({ properties, item, onDelete, showDelete }) => {
  const [value, setValue] = React.useState(item.property)
  React.useEffect(() => {
    setValue(item.property)
  }, [item.property])
  const onChange: React.ChangeEventHandler<HTMLSelectElement> =
    React.useCallback(
      event => {
        const newValue = event.target.value
        if (newValue === deleteOptionValue) {
          onDelete(item)
        } else {
          item.property = newValue
          setValue(newValue)
        }
      },
      [item, onDelete]
    )
  return (
    <Select value={value} onChange={onChange}>
      {showDelete && (
        <optgroup label={'Actions'}>
          <SpecialOption value={deleteOptionValue}>Delete</SpecialOption>
        </optgroup>
      )}
      <optgroup label={'Properties'}>
        {properties.map(t => (
          <option key={t}>{t}</option>
        ))}
      </optgroup>
    </Select>
  )
}
const Input = styled.input`
  width: 50px;
  margin: 5px;
  text-decoration: underline;
  background: transparent;
  text-align: center;
  vertical-align: middle;
`
const PropInput: React.FC<{
  item: IDisplayItem
  prop: Extract<keyof IDisplayItem, 'textLeft' | 'textRight'>
}> = ({ item, prop }) => {
  const propVal = item[prop]
  const [value, setValue] = React.useState(propVal)
  React.useEffect(() => {
    setValue(propVal)
  }, [propVal])

  const handleChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      e => {
        const newValue = e.target.value.replace(/[{}]/g, '')
        item[prop] = newValue
        setValue(newValue)
      },
      [item, prop]
    )
  return <Input value={value} onChange={handleChange} />
}

export default React.memo(SetupLabelCompositePropertyWrapper)
