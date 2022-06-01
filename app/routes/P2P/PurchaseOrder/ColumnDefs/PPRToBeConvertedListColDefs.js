import i18next from "i18next";
import { convertToLocalTime } from "helper/utilities";

const PRToBeConvertedListColDefs = [
    {
        headerName: i18next.t("PrePurchaseRequisitionNo"),
        field: "pprNumber",
        minWidth: 220
    },
    {
        headerName: i18next.t("PrePurchaseRequisitionTitle"),
        field: "pprTitle",
        tooltipField: "pprTitle",
        tooltipComponentParams: {
            fieldTooltip: "pprTitle",
            isShow: true
        }
    },
    {
        headerName: i18next.t("Status"),
        field: "status",
        valueGetter: ({ data }) => data?.status?.replaceAll("_", " ") ?? "",
        minWidth: 300
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode",
        minWidth: 150
    },
    {
        headerName: i18next.t("Type"),
        field: "procurementType",
        maxWidth: 120,
        valueGetter: ({ data }) => data?.procurementType?.toUpperCase()
    },
    {
        headerName: i18next.t("Requester"),
        field: "requesterName",
        maxWidth: 150
    },
    {
        headerName: i18next.t("ApprovedDate"),
        field: "approvedDate",
        minWidth: 180,
        valueFormatter: (params) => convertToLocalTime(params?.value),
        sort: "desc"
    }
];

export default PRToBeConvertedListColDefs;
