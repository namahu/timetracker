import { Properties } from "../TimeTracker";

type TogglProject = {
    id: number;
    wid: number;
    cid: number;
    name: string;
    billable: boolean;
    is_private: boolean;
    active: boolean;
    at: string;
};

const createTogglInstance = (token: string, properties: Properties) => {
    return new TogglService_(token, properties);
};

class TogglService_ {
    private baseURL = "https://api.track.toggl.com/api/v8";

    private token: string;
    private properties: Properties;

    constructor (token: string, properties: Properties) {
        this.token = token;
        this.properties = properties;

    }

    private getALLProject_ = () => {
        const endPoint = "/workspaces/"
            + this.properties.TOGGL_WORKSPACE_ID
            + "/projects";

        const contentText = this.request_(endPoint, "get");
        return JSON.parse(contentText);
    }

    private request_ = (
        endPoint: string,
        method: GoogleAppsScript.URL_Fetch.HttpMethod,
        payload: object = null
    ) => {
        const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
            method: method,
            contentType: "application/json",
            headers: {
                Authorization: "Basic " + this.token + ":api_token"
            },
            muteHttpExceptions: true
        }

        if (payload) {
            options.payload = JSON.stringify(payload);
        }

        const res = UrlFetchApp.fetch(this.baseURL + endPoint, options);

        return res.getContentText("UTF-8");
    }

    getProjectByProjectName = (name: string): TogglProject[] => {
        const allProject: TogglProject[] = this.getALLProject_();
        return allProject.filter(project => project.name === name);
    }
};

export { createTogglInstance };
