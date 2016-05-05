import React, { Component } from 'react'
import { connect } from 'react-redux'
import { doneResizing } from '../actions/resize-actions'
import { registerTools } from '../actions/registry-actions'
import HighVolumeStore from '../utils/high-volume-store'
import styles from '../styles/'
import jss from 'js-stylesheet'

class ReduxUIPanels extends Component {
    render() {
        const { children, onMouseMove } = this.props
        const container = React.Children.only(children)
        return (
            <div className="redux-ui-panels" onMouseMove={onMouseMove} onMouseUp={this.onMouseUp}>
                {container}
            </div>
        );
    }

    componentWillMount() {
        const { onWindowResize, dispatch, tools } = this.props
        window.addEventListener('resize', onWindowResize);

        if (  tools && tools.length ) {
            dispatch(registerTools({
                tools: tools
            }))
        }

        // SJ: Apply Timber's CSS
        jss(styles)
    }

    onMouseUp = (e) => {
        const { isResizing, dispatch } = this.props
        if ( isResizing ) dispatch(doneResizing(e))
    }
}

const mapStateToProps = state => ({
    isResizing: state.ReduxUIPanels.resize.isResizing
})

const mapDispatchToProps = (dispatch, props) => {
    return {
        onMouseMove: (e) => {
            HighVolumeStore._mouseMoved(e)
        },
        onWindowResize: (e) => {
            HighVolumeStore._windowOnResize(e, dispatch)
        },
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReduxUIPanels);