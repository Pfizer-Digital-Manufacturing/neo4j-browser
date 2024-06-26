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
import { PairwiseArcsRelationshipRouting } from './utils/PairwiseArcsRelationshipRouting'
import { measureText } from '../../../utils/textMeasurement'
import { GraphModel } from '../../../models/Graph'
import { GraphStyleModel } from '../../../models/GraphStyle'
import { NodeCaptionLine, NodeModel } from '../../../models/Node'
import { RelationshipModel } from '../../../models/Relationship'
import {
  includePropertyNameKey,
  replaceUnderscoresWithSpaces
} from 'project-root/src/browser/modules/Stream/CypherFrame/VisualizationView/PropertiesPanelContent/modal/label/SetupLabelDisplaySettings'
import { ICaptionSettingsStore } from 'project-root/src/browser/modules/Stream/CypherFrame/VisualizationView/PropertiesPanelContent/modal/label/SetupLabelStorage'
import { RelArrowCaptionPosition } from 'project-root/src/browser/modules/Stream/CypherFrame/VisualizationView/PropertiesPanelContent/modal/label/SetupLabelRelArrowSVG'
import { flatten } from 'lodash-es'
import {
  allLabelPositions,
  ICaptionSettings
} from 'project-root/src/browser/modules/Stream/CypherFrame/VisualizationView/PropertiesPanelContent/modal/label/SetupLabelModal'

export class GraphGeometryModel {
  relationshipRouting: PairwiseArcsRelationshipRouting
  style: GraphStyleModel
  canvas: HTMLCanvasElement
  constructor(style: GraphStyleModel) {
    this.style = style
    this.relationshipRouting = new PairwiseArcsRelationshipRouting(this.style)
    this.canvas = document.createElement('canvas')
  }

  formatNodeCaptions(nodes: NodeModel[]): void {
    const canvas2DContext = this.canvas.getContext('2d')
    if (canvas2DContext) {
      nodes.forEach(
        node =>
          (node.caption = fitCaptionIntoCircle(
            node,
            this.style,
            canvas2DContext
          ))
      )
    }
  }

  formatRelationshipCaptions(relationships: RelationshipModel[]): void {
    relationships.forEach(relationship => {
      const currentStyle = this.style.forRelationship(relationship)
      const template = currentStyle.get('caption')
      relationship.caption = this.style.interpolate(template, relationship)

      const captionSettings: ICaptionSettings =
        currentStyle.get('captionSettings')
      // center caption
      if (captionSettings) {
        relationship.captionSettingsArray = []
        allLabelPositions.forEach(position => {
          const currentStyle = captionSettings[position]
          if (currentStyle?.caption) {
            let caption = this.style.interpolate(
              currentStyle.caption,
              relationship
            )
            if (currentStyle[replaceUnderscoresWithSpaces]) {
              caption = caption.replace(/[_]/g, ' ')
            }
            if (currentStyle[includePropertyNameKey]) {
              caption =
                `${currentStyle.caption.replace(/[{}]/g, '')}: ` + caption
            }
            relationship.captionSettingsArray.push(
              Object.assign({}, currentStyle, {
                caption,
                yOffset: 0
              })
            )
          }
        })
        const arrLength = relationship.captionSettingsArray.length
        switch (arrLength) {
          case 2:
            relationship.captionSettingsArray[0].yOffset = -4
            relationship.captionSettingsArray[1].yOffset = 4
            break
          case 3:
            relationship.captionSettingsArray[0].yOffset = -8
            relationship.captionSettingsArray[2].yOffset = 8
            break
        }
      } else {
        //@ts-ignore
        delete relationship.captionSettingsArray
      }

      const extraCaptionSettings: ICaptionSettingsStore = currentStyle.get(
        'extraCaptionSettings'
      )
      // other captions
      if (extraCaptionSettings) {
        relationship.sideCaptions = {}
        Object.keys(extraCaptionSettings).forEach(relCaptionPosition => {
          const positionInt: RelArrowCaptionPosition = parseInt(
            relCaptionPosition,
            10
          )
          if (extraCaptionSettings.hasOwnProperty(relCaptionPosition)) {
            const arr: any[] = []
            relationship.sideCaptions[relCaptionPosition] = arr
            const settings: ICaptionSettings = extraCaptionSettings[positionInt]
            allLabelPositions.forEach(position => {
              const currentStyle = settings[position]
              if (currentStyle?.caption) {
                let caption = this.style.interpolate(
                  currentStyle.caption,
                  relationship
                )
                if (currentStyle[replaceUnderscoresWithSpaces]) {
                  caption = caption.replace(/[_]/g, ' ')
                }
                if (currentStyle[includePropertyNameKey]) {
                  caption =
                    `${currentStyle.caption.replace(/[{}]/g, '')}: ` + caption
                }
                arr.push(
                  Object.assign({}, currentStyle, {
                    caption,
                    yOffset: 0,
                    position: positionInt
                  })
                )
              }
            })
            const arrLength = arr.length
            switch (arrLength) {
              case 2:
                if (
                  [
                    RelArrowCaptionPosition.startAbove,
                    RelArrowCaptionPosition.endAbove
                  ].includes(positionInt)
                ) {
                  arr[0].yOffset = -8
                  arr[1].yOffset = 0
                } else {
                  arr[0].yOffset = 0
                  arr[1].yOffset = 8
                }
                break
              case 3:
                if (
                  [
                    RelArrowCaptionPosition.startAbove,
                    RelArrowCaptionPosition.endAbove
                  ].includes(positionInt)
                ) {
                  arr[0].yOffset = -16
                  arr[1].yOffset = -8
                  arr[2].yOffset = 0
                } else {
                  arr[0].yOffset = 0
                  arr[1].yOffset = 8
                  arr[2].yOffset = 16
                }
                break
            }
          }
        })
      } else {
        delete relationship.sideCaptions
      }
    })
  }

