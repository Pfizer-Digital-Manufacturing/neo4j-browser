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
                parseStrings: false
              })
            )
          } catch (e) {
            console.error(e)
          }
        }
      }}
      key="editor-reorder"
      color={base.primary}
    >
      <ReOrderIcon width={20} />
    </StyledEditorButton>
  )
}

export default BeautifyEditorButton
