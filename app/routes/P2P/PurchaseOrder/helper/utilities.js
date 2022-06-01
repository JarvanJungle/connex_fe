const convertAction = (action) => {
    let result = "";
    switch (action.toLowerCase()) {
    case "convert_from_ppo":
        result = "Converted from PPO";
        break;
    case "convert_from_pr":
        result = "Converted from Purchase Request";
        break;
    case "submit":
        result = "Issued Purchase Order";
        break;
    case "issue":
        result = "Issued Purchase Order";
        break;
    case "supplier_viewed_po":
        result = "Viewed Purchase Order";
        break;
    case "acknowledge":
        result = "Acknowledged PO";
        break;
    case "close":
        result = "Closed PO";
        break;
    case "reject":
    case "rejected":
        result = "Rejected PO";
        break;
    case "cancel":
    case "cancelled":
        result = "Cancelled PO";
        break;
    case "recall":
        result = "Recalled PO";
        break;
    case "send_back":
        result = "Sent back PO";
        break;
    }
    return result || action;
};

export default convertAction;
