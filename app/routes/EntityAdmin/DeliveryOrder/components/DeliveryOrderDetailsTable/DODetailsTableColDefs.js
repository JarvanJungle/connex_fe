import { formatDisplayDecimal } from "helper/utilities";
import i18next from "i18next";

const editableLogic = (params) => (
    (!params.data.isView));

const cellStyleLogic = (params) => {
    if (!params.data.isView) {
        return {
            backgroundColor: "#DDEBF7",
            border: "1px solid #E4E7EB"
        };
    } return {};
};

const editableIssueLogic = (params) => (
    (!params.data.isIssue && !params.data.isView));

const cellStyleIssueLogic = (params) => {
    if (!params.data.isIssue && !params.data.isView) {
        return {
            backgroundColor: "#DDEBF7",
            border: "1px solid #E4E7EB"
        };
    } return {};
};

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    if (value === 0) return "0.00";
    return "";
};

const DODetailsTableColDefs = [
    {
        headerName: i18next.t("PONumber"),
        field: "poNumber",
        suppressSizeToFit: true,
        cellRenderer: "LinkCellRenderer"
    },
    {
        headerName: i18next.t("ItemCode"),
        field: "itemCode",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("ItemName"),
        field: "itemName",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("ItemDescription"),
        field: "itemDescription",
        tooltipField: "itemDescription",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("ItemModel"),
        field: "itemModel",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("ItemSize"),
        field: "itemSize",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("ItemBrand"),
        field: "itemBrand",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("UOM"),
        field: "uomCode",
        suppressSizeToFit: true,
        width: 120
    },
    {
        headerName: i18next.t("POQuantity"),
        field: "poQuantity",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        width: 140
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("QtyConverted"),
        field: "qtyConverted",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        width: 140
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("PO Qty Rejected"),
        field: "poQtyRejected",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        width: 160
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("PO Qty Received"),
        field: "poQtyReceived",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        width: 160
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("PONote"),
        field: "poNote",
        tooltipField: "poNote",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("ToConvert"),
        field: "qtyToConvert",
        suppressSizeToFit: true,
        editable: editableIssueLogic,
        cellStyle: (params) => {
            if (!params.data.isIssue && !params.data.isView) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    textAlign: "right"
                };
            } return {
                textAlign: "right"
            };
        },
        pinned: "right",
        width: 140
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("CompletedDelivery"),
        field: "completedDelivery",
        cellRenderer: "completedDelivery",
        width: 180,
        cellStyle: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: "20px"
        },
        suppressSizeToFit: true,
        pinned: "right"
    },
    {
        headerName: i18next.t("DeliveryAddress"),
        field: "addressLabel",
        suppressSizeToFit: true,
        pinned: "right"
    },
    {
        headerName: i18next.t("NotesToBuyer"),
        field: "notesToBuyer",
        suppressSizeToFit: true,
        cellEditor: "agLargeTextCellEditor",
        cellEditorParams: { maxLength: 400 },
        editable: editableLogic,
        cellStyle: cellStyleLogic,
        pinned: "right"
    },
    {
        headerName: i18next.t("NotesToBuyer"),
        field: "notesToBuyerIssued",
        tooltipField: "notesToBuyer",
        suppressSizeToFit: true,
        valueGetter: (params) => (params.data.notesToBuyer),
        hide: true
    },
    {
        headerName: i18next.t("Comments on Delivery"),
        field: "commentsOnDelivery",
        tooltipField: "commentsOnDelivery",
        suppressSizeToFit: true,
        hide: true
    },
    {
        headerName: i18next.t("Add Attachment"),
        field: "documentFileLabel",
        cellRenderer: "addAttachment",
        suppressSizeToFit: true,
        hide: true
    },
    {
        headerName: i18next.t("QtyRejected"),
        field: "qtyRejected",
        suppressSizeToFit: true,
        hide: true,
        cellStyle: { textAlign: "right" },
        width: 140
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("QtyReceived"),
        field: "qtyReceived",
        suppressSizeToFit: true,
        hide: true,
        cellStyle: { textAlign: "right" },
        width: 140
        // cellRenderer: formatNumber
    }
];

export default DODetailsTableColDefs;
