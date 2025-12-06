import React from 'react';
import { Link } from "react-router-dom";
import { Button } from 'antd';

const ButtonIcon = (props) => {

    const url = props.url;
    const icon = props.icon;
    const title = props.title;
    const onClick = props.onClick;
    const size = props.size;

    const button = <Button type="primary" icon={icon} onClick={onClick} size={size}>{title}</Button>;

    if(url){
        return (
            <Link to={url}>{button}</Link>
        );
    }

    return button;
}

export default ButtonIcon;