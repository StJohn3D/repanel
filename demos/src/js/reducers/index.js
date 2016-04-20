import { combineReducers } from 'redux';
import friendList from './friendList';
import { MOUSE, REGISTER, RESIZE } from '../constants/action-types'

const initialState = {
  resize: {
    isResizing: false,
    componentID: undefined,
    containerID: 'TODO'
  },
  mouse: {
    position: {
      x: 0,
      y: 0
    },
    isLeftDown: false
  },
  containers: {},
  panels: []
}

const rootReducer = combineReducers({
  timberUI: function(state = initialState, action) {
    let stateOverride
    switch (action.type) {

      case MOUSE.LEFT_BUTTON_PRESSED:
        return Object.assign({}, state, {
          mouse: {
            isLeftDown: true
          }
        })

      case MOUSE.LEFT_BUTTON_RELEASED:
        return Object.assign({}, state, {
          resize: {
            ...state.resize,
            isResizing : false,
            componentID: undefined
          },
          mouse: {
            isLeftDown: false
          }
        })

      case REGISTER.CONTAINER:
        stateOverride = {
          containers: {
            ...state.containers
          }
        }
        stateOverride.containers[action.payload.id] = action.payload
        return Object.assign({}, state, stateOverride)

      case REGISTER.PANEL:
        stateOverride = {
          panels: {
            ...state.panels
          }
        }
        stateOverride.panels[action.payload.id] = action.payload
        return Object.assign({}, state, stateOverride)

        case RESIZE.BEGIN:
          return Object.assign({}, state, {
            resize: {
              ...state.resize,
              isResizing: true,
              componentID: action.payload.panelID
            }
          })

      default:
        return initialState
    }
  }
});

export default rootReducer;
