import { formatDisplayDecimal, convertDate2String } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import i18next from "i18next";
import { formatDate, formatStyleNumber } from "../helper";

const getQuotationColDefs = (taxRecords, currencies, unconnectedSupplier, isBuyer) => [
    {
        headerName: i18next.t("Available"),
        field: "available",
        cellRenderer: "checkboxRenderer",
        cellStyle: (params) => {
            const style = {
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            };
            if (
                !params?.data?.quotationItem
                || params?.data?.disabled
                || params?.data?.submitted
            ) {
                return {
                    ...style,
                    "pointer-events": "none",
                    opacity: "0.6"
                };
            }
            return style;
        },
        filter: false,
        width: 100,
        pinned: "left"
    },
    {
        headerName: i18next.t("ItemName"),
        field: "itemName",
        width: 220
    },
    {
        headerName: i18next.t("ItemDescription"),
        field: "itemDescription",
        tooltipField: "itemDescription",
        tooltipComponentParams: {
            fieldTooltip: "itemDescription",
            isShow: true
        },
        width: 250
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel",
        width: 140
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize",
        width: 140
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand",
        width: 140
    },
    {
        headerName: i18next.t("UOM"),
        field: "uom",
        width: 140
    },
    {
        headerName: i18next.t("RequiredQuantity"),
        field: "itemQuantity",
        valueFormatter: ({ data, value }) => {
            if (data?.itemCode.length === 2) {
                return "";
            }
            return value;
            // return formatDisplayDecimal(value, 2);
        },
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("Currency"),
        field: "sourceCurrency",
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: { values: currencies },
        editable: (params) => !params?.data?.disabled
            && params?.data?.available && isBuyer
            && !params?.data?.unconnectedSupplier,
        cellStyle: (params) => {
            if (!params?.data?.disabled
                && !params?.data?.unconnectedSupplier
                && params?.data?.available && isBuyer
            ) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        valueFormatter: ({ value }) => {
            if (value) {
                if (typeof value === "string") return value;
                return `${value.currencyName} (+${value.currencyCode})`;
            }
            return value;
        },
        cellRenderer: ({ value }) => {
            if (value) {
                if (typeof value === "string") return value;
                return value.currencyCode;
            }
            return value;
        },
        width: 140
    },
    {
        headerName: i18next.t("QuotedUnitPrice"),
        field: "itemUnitPrice",
        editable: (params) => !params?.data?.disabled && params?.data?.available,
        cellStyle: (params) => {
            if (!params?.data?.disabled && params?.data?.available) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    textAlign: "right"
                };
            }
            return {
                textAlign: "right"
            };
        },
        valueFormatter: ({ value }) => {
            // if (value) return formatDisplayDecimal(value, 2);
            // return "0.00";
            if (value) return value;
            return "";
        },
        width: 140
    },
    {
        headerName: i18next.t("NetPrice"),
        field: "netPrice",
        cellStyle: formatStyleNumber,
        valueFormatter: ({ data, value }) => {
            if (data?.itemCode.length === 2) {
                return formatDisplayDecimal(value, 2);
            }
            const { itemQuantity, itemUnitPrice } = data;
            return formatDisplayDecimal(itemQuantity * itemUnitPrice, 2);
        },
        width: 140
    },
    {
        headerName: i18next.t("QuotedDate"),
        field: "quotedDate",
        valueFormatter: (params) => {
            const { data, value } = params;
            if (data?.itemCode.length === 1) {
                return convertDate2String(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss);
            }
            return value;
        },
        width: 160
    },
    {
        headerName: i18next.t("TaxCode"),
        field: "taxCode",
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            values: taxRecords
        },
        editable: (params) => !params?.data?.disabled && params?.data?.available,
        cellStyle: (params) => {
            if (!params?.data?.disabled && params?.data?.available) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        valueFormatter: (params) => {
            const { value } = params;
            if (value) {
                if (typeof value === "string") return value;
                return value.taxCode;
            }
            return value;
        },
        width: 140,
        hide: unconnectedSupplier
    },
    {
        headerName: i18next.t("TaxCode"),
        field: "taxCode",
        editable: (params) => !params?.data?.disabled
            && params?.data?.available
            && unconnectedSupplier,
        cellStyle: (params) => {
            if (!params?.data?.disabled
                && params?.data?.available
                && unconnectedSupplier
            ) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        valueFormatter: (params) => {
            const { value } = params;
            if (value) {
                if (typeof value === "string") return value;
                return value.taxCode;
            }
            return value;
        },
        width: 140,
        hide: !unconnectedSupplier
    },
    {
        headerName: i18next.t("TaxPercentage%"),
        field: "taxPercentage",
        editable: (params) => !params?.data?.disabled
            && params?.data?.available
            && unconnectedSupplier,
        cellStyle: (params) => {
            if (!params?.data?.disabled
                && params?.data?.available
                && unconnectedSupplier
            ) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    textAlign: "right"
                };
            }
            return { textAlign: "right" };
        },
        valueFormatter: ({ value }) => formatDisplayDecimal(value, 2),
        width: 140
    },
    {
        headerName: i18next.t("DeliveryAddress"),
        field: "address",
        width: 160
    },
    {
        headerName: i18next.t("RequestedDeliveryDate"),
        field: "requestedDeliveryDate",
        valueFormatter: formatDate,
        width: 160
    },
    {
        headerName: i18next.t("BuyersNote"),
        field: "note",
        minWidth: 400,
        tooltipField: "note",
        tooltipComponentParams: {
            fieldTooltip: "note",
            isShow: true
        }
    },
    {
        headerName: i18next.t("Note"),
        field: "quoteItemNote",
        minWidth: 400,
        cellEditor: "agLargeTextCellEditor",
        cellEditorParams: { maxLength: 500 },
        editable: (params) => !params?.data?.disabled && params?.data?.available,
        cellStyle: (params) => {
            if (!params?.data?.disabled && params?.data?.available) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    width: "400px"
                };
            }
            return {};
        },
        tooltipField: "quoteItemNote",
        tooltipComponentParams: (params) => ({
            fieldTooltip: "quoteItemNote",
            isShow: params?.data?.itemCode?.length === 2
        })
    }
];

export default getQuotationColDefs;
