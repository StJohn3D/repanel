import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import PANEL_TYPE from '../constants/panel-types'
import CONTAINER_FLOW from '../constants/container-flows'
import ResizeHandle from './ResizeHandle'
import Tool from './Tool'
import Container from './Container'
import HighVolumeStore from '../utils/high-volume-store'
import { layout } from '../utils/layout'

class Panel extends Component {
    constructor() {
        super()
        this.state = {}
    }

    componentWillReceiveProps(nextProps) {
        const { resize, index, id, type, flow } = nextProps
        const { parentID, parentIndex } = layout(index).getProps(id)
        const node = ReactDOM.findDOMNode(this)
        let computedWidth = this.getClientWidth()
        let computedHeight = this.getClientHeight()
        if (resize.isResizing) {
            if (resize.parentContainerID !== parentID) { // SJ: We're not in the container being resized
                if (flow === CONTAINER_FLOW.VERTICAL && type === PANEL_TYPE.BOTTOM) {
                    computedHeight = 'auto'
                }
            }
            else { // SJ: We ARE in the container being resized
                if ( resize.containerIndex + 1 === parentIndex ) {// SJ: I come after the panel being resized
                    switch (flow) {
                        case CONTAINER_FLOW.VERTICAL:
                        computedHeight = 'auto'
                        break
                        case CONTAINER_FLOW.HORIZONTAL:
                        computedWidth = 'auto'
                        break
                    }
                }
                else if ( id === resize.panelID ) { // SJ: I AM the panel being resized
                    switch (flow) {
                        case CONTAINER_FLOW.VERTICAL:
                        this.handleResizeV()
                        break
                        case CONTAINER_FLOW.HORIZONTAL:
                        this.handleResizeH()
                        break
                    }
                }
            }
            if (!this.state.isResizing) {
                this.setState({
                    width: computedWidth === 'auto' ? computedWidth : computedWidth + 'px',
                    height: computedHeight === 'auto' ? computedHeight : computedHeight + 'px',
                    isResizing: true
                })
            }
        } else {
            if (typeof this.unsubscribe === 'function') {
                this.unsubscribe()
                delete this.unsubscribe
            }
            this.setState({
                width: computedWidth + 'px',
                height: computedHeight + 'px',
                isResizing: false
            })
        }
    }

    buildResizer(id, type, flow, props) {
        const { parentID, parentIndex } = props
        console.log(id)
        const handleProps = {
            type, flow, id, parentID, parentIndex,
        }
        switch (type) {
            case PANEL_TYPE.LEFT:
            case PANEL_TYPE.CENTER:
            case PANEL_TYPE.TOP:
            case PANEL_TYPE.MIDDLE:
            return <ResizeHandle {...handleProps} />

            default:
            return false
        }
    }

    buildTool(props) {
        const { children, id, toolIndex } = props

        if ( children.length === 0 ) {
            return <Tool panelID={id} selectedIndex={toolIndex}/>
        } else return false
    }

    render() {
        const { index, id, type, flow } = this.props
        const props = layout(index).getProps(id)
        const { children, width, height } = props
        let style = {
            width: this.state.width || width || 'auto',
            height: this.state.height || height || 'auto'
        }
        switch(flow) {
            case CONTAINER_FLOW.VERTICAL:
                style.width = 'auto'
                break
            case CONTAINER_FLOW.HORIZONTAL:
                style.height = 'auto'
                break
        }

        const resizer = this.buildResizer(id, type, flow, props)
        const tool = this.buildTool(props)

        return (
            <section className="ruip-panel" style={style}>
                {children.map(function(child) {
                    if (child.type === 'Container') return <Container key={child.parentIndex} id={child.id} />
                    else return child.component
                })}{tool}{resizer}
            </section>
        )
    }

    componentWillUnmount() {
        if (typeof this.unsubscribe === 'function') {
            this.unsubscribe()
            delete this.unsubscribe
        }
    }

    getClientWidth() {
        return ReactDOM.findDOMNode(this).clientWidth
    }

    getClientHeight() {
        return ReactDOM.findDOMNode(this).clientHeight
    }

    handleResizing(updateFunc) {
        if (!this.unsubscribe) {
            this.unsubscribe = HighVolumeStore.subscribe(updateFunc)
        }
    }

    handleResizeH() {
        const startX = HighVolumeStore.mouseX;
        const startWidth = this.getClientWidth();
        const updateWidth = () => {
            const newWidth = Number(startWidth) + (HighVolumeStore.mouseX - startX);
            this.setState({width: newWidth + 'px'})
        }

        this.handleResizing(updateWidth)
    }

    handleResizeV() {
        const startY = HighVolumeStore.mouseY;
        const startHeight = this.getClientHeight();
        const updateHeight = () => {
            const newHeight = Number(startHeight) + (HighVolumeStore.mouseY - startY);
            this.setState({height: newHeight + 'px'})
        }

        this.handleResizing(updateHeight)
    }
}

const mapStateToProps = state => ({
    resize: state.ReduxUIPanels.resize,
    tools : state.ReduxUIPanels.tools,
    index : state.ReduxUIPanels.index
})

export default connect(mapStateToProps)(Panel)
