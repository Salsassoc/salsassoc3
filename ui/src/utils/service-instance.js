class ServiceInstance
{
    constructor(config) {
        this.config = config;

        this.status = null;
        this.error = null;
    }

    getAdminBaseUrl()
    {
        let base_url = window.location.protocol + "//" + window.location.host;
        return base_url;
    }

    createAdminUrl(path)
    {
        return path;
    }

    getServiceBaseUrl()
    {
        const server = this.config.getServer();
        let base_url;
        if(server){
            base_url = server.protocole + "://" + server.hostname + ":" + server.port;
        }else{
            base_url = window.location.protocol + "//" + window.location.host;
        }
        return base_url;
    }

    createServiceUrl(path)
    {
        return this.getServiceBaseUrl() + '/api' + path;
    }
}

export default ServiceInstance;
