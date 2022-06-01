export const progressiveClaimColumnDefs = (t) => ([
    {
        headerName: t("Draft Progress Claim No."),
        field: "draftProgressClaimNo",
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true
    },
    {
        headerName: t("Developer Name"),
        field: "developerName"
    },
    {
        headerName: t("Status"),
        field: "status"
    },
    {
        headerName: t("Payment Claim Reference Month"),
        field: "paymentClaimReferenceMonth"
    },
    {
        headerName: t("This Claim"),
        field: "thisClaim"
    },
    {
        headerName: t("This Certified"),
        field: "thisCertified"
    },
    {
        headerName: t("Payment Claim Reference No."),
        field: "paymentClaimReferenceNo"
    },
    {
        headerName: t("Developer Work Order No."),
        field: "developerWorkOrderNo"
    },
    {
        headerName: t("Work Order Title"),
        field: "workOrderTitle",
    },
    {
        headerName: t("Project"),
        field: "project",
    },
    {
        headerName: t("Updated At"),
        field: "updatedAt",
    },
    {
        headerName: t("Issued By"),
        field: "issuedBy",
    },
    {
        headerName: t("Responded By"),
        field: "respondedBy",
    },
    {
        headerName: t("Acknowledged By"),
        field: "acknowledgedBy",
    },
]);

export const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true
};