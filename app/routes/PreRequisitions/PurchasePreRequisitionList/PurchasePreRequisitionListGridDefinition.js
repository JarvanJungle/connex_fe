import i18next from "i18next";
import { convertToLocalTime, formatDateString } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { PPR_STATUS, PPR_FE_STATUS } from "helper/purchasePreRequisitionConstants";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip",
    sortable: true
};

/**
 * @data an array
 * @structure
 * {
    "pprNumber": string,
    "status": string,
    "pprTitle": string,
    "procurementType": string,
    "approvalCode": string,
    "approvalSequence": string,
    "nextGroup": string,
    "requesterName": string,
    "submittedOn": string (date),
    "updatedOn": string (date)
    }
 *  @example
    {
    "pprNumber": "PR100000006",
    "status": "SAVED_AS_DRAFT",
    "pprTitle": "Punggole_Rental_2404",
    "procurementType": "SERVICE",
    "approvalCode": "SITP PURCHASER APPROVAL",
    "approvalSequence": "Group A (2) > Group B (3) > Group C (4)",
    "nextGroup": "Group A (2)",
    "requesterName": "John Smith",
    "submittedOn": "2021-05-25",
    "updatedOn": "2021-05-25"
    }
 */
const columnDefs = [
    {
        headerName: i18next.t("Purchase Pre-requisition No."),
        field: "pprNumber",
        minWidth: 210
    },
    {
        headerName: i18next.t("Status"),
        field: "status",
        minWidth: 200,
        valueGetter: (params) => {
            switch (params.data.status) {
            case PPR_STATUS.PENDING_SUBMISSION:
            {
                return PPR_FE_STATUS.SAVED_AS_DRAFT;
            }
            case PPR_STATUS.PENDING_APPROVAL:
            {
                return PPR_FE_STATUS.PENDING_APPROVAL;
            }
            case PPR_STATUS.CANCELLED:
            {
                return PPR_FE_STATUS.CANCELLED;
            }
            case PPR_STATUS.RECALLED:
            {
                return PPR_FE_STATUS.RECALLED;
            }
            case PPR_STATUS.APPROVED:
            {
                return PPR_FE_STATUS.APPROVED;
            }
            case PPR_STATUS.REJECTED:
            {
                return PPR_FE_STATUS.REJECTED;
            }
            case PPR_STATUS.SENT_BACK:
            {
                return PPR_FE_STATUS.SENT_BACK;
            }
            case PPR_STATUS.CONVERTED_TO_PR:
            {
                return PPR_FE_STATUS.CONVERTED_TO_PR;
            }
            case PPR_STATUS.PENDING_CONVERSION_TO_PO:
            {
                return PPR_FE_STATUS.PENDING_CONVERSION_TO_PO;
            }
            case PPR_STATUS.PARTIALLY_CONVERTED_TO_PO:
            {
                return PPR_FE_STATUS.PARTIALLY_CONVERTED_TO_PO;
            }
            case PPR_STATUS.CONVERTED_TO_PO:
            {
                return PPR_FE_STATUS.CONVERTED_TO_PO;
            }
            default: return params.data.status;
            }
        }
    },
    {
        headerName: i18next.t("Requester"),
        field: "requesterName",
        minWidth: 140
    },
    {
        headerName: i18next.t("Purchase Pre-requisition Title"),
        field: "pprTitle",
        minWidth: 240,
        tooltipField: "pprTitle"
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode",
        minWidth: 140
    },
    {
        headerName: i18next.t("Procurement Type"),
        field: "procurementType",
        minWidth: 120
    },
    {
        headerName: i18next.t("Approval Route"),
        field: "approvalCode",
        minWidth: 150
    },
    {
        headerName: i18next.t("Approval Sequence"),
        field: "approvalSequence",
        minWidth: 180
    },
    {
        headerName: i18next.t("Next Approval Group"),
        field: "nextGroup",
        minWidth: 180
    },
    {
        headerName: i18next.t("Submitted On"),
        field: "submittedOn",
        minWidth: 180,
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss),
        sort: "desc"
    },
    {
        headerName: i18next.t("Updated On"),
        field: "updatedOn",
        minWidth: 180,
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss)
    }
];

export {
    defaultColDef,
    columnDefs
};
