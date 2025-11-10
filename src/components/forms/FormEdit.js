import React from 'react';

import { Form, Grid } from 'antd';

const { useBreakpoint } = Grid;

const FormEdit = React.forwardRef((props, ref) => {

    const screens = useBreakpoint();
    const lowRes = (screens.xs || !screens.lg);

    const formProps = (lowRes ? 
      {
        layout:"vertical",
      } : {
        layout:"horizontal",
        labelAlign: "left",
        /*
        labelCol: {
            xs: { span: 24 },
            sm: { span: 8 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 },
        },
        */
        // 1-24 to represent spans range
        labelCol: {span: 6},
        wrapperCol: {span: 12},
      }
    );
    
    /*
    const validateMessages = {
      required: '${label} is required!',
      types: {
        email: '${label} is not a valid email!',
        number: '${label} is not a valid number!',
      },
      number: {
        range: '${label} must be between ${min} and ${max}',
      },
    };

    // validateMessages={validateMessages}
    */

    return (
        <Form
            {...props}
            {...formProps}
            ref={ref}
            >
                {props.children}
        </Form>
        )
}
)

export default FormEdit;