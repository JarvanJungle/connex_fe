import i18next from "i18next";
import { minusToPrecise, isNullOrUndefined } from "helper/utilities";

const getItemsOrderedDOColDefs = (disabled) => [
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
    },
    {
        headerName: i18next.t("QtyConverted"),
        field: "qtyConverted",
        cellStyle: { textAlign: "right" },
        width: 140
    },
    {
        headerName: i18next.t("QtyRejected"),
        field: "qtyRejected",
        cellStyle: { textAlign: "right" },
        width: 140
    },
    {
        headerName: i18next.t("QtyReceived"),
        field: "qtyReceived",
        /*
         * poItemQtyReceived: create GR form
         * qtyReceived: details GR form
        */
        valueGetter: ({ data }) => {
            if (!isNullOrUndefined(data?.poItemQtyReceived)) {
                return data?.poItemQtyReceived;
            }
            return data?.qtyReceived;
        },
        cellStyle: { textAlign: "right" },
        width: 140
    },
    {
        headerName: i18next.t("PendingDeliveryQty"),
        field: "poItemQtyPendingReceiving",
        valueGetter: ({ data }) => {
            if (!isNullOrUndefined(data?.poItemQtyPendingReceiving)) {
                return data?.poItemQtyPendingReceiving;
            }
            const value = minusToPrecise(Number(data.poQuantity), Number(data.qtyReceived));
            return value;
        },
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("DeliveryOrderQty"),
        field: "qtyToConvert",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("QtyReceiving"),
        field: "qtyReceiving",
        width: 130,
        cellStyle: () => {
            if (disabled) return { textAlign: "right" };
            return {
                textAlign: "right",
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            };
        },
        editable: !disabled
    },
    {
        headerName: i18next.t("QtyRejecting"),
        field: "qtyRejecting",
        width: 130,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("PODeliveryCompleted"),
        field: "poDeliveryCompleted",
        cellRenderer: "poDeliveryCompleted",
        width: 130,
        cellStyle: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: "14px"
        }
    },
    {
        headerName: i18next.t("DeliveryAddress"),
        field: "addressLabel",
        width: 140,
        cellRenderer: (params) => {
            const { value } = params;
            if (typeof value === "object") {
                return value.addressLabel;
            }
            return value;
        }
    },
    {
        headerName: i18next.t("NotesToBuyer"),
        field: "notesToBuyer",
        width: 140,
        tooltipField: "notesToBuyer",
        tooltipComponentParams: {
            fieldTooltip: "notesToBuyer",
            isShow: true
        }
    },
    {
        headerName: i18next.t("CommentsOnDelivery"),
        field: "commentsOnDelivery",
        width: 140,
        cellStyle: () => {
            if (disabled) return { };
            return {
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            };
        },
        cellEditor: "agLargeTextCellEditor",
        cellEditorParams: { maxLength: 250 },
        editable: !disabled,
        tooltipField: "commentsOnDelivery",
        tooltipComponentParams: {
            fieldTooltip: "commentsOnDelivery",
            isShow: disabled
        }
    },
    {
        headerName: i18next.t("AddAttachment"),
        field: "addAttachment",
        width: 140,
        cellStyle: () => {
            if (disabled) {
                return {
                    display: "flex",
                    justifyContent: "center"
                };
            }
            return {
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB",
                display: "flex",
                justifyContent: "center"
            };
        },
        cellRenderer: "addAttachment"
    }
];

export default getItemsOrderedDOColDefs;
