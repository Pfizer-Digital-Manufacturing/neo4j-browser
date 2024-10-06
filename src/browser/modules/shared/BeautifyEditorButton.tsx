import * as React from 'react'
import beautifyCypher from 'cypher-beautifier'
import { base } from 'browser-styles/themes'
import { ReOrderIcon } from 'browser-components/icons/LegacyIcons'
import { StyledEditorButton } from 'browser-components/buttons'
import { CypherEditor } from 'project-root/src/neo4j-arc'

const BeautifyEditorButton: React.FC<{ editor?: CypherEditor }> = ({
  editor
}) => {
  return (
    <StyledEditorButton
      data-testid="editor-reorder"
      onClick={() => {
        if (editor) {
          try {
            editor.setValue(
              beautifyCypher(editor.getValue(), {
                parseStrings: true
              })
            )
          } catch (e) {
            console.error(e)
            editor.setValue(
              beautifyCypher(editor.getValue(), {
                parseStrings: false
              })
            )
          }
        }
      }}
      key="editor-reorder"
      color={base.primary}
    >
      <ReOrderIcon width={20} title={'Beautify'} />
    </StyledEditorButton>
  )
}

export default BeautifyEditorButton
