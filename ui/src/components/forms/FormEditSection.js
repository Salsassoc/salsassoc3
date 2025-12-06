import React, { Fragment } from 'react';

import { Card } from 'antd';
import HelpIndicator from "../HelpIndicator.js";

const FormSection = (props) => {

    const title = props.title || null;
    const children = props.children || null;
    const extra = props.extra || null;
    const visible = props.visible || null;
    const tooltip = props.tooltip || null;

    const isVisible = (visible != undefined ? visible : true);

    function getCardTitle(title, tooltip) {
        if (!tooltip) return title;
        return (
            <>
                {title}
                {' '}
                <HelpIndicator tooltip={tooltip} />
            </>
        );
    }

    if(isVisible){
        return (
            <Fragment>
                <Card extra={extra} title={getCardTitle(title, tooltip)}>{children}</Card><br/>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <div style={{display:"none"}}>{children}</div>
        </Fragment>
    );
}

export default FormSection;
