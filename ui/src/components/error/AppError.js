import {FetchJsonResultError, FetchXmlResultError} from "../../authentication/backend.js";

export class AppError {

    constructor(error = undefined, is_fatal = false) {
        if(error === undefined) {
            this.is_fatal = is_fatal;
            this.message = null;
            this.description = "";
        }else{
            this.setFromError(error);
        }
    }

    setFromError(error) {
        if(error instanceof FetchJsonResultError
        || error instanceof FetchXmlResultError) {
            this.is_fatal = false;
            this.message = null;
            this.description = error.errorString();
        }
    }

    isFatal() {
        return this.is_fatal;
    }

    setMessage(message) {
        this.message = message;
    }

    getMessage() {
        return this.message;
    }

    setDescription(description) {
        this.description = description;
    }

    getDescription() {
        return this.description;
    }
}

export function FatalAppError() {
    return new AppError(undefined, true);
}

export default AppError;
