const createTodoistInstance = (token: string) => {
    return new TodoistService_(token);
};

class TodoistService_ {
    private baseURL = "https://api.todoist.com/sync/v8";

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

    getProjectByProjectID = (projectID: number) => {
        const endPoint = this.baseURL
            + "/projects/get_data?project_id="
            + projectID;
        
        const contentText = this.request_(endPoint, "get");
        return JSON.parse(contentText);
    }
}

export { createTodoistInstance };
