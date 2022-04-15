/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { StyleElement } from 'canvg'
import { cloneDeep } from 'lodash-es'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Action, Dispatch } from 'redux'

import { GraphStyle, Selector } from '../graphStyle'
import {
  StyledCaptionSelector,
  StyledCircleSelector,
  StyledInlineList,
  StyledInlineListItem,
  StyledInlineListStylePicker,
  StyledLabelToken,
  StyledPickerListItem,
  StyledPickerSelector,
  StyledTokenRelationshipType
} from './styled'
import SetupLabelModal, {
  ICaptionSettings
} from 'browser/modules/D3Visualization/components/modal/label/SetupLabelModal'
import SetupColorModal from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorModal'
import { IColorSettings } from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorStorage'
import { RelArrowCaptionPosition } from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelRelArrowSVG'
import Relationship from 'project-root/src/browser/modules/D3Visualization/lib/visualization/components/Relationship'
import VizNode from 'project-root/src/browser/modules/D3Visualization/lib/visualization/components/VizNode'
import { GlobalState } from 'shared/globalState'
import * as actions from 'shared/modules/grass/grassDuck'
import { toKeyString } from 'shared/services/utils'

export interface IStyleForLabelProps {
  'border-color': string
  'border-width': string
  caption: string
  color: string
  diameter: string
  'font-size': string
  'text-color-internal': string
}
export interface IStyleForLabel {
  props: IStyleForLabelProps & {
    colorSettings?: IColorSettings
    captionSettings?: ICaptionSettings
  }
  selector: {
    classes: string[]
    tag: string
  }
}
type GrassEditorProps = {
  nodes: VizNode[]
  relationships: Relationship[]
  graphStyleData?: any
  graphStyle?: GraphStyle
  update?: any
  selectedLabel?: { label: string; propertyKeys: string[] }
  selectedRelType?: { relType: string; propertyKeys: string[] }
}
function stringSorter(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}
export class GrassEditorComponent extends Component<GrassEditorProps> {
  graphStyle: GraphStyle
  nodeDisplaySizes: any
  picker: any
  widths: any
  constructor(props: any) {
    super(props)
    this.graphStyle = new GraphStyle()
    if (this.props.graphStyleData) {
      this.graphStyle.loadRules(this.props.graphStyleData)
    }
    this.nodeDisplaySizes = []
    this.widths = []
    for (let index = 0; index < 10; index++) {
      this.nodeDisplaySizes.push(`${12 + 2 * index}px`)
      this.widths.push(`${5 + 3 * index}px`)
    }
  }

  sizeLessThan(size1: string | undefined, size2: string | undefined): boolean {
    const size1Numerical = size1 ? parseInt(size1.replace('px', '')) : 0
    const size2Numerical = size2 ? parseInt(size2.replace('px', '')) : 0
    return size1Numerical <= size2Numerical
  }

  updateStyle = (selector: Selector, styleProp: any) => {
    this.graphStyle.changeForSelector(selector, styleProp)
    this.props.update(this.graphStyle.toSheet())
  }

  circleSelector(
    type: 'color' | 'size',
    styleProps: any,
    styleProvider: any,
    activeProvider: any,
    className: string,
    selector: Selector,
    textProvider = (_: any) => {
      return ''
    }
  ) {
    return styleProps.map((styleProp: any, i: any) => {
      const onClick = () => {
        this.updateStyle(selector, styleProp)
      }
      const style = styleProvider(styleProp, i)
      const text = textProvider(styleProp)
      const active = activeProvider(styleProp)
      return (
        <StyledPickerListItem
          className={className}
          key={toKeyString('circle' + i)}
          data-testid={`select-${type}-${i}`}
        >
          <StyledCircleSelector
            className={active ? 'active' : ''}
            style={style}
            onClick={onClick}
          >
            {text}
          </StyledCircleSelector>
        </StyledPickerListItem>
      )
    })
  }

