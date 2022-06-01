import i18next from "i18next";
import { formatDisplayDecimal } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const ItemsOrderedDOGRDetailsColDefs = [
    {
        headerName: i18next.t("DONo"),
        field: "doNumber",
        cellRenderer: "doNumber",
        width: 140
    },
    {
        headerName: i18next.t("PONo"),
        field: "poNumber",
        cellRenderer: "poNumber",
        width: 140
    },
    {
        headerName: i18next.t("ItemCode"),
        field: "itemCode",
        width: 140
    },
    {
        headerName: i18next.t("ItemName"),
        field: "itemName"
    },
    {
        headerName: i18next.t("ItemDescription"),
        field: "itemDescription",
        tooltipField: "itemDescription",
        tooltipComponentParams: {
            fieldTooltip: "itemDescription",
            isShow: true
        }
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel",
        width: 120
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize",
        width: 120
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand",
        width: 120
    },
    {
        headerName: i18next.t("UOM"),
        field: "uomCode",
        width: 120
    },
    {
        headerName: i18next.t("PONote"),
        field: "poNote",
        tooltipField: "poNote",
        tooltipComponentParams: {
            fieldTooltip: "poNote",
            isShow: true
        }
    },
    {
        headerName: i18next.t("POQuantity"),
        field: "poQuantity",
        cellStyle: { textAlign: "right" },
        width: 140
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("QtyPreviouslyReceived"),
        field: "previousReceived",
        cellStyle: { textAlign: "right" },
        width: 140
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("PendingDeliveryQty"),
        field: "qtyPendingDelivery",
        cellStyle: { textAlign: "right" },
        width: 140
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("QtyReceiving"),
        field: "qtyReceiving",
        cellStyle: { textAlign: "right" },
        width: 140
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("CompletedDelivery"),
        field: "completedDelivery",
        cellRenderer: "poDeliveryCompleted",
        cellStyle: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: "14px"
        }
    },
    {
        headerName: i18next.t("NotesToBuyer"),
        field: "notesToBuyer",
        tooltipField: "notesToBuyer",
        tooltipComponentParams: {
            fieldTooltip: "notesToBuyer",
            isShow: true
        }
    },
    {
        headerName: i18next.t("CommentsOnDelivery"),
        field: "commentsOnDelivery",
        tooltipField: "commentsOnDelivery",
        tooltipComponentParams: {
            fieldTooltip: "commentsOnDelivery",
            isShow: true
        }
    },
    {
        headerName: i18next.t("Attachment"),
        field: "addAttachment",
        width: 140,
        cellRenderer: "addAttachment"
    }
];

export default ItemsOrderedDOGRDetailsColDefs;
