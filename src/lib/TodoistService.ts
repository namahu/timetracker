export type TodoistLabel = {
    id: number;
    name: string;
    color: number;
    order: number;
    favorite: boolean;
}

const createTodoistInstance = (token: string) => {
    return new TodoistService_(token);
};

class TodoistService_ {
    private syncAPIBaseURL = "https://api.todoist.com/sync/v8";
    private restAPIBaseURL = "https://api.todoist.com/rest/v1";

    private token: string;

    constructor (token: string) {
        this.token = token;
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
                Authorization: "Bearer " + this.token
            },
            muteHttpExceptions: true
        };

        if (payload) {
            options.payload = JSON.stringify(payload);
        }

        const res = UrlFetchApp.fetch(endPoint, options);
        return res.getContentText("UTF-8");
    }

    getAllLabel = (): TodoistLabel[] => {
        const endPoint = this.syncAPIBaseURL
            + "/labels";
        
        const contentText = this.request_(endPoint, "get");
        return JSON.parse(contentText);
    }

    getLabelByLabelID = (labelID: number[]) => {
        const allLabel = this.getAllLabel();
        return allLabel.filter(label => labelID.includes(label.id));
    }

    getProjectByProjectID = (projectID: number) => {
        const endPoint = this.syncAPIBaseURL
            + "/projects/get_data?project_id="
            + projectID;
        
        const contentText = this.request_(endPoint, "get");
        return JSON.parse(contentText);
    }
}

export { createTodoistInstance };