  colorPicker(selector: any, styleForLabel: any) {
    return (
      <StyledInlineListItem key="color-picker">
        <StyledInlineList>
          <StyledInlineListItem>Color:</StyledInlineListItem>
          {this.circleSelector(
            'color',
            this.graphStyle.defaultColors(),
            (color: any) => {
              return { backgroundColor: color.color }
            },
            (color: any) => {
              return color.color === styleForLabel.get('color')
            },
            'color-picker-item',
            selector
          )}
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  sizePicker(selector: Selector, styleForLabel: any) {
    return (
      <StyledInlineListItem key="size-picker">
        <StyledInlineList data-testid="size-picker">
          <StyledInlineListItem>Size:</StyledInlineListItem>
          {this.circleSelector(
            'size',
            this.graphStyle.defaultSizes(),
            (_size: any, index: any) => {
              return {
                width: this.nodeDisplaySizes[index],
                height: this.nodeDisplaySizes[index]
              }
            },
            (size: any) => {
              return this.sizeLessThan(
                size.diameter,
                styleForLabel.get('diameter')
              )
            },
            'size-picker-item',
            selector
          )}
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  widthPicker(selector: Selector, styleForItem: any) {
    const widthSelectors = this.graphStyle
      .defaultArrayWidths()
      .map((widthValue: any, i: any) => {
        const onClick = () => {
          this.updateStyle(selector, widthValue)
        }
        const style = { width: this.widths[i] }
        const active =
          styleForItem.get('shaft-width') === widthValue['shaft-width']
        return (
          <StyledPickerListItem key={toKeyString('width' + i)}>
            <StyledPickerSelector
              className={active ? 'active' : ''}
              style={style}
              onClick={onClick}
            />
          </StyledPickerListItem>
        )
      })
    return (
      <StyledInlineListItem key="width-picker">
        <StyledInlineList>
          <StyledInlineListItem>Line width:</StyledInlineListItem>
          {widthSelectors}
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  labelPicker(
    selector: any,
    styleForItem: any,
    propertyKeys: string[],
    showTypeSelector = false,
    isNode = true,
    typeList: string[] = []
  ) {
    return (
      <StyledInlineListItem key="label-picker">
        <StyledInlineList className="label-picker picker">
          <SetupLabelModal
            selector={selector}
            itemStyleProps={styleForItem.props}
            propertyKeys={propertyKeys}
            showTypeSelector={showTypeSelector}
            typeList={typeList}
            updateStyle={props => {
              if (props) {
                const extraCaptionSettings = cloneDeep(props)
                this.updateStyle(selector, {
                  captionSettings:
                    extraCaptionSettings[RelArrowCaptionPosition.center]
                })
                delete extraCaptionSettings[RelArrowCaptionPosition.center]
                if (Object.keys(extraCaptionSettings).length > 0) {
                  this.updateStyle(selector, { extraCaptionSettings })
                } else {
                  this.updateStyle(selector, {
                    extraCaptionSettings: undefined
                  })
                }
              } else {
                this.updateStyle(selector, {
                  captionSettings: undefined,
                  extraCaptionSettings: undefined
                })
              }
            }}
            isNode={isNode}
          />
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  captionPicker(
    selector: Selector,
    styleForItem: any,
    propertyKeys: any,
    showTypeSelector = false
  ) {
    const captionSelector = (displayCaption: string, captionToSave: string) => {
      const onClick = () => {
        this.updateStyle(selector, { caption: captionToSave })
      }
      const active = styleForItem.props.caption === captionToSave
      return (
        <StyledPickerListItem key={toKeyString('caption' + displayCaption)}>
          <StyledCaptionSelector
            className={active ? 'active' : ''}
            onClick={onClick}
          >
            {displayCaption}
          </StyledCaptionSelector>
        </StyledPickerListItem>
      )
    }
    const captionSelectors = propertyKeys.map((propKey: any) => {
      return captionSelector(propKey, `{${propKey}}`)
    })
    let typeCaptionSelector = null
    if (showTypeSelector) {
      typeCaptionSelector = captionSelector('<type>', '<type>')
    }
    return (
      <StyledInlineListItem key="caption-picker">
        <StyledInlineList>
          <StyledInlineListItem>Caption:</StyledInlineListItem>
          {captionSelector('<id>', '<id>')}
          {typeCaptionSelector}
          {captionSelectors}
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  colorTypePicker({
    items,
    itemStyle,
    title
  }: {
    items: Array<Pick<VizNode, 'propertyMap'>>
    itemStyle: IStyleForLabel
    title: string
  }) {
    const propertiesSet: {
      [key: string]: Set<string>
    } = {}
    items.forEach(item => {
      for (const key in item.propertyMap) {
        if (item.propertyMap.hasOwnProperty(key)) {
          if (propertiesSet[key]) {
            propertiesSet[key].add(item.propertyMap[key])
          } else {
            propertiesSet[key] = new Set<string>([item.propertyMap[key]])
          }
        }
      }
    })
    const properties: {
      [key: string]: string[]
    } = {}
    for (const key in propertiesSet) {
      if (propertiesSet.hasOwnProperty(key)) {
        properties[key] = Array.from(propertiesSet[key]).sort(stringSorter)
      }
    }
    return (
      <StyledInlineListItem key="color-type-picker">
        <StyledInlineList className="color-type-picker picker">
          <SetupColorModal
            title={title}
            properties={properties}
            itemStyleProps={itemStyle.props}
            updateStyle={colorSettings => {
              this.updateStyle(itemStyle.selector, {
                colorSettings
              })
            }}
          />
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  stylePicker() {
    let pickers
    let title
    if (this.props.selectedLabel) {
      const labelList =
        this.props.selectedLabel.label !== '*'
          ? [this.props.selectedLabel.label]
          : []
      const styleForLabel = this.graphStyle.forNode({ labels: labelList })
      const inlineStyle = {
        backgroundColor: styleForLabel.get('color'),
        color: styleForLabel.get('text-color-internal'),
        cursor: 'default'
      }
      const displayCaptionPicker =
        styleForLabel.props?.captionSettings === undefined // do not show caption picker if label settings are set
      const displayColorPicker =
        styleForLabel.props?.colorSettings === undefined // do not show caption picker if label settings are set
      const propertyKeys = (
        this.props.selectedLabel.propertyKeys as string[]
      ).sort(stringSorter)
      pickers = [
        this.labelPicker(
          styleForLabel.selector,
          styleForLabel,
          propertyKeys,
          true,
          true,
          getTypeListForNodes(this.props.nodes, labelList)
        ),
        this.colorTypePicker({
          items: this.props.nodes.filter(node =>
            node.labels.includes(this.props.selectedLabel!.label)
          ),
          title: 'Color nodes by property values',
          itemStyle: styleForLabel
        }),
        this.sizePicker(styleForLabel.selector, styleForLabel)
      ]
      if (displayColorPicker) {
        pickers.push(this.colorPicker(styleForLabel.selector, styleForLabel))
      }
      if (displayCaptionPicker) {
        pickers.push(
          this.captionPicker(
            styleForLabel.selector,
            styleForLabel,
            propertyKeys
          )
        )
      }
      title = (
        <StyledLabelToken style={inlineStyle}>
          {this.props.selectedLabel.label || '*'}
        </StyledLabelToken>
      )
    } else if (this.props.selectedRelType) {
      const relTypeSelector =
        this.props.selectedRelType.relType !== '*'
          ? { type: this.props.selectedRelType.relType }
          : {}
      const styleForRelType = this.graphStyle.forRelationship(relTypeSelector)
      const inlineStyle = {
        backgroundColor: styleForRelType.get('color'),
        color: styleForRelType.get('text-color-internal'),
        cursor: 'default'
      }
      const displayCaptionPicker =
        styleForRelType.props?.captionSettings === undefined // do not show caption picker if label settings are set
      const displayColorPicker =
        styleForRelType.props?.colorSettings === undefined // do not show caption picker if label settings are set

      const propertyKeys = (
        this.props.selectedRelType.propertyKeys as string[]
      ).sort(stringSorter)

      pickers = [
        this.labelPicker(
          styleForRelType.selector,
          styleForRelType,
          propertyKeys,
          true,
          false
        ),
        this.colorTypePicker({
          items: this.props.relationships.filter(rel =>
            rel.type.includes(this.props.selectedRelType!.relType)
          ),
          title: 'Color relationships by property values',
          itemStyle: styleForRelType
        }),
        this.widthPicker(styleForRelType.selector, styleForRelType)
      ]
      if (displayColorPicker) {
        pickers.push(
          this.colorPicker(styleForRelType.selector, styleForRelType)
        )
      }
      if (displayCaptionPicker) {
        pickers.push(
          this.captionPicker(
            styleForRelType.selector,
            styleForRelType,
            propertyKeys,
            true
          )
        )
      }
      title = (
        <StyledTokenRelationshipType style={inlineStyle}>
          {this.props.selectedRelType.relType || '*'}
        </StyledTokenRelationshipType>
      )
    } else {
      return null
    }
    return (
      <StyledInlineListStylePicker>
        {title}
        {pickers}
      </StyledInlineListStylePicker>
    )
  }

  componentDidUpdate(prevProps: any) {
    if (
      this.props.graphStyleData &&
      prevProps.graphStyleData !== this.props.graphStyleData
    ) {
      this.graphStyle.loadRules(this.props.graphStyleData)
    }
  }

  render() {
    return this.stylePicker()
  }
}

function getTypeListForNodes(
  nodes: GrassEditorProps['nodes'],
  labels: string[]
): string[] {
  if (labels.length > 0) {
    const typeListSet = new Set<string>([labels[0]])
    nodes.forEach(node => {
      if (node.labels.length > 1 && node.labels.includes(labels[0])) {
        node.labels.forEach(l => typeListSet.add(l))
      }
    })
    return Array.from(typeListSet).sort((a, _) => (a === labels[0] ? -1 : 1))
  } else {
    return []
  }
}

const mapStateToProps = (state: GlobalState) => ({
  graphStyleData: actions.getGraphStyleData(state),
  meta: state.meta
})

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  update: (data: any) => {
    dispatch(actions.updateGraphStyleData(data))
  }
})

// @ts-ignore
export const GrassEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(GrassEditorComponent)
