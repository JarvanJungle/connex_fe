import i18next from "i18next";
import {convertToLocalTime, formatDateString} from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { formatStyleNumber, RFQ_CONSTANTS } from "../helper";

const RFQsListColDefsBuyer = [
    {
        headerName: i18next.t("RFQNo"),
        field: "rfqNumber"
    },
    {
        headerName: i18next.t("Status"),
        field: "rfqStatus",
        valueFormatter: ({ data }) => {
            const { rfqStatus } = data;
            switch (rfqStatus) {
            case RFQ_CONSTANTS.CLOSED:
                return RFQ_CONSTANTS.CLOSED_FE;
            default:
                return rfqStatus?.replaceAll("_", " ");
            }
        },
        valueGetter: ({ data }) => {
            const { rfqStatus } = data;
            switch (rfqStatus) {
            case RFQ_CONSTANTS.CLOSED:
                return RFQ_CONSTANTS.CLOSED_FE;
            default:
                return rfqStatus?.replaceAll("_", " ");
            }
        }
    },
    {
        headerName: i18next.t("RFQTitle"),
        field: "rfqTitle",
        valueFormatter: ({ value }) => value?.toUpperCase(),
        width: 180,
        tooltipField: "rfqTitle",
        tooltipComponentParams: () => ({
            fieldTooltip: "rfqTitle",
            isShow: true,
            showValue: true
        })
    },
    {
        headerName: i18next.t("RFQType"),
        field: "rfqType",
        width: 140
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode",
        width: 140
    },
    {
        headerName: i18next.t("QuotationsReceived"),
        field: "quotationReceived",
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("QuotationsSent"),
        field: "quotationSent",
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("RFQDueOn"),
        field: "dueDate",
        valueFormatter: ({ data }) => formatDateString(
            data?.dueDate, CUSTOM_CONSTANTS.DDMMYYYHHmmss
        )
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        width: 140
    },
    {
        headerName: i18next.t("Vendor"),
        field: "vendors",
        valueFormatter: ({ data }) => data?.vendors?.join(", "),
        valueGetter: ({ data }) => data?.vendors?.join(", "),
        tooltipField: "vendors",
        tooltipComponentParams: () => ({
            fieldTooltip: "vendors",
            isShow: true,
            showValue: true
        }),
        width: 300
    },
    {
        headerName: i18next.t("ApprovalRoute"),
        field: "approvalRouteName"
    },
    {
        headerName: i18next.t("ApprovalSequence"),
        field: "approvalRouteSequence"
    },
    {
        headerName: i18next.t("NextApprover"),
        field: "nextApprover"
    },
    {
        headerName: i18next.t("Requester"),
        field: "requesterName"
    },
    {
        headerName: i18next.t("SubmittedOn"),
        field: "submittedDate",
        valueFormatter: ({ data }) => convertToLocalTime(
            data?.submittedDate, CUSTOM_CONSTANTS.DDMMYYYHHmmss
        ),
        sort: "desc"
    },
    {
        headerName: i18next.t("UpdatedOn"),
        field: "updatedDate",
        valueFormatter: ({ data }) => convertToLocalTime(
            data?.updatedDate, CUSTOM_CONSTANTS.DDMMYYYHHmmss
        )
    }
];

const RFQsListColDefsSupplier = [
    {
        headerName: i18next.t("RFQNo"),
        field: "rfqNumber"
    },
    {
        headerName: i18next.t("Status"),
        field: "rfqStatus",
        valueFormatter: ({ data }) => {
            const { rfqStatus } = data;
            switch (rfqStatus) {
            case RFQ_CONSTANTS.CLOSED:
                return RFQ_CONSTANTS.CLOSED_FE;
            default:
                return rfqStatus?.replaceAll("_", " ");
            }
        },
        valueGetter: ({ data }) => {
            const { rfqStatus } = data;
            switch (rfqStatus) {
            case RFQ_CONSTANTS.CLOSED:
                return RFQ_CONSTANTS.CLOSED_FE;
            default:
                return rfqStatus?.replaceAll("_", " ");
            }
        }
    },
    {
        headerName: i18next.t("RFQTitle"),
        field: "rfqTitle",
        valueFormatter: ({ value }) => value?.toUpperCase(),
        width: 180,
        tooltipField: "rfqTitle",
        tooltipComponentParams: () => ({
            fieldTooltip: "rfqTitle",
            isShow: true,
            showValue: true
        })
    },
    {
        headerName: i18next.t("RFQType"),
        field: "rfqType",
        width: 140
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        width: 140
    },
    {
        headerName: i18next.t("Vendor"),
        field: "vendor"
    },
    {
        headerName: i18next.t("Requestor"),
        field: "requesterName"
    },
    {
        headerName: i18next.t("RFQStartedOn"),
        field: "submittedDate",
        valueFormatter: ({ data }) => convertToLocalTime(
            data?.submittedDate, CUSTOM_CONSTANTS.DDMMYYYHHmmss
        ),
        sort: "desc"
    },
    {
        headerName: i18next.t("RFQDueOn"),
        field: "dueDate",
        valueFormatter: ({ data }) => formatDateString(
            data?.dueDate, CUSTOM_CONSTANTS.DDMMYYYHHmmss
        )
    }
];

const getRFQsListColDefs = (isBuyer) => (isBuyer ? RFQsListColDefsBuyer : RFQsListColDefsSupplier);

export default getRFQsListColDefs;
