const convertActionAuditTrail = (action) => {
    switch (action) {
    case "APPROVED":
        return "Approved Purchase Requisition";
    case "CONVERTED_TO_PPO":
        return "Converted to PPO";
    case "Saved as draft":
        return "Saved A Purchase Requisition As Draft";
    case "Recalled":
        return "Recalled Purchase Requisition";
    case "SENT_BACK":
    case "Sent back":
        return "Sent Back Purchase Requisition";
    case "Cancelled":
        return "Cancelled Purchase Requisition";
    case "Rejected":
        return "Rejected Purchase Requisition";
    default:
        return action;
    }
};

export default convertActionAuditTrail;
