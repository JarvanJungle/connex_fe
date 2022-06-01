import i18next from "i18next";
import { convertDate2String } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";

const cellStyle = ({
    data, context, isNumber, isQuantity
}) => {
    if (
        (!isQuantity && data?.manualItem && !context?.disabled)
        || (isQuantity && !context?.disabled)
    ) {
        return {
            backgroundColor: "#DDEBF7",
            border: "1px solid #E4E7EB",
            textAlign: isNumber ? "right" : "left"
        };
    }
    return { textAlign: isNumber ? "right" : "left" };
};

const getAddItemsColDefs = (addresses, disabled, isProject, uoms, currencies) => [
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "actionDelete",
        filter: false,
        hide: disabled,
        width: 100
    },
    {
        headerName: i18next.t("ItemCode"),
        field: "itemCode",
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle
    },
    {
        headerName: i18next.t("ItemName"),
        field: "itemName",
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle,
        width: 220
    },
    {
        headerName: i18next.t("ItemDescription"),
        field: "itemDescription",
        cellEditor: "agLargeTextCellEditor",
        cellEditorParams: { maxLength: 250 },
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle,
        tooltipField: "itemDescription",
        tooltipComponentParams: (params) => {
            const { manualItem } = params.data;
            return {
                fieldTooltip: "itemDescription",
                isShow: disabled || !manualItem
            };
        },
        width: 250
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel",
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle,
        width: 140
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize",
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle,
        width: 140
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand",
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle,
        width: 140
    },
    {
        headerName: i18next.t("Trade"),
        field: "projectForecastTradeCode",
        hide: !isProject,
        width: 140
    },
    {
        headerName: i18next.t("UOM"),
        field: "uom",
        valueFormatter: ({ value }) => {
            if (value) {
                if (typeof value === "string") return value;
                return value.uomCode;
            }
            return value;
        },
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            values: uoms
        },
        editable: (params) => {
            const { manualItem } = params.data;
            return manualItem && !disabled;
        },
        cellStyle,
        width: 140
    },
    {
        headerName: i18next.t("Quantity"),
        field: "itemQuantity",
        editable: !disabled,
        cellStyle: (params) => cellStyle({ ...params, isNumber: true, isQuantity: true }),
        width: 140
    },
    {
        headerName: i18next.t("Currency"),
        field: "sourceCurrency",
        cellEditor: "agRichSelectCellEditor",
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
        cellEditorParams: { values: currencies },
        editable: (params) => {
            const { manualItem, editableCurrency } = params.data;
            return (!disabled && manualItem) || (!disabled && editableCurrency);
        },
        cellStyle: ({ data, context }) => {
            const { manualItem, editableCurrency } = data;
            if (
                (!context.disabled && manualItem)
                || (!context.disabled && editableCurrency)
            ) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        width: 140
    },
    {
        headerName: i18next.t("Price"),
        field: "itemUnitPrice",
        editable: (params) => {
            const { manualItem, editablePrice } = params.data;
            return (!disabled && manualItem) || (!disabled && editablePrice);
        },
        cellStyle: (params) => {
            const { manualItem, editablePrice } = params.data;
            if ((!disabled && manualItem) || (!disabled && editablePrice)) {
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
        width: 140
    },
    {
        headerName: i18next.t("DeliveryAddress"),
        field: "address",
        valueFormatter: ({ value }) => {
            if (value) {
                if (typeof value === "string") return value;
                return value.addressLabel;
            }
            return value;
        },
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            values: addresses
        },
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        }
    },
    {
        headerName: i18next.t("RequestedDeliveryDate"),
        field: "requestedDeliveryDate",
        cellEditor: "datePicker",
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return convertDate2String(new Date(value), CUSTOM_CONSTANTS.DDMMYYYY);
            return "";
        },
        width: 160
    },
    {
        headerName: i18next.t("Note"),
        field: "note",
        minWidth: 400,
        cellEditor: "agLargeTextCellEditor",
        cellEditorParams: { maxLength: 500 },
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    width: "400px"
                };
            }
            return {};
        },
        tooltipField: "note",
        tooltipComponentParams: {
            fieldTooltip: "note",
            isShow: disabled
        }
    }
];

export default getAddItemsColDefs;
