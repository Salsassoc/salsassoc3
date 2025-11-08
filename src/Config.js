class Config {

    constructor(){
        this.config = window.Config;
    }

    getServer(){
        if(this.config){
            return this.config.server;
        }
        return null;
    }

    getApplication(){
        if(this.config){
            return this.config.application;
        }
        return null;
    }

}

export default Config;