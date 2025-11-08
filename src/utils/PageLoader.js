import i18n from '../utils/i18n.js';
import MsgInfo from '../utils/message.js';
import NotifInfo from '../utils/notification.js';

import {FetchJsonResultError, FetchXmlResultError} from '../authentication/backend.js';

import AppError, { FatalAppError } from '../components/error/AppError.js';

class PageLoader
{
    static StateInitial = 0;
    static StateProcessing = 1;
    static StateDone = 2;
    static StateError = 3;

    constructor() {
        // Current page load state
        this.state = PageLoader.StateInitial;

        // Mark that data have been loaded once
        this.loaded_once = false;

        this.error = null;

        this.statusHandler = null;
    }

    reset()
    {
        this.state = PageLoader.StateInitial;
        this.loaded_once = false;
        this.error = null;
    }

    shouldComponentUpdate(_nextProps, _nextState) {
        return !this.isProcessing();
    }

    setStatusHandler(handler){
        this.statusHandler = handler;
    }

    notifyState(){
        if(this.statusHandler){
            this.statusHandler(this.state);
        }
    }

    isInitializingOrProcessing(){
        return this.isInitializing() || this.isProcessing();
    }

    isInitializing(){
        return (this.state == PageLoader.StateInitial);
    }

    hasError(){
        return (this.state == PageLoader.StateError); 
    }

    clearError = () => {
        this.error = null;
        this.notifyState();
    }

    // Standard process 

    isProcessing(){
        return (this.state == PageLoader.StateProcessing);
    }

    startProcessing(msg) {
        // Update data
        this.state = PageLoader.StateProcessing;

        // User feedback
        if(this.loaded_once){
            if(msg){
                MsgInfo.loading(msg);
            }
        }

        // Notify handler
        this.notifyState();
    }

    endProcessing(msg) {
        // Update data
        this.error = null;
        this.state = PageLoader.StateDone;

        // User feedback
        if(this.loaded_once){
            MsgInfo.close();
        }
        if(msg){
            NotifInfo.success(msg);
        }

        // Notify handler
        this.notifyState();
    }

    errorProcessing(error, msg){
        // Update data
        this.state = PageLoader.StateError;

        // Close message box
        MsgInfo.close();

        // Create error object
        let errorObject = null;
        if(error instanceof AppError) {
            errorObject = error;
        }else if(error instanceof FetchJsonResultError) {
            errorObject = new AppError(error);
        }else if(error instanceof FetchXmlResultError) {
            errorObject = new AppError(error);
        }else {
            errorObject = new FatalAppError(error);
        }
        this.error = errorObject;
        // User feedback
        if(msg && !this.error?.isFatal()){
            NotifInfo.error(msg, this.error.description);
        }

        // Notify handler
        this.notifyState();
    }

    // Loading functions

    startLoading(msg) {
        const realmsg = (msg ? msg : i18n.t("Common_Loading_Progress"));
        this.startProcessing(realmsg);
    }

    endLoading(msg) {
        this.loaded_once = true;
        this.endProcessing(msg);
    }

    errorLoading(error, msg){
        const realmsg = (msg ? msg : i18n.t("Common_Loading_Error"));
        this.errorProcessing(error, realmsg);
    }

    isInitialLoading(){
        return isInitializing() || (this.isProcessing() && !this.loaded_once);
    }

    hasLoadedOnce(){
        return this.loaded_once;
    }

    loadData(loadFunc, updateFunc) {
        if(!loadFunc){
            loadFunc = this.dummyLoadData;
        }

        this.startLoading();

        return loadFunc()
            .then(response => {
                this.endLoading();
                if(updateFunc){
                    updateFunc();
                }
            })
            .catch((error) => {
                this.errorLoading(error);
            });
    }

    loadDataBackground(loadFunc){
        if(loadFunc){
            return loadFunc().catch((error) => {
                console.log(error);
            })
        }
        return this.dummyLoadData();
    }

    dummyLoadData() {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    // Saving function

    startSaving(msg) {
        const realmsg = (msg ? msg : i18n.t("Common_Save_Progress"));
        this.startProcessing(realmsg);
    }

    endSaving(msg) {
        this.endProcessing(msg);
    }

    errorSaving(error, msg){
        const realmsg = (msg ? msg : i18n.t("Common_Save_Error"));
        this.errorProcessing(error, realmsg);
    }

    // Remove function

    startRemoving(msg) {
        const realmsg = (msg ? msg : i18n.t("Common_Remove_Progress"));
        this.startProcessing(realmsg);
    }

    endRemoving(msg) {
        this.endProcessing(msg);
    }

    errorRemoving(error, msg){
        const realmsg = (msg ? msg : i18n.t("Common_Remove_Error"));
        this.errorProcessing(error, realmsg);
    }

    // Download function

    startDownloading(msg) {
        const realmsg = (msg ? msg : i18n.t("Common_Download_Progress"));
        this.startProcessing(realmsg);
    }

    endDownloading(msg) {
        this.endProcessing(msg);
    }

    errorDownloading(error, msg){
        const realmsg = (msg ? msg : i18n.t("Common_Download_Error"));
        this.errorProcessing(error, realmsg);
    }

    // Test function

    startTesting(msg) {
        const realmsg = (msg ? msg : i18n.t("Common_Test_Progress"));
        this.startProcessing(realmsg);
    }

    endTesting(msg) {
        this.endProcessing(msg);
    }

    errorTesting(error, msg){
        const realmsg = (msg ? msg : i18n.t("Common_Test_Error"));
        this.errorProcessing(error, realmsg);
    }
};

export default PageLoader;
