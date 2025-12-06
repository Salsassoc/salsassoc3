import React from 'react';

import { Result as AntdResult } from 'antd';

import i18n from '../../utils/i18n.js';

const Result = ( {status} ) => {

    const getStatusMsg = (status) => {
        switch(status){
        case "403":
            return i18n.t("Common_PageForbidden");
        case "404":
            return i18n.t("Common_PageNotFound");
        default:
            break;
        }
        return i18n.t("Common_ResultDefault");
    }

    const statusMsg = getStatusMsg(status);

    return (<AntdResult
        status={status}
        title={status}
        subTitle={statusMsg}
    />)
}

export default Result;