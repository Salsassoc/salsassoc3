import React from 'react';

import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const HelpIndicator = (props) => {

    let styleProps = [];

    const sizeMode = props.size || "normal";
    if(sizeMode == "large"){
        styleProps.overlayInnerStyle={width: '600px'}
    }
    styleProps.styles = { lineBreak: 'pre-line', whiteSpace: "pre-wrap"};

    return (
        <Tooltip title={props.tooltip} {...styleProps} placement="topRight">
            <QuestionCircleOutlined />
        </Tooltip>
    );
}

export default HelpIndicator;