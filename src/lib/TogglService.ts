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

export type TimeEntryProps = {
    at?: string;
    billable?: boolean;
    created_with: string;
    description: string;
    duration?: number;
    duronly?: boolean;
    id?: number;
    pid: number;
    start?: string;
    stop?: string;
    tags?: string[];
    tid?: number;
    wid?: number;
}

export type TimeEntry = {
    time_entry: TimeEntryProps;
}

export type TimeEntryResponse = {
    data: TimeEntryProps;
}

export interface ITogglService {
    getProjectByProjectName: (name: string) => TogglProject[];
    startTimeEntry: (payload: TimeEntry) => TimeEntryResponse;
    stopTimeEntry: (timeEntryID: string) => any;
}

const createTogglInstance = (token: string, properties: Properties) => {
    return new TogglService_(token, properties);
};

class TogglService_ implements ITogglService {
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
                Authorization: "Basic " + Utilities.base64Encode(this.token + ":api_token"),
                "Content-type": "application/json"
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

    startTimeEntry = (payload: TimeEntry): TimeEntryResponse => {
        const endPoint = "/time_entries/start"
        
        const contentText = this.request_(endPoint, "post", payload);
        return JSON.parse(contentText);
    }

    stopTimeEntry = (timeEntryID: string) => {
        const endPoint = "/time_entries/"
            + timeEntryID
            + "/stop";
        const contentText = this.request_(endPoint, "put");
        return JSON.parse(contentText);
    };
};

export { createTogglInstance };
