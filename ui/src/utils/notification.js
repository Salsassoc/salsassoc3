import { notification, List } from 'antd';

class NotifInfo
{
    static success(msg, duration = 3)
    {
        notification.success({
            message: msg,
            key: 'notification-display',
            duration: duration,
            description: ''
        });
    }

    static error(msg, details = null, duration=0)
    {
        let detailExist = false;
        if(details !== undefined && typeof details !== 'object') {
            detailExist = true;
            console.log("[Error] " + details);
        }
        let description = (detailExist) ? details + "" : ""

        notification.error({
            duration: duration,
            key: 'notification-display',
            message: msg,
            description: (<List
                dataSource={description.split("\n")}
                renderItem={(item) => (
                  <List.Item>{item}</List.Item>
                )}
              />)
        });   
    }

    static close()
    {
        notification.destroy("notification-display");
    }

};

export default NotifInfo;