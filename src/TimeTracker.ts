import { handleItemCompleted } from "./EventHandler/ItemCompleted";
import { handleItemUpdated } from "./EventHandler/ItemUpdated";
import { createTodoistInstance } from "./lib/TodoistService";
import { createTogglInstance, TimeEntry, TimeEntryProps, TimeEntryResponse } from "./lib/TogglService";

export type Properties = {
    CREATED_WITH_PROP: string;
    TASK_DONE_SECTION_ID: string;
    TODOIST_API_KEY: string;
    TOGGL_API_KEY: string;
    TOGGL_WORKSPACE_ID: string;
    TIMEENTRY_ID: string;
    TIMETRACKING_LABEL_ID: string;
    TIMETRACKING_SECTION_IDS: number[];
    TRAKING_TASK_ID: string;
};

type TodoistWebHookEventData = {
    content: string;
    id: number;
    labels: number[];
    project_id: number;
    section_id: number;
};

export type TodoistWebHookEvent = {
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

    const todoist = createTodoistInstance(properties.TODOIST_API_KEY);
    const toggl = createTogglInstance(properties.TOGGL_API_KEY, properties);

    if (contents.event_name === "item:completed") 
        return handleItemCompleted(
            todoist,
            toggl,
            contents,
            scriptProperties,
            properties
        );

    if (contents.event_name === "item:updated")
        return handleItemUpdated(
            todoist,
            toggl,
            contents,
            properties,
            scriptProperties
        );

    return ask({
        ok: false,
        message: "Invalid Event"
    });

};

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
 * TodoistタスクがTimeTrackingセクションにいるかどうかを調べる
 * 
 * @param { number } sectionID - タスクがいるセクションのID
 * @param { Properties } properties - スクリプトプロパティ 
 * @returns { boolean } - チェック結果
 */
const checkHasTimeTrackingSectionId = (sectionID: number, properties: Properties): boolean => {
    return properties.TIMETRACKING_SECTION_IDS.includes(sectionID);
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

const ask = (content: object) => {
    return ContentService.createTextOutput(JSON.stringify(content))
    .setMimeType(ContentService.MimeType.JSON);
};

export { ask, checkEventTaskTimeTrackingTaskWithSame, checkExistsTimetrackingLabelID, checkHasTimeTrackingSectionId };
