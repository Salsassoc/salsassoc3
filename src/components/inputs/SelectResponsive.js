import React from 'react';

import { Select, Grid } from 'antd';

const { useBreakpoint } = Grid;

const SelectResponsive = (props) => {

    const screens = useBreakpoint();
    const lowRes = (screens.xs || !screens.md);

    let style = (props.style ? {...props.style} : {});
    if(lowRes){
        style.width = "100%";
    }

    return <Select {...props} style={style} />
}

export default SelectResponsive;