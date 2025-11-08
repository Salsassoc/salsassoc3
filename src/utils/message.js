import { message } from 'antd';

class MsgInfo
{
    static loading(msg)
    {
        message.loading({
            content: msg,
            key: "message-display",
            duration: 0
        });
    }

    static success(msg)
    {
        message.success({
            content: msg,
            key: 'message-display',
            duration: 5
        });
    }

    static error(msg, details)
    {
        message.error({
            content: msg,
            key: "message-display",
            duration: 5
        });
        if(details !== undefined){
            console.log("[Error] " + details);
        }
    }

    static close()
    {
        message.destroy("message-display");
    }

};

export default MsgInfo;