import { expect } from 'chai'
import { put, take, call } from 'redux-saga/effects'
import frames from '../main/frames'
import editor from '../main/editor'
import { watchCommands, handleClientCommand } from './commandInterpreter'
import helper from '../services/commandInterpreterHelper'
import bolt from '../services/bolt/bolt'

describe('commandInterpreter Sagas', () => {
  describe('watchCommands Saga', () => {
    it('should listen to editor.actionTypes.USER_COMMAND_QUEUED starting with :', () => {
      // Given
      const watchSaga = watchCommands()
      const payload = {cmd: ':help'}
      const storeSettings = {cmdchar: ':'}

      // When
      const rec = watchSaga.next().value
      const actualHistoryPut = watchSaga.next(payload).value
      const expectedHistoryPut = put(editor.actions.addHistory(payload))
      watchSaga.next() // Settings read
      const actualCallAction = watchSaga.next(storeSettings).value
      const expectedCallAction = call(handleClientCommand, payload.cmd, storeSettings.cmdchar)

      // Then
      expect(rec).to.deep.equal(take(editor.actionTypes.USER_COMMAND_QUEUED))
      expect(actualHistoryPut).to.deep.equal(expectedHistoryPut)
      expect(actualCallAction).to.deep.equal(expectedCallAction)
    })

    it('should listen to editor.actionTypes.USER_COMMAND_QUEUED with Cypher', () => {
      // Given
      const watchSaga = watchCommands()
      const payload = {cmd: 'RETURN 1'}
      const storeSettings = {cmdchar: ':'}

      // When
      const rec = watchSaga.next().value
      const actualHistoryPut = watchSaga.next(payload).value
      const expectedHistoryPut = put(editor.actions.addHistory(payload))
      watchSaga.next() // Settings read
      const actualBoltAction = watchSaga.next(storeSettings).value
      const expectedBoltAction = call(bolt.transaction, payload.cmd)
      const actualPutAction = watchSaga.next().value
      const expectedPutAction = put(frames.actions.add({cmd: payload.cmd}))

      // Then
      expect(rec).to.deep.equal(take(editor.actionTypes.USER_COMMAND_QUEUED))
      expect(actualHistoryPut).to.deep.equal(expectedHistoryPut)
      expect(actualBoltAction).to.deep.equal(expectedBoltAction)
      // We cannot do deep equal here because of uuid
      expect(actualPutAction.PUT.action.state.cmd).to.equal(expectedPutAction.PUT.action.state.cmd)
    })
  })

  describe('handleClientCommand Saga', () => {
    it('should catch unknown commands', () => {
      // Given
      const payload = {cmd: ':unknown'}
      const storeSettings = {cmdchar: ':'}
      const handleClientCommandSaga = handleClientCommand(payload.cmd, storeSettings.cmdchar)

      // When
      const actualCallAction = handleClientCommandSaga.next().value
      const expectedCallAction = call(helper.interpret('catch-all').exec, payload.cmd, storeSettings.cmdchar)

      // Then
      expect(actualCallAction).to.deep.equal(expectedCallAction)
    })

    it('should find known commands', () => {
      // Given
      const payload = {cmd: ':clear'}
      const storeSettings = {cmdchar: ':'}
      const handleClientCommandSaga = handleClientCommand(payload.cmd, storeSettings.cmdchar)

      // When
      const actualCallAction = handleClientCommandSaga.next().value
      const expectedCallAction = call(helper.interpret('clear').exec, payload.cmd, storeSettings.cmdchar)

      // Then
      expect(actualCallAction).to.deep.equal(expectedCallAction)
    })
  })
})