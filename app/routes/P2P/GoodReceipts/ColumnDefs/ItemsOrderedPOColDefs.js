import i18next from "i18next";
import { formatDisplayDecimal } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const getItemsOrderedPOColDefs = (disabled, isApprovalMode) => [
    {
        headerName: i18next.t("PONo"),
        field: "poNumber",
        cellRenderer: "poNumber"
    },
    {
        headerName: i18next.t("ItemCode"),
        field: "itemCode"
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
            isShow: disabled
        }
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel"
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize"
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand"
    },
    {
        headerName: i18next.t("UOM"),
        field: "uomCode"
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
        headerName: i18next.t("Quantity"),
        field: "quantity",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("QtyReceived"),
        field: "qtyReceived",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("PendingDeliveryQty"),
        field: "qtyPendingDelivery",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("QtyReceiving"),
        field: "qtyReceiving",
        cellStyle: () => {
            if (disabled) return { textAlign: "right" };
            return {
                textAlign: "right",
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            };
        },
        editable: !disabled,
        width: 150,
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("PODeliveryCompleted"),
        field: "poDeliveryCompleted",
        cellRenderer: "poDeliveryCompleted"
    },
    {
        headerName: i18next.t("DeliveryAddress"),
        field: "address",
        cellRenderer: (params) => {
            const { data } = params;
            if (data) {
                const { address } = data;
                return address.addressLabel;
            }
            return "";
        },
        width: 160,
        hide: isApprovalMode
    },
    {
        headerName: i18next.t("CommentsOnDelivery"),
        field: "commentsOnDelivery",
        cellStyle: () => {
            if (disabled) return {};
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
        cellStyle: () => {
            if (disabled) return {};
            return {
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB",
                display: "flex",
                justifyContent: "center"
            };
        },
        cellRenderer: "addAttachment",
        width: 160
    }
];

export default getItemsOrderedPOColDefs;
