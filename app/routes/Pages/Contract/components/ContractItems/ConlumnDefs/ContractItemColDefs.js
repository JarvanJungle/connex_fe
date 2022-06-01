import i18next from "i18next";
import { formatDisplayDecimal } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { convertDate2String } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const properties = (disabled) => ({
    editable: (params) => {
        const { manualItem } = params.data;
        return manualItem && !disabled;
    },
    cellStyle: (params) => {
        const { manualItem } = params.data;
        if (manualItem && !disabled) {
            return {
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            };
        }
        return { };
    }
});

const getContractItemColDefs = (addresses, uoms,
    currencies, taxRecords, glAccounts, note, disabled) => [
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "actionDelete",
        hide: disabled
    },
    {
        headerName: i18next.t("ItemCode"),
        field: "itemCode",
        ...properties(disabled)
    },
    {
        headerName: i18next.t("ItemName"),
        field: "itemName",
        ...properties(disabled)
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
        cellStyle: (params) => {
            const { manualItem } = params.data;
            if (manualItem && !disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return {};
        },
        tooltipField: "itemDescription",
        tooltipComponentParams: {
            fieldTooltip: "itemDescription",
            isShow: disabled
        },
        width: 250
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel",
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize",
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand",
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Trade"),
        field: "trade",
        ...properties(disabled)
    },
    {
        headerName: i18next.t("UOM"),
        field: "uomCode",
        ...properties(disabled),
        cellRenderer: "uomCodeCellRenderer",
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            values: uoms,
            cellRenderer: "uomCodeCellRenderer"
        }
    },
    {
        headerName: i18next.t("Quantity"),
        field: "itemQuantity",
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    textAlign: "right"
                };
            }
            return {
                textAlign: "right"
            };
        }
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        ...properties(disabled),
        cellRenderer: "currencyCellTableRenderer",
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            values: currencies,
            cellRenderer: "currencyCellRenderer"
        }
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "itemUnitPrice",
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
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
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("TaxCode"),
        field: "taxCode",
        cellRenderer: "taxRecordCellRenderer",
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            values: taxRecords,
            cellRenderer: "taxRecordCellRenderer"
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
        headerName: i18next.t("Tax Percentage (%)"),
        field: "taxPercentage",
        cellStyle: {
            textAlign: "right"
        },
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("InSourceCurrencyBeforeTax"),
        field: "inSourceCurrencyBeforeTax",
        cellStyle: {
            textAlign: "right"
        },
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("ExchangeRate"),
        field: "exchangeRate",
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
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
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("InDocumentCurrencyBeforeTax"),
        field: "inDocumentCurrencyBeforeTax",
        cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right"
        }
    },
    {
        headerName: i18next.t("TaxAmountInDocumentCurrency"),
        field: "inDocumentCurrencyTaxAmount",
        cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right"
        }
    },
    {
        headerName: i18next.t("In Document Currency (After Tax)"),
        field: "inDocumentCurrencyAfterTax",
        cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right"
        }
    },
    // {
    //     headerName: i18next.t("Delivery Address"),
    //     field: "address",
    //     cellRenderer: "addressCellRenderer",
    //     cellEditor: "agRichSelectCellEditor",
    //     cellEditorParams: {
    //         values: addresses,
    //         cellRenderer: "addressCellRenderer"
    //     },
    //     editable: !disabled,
    //     cellStyle: () => {
    //         if (!disabled) {
    //             return {
    //                 backgroundColor: "#DDEBF7",
    //                 border: "1px solid #E4E7EB"
    //             };
    //         }
    //         return { };
    //     }
    // },
    // {
    //     headerName: i18next.t("RequestedDeliveryDate"),
    //     field: "requestedDeliveryDate",
    //     cellEditor: "datePicker",
    //     editable: !disabled,
    //     cellStyle: () => {
    //         if (!disabled) {
    //             return {
    //                 backgroundColor: "#DDEBF7",
    //                 border: "1px solid #E4E7EB"
    //             };
    //         }
    //         return {};
    //     },
    //     cellRenderer: (params) => {
    //         const { value } = params;
    //         if (value) return convertDate2String(new Date(value), CUSTOM_CONSTANTS.DDMMYYYY);
    //         return "";
    //     }
    // },
    // {
    //     headerName: i18next.t("G/L Account"),
    //     field: "glAccount",
    //     cellRenderer: "accountCellRenderer",
    //     cellEditor: "agRichSelectCellEditor",
    //     cellEditorParams: {
    //         values: glAccounts,
    //         cellRenderer: "accountCellRenderer"
    //     },
    //     editable: !disabled,
    //     cellStyle: () => {
    //         if (!disabled) {
    //             return {
    //                 backgroundColor: "#DDEBF7",
    //                 border: "1px solid #E4E7EB"
    //             };
    //         }
    //         return { };
    //     }
    // },
    {
        headerName: i18next.t("Note"),
        field: "note",
        minWidth: 400,
        cellEditor: "agLargeTextCellEditor",
        cellEditorParams: { maxLength: 400 },
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

export default getContractItemColDefs;
