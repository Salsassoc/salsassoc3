import React, { Fragment } from 'react';

import { Card, Grid, Row, Col, Divider, Alert } from 'antd';

const { useBreakpoint } = Grid;

const TCALayout = ({title, form, content, actions, error}) => {

    function getForm(form)
    {
        if(form){
            return <Fragment>{form}<br/></Fragment>
        }
        return null;
    }

    const screens = useBreakpoint();
    const lowRes = (screens.xs || !screens.md);

    const titleView = <span style={{fontSize:"16px", fontWeight:"bold"}}>{title}</span>;
    const formView = getForm(form);

    if(lowRes){
        return (
            <Fragment>
                <Row align="middle">
                    <Col span={24}>
                        {formView}
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        {content}
                    </Col>
                </Row>
                <Row align="middle">
                    {error ?
                        <Col span={24} style={{textAlign: "left", paddingTop: "10px"}}>
                            <Alert type="error" message={error} />
                        </Col>
                    : null }
                    <Col span={24} style={{textAlign: "center"}}>
                        <Divider />
                        {actions}
                    </Col>
                </Row>
            </Fragment>
        );
    }

    let headRow = title || actions;

    return (
        <Fragment>
            {formView}
            <Card>
                {headRow ? 
                <Row style={{margin: "0px 0px 10px 0px"}} align="middle" gutter={[8, 8]}>
                    <Col span={12} style={{paddingLeft: "5px"}}>
                        {titleView}
                    </Col>
                    <Col span={12} style={{textAlign: "right"}}>
                        {actions}
                    </Col>
                    {error ?
                        <Col span={24} style={{textAlign: "left"}}>
                            <Alert type="error" message={error} />
                        </Col>
                    : null }
                </Row>
                : ""
                }
                <Row>
                    <Col span={24}>
                        {content}
                    </Col>
                </Row>
            </Card>
        </Fragment>
    );
}

export default TCALayout;