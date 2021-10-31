type Properties = {
    TODOIST_API_KEY: string;
    TIMETRACKING_LABEL_ID: number;
};

type TodoistWebHookEventData = {
    labels: number[]
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

    if (contents.event_name === "item:completed") {
        // EventのタスクIDとスクリプトプロパティのタスクIDを比較
        // 一致していたらtoggl trackへの計測停止リクエスト作成と送信
        // スクリプトプロパティのタスクIDをnullにする

        return ask();
    }

    const hasTimeTrackingLabel = checkTimeTrackingLabelExistence(contents.event_data.labels, properties);

    if (!hasTimeTrackingLabel) {
        // EventのタスクIDとスクリプトプロパティのタスクIDを比較
        // 一致していたらtoggl trackへの計測停止リクエスト作成と送信
        // スクリプトプロパティのタスクIDをnullにする

        return ask();
    }

    // EventのタスクIDをスクリプトプロパティに保存
    // タスクのプロジェクトをtoggl trackのプロジェクトに変換
    // タスクのラベルをtoggl trackのラベルに変換
    // toggl trackへの計測開始リクエスト作成と送信

    return ask();
}

/**
 * Todoistタスクのラベルに「TimeTracking」が設定されているかを調べる
 * 
 * @param { number[] } labels - タスクに設定されているラベル
 * @param { Properties } properties - スクリプトプロパティ
 * @returns { boolean }
 */
const checkTimeTrackingLabelExistence = (labels: number[], properties: Properties): boolean => {
    return labels.includes(Number(properties.TIMETRACKING_LABEL_ID));
};


const ask = () => {
    return ContentService.createTextOutput(JSON.stringify({
        ok: true
    }))
    .setMimeType(ContentService.MimeType.JSON);
};
