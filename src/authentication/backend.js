import { authHeader } from './auth-header.js';

import AppError from '../components/error/AppError.js';

export class FetchResultError extends Error {

    constructor(response) {
        super();
        this.statusCode = response.status;
        this.appError = new AppError();
    }

    getAppError() {
        return this.appError;
    }

    toString() {
        return "HTTP Status Code:" + this.statusCode;
    }
}


export class FetchXmlResultError extends FetchResultError {

    constructor(response, xml) {
        super(response);
        this.xml = xml;
    }
    
    errorString() {
        let errorMsgArr = [];
        if (this.xml.querySelector("errors") && this.xml.querySelector('main_error')) {
            errorMsgArr.push(this.xml.querySelector('main_error').textContent);
        } 
        
        if (this.xml.querySelector("errors") && this.xml.querySelectorAll("list error")) {
            errorMsgArr = errorMsgArr.concat(this._joinErrorsArray(this.xml.querySelectorAll("list error")));
        }
        return errorMsgArr.join('\n');
    }

    errors() {
        let errors = [];
        if (this.xml.querySelector("errors") && this.xml.querySelector('main_error')) {
            errors.push(this.xml.querySelector('main_error').textContent);
        }
        if (this.xml.querySelector("errors") && this.xml.querySelectorAll("list error")) {
            for (let i = 0; i < this.xml.querySelectorAll("list error").length; i++) {
                errors.push(this.xml.querySelectorAll("list error")[i].textContent);
            }
        }
        return errors;
    }

    _joinErrorsArray(errors) {
        let out = [];
        
        for (let i = 0; i < errors.length; i++) {
            out.push(errors[i].textContent);
        }

        return out;
    }

    toString() {
        return this.errorString();
    }
}

export class FetchJsonResultError extends FetchResultError {

    constructor(response, json) {
        super(response);
        this.json = json;
    }

    errorString() {
        let errorMsgArr = [];
        if (this.json.errors && this.json.errors.main_error) {
            errorMsgArr.push(this.json.errors.main_error.text);
        } 
        
        if (this.json.errors && this.json.errors.list) {
            errorMsgArr = errorMsgArr.concat(this._joinErrorsArray(this.json.errors.list));
        }
        return errorMsgArr.join('\n');
    }

    errors() {
        let errors = [];
        if (this.json.errors && this.json.errors.main_error) {
            errors.push(this.json.errors.main_error.text);
        }
        if (this.json.errors && this.json.errors.list) {
            for (let i = 0; i < this.json.errors.list.length; i++) {
                errors.push(this.json.errors.list[i]['text']);
            }
        }
        return errors;
    }

    _joinErrorsArray(errors, str) {
        let out = [];

        for (let i = 0; i < errors.length; i++) {
            out.push(errors[i]['text']);
        }

        return out;
    }

    toString() {
        return this.errorString();
    }
}

export class FetchResponse {

    constructor(response, text = undefined) {
        this.statusCode = response.status;
        this.headers = response.headers;
        if(this.headers.has("X-QueryInfos")) {
            this.query_infos = this.parseQueryInfos(this.headers.get("X-QueryInfos"));
        }
        if(text !== undefined) {
            this.result = response;
        }
    }

    parseQueryInfos(value) {
        let obj = {};
        const query_infos = value.split(";");
        for(const item of query_infos) {
            const [k, v] = item.split("=");
            if(!isNaN(v)) {
                obj[k] = parseInt(v);
            }else{
                obj[k] = v;
            }
        }
        return obj;

    }
}

export class FetchJsonResponse extends FetchResponse {

    constructor(response, json) {
        super(response);
        this.result = json;
    }
}

export class FetchXmlResponse extends FetchResponse {

    constructor(response, xml) {
        super(response);
        this.result = xml;
    }
}

export function fetchXML(url, opts) {
    if (!opts) {
        opts = {};
    }
    if (!opts.headers) {
        opts.headers = new Headers({});
    }
    // Set Accept
    if (!opts.headers.has('Accept')) {
        opts.headers.set('Accept', 'application/xml');
    }

    const parser = new DOMParser();

    return fetch(url, opts).then(
        response => {
            if (response.ok) {
                if (response.status === 204) {
                    return null;
                } else {
                    return response.text().then(text => {
                        return new FetchXmlResponse(response, parser.parseFromString(text, "text/xml"))
                    });
                }
            } else {
                if (response.status === 401) {
                    //window.location.replace("/login");
                }
                console.log("[FecthJXML] Unable to fetch data: ", response.statusText);
                return response.text().then((text) => {
                    throw new FetchXmlResultError(response, parser.parseFromString(text, "text/xml"));
                });
            }
        });
}