  setNodeRadii(nodes: NodeModel[]): void {
    nodes.forEach(node => {
      node.radius = parseFloat(this.style.forNode(node).get('diameter')) / 2
    })
  }

  onGraphChange(
    graph: GraphModel,
    options = { updateNodes: true, updateRelationships: true }
  ): void {
    if (!!options.updateNodes) {
      this.setNodeRadii(graph.nodes())
      this.formatNodeCaptions(graph.nodes())
    }

    if (!!options.updateRelationships) {
      this.formatRelationshipCaptions(graph.relationships())
      this.relationshipRouting.measureRelationshipCaptions(
        graph.relationships()
      )
    }
  }

  onTick(graph: GraphModel): void {
    this.relationshipRouting.layoutRelationships(graph)
  }
}

interface IWordObject {
  word: string
  belongsTo: number
  fontWeight: string
  fontStyle: string
  textDecoration: string
}
const fitMultipleCaptionsIntoCircle = function (
  node: NodeModel,
  style: GraphStyleModel,
  captionSettings: ICaptionSettings,
  canvas2DContext: CanvasRenderingContext2D
) {
  const fontSize = parseFloat(style.forNode(node).get('font-size'))
  const maxLines = (node.radius * 2) / fontSize
  const styleForNode = style.forNode(node)
  const wordsObjects: IWordObject[] = flatten(
    allLabelPositions.map((position, index) => {
      const currentStyle = captionSettings[position]
      if (currentStyle.caption) {
        const nodeText: string = style.interpolate(
          currentStyle.caption,
          node,
          currentStyle
        )
        const captionText: string =
          nodeText.length > 100 ? nodeText.substring(0, 100) : nodeText
        const fontWeight =
          currentStyle['font-weight'] ?? styleForNode.get('font-weight')
        const fontStyle =
          currentStyle['font-style'] ?? styleForNode.get('font-style')
        const textDecoration =
          currentStyle['text-decoration'] ??
          style.forNode(node).get('text-decoration')
        let words: string[] = captionText.split(' ')
        if (currentStyle[replaceUnderscoresWithSpaces]) {
          words = flatten(
            words.map(w => {
              if (w.indexOf('_') === -1) {
                return w
              } else {
                return w.split('_')
              }
            })
          )
        }
        if (currentStyle[includePropertyNameKey]) {
          words.unshift(`${currentStyle.caption.replace(/[{}]/g, '')}:`)
        }
        return words.map(word => ({
          word,
          belongsTo: index,
          fontWeight,
          fontStyle,
          textDecoration
        }))
      }
      return []
    })
  )

  const fontFamily = 'sans-serif'
  const lineHeight = fontSize
  const square = (distance: any) => distance * distance
  const addShortenedNextWord = (line: any, word: any, measure: any) => {
    const result = []
    while (!(word.length <= 2)) {
      word = `${word.substr(0, word.length - 2)}\u2026`
      if (measure(word) < line.remainingWidth) {
        line.text += ` ${word}`
        break
      } else {
        result.push(undefined)
      }
    }
    return result
  }
  const noEmptyLines = function (lines: any[]) {
    for (const line of Array.from(lines)) {
      if (line.text.length === 0) {
        return false
      }
    }
    return true
  }

  const emptyLine = ({
    lineCount,
    iLine,
    style,
    node,
    lineHeight,
    fontWeight,
    fontStyle,
    textDecoration
  }: {
    lineCount: number
    style: any
    node: any
    iLine: number
    lineHeight: number
    fontWeight?: string
    fontStyle?: string
    textDecoration?: string
  }) => {
    let baseline = (1 + iLine - lineCount / 2) * lineHeight
    if (style.forNode(node).get('icon-code')) {
      baseline = baseline + node.radius / 3
    }
    const containingHeight =
      iLine < lineCount / 2 ? baseline - lineHeight : baseline
    const lineWidth =
      Math.sqrt(square(node.radius) - square(containingHeight)) * 2
    return {
      node,
      text: '',
      baseline,
      remainingWidth: lineWidth,
      fontWeight,
      fontStyle,
      textDecoration
    }
  }
  const fitMultipleOnFixedNumberOfLines = ({
    lineCount,
    words
  }: {
    lineCount: any
    words: IWordObject[]
  }): [any, number] => {
    const measure = (text: string) =>
      measureText(text, fontFamily, fontSize, canvas2DContext)

    const lines = []
    let iWord = 0
    for (
      let iLine = 0, end = lineCount - 1, asc = end >= 0;
      asc ? iLine <= end : iLine >= end;
      asc ? iLine++ : iLine--
    ) {
      const line = emptyLine({ lineCount, iLine, node, lineHeight, style })
      const currentWord = words[iWord]
      let currentCaptionIndex: number | undefined
      if (currentWord) {
        currentCaptionIndex = currentWord.belongsTo
        line.fontWeight = currentWord.fontWeight
        line.fontStyle = currentWord.fontStyle
        line.textDecoration = currentWord.textDecoration
      }
      while (
        iWord < words.length &&
        measure(` ${words[iWord].word}`) < line.remainingWidth &&
        currentCaptionIndex === words[iWord].belongsTo
      ) {
        line.text += ` ${words[iWord].word}`
        line.remainingWidth -= measure(` ${words[iWord].word}`)
        iWord++
      }
      lines.push(line)
    }
    if (iWord < words.length) {
      addShortenedNextWord(lines[lineCount - 1], words[iWord].word, measure)
    }
    return [lines, iWord]
  }

  let lines = [emptyLine({ lineCount: 1, iLine: 0, lineHeight, style, node })]
  let consumedWords = 0
  for (
    let lineCount = 1, end = maxLines, asc = end >= 1;
    asc ? lineCount <= end : lineCount >= end;
    asc ? lineCount++ : lineCount--
  ) {
    const [candidateLines, candidateWords] = Array.from(
      fitMultipleOnFixedNumberOfLines({
        lineCount,
        words: wordsObjects
      })
    )
    if (noEmptyLines(candidateLines)) {
      ;[lines, consumedWords] = Array.from([candidateLines, candidateWords])
    }
    if (consumedWords >= wordsObjects.length) {
      return lines
    }
  }
  return lines
}
const fitCaptionIntoCircle = (
  node: NodeModel,
  style: GraphStyleModel,
  canvas2DContext: CanvasRenderingContext2D
): NodeCaptionLine[] => {
  const captionSettingsInput = style.forNode(node).get('captionSettings')
  const captionSettings: ICaptionSettings | null =
    captionSettingsInput === '' ? null : captionSettingsInput
  if (captionSettings) {
    return fitMultipleCaptionsIntoCircle(
      node,
      style,
      captionSettings,
      canvas2DContext
    )
  }

  const fontFamily = 'sans-serif'
  const fontSize = parseFloat(style.forNode(node).get('font-size'))
  // Roughly calculate max text length the circle can fit by radius and font size
  const maxCaptionTextLength = Math.floor(
    (Math.pow(node.radius, 2) * Math.PI) / Math.pow(fontSize, 2)
  )
  const template = style.forNode(node).get('caption')
  const nodeText = style.interpolate(template, node)
  const captionText =
    nodeText.length > maxCaptionTextLength
      ? nodeText.substring(0, maxCaptionTextLength)
      : nodeText
  const measure = (text: string) =>
    measureText(text, fontFamily, fontSize, canvas2DContext)
  const whiteSpaceMeasureWidth = measure(' ')

  const words = captionText.split(' ')

  const emptyLine = (lineCount: number, lineIndex: number): NodeCaptionLine => {
    // Calculate baseline of the text
    const baseline = (1 + lineIndex - lineCount / 2) * fontSize

    // The furthest distance between chord (top or bottom of the line) and circle centre
    const chordCentreDistance =
      lineIndex < lineCount / 2
        ? baseline - fontSize / 2
        : baseline + fontSize / 2
    const maxLineWidth =
      Math.sqrt(Math.pow(node.radius, 2) - Math.pow(chordCentreDistance, 2)) * 2
    return {
      node,
      text: '',
      baseline,
      remainingWidth: maxLineWidth
    }
  }

  const addShortenedNextWord = (
    line: NodeCaptionLine,
    word: string
  ): string => {
    while (word.length > 2) {
      const newWord = `${word.substring(0, word.length - 2)}\u2026`
      if (measure(newWord) < line.remainingWidth) {
        return `${line.text.split(' ').slice(0, -1).join(' ')} ${newWord}`
      }
      word = word.substring(0, word.length - 1)
    }
    return `${word}\u2026`
  }

  const fitOnFixedNumberOfLines = function (
    lineCount: number
  ): [NodeCaptionLine[], number] {
    const lines = []
    const wordMeasureWidthList: number[] = words.map((word: string) =>
      measure(`${word}`)
    )
    let wordIndex = 0
    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      const line = emptyLine(lineCount, lineIndex)
      while (
        wordIndex < words.length &&
        wordMeasureWidthList[wordIndex] <
          line.remainingWidth - whiteSpaceMeasureWidth
      ) {
        line.text = `${line.text} ${words[wordIndex]}`
        line.remainingWidth -=
          wordMeasureWidthList[wordIndex] + whiteSpaceMeasureWidth
        wordIndex++
      }
      lines.push(line)
    }
    if (wordIndex < words.length) {
      lines[lineCount - 1].text = addShortenedNextWord(
        lines[lineCount - 1],
        words[wordIndex]
      )
    }
    return [lines, wordIndex]
  }

  let consumedWords = 0
  const maxLines = (node.radius * 2) / fontSize

  let lines = [emptyLine(1, 0)]
  // Typesetting for finding suitable lines to fit words
  for (let lineCount = 1; lineCount <= maxLines; lineCount++) {
    const [candidateLines, candidateWords] = fitOnFixedNumberOfLines(lineCount)

    // If the lines don't have empty line(s), they're probably good fit for the typesetting
    if (!candidateLines.some((line: NodeCaptionLine) => !line.text)) {
      lines = candidateLines
      consumedWords = candidateWords
    }
    if (consumedWords >= words.length) {
      return lines
    }
  }
  return lines
}
