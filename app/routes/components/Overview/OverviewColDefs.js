import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { convertToLocalTime } from "helper/utilities";
import i18next from "i18next";

const convertAction = (params) => {
    const { data } = params;
    switch (data.action) {
    case "APPROVED":
        if (data.type === "PPR") {
            return "Approved Purchase Pre-Requisition";
        }
        if (data.type === "PR") {
            return "Approved Purchase Requisition";
        }
        if (data.type === "PPO") {
            return "Approved PPO";
        }
        if (data.type === "GR") {
            return "Approved Goods Receipt";
        }
        if (data.type === "PAY") {
            return "Approved Payment";
        }
        break;
    case "Saved as draft":
        if (data.type === "PR") {
            return "Saved Requisition As Draft";
        }
        break;
    case "Recalled":
        if (data.type === "PR") {
            return "Recalled Purchase Requisition";
        }
        if (data.type === "PPO") {
            return "Recalled PPO";
        }
        break;
    case "SENT_BACK":
        if (data.type === "PR") {
            return "Sent Back Purchase Requisition";
        }
        if (data.type === "PO") {
            return "Sent Back PO";
        }
        if (data.type === "PPO") {
            return "Sent Back PPO";
        }
        if (data.type === "DO") {
            return "Sent Back DO";
        }
        if (data.type === "GR") {
            return "Sent Back GR";
        }
        if (data.type === "PAY") {
            return "Sent Back Payment";
        }
        break;
    case "SEND_BACK":
        if (data.type === "PPO") {
            return "Sent Back PPO";
        }
        if (data.type === "PAY") {
            return "Sent Back Payment";
        }
        if (data.type === "PO") {
            return "Sent Back PO";
        }
        break;
    case "Rejected":
        if (data.type === "PR") {
            return "Rejected Purchase Requisition";
        }
        if (data.type === "PO") {
            return "Rejected PO";
        }
        break;
    case "CONVERTED_TO_PPO":
        if (data.type === "PR") {
            return "Converted To PPO";
        }
        if (data.type === "PPO") {
            return "Converted To PPO";
        }
        break;
    case "CONVERTED_TO_PO":
        if (data.type === "PR") {
            return "Converted To PO";
        }
        if (data.type === "PPO") {
            return "Converted To PO";
        }
        if (data.type === "PO") {
            return "Converted To PO";
        }
        break;
    case "REJECTED":
        if (data.type === "PR") {
            return "Rejected Purchase Requisition";
        }
        if (data.type === "PAY") {
            return "Rejected Payment";
        }
        if (data.type === "PAY") {
            return "Rejected Payment";
        }
        break;
    case "REJECT":
        if (data.type === "PAY") {
            return "Rejected Payment";
        }
        if (data.type === "PO") {
            return "Rejected PO";
        }
        break;
    case "SUBMIT":
        if (data.type === "PPO") {
            return "Submitted PPO";
        }
        if (data.type === "GR") {
            return "Submitted Goods Receipt";
        }
        if (data.type === "PAY") {
            return "Submitted Payment";
        }
        if (data.type === "PO") {
            return "Issued Purchase Order";
        }
        break;
    case "RECALL":
        if (data.type === "PPO") {
            return "Recalled PPO";
        }
        if (data.type === "PO") {
            return "Recalled PO";
        }
        break;
    case "CANCEL":
        if (data.type === "PPO") {
            return "Cancelled PPO";
        }
        if (data.type === "PO") {
            return "Cancelled PO";
        }
        break;
    case "CONVERT":
        if (data.type === "PPO") {
            return "Converted To PO";
        }
        break;
    case "convert":
        if (data.type === "PPO") {
            return "Converted To PO";
        }
        break;
    case "convert_from_ppo":
        if (data.type === "PO") {
            return "Converted From PPO";
        }
        break;
    case "CONVERT_FROM_PR":
        if (data.type === "PO") {
            return "Converted from Purchase Request";
        }
        break;
    case "CLOSE":
        if (data.type === "PO") {
            return "Closed PO";
        }
        break;
    case "issue":
        if (data.type === "PO") {
            return "Issued PO";
        }
        break;
    case "cancel":
        if (data.type === "PO") {
            return "Cancelled PO";
        }
        break;
    case "cancelled":
    case "CANCELLED":
        if (data.type === "PR") {
            return "Cancelled Purchase Requisition";
        }
        if (data.type === "PPO") {
            return "Cancelled PPO";
        }
        if (data.type === "PO") {
            return "Cancelled PO";
        }
        if (data.type === "DO") {
            return "Cancelled DO";
        }
        if (data.type === "GR") {
            return "Cancelled Goods Receipt";
        }
        break;
    case "SUPPLIER_VIEWED_PO":
        if (data.type === "PO") {
            return "Viewed PO";
        }
        break;
    case "ACKNOWLEDGE":
        if (data.type === "PO") {
            return "Acknowledged PO";
        }
        break;
    case "reject":
        if (data.type === "PO") {
            return "Rejected PO";
        }
        break;
    case "close":
        if (data.type === "PO") {
            return "Closed PO";
        }
        break;
    case "DO Created":
        if (data.type === "DO") {
            return "Created DO";
        }
        break;
    case "DO Issued":
        if (data.type === "DO") {
            return "Issued DO";
        }
        break;
    case "save_as_draft":
        if (data.type === "GR") {
            return "Saved Goods Receipt As Draft";
        }
        if (data.type === "PAY") {
            return "Saved Payment As Draft";
        }
        break;
    case "SAVE_AS_DRAFT":
        if (data.type === "PAY") {
            return "Saved Payment As Draft";
        }
        break;
    case "submit":
        if (data.type === "GR") {
            return "Submitted Goods Receipt";
        }
        break;
    case "INVOICE_APPROVED":
        if (data.type === "INV") {
            return "Approved Invoice";
        }
        if (data.type === "PAY") {
            return "Approved Invoice";
        }
        break;
    case "INVOICE_REJECTED":
        if (data.type === "INV") {
            return "Rejected Invoice";
        }
        if (data.type === "PAY") {
            return "Rejected Invoice";
        }
        break;
    case "DO_INVOICE_CREATED":
        if (data.type === "INV") {
            return "Created DO Invoice";
        }
        break;
    case "NON_PO_INVOICE_CREATED":
        if (data.type === "INV") {
            return "Created Non-PO Invoice";
        }
        break;
    case "ISSUE_PENDING_APPROVAL_INVOICE":
        if (data.type === "INV") {
            return "Issued Invoice";
        }
        break;
    case "PROJECT_INVOICE_CREATED":
        if (data.type === "INV") {
            return "Created Project Invoice";
        }
        break;
    default:
        return params.value;
    }
    return data.action;
};

const OverviewColDefs = [
    {
        headerName: i18next.t("Show More"),
        field: "actionGet",
        suppressSizeToFit: false,
        cellRenderer: "GetChildParent",
        cellStyle: () => ({
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }),
        filter: false,
        maxWidth: 120
    },
    {
        headerName: i18next.t("DocumentNumber"),
        field: "documentNumber",
        suppressSizeToFit: false,
        cellRenderer: "LinkCellRenderer"
    },
    {
        headerName: i18next.t("User"),
        field: "userName",
        suppressSizeToFit: false
    },
    {
        headerName: i18next.t("Role"),
        field: "userRole",
        suppressSizeToFit: false
    },
    {
        headerName: i18next.t("Date"),
        field: "date",
        suppressSizeToFit: false,
        valueFormatter:
        (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss)
    },
    {
        headerName: i18next.t("Action"),
        field: "action",
        suppressSizeToFit: false,
        valueFormatter: (params) => convertAction(params)
    }
];

export default OverviewColDefs;