export function fetchJSON(url, opts, json_reviver) {
    if (!opts) {
        opts = {};
    }
    if (!opts.headers) {
        opts.headers = new Headers({});
    }
    // Set Accept
    if (!opts.headers.has('Accept')) {
        opts.headers.set('Accept', 'application/json');
    }
    return fetch(url, opts).then(
        response => {
            if (response.ok) {
                if (response.status === 204) {
                    return null;
                } else {
                    return response.text().then(text => {
                        return new FetchJsonResponse(response, JSON.parse(text, json_reviver))
                    });
                }
            } else {
                if (response.status === 401) {
                    //window.location.replace("/login");
                }
                console.log("[FecthJSON] Unable to fetch data: ", response.statusText);
                return response.text().then((text) => {
                    throw new FetchJsonResultError(response, JSON.parse(text, json_reviver))
                });
            }
        });
}

function getOutputFileName(headers, filename, defaultFilename)
{
    // If custom filename is set, return it
    if(filename){
        return filename;
    }

    // Look in content disposition header for filename
    const contentDisposition = headers.get('Content-Disposition');
    // Extract filename
    if (contentDisposition && contentDisposition.includes('filename=')) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length > 1) {
            return filenameMatch[1];
        }
    }

    return defaultFilename;
}

async function downloadFile(url, filename) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Download error : ${response.statusText}`);
        }

        const contentLength = response.headers.get('Content-Length');

        const output_filename = getOutputFileName(response.headers, filename, 'download.dat');

        const total = (contentLength ? parseInt(contentLength, 10) : null);
        let loaded = 0;

        const reader = response.body.getReader();
        const stream = new ReadableStream({
            start(controller) {
                function read() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close();
                            return;
                        }

                        loaded += value.byteLength;

                        // Update progress field
                        if(total){
                            const percent = (loaded / total) * 100;
                            const textDownloads = document.getElementById('TextDownload_' + filename);
                            if(textDownloads){
                                textDownloads.textContent = percent.toFixed(1)+ "%";
                            }
                        }

                        controller.enqueue(value);
                        read();
                    }).catch(error => {
                        console.error('Erreur de lecture du flux', error);
                        controller.error(error);
                    });
                }
                read();
            }
        });

        const newResponse = new Response(stream);
        const blob = await newResponse.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = output_filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Failed to download file :', error);
        throw new Error(`Download error : ${error}`);
    }
}

/*
export function fetchFile(url, opts, filename) {

    // Use https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream in the future
    if(opts && (opts.streamSaverPath && opts.streamSaverPath.isSecureContext)){
        streamSaver.mitm = opts.streamSaverPath + '/mitm.html';
        console.log("Using mitm: " + streamSaver.mitm);

    } else {
        // StreamSaver doest not seem to work with insecure context
        // Run direct download with navigator
        console.log("Insecure context, run direct download");
        return downloadFile(url, filename);
    }

    return fetch(url, opts).then(response => {
        const totalSize = response.headers.get('Content-Length');
        console.log("File size is: " + totalSize);

        // If the WritableStream is not available (Firefox, Safari), take it from the ponyfill
        // Since 2022-05, all browser have support for WritableStream
        // https://developer.mozilla.org/en-US/docs/Web/API/WritableStream
        // if (!window.WritableStream) {
        //    console.log("Using ponyfill WritableStream");
        //    streamSaver.WritableStream = WritableStream;
        //    window.WritableStream = WritableStream;
        // }

        const fileStream = streamSaver.createWriteStream(filename, {size: totalSize});
        const readableStream = response.body;

        // More optimized (mainly available in Safari)
        if (readableStream.pipeTo) {
            console.log("Using pipeTo method");
            return readableStream.pipeTo(fileStream);
        }

        console.log("Using pump method");

        // Else we create manually the pipe
        const writer = fileStream.getWriter();

        const reader = readableStream.getReader();
        const pump = () => reader.read()
            .then(res =>
                res.done ? writer.close() : writer.write(res.value).then(pump)
            );

        return pump();
    });
}
*/

export function configureBackend() {

    /*
    axiosInstance.interceptors.request.use(function (config) {
        const token = localStorage.getItem('token')
        config.headers.Authorization =  token
      
        return config;
      });
      */

    // Override fetch function
    let realFetch = window.fetch;
    window.fetch = function (url, opts) {

        if (!opts) {
            opts = {};
        }

        if (!opts.headers) {
            opts.headers = new Headers({});
        }

        // Set Authorization
        const auth = authHeader();
        if (auth && !opts.headers.has('Authorization')) {
            if(auth['Authorization']){
                opts.headers.set('Authorization', auth['Authorization']);
            }
        }

        // Set Content-Type
        if (!opts.headers.has('Content-Type')) {
            if ((opts.body !== undefined)) {
                if (!(opts.body instanceof FormData)) {
                    opts.headers.set('Content-Type', 'application/json; charset=utf-8');
                }
            } else {
                opts.headers.set('Content-Type', 'text/plain; charset=utf-8');
            }
        }

        if (!opts.credentials) {
            opts.credentials = 'include';
        }
        if (!opts.mode) {
            opts.mode = 'cors';
        }
        if (!opts.method) {
            opts.method = 'GET';
        }
        if (!opts.redirect) {
            opts.redirect = 'follow';
        }

        // Allow server t odisable prompt login
        opts.headers.set('X-Requested-With', 'Salsassoc');

        return realFetch(url, opts);
    }
}
