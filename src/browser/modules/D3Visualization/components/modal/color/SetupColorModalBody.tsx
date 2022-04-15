import { cloneDeep } from 'lodash-es'
import * as React from 'react'
import styled from 'styled-components'

import { IColorSettings, ISetupColorStorageProps } from './SetupColorStorage'
import { IStyleForLabelProps } from 'project-root/src/browser/modules/D3Visualization/components/GrassEditor'
import SetupColorPicker from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorPicker'

const Container = styled.div`
  padding: 10px 20px;
  max-height: 70vh;
  overflow-y: auto;
`
const InputMarginRight = styled.input`
  margin-right: 5px;
  vertical-align: middle;
`
const Label = styled.label`
  display: block;
  cursor: pointer;
  margin: 5px 0;
  vertical-align: middle;
`
const SetupColorModalBody: React.FC<
  ISetupColorStorageProps & {
    colorSettings: IColorSettings
    onSubmit: (settings?: IColorSettings) => void
    handlePropertyChange: React.ChangeEventHandler<HTMLInputElement>
    selectedProperty: string | undefined
  }
> = props => {
  const {
    properties,
    colorSettings,
    onSubmit,
    doClose,
    selectedProperty,
    handlePropertyChange,
    title
  } = props
  const keys = React.useMemo(
    () => Object.keys(properties).sort((a, b) => (a > b ? 1 : -1)),
    [properties]
  )

  const handleSubmit: (settings?: IColorSettings['settings']) => void =
    React.useCallback(
      settings => {
        onSubmit(
          settings
            ? {
                key: colorSettings.key,
                settings
              }
            : undefined
        )
      },
      [colorSettings, onSubmit]
    )
  return (
    <Container>
      <h3>{title}</h3>
      <div>
        {keys.map(key => (
          <Label key={key}>
            <InputMarginRight
              type={'radio'}
              name={'type'}
              value={key}
              onChange={handlePropertyChange}
              checked={key === selectedProperty}
            />
            {key}
          </Label>
        ))}
      </div>
      {selectedProperty && (
        <SetupColorPicker
          values={properties[selectedProperty]}
          onSubmit={handleSubmit}
          onClose={doClose}
          initialColorSettings={colorSettings.settings}
        />
      )}
    </Container>
  )
}

export default SetupColorModalBody
