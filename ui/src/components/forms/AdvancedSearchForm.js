import React from 'react';

import { Form, Grid, Collapse, Card } from 'antd';

const { useBreakpoint } = Grid;

const AdvancedSearchForm = (props) => {

    const screens = useBreakpoint();
    const lowRes = (screens.xs || !screens.md);

    const layout=(lowRes ? "vertical" : "inline");

    const bordered = (props.bordered != undefined ? props.bordered : true);

    let {bordered: _, ...formProps} = props;

    const form = (<Form
        className="app-advanced-search-form"
        layout={layout}
        {...formProps}
    />);

    if(lowRes){
        return (
            <Collapse bordered={false} className="app-advanced-search-form-collapsed">
                <Collapse.Panel header="Rechercher" key="1">
                    {form}
                </Collapse.Panel>
            </Collapse>
        );
    }

    if(!bordered){
        return (
            <div className="app-advanced-search-form-inline">
                {form}
            </div>
        );
    }

    return (
        <Card>
            <div className="app-advanced-search-form-inline">
                {form}
            </div>
        </Card>
    );


}

export default AdvancedSearchForm;
