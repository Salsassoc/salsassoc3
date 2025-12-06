import React from 'react';

import { PlusOutlined } from '@ant-design/icons';

import i18n from '../../utils/i18n.js';

import ButtonIcon from './ButtonIcon.js';

const ButtonAdd = (props) => {

    const buttonTitle = props.title || i18n.t("Common_Add");
    return (
        <ButtonIcon icon={<PlusOutlined />} title={buttonTitle} {...props} />
    );
}

export default ButtonAdd;