import { createTodoistInstance } from "./lib/TodoistService";
import { createTogglInstance, TimeEntry, TimeEntryProps, TimeEntryResponse } from "./lib/TogglService";

export type Properties = {
    CREATED_WITH_PROP: string;
    TODOIST_API_KEY: string;
    TOGGL_API_KEY: string;
    TOGGL_WORKSPACE_ID: string;
    TIMEENTRY_ID: string;
    TIMETRACKING_LABEL_ID: string;
    TIMETRACKING_SECTION_ID: string;
    TRAKING_TASK_ID: string;
};

type TodoistWebHookEventData = {
    content: string;
    id: number;
    labels: number[];
    project_id: number;
    section_id: number;
};

type TodoistWebHookEvent = {
    event_name: "item:updated" | "item:completed";
    event_data: TodoistWebHookEventData;
};

const doPost = (event: GoogleAppsScript.Events.DoPost) => {
    if (!event) return;

    const scriptProperties = PropertiesService.getScriptProperties();
    const properties = scriptProperties.getProperties() as unknown as Properties;

    scriptProperties.setProperty("webhookEvent", JSON.stringify(event));

    const postData = event.postData;
    const contents: TodoistWebHookEvent = JSON.parse(postData.contents);

    const toggl = createTogglInstance(properties.TOGGL_API_KEY, properties);

    const hasTimetrackingLableID = checkExistsTimetrackingLabelID(contents.event_data.labels, properties);

    if (!hasTimetrackingLableID || contents.event_name === "item:completed") {
        // EventのタスクIDとスクリプトプロパティのタスクIDを比較
        // 一致していたらtoggl trackへの計測停止リクエスト作成と送信
        // スクリプトプロパティのタスクIDをnullにする
        const isTrackingTask = checkEventTaskTimeTrackingTaskWithSame(
            contents.event_data.id,
            properties.TRAKING_TASK_ID
        );

        if (isTrackingTask) {
            toggl.stopTimeEntry(properties.TIMEENTRY_ID);

            scriptProperties.setProperties({
                "TRAKING_TASK_ID": "empty",
                "TIMEENTRY_ID": ""
            });
        }

        if (hasTimetrackingLableID) {
            // タスクから「TimeTracking」のラベルを削除する
        }


        return ask();
    }

    // タスクのプロジェクトをtoggl trackのプロジェクトに変換
    // タスクのラベルをtoggl trackのラベルに変換
    // toggl trackへの計測開始リクエスト作成と送信
    // EventのタスクIDをスクリプトプロパティに保存

    const todoist = createTodoistInstance(properties.TODOIST_API_KEY);

    const projectID: number = contents.event_data.project_id;
    const project = todoist.getProjectByProjectID(projectID);

    const todoistLabels = todoist.getLabelByLabelID(contents.event_data.labels);
    const labelName: string[] = todoistLabels.length === 1
        ? []
        : todoistLabels.filter(label => {
            return label.id !== Number(properties.TIMETRACKING_LABEL_ID)
        }).map(label => label.name);

    const togglProject = toggl.getProjectByProjectName(project.name);
    console.log(togglProject);

    if (!togglProject.length) {
        // 計測始める前に、toggl側にプロジェクトを作成する
    }

    const payload: TimeEntryProps = {
        pid: togglProject[0].id,
        description: contents.event_data.content,
        tags: labelName,
        created_with: properties.CREATED_WITH_PROP
    };

    const timeEntryResponse: TimeEntryResponse = toggl.startTimeEntry({
        time_entry: payload
    });
    scriptProperties.setProperties({
        "TRAKING_TASK_ID": contents.event_data.id.toString(),
        "TIMEENTRY_ID": timeEntryResponse.data.id.toString()
    });

    return ask();
}

/**
 * リクエストで受信したタスクが時間計測中のタスクかどうかを調べる
 * 
 * @param { number }eventTaskID - イベント内のタスクID 
 * @param  { string } timeTrackingTaskID - 計測中のタスクID
 * @returns { boolean } - 比較結果
 */
const checkEventTaskTimeTrackingTaskWithSame = (
    eventTaskID: number,
    timeTrackingTaskID: string | "empty"
): boolean => {
    return timeTrackingTaskID === "empty"
        ? false
        : eventTaskID === Number(timeTrackingTaskID);
};

/**
 * Todoistタスクのラベルに「TimeTracking」が設定されているかを調べる
 * 
 * @param { number[] } labels - タスクに設定されているラベル
 * @param { Properties } properties - スクリプトプロパティ
 * @returns { boolean }
 */
const checkExistsTimetrackingLabelID = (labels: number[], properties: Properties): boolean => {
    return labels.includes(Number(properties.TIMETRACKING_LABEL_ID));
};

/**
 * time trackingするタスクのIDをScriptPropertiesに保存する
 * 
 * @param { number } taskID - TodoistのタスクID 
 * @param scriptProperties 
 */
const setTaskIDInScriptProperty = (
    taskID: number,
    scriptProperties: GoogleAppsScript.Properties.Properties
) => {
    scriptProperties.setProperty("TRACKING_TASK_ID", taskID.toString());
};

const ask = () => {
    return ContentService.createTextOutput(JSON.stringify({
        ok: true
    }))
    .setMimeType(ContentService.MimeType.JSON);
};
