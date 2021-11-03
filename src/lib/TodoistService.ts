export type TodoistLabel = {
    id: number;
    name: string;
    color: number;
    order: number;
    favorite: boolean;
};

export type TodoistProject = {
    id: number;
    name: string;
    comment_count: number;
    color: number;
    shared: boolean;
    sync_id: number;
    order: number;
    favorite: boolean;
    url: string;
};

export type TodoistTask = {
    content?: string;
    description?: string;
    label_ids?: number[];
    priority?: number;
    due_string?: string;
    due_date?: string;
    due_datetime?: string;
    due_lang?: string;
    assignee?: number;
};

export interface ITodoistService {
    getAllLabel: () => TodoistLabel[];
    getLabelByLabelID: (labelID: number[]) => TodoistLabel[];
    getProjectByProjectID: (projectID: number) => TodoistProject;
    updateTask: (taskID: number, payload: TodoistTask) => void;
}

const createTodoistInstance = (token: string) => {
    return new TodoistService_(token);
};

class TodoistService_ implements ITodoistService {
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
        const endPoint = this.restAPIBaseURL
            + "/labels";
        
        const contentText = this.request_(endPoint, "get");
        return JSON.parse(contentText);
    }

    getLabelByLabelID = (labelID: number[]) => {
        const allLabel = this.getAllLabel();
        return allLabel.filter(label => labelID.includes(label.id));
    }

    getProjectByProjectID = (projectID: number) => {
        const endPoint = this.restAPIBaseURL
            + "/projects/"
            + projectID;
        
        const contentText = this.request_(endPoint, "get");
        return JSON.parse(contentText);
    }

    updateTask = (taskID: number, payload: TodoistTask): void => {
        const endPoint = this.restAPIBaseURL
            + "tasks"
            + taskID;

        this.request_(endPoint, "post", payload);
    };
}

export { createTodoistInstance };
