import i18next from "i18next";
import { formatDisplayDecimal } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const DODetailsTableColDefs = [
    {
        headerName: i18next.t("PONumber"),
        field: "poNumber",
        suppressSizeToFit: true,
        cellRenderer: "poNumber"
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
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("UOM"),
        field: "uomCode",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("POQuantity"),
        field: "poQuantity",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("QtyConverted"),
        field: "qtyConverted",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("QtyRejected"),
        field: "qtyRejected",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("QtyReceived"),
        field: "qtyReceived",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("QtyPendingDelivery"),
        field: "qtyPendingDelivery",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("DeliveryOrderQty"),
        field: "qtyToConvert",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("PONote"),
        field: "poNote",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("DeliveryAddress"),
        field: "address",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("NotesToBuyer"),
        field: "notesToBuyer",
        suppressSizeToFit: true
    }
];

export default DODetailsTableColDefs;
