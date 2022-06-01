import { convertToLocalTime } from "helper/utilities";

const convertAction = (action) => {
    let result = "";
    switch (action.toLowerCase()) {
    case "converted_to_ppo":
        result = "Converted to PPO";
        break;
    case "submit":
        result = "Submitted PPO";
        break;
    case "approve":
    case "approved":
        result = "Approved PPO";
        break;
    case "convert":
        result = "Converted to PO";
        break;
    case "sendBack":
    case "sent_back":
    case "send_back":
        result = "Sent back PPO";
        break;
    case "reject":
        result = "Rejected PPO";
        break;
    case "cancel":
        result = "Cancelled PPO";
        break;
    case "recall":
        result = "Recalled PPO";
        break;
    case "save_as_draft":
        result = "Saved a PPO as draft";
        break;
    }
    return result || action;
};

const getDataAuditTrail = (data) => {
    let result = [...data];
    result = result.map(({
        action, dateTime, userRole, ...rest
    }) => ({
        ...rest,
        date: convertToLocalTime(dateTime),
        role: userRole,
        action: convertAction(action)
    }));
    return result;
};

export { convertAction, getDataAuditTrail };
