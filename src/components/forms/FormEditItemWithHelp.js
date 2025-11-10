import React, { Fragment } from 'react';

import { Row, Col } from 'antd';

import HelpIndicator from '../../components/HelpIndicator.js';

const FormEditItemWithHelp = (props) => {

    const tooltip = props.tooltip;

    if(Array.isArray(props.children)){
        const childrenFiltered = props.children.filter(item => (item != null));
        const children = childrenFiltered.map((item, index) => {
            if(index == 0){
                return <Fragment key={index}>{item}</Fragment>;
            }else{
                return <Fragment key={index}><br/>{item}</Fragment>;
            }
        });
    
        return (
            <Fragment>
                {children}
            </Fragment>
        );
    }

    return (
        <Row wrap={false} gutter={8} align="middle">
            <Col flex="auto">
                {props.children}
            </Col>
            {tooltip ?
                <Col flex="none">
                    <HelpIndicator tooltip={tooltip} />
                </Col> : null
            }
        </Row>
    );
}

export default FormEditItemWithHelp;
