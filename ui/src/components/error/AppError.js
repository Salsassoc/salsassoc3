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
            let description = error.errorString();
            if (description && description.includes('.')) {
                this.description = i18n.t(description);
            } else {
                this.description = description;
            }
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
