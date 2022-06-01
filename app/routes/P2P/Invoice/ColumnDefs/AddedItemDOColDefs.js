import i18next from "i18next";
import { formatNumber, formatStyleNumber } from "../helper/utilities";

const getAddedItemDOColDefs = (
    disabled,
    taxRecords
) => [
    {
        headerName: i18next.t("DO"),
        children: [
            {
                headerName: i18next.t("DONo"),
                field: "doNumber",
                cellRenderer: "actionDelete",
                cellStyle: {
                    display: "flex",
                    alignItem: "center",
                    justifyContent: "center"
                }
            }
        ]
    },
    {
        headerName: i18next.t("PO"),
        children: [
            {
                headerName: i18next.t("PONo"),
                field: "poNumber",
                tooltipField: "poNumber",
                tooltipComponentParams: {
                    fieldTooltip: "poNumber",
                    isShow: true
                },
                cellRenderer: "poNumber"
            },
            {
                headerName: i18next.t("ItemName"),
                field: "itemName",
                editable: (params) => {
                    const { data } = params;
                    const { isManualItem } = data;
                    return isManualItem && !disabled;
                },
                cellStyle: (params) => {
                    const { data } = params;
                    const { isManualItem } = data;
                    if (isManualItem && !disabled) {
                        return {
                            backgroundColor: "#DDEBF7",
                            border: "1px solid #E4E7EB"
                        };
                    }
                    return {};
                }
            },
            {
                headerName: i18next.t("ActualPOQty"),
                field: "poQty",
                // cellRenderer: formatNumber,
                cellStyle: formatStyleNumber
            }
        ]
    },
    {
        headerName: i18next.t("DO"),
        children: [
            {
                headerName: i18next.t("QtyConverted"),
                field: "doQtyConverted",
                cellRenderer: formatNumber,
                cellStyle: formatStyleNumber
            }
        ]
    },
    {
        headerName: i18next.t("Invoice"),
        children: [
            {
                headerName: i18next.t("InvoicedQty"),
                field: "invoicedQty",
                cellRenderer: (params) => (params?.data?.invoicedQty || params?.data?.invoiceCumulativeQty || "0"),
                cellStyle: formatStyleNumber
            },
            {
                headerName: i18next.t("Qty"),
                field: "invoiceQty",
                // cellRenderer: formatNumber,
                // editable: (params) => {
                //     const { data } = params;
                //     return !disabled && data.isManualItem;
                // },
                // cellStyle: (params) => {
                //     const { data } = params;
                //     if (!disabled && data.isManualItem) {
                //         return {
                //             backgroundColor: "#DDEBF7",
                //             border: "1px solid #E4E7EB",
                //             textAlign: "right"
                //         };
                //     }
                //     return {
                //         textAlign: "right"
                //     };
                // }
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
                headerName: i18next.t("UnitPrice"),
                field: "invoiceUnitPrice",
                // cellRenderer: formatNumber,
                editable: !disabled,
                cellStyle: (params) => {
                    const { value, data } = params;
                    const redBackground = (data.isEditInvUnitPrice || disabled)
                        && (value !== data.poUnitPrice) && !data.isManualItem;
                    return {
                        backgroundColor: redBackground ? "#FCC6C6" : "#DDEBF7",
                        border: "1px solid #E4E7EB",
                        textAlign: "right"
                    };
                }
            },
            {
                headerName: i18next.t("Price Type"),
                field: "priceType"
            },
            {
                headerName: i18next.t("NetPrice"),
                field: "invoiceNetPrice",
                cellRenderer: formatNumber,
                cellStyle: formatStyleNumber
            },
            {
                headerName: i18next.t("TaxCode"),
                field: "invoiceTaxCode",
                valueFormatter: (params) => {
                    const { value } = params;
                    if (value) {
                        if (typeof value === "string") return value;
                        return value.taxCode;
                    }
                    return value;
                },
                cellEditor: "agDropdownSelection",
                cellEditorParams: {
                    values: taxRecords,
                    getOption: ({ taxCode }) => ({ label: taxCode, value: taxCode })
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
                },
                width: 140
            },
            {
                headerName: i18next.t("TaxPercentage"),
                field: "invoiceTaxCodeValue",
                cellRenderer: formatNumber,
                cellStyle: formatStyleNumber,
                width: 140
            }
        ]
    },
    {
        headerName: i18next.t("DO"),
        children: [
            {
                headerName: i18next.t("QtyReceived"),
                field: "grQtyReceived",
                // cellRenderer: formatNumber,
                cellStyle: formatStyleNumber
            },
            {
                headerName: i18next.t("QtyRejected"),
                field: "grQtyRejected",
                // cellRenderer: formatNumber,
                cellStyle: formatStyleNumber
            }
        ]
    },
    {
        headerName: i18next.t("PO"),
        children: [
            {
                headerName: i18next.t("ItemCode"),
                field: "itemCode"
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
                field: "model"
            },
            {
                headerName: i18next.t("Size"),
                field: "size"
            },
            {
                headerName: i18next.t("Brand"),
                field: "brand"
            },
            {
                headerName: i18next.t("UOM"),
                field: "uom",
                valueFormatter: (params) => {
                    const { value } = params;
                    if (value) {
                        if (typeof value === "string") return value;
                        return value.uomCode;
                    }
                    return value;
                },
                width: 120
            },
            {
                headerName: i18next.t("Notes"),
                field: "notes",
                tooltipField: "notes",
                tooltipComponentParams: {
                    fieldTooltip: "notes",
                    isShow: disabled
                }
            },
            {
                headerName: i18next.t("UnitPrice"),
                field: "poUnitPrice",
                // cellRenderer: formatNumber,
                cellStyle: (params) => {
                    const { value, data } = params;
                    const redBackground = (data.isEditInvUnitPrice || disabled)
                        && (value !== data.invoiceUnitPrice) && !data.isManualItem;
                    return {
                        backgroundColor: redBackground ? "#FCC6C6" : "#DDEBF7",
                        border: "1px solid #E4E7EB",
                        textAlign: "right"
                    };
                },
                width: 150
            },
            {
                headerName: i18next.t("NetPrice"),
                field: "poNetPrice",
                cellRenderer: formatNumber,
                cellStyle: formatStyleNumber,
                width: 150
            },
            {
                headerName: i18next.t("TaxCode"),
                field: "poTaxCode",
                valueFormatter: (params) => {
                    const { value } = params;
                    if (value) {
                        if (typeof value === "string") return value;
                        return value.taxCode;
                    }
                    return value;
                },
                width: 120
            },
            {
                headerName: i18next.t("TaxPercentage"),
                field: "poTaxCodeValue",
                cellRenderer: formatNumber,
                cellStyle: formatStyleNumber,
                width: 140
            }
        ]
    }
];

export default getAddedItemDOColDefs;
