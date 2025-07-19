class User {
    constructor(data){
        this.data = data;
    }

    getId(){
        if(this.data){
            return this.data.id;
        }
        return 0;
    }

    getUsername(){
        if(this.data){
            return this.data.username;
        }
        return '';
    }
}

export default User;