import React from 'react';

import { Form } from 'antd';

const FormEditItemSubmit = ({children}) => {

    const itemProps = {
        wrapperCol:{span:24}
    }

    const divStyle = {
        textAlign:"right"
    }

    return <Form.Item {...itemProps}><div style={divStyle}>{children}</div></Form.Item>
}

export default FormEditItemSubmit;