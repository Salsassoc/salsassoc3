import {Alert} from "antd";
import React, {Fragment} from "react";
import {AppError} from "../error/AppError.js";
import PropTypes from "prop-types";

export class AlertError extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            error: props.error
        }
    }

    UNSAFE_componentWillUpdate(nextProps, nextState, nextContext) {
        if (nextProps.error !== this.state.error) {
            this.setState({ error: nextProps.error });
        }
    }

    handleClose() {
        this.setState = {
            error: undefined
        }
        if(this.props.handleClose) {
            this.props.handleClose();
        }
    }

    render() {
        if(this.state.error?.getMessage() || this.state.error?.getDescription()) {
            return (
                <Alert
                    message={this.state.error.getMessage()}
                    description={this.state.error.getDescription()}
                    type="error"
                    onClose={this.props.handleClose}
                    showIcon
                    closable
                    style={{marginBottom: 20}}
                />
            )
        }else{
            return (<Fragment />)
        }
    }
}

AlertError.propTypes = {
    error: PropTypes.instanceOf(AppError),
    handleClose: PropTypes.func
}

export default AlertError;