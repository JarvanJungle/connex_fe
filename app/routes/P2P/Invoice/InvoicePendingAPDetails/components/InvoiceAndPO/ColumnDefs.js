import i18next from "i18next";
import { roundNumberWithUpAndDown, formatNumberForRow, formatDisplayDecimal } from "helper/utilities";
import { PURCHASE_ORDER_ROUTES } from "routes/P2P/PurchaseOrder";
import { formatStyleNumber } from "helper/utilities";

const RED_COLOR = "#FCC6C6";

export default (
    roundedNetPriceConfig, openEditDecimalModal, isThreeWay = true, editable, isEditGL, glAccounts, invoiceStatus, apSpecialist
) => {
    const columnGroups = {
        startCols: [
            {
                headerName: i18next.t("PO"),
                children: [
                    {
                        headerName: i18next.t("PONo"),
                        field: "poNumber",
                        width: 180,
                        cellRenderer: "linkRenderer",
                        cellRendererParams: (params) => ({
                            ...params,
                            endPoint: PURCHASE_ORDER_ROUTES.PO_DETAILS,
                            uuidField: "poUuid",
                            state: { data: params?.data }
                        })
                    }
                ]
            },
            {
                headerName: i18next.t("Invoice"),
                children: [
                    {
                        headerName: i18next.t("ItemName"),
                        width: 180,
                        field: "itemName"
                    }
                ]
            }
        ],
        endCols: [
            {
                children: [
                    {
                        headerName: i18next.t("TaxClaimable"),
                        field: "taxClaimable",
                        width: 140,
                        cellRenderer: "taxClaimable",
                        editable: false
                    }
                ]
            },
            {
                children: [
                    {
                        headerName: i18next.t("GLAccount"),
                        field: "glCode",
                        cellEditor: "agDropdownSelection",
                        valueFormatter: (params) => {
                            const { value } = params;
                            if (!glAccounts || glAccounts.length === 0) {
                                return value;
                            }
                            if (typeof value === "string" && glAccounts) {
                                const gl = glAccounts.find((item) => item.accountNumber === value);
                                return `${gl?.accountNumber} ${gl?.description}`;
                            }
                            if (typeof value === "object") {
                                return `${value.accountNumber ?? ""} ${value.description ?? ""}`;
                            }
                            return value;
                        },
                        cellEditorParams: {
                            values: glAccounts,
                            getOption: ({ accountNumber, description }) => ({ label: `${accountNumber ?? ""} ${description ? `(${description})` : ""}`, value: accountNumber })
                        },
                        editable: () => {
                            if (invoiceStatus === 'PENDING_APPROVAL' && apSpecialist) return false
                            return isEditGL
                        },
                        cellStyle: () => {
                            if (isEditGL) {
                                return {
                                    backgroundColor: "#DDEBF7",
                                    border: "1px solid #E4E7EB"
                                };
                            }
                            return {};
                        }
                    }
                ]
            },
            {
                children: [
                    {
                        headerName: i18next.t("Cost Code"),
                        field: "costCode",
                        cellEditor: "agDropdownSelection",
                        valueFormatter: (params) => {
                            const { value } = params;
                            if (!value) return "";
                            return typeof value === "object" ? value?.code : value;
                        },
                        cellEditorParams: (params) => {
                            const { glCode } = params.data;
                            let costs;
                            if (typeof glCode === "string") {
                                costs = glAccounts.find((item) => item.accountNumber === glCode)?.costCodeDtoList || [];
                            } else {
                                costs = params.data?.glCode?.costCodeDtoList || [];
                            }
                            return ({
                                values: costs,
                                getOption: ({ code }) => ({ label: code, value: code })
                            });
                        },
                        editable: () => {
                            if (invoiceStatus === 'PENDING_APPROVAL' && apSpecialist) return false
                            return isEditGL
                        },
                        cellStyle: () => {
                            if (isEditGL) {
                                return {
                                    backgroundColor: "#DDEBF7",
                                    border: "1px solid #E4E7EB"
                                };
                            }
                            return {};
                        }
                    }
                ]
            },
            {
                children: [
                    {
                        headerName: i18next.t("Department Code"),
                        field: "departmentCode",
                        cellEditor: "agDropdownSelection",
                        valueFormatter: (params) => {
                            const { value } = params;
                            if (!value) return "";
                            return typeof value === "object" ? value?.code : value;
                        },
                        cellEditorParams: (params) => {
                            const { glCode } = params.data;
                            let departments;
                            if (typeof glCode === "string") {
                                departments = glAccounts.find((item) => item.accountNumber === glCode)?.departmentCodeDtoList || [];
                            } else {
                                departments = params.data?.glCode?.departmentCodeDtoList || [];
                            }
                            return ({
                                values: departments,
                                getOption: ({ code }) => ({ label: code, value: code })
                            });
                        },
                        editable: () => {
                            if (invoiceStatus === 'PENDING_APPROVAL' && apSpecialist) return false
                            return isEditGL
                        },
                        cellStyle: () => {
                            if (isEditGL) {
                                return {
                                    backgroundColor: "#DDEBF7",
                                    border: "1px solid #E4E7EB"
                                };
                            }
                            return {};
                        }
                    }
                ]
            }
        ],
        grInformation: {
            headerName: i18next.t("GRInformation"),
            children: [
                {
                    headerName: i18next.t("QtyReceived"),
                    field: "grQtyReceived",
                    colId: "grQtyReceived",
                    width: 140,
                    // valueFormatter: formatNumberForRow,
                    cellStyle: formatStyleNumber
                },
                {
                    headerName: i18next.t("QtyRejected"),
                    field: "grQtyRejected",
                    width: 140,
                    // valueFormatter: formatNumberForRow,
                    cellStyle: formatStyleNumber
                }
            ]
        },
        poDetails: {
            headerName: i18next.t("PO"),
            children: [
                {
                    headerName: i18next.t("ItemCode"),
                    field: "itemCode",
                    width: 160
                },
                {
                    headerName: i18next.t("ItemDescription"),
                    field: "itemDescription",
                    width: 200,
                    tooltipComponent: "customTooltip",
                    tooltipField: "itemDescription",
                    tooltipComponentParams: {
                        fieldTooltip: "itemDescription",
                        isShow: true
                    }
                },
                {
                    headerName: i18next.t("Model"),
                    field: "model",
                    width: 140
                },
                {
                    headerName: i18next.t("Size"),
                    field: "size",
                    width: 140
                },
                {
                    headerName: i18next.t("Brand"),
                    field: "brand",
                    width: 140
                },
                {
                    headerName: i18next.t("UOM"),
                    field: "uom",
                    width: 140
                },
                {
                    headerName: i18next.t("Trade"),
                    field: "projectForecastTradeCode",
                    editable
                },
                {
                    headerName: i18next.t("Category"),
                    field: "itemCategory",
                    editable
                },
                {
                    headerName: i18next.t("Notes"),
                    field: "notes",
                    width: 200,
                    tooltipComponent: "customTooltip",
                    tooltipField: "notes",
                    tooltipComponentParams: {
                        fieldTooltip: "notes",
                        isShow: true
                    }
                },
                {
                    headerName: i18next.t("NetPrice"),
                    hide: !isThreeWay,
                    width: 140,
                    valueGetter: ({ getValue }) => (
                        roundNumberWithUpAndDown(getValue("poQty") * getValue("poUnitPrice"))
                    ),
                    valueFormatter: formatNumberForRow,
                    cellStyle: formatStyleNumber
                },
                {
                    headerName: i18next.t("TaxCode"),
                    field: "poTaxCode",
                    width: 140
                },
                {
                    headerName: i18next.t("TaxPercentage"),
                    field: "poTaxCodeValue",
                    width: 140,
                    valueFormatter: formatNumberForRow,
                    cellStyle: formatStyleNumber
                }
            ]
        },
        poDetailsPinned: {
            headerName: i18next.t("PO"),
            children: [
                {
                    headerName: i18next.t("ActualPOQty"),
                    field: "poQty",
                    colId: "poQty",
                    width: 140,
                    valueGetter: ({ data }) => data.poQty || 0,
                    // valueFormatter: formatNumberForRow,
                    cellStyle: formatStyleNumber
                },
                {
                    headerName: i18next.t("UnitPrice"),
                    field: "poUnitPrice",
                    width: 140,
                    colId: "poUnitPrice",
                    valueGetter: ({ data }) => data.poUnitPrice || 0,
                    // valueFormatter: formatNumberForRow,
                    cellStyle: ({ value, data }) => ({
                        textAlign: "right",
                        backgroundColor: value !== data?.invoiceUnitPrice && RED_COLOR
                    })
                },
                {
                    headerName: i18next.t("NetPrice"),
                    hide: isThreeWay,
                    width: 140,
                    valueGetter: ({ getValue }) => roundNumberWithUpAndDown(
                        getValue("poQty") * getValue("poUnitPrice")
                    ),
                    valueFormatter: formatNumberForRow,
                    cellStyle: formatStyleNumber
                }
            ]
        },
        pendingInvoice: {
            headerName: i18next.t("PendingInvoice"),
            children: [
                {
                    headerName: i18next.t("PendingInvoiceQty"),
                    colId: "pendingInvoiceQty",
                    width: 160,
                    field: "pendingInvoiceQty",
                    // valueGetter: ({ getValue }) => (
                    //     getValue("grQtyReceived") - getValue("invoicedQty") || 0
                    // ),
                    // valueFormatter: formatNumberForRow,
                    cellStyle: ({ value, data }) => ({
                        textAlign: "right",
                        backgroundColor: isThreeWay && value !== data?.invoiceQty && RED_COLOR
                    })
                },
                {
                    headerName: i18next.t("PendingInvoiceNetPrice"),
                    field: "pendingInvoiceNetPrice",
                    width: 160,
                    valueGetter: ({ getValue }) => (
                        roundNumberWithUpAndDown(
                            getValue("pendingInvoiceQty") * getValue("poUnitPrice") || 0
                        )
                    ),
                    valueFormatter: formatNumberForRow,
                    cellStyle: formatStyleNumber
                }
            ]
        },
        invoiceDetailsPinned: {
            headerName: i18next.t("Invoice"),
            children: [
                {
                    headerName: i18next.t("Qty"),
                    width: 140,
                    colId: "invoiceQty",
                    field: "invoiceQty",
                    valueGetter: ({ data }) => data.invoiceQty || 0,
                    // valueFormatter: formatNumberForRow,
                    cellStyle: ({ value, data }) => ({
                        textAlign: "right",
                        backgroundColor: value !== data?.pendingInvoiceQty
                            && RED_COLOR
                    })
                },
                {
                    headerName: i18next.t("UnitPrice"),
                    width: 140,
                    colId: "invoiceUnitPrice",
                    field: "invoiceUnitPrice",
                    valueGetter: ({ data }) => data.invoiceUnitPrice || 0,
                    // valueFormatter: formatNumberForRow,
                    cellStyle: ({ value, data }) => ({
                        textAlign: "right",
                        backgroundColor: value !== data?.poUnitPrice && RED_COLOR
                    })
                },
                {
                    headerName: i18next.t("NetPrice"),
                    width: 140,
                    colId: "invoiceNetPrice",
                    valueGetter: ({ getValue }) => (
                        roundNumberWithUpAndDown(getValue("invoiceQty") * getValue("invoiceUnitPrice"))
                    ),
                    valueFormatter: formatNumberForRow,
                    cellStyle: formatStyleNumber
                }
            ]
        },
        invoiceDetails: {
            headerName: i18next.t("Invoice"),
            children: [
                {
                    headerName: i18next.t("TaxCode"),
                    field: "invoiceTaxCode",
                    width: 140
                },
                {
                    headerName: i18next.t("TaxPercentage"),
                    field: "invoiceTaxCodeValue",
                    colId: "invoiceTax",
                    width: 140,
                    valueFormatter: formatNumberForRow,
                    cellStyle: formatStyleNumber
                },
                {
                    headerName: i18next.t("Net Price (W GST)"),
                    colId: "invoiceNetPriceWGST",
                    valueGetter: ({ getValue }) => (
                        roundNumberWithUpAndDown(
                            getValue("invoiceNetPrice") * (1 + getValue("invoiceTax") / 100) || 0
                        )
                    ),
                    width: 140,
                    valueFormatter: formatNumberForRow,
                    cellStyle: formatStyleNumber
                },
                {
                    headerName: i18next.t("Net Price (Rounded)"),
                    headerComponent: "customHeader",
                    width: 160,
                    headerComponentParams: {
                        enableCustomButton: true,
                        customButtonIcon: "pencil",
                        customButtonOnClick: openEditDecimalModal
                    },
                    valueGetter: ({ getValue }) => formatDisplayDecimal(roundNumberWithUpAndDown(
                        getValue("invoiceNetPriceWGST"),
                        roundedNetPriceConfig?.decimalPlaces,
                        roundedNetPriceConfig?.type
                    ), roundedNetPriceConfig?.decimalPlaces),
                    cellStyle: formatStyleNumber
                },
                {
                    headerName: i18next.t("InvoicedQty"),
                    headerComponent: "customHeader",
                    field: "invoiceCumulativeQty",
                    colId: "invoicedQty",
                    width: 140,
                    valueGetter: (params) => params?.data?.invoiceCumulativeQty || 0,
                    // valueFormatter: formatNumberForRow,
                    cellStyle: formatStyleNumber
                }
            ]
        }
    };
    return (isThreeWay
        ? [
            ...columnGroups.startCols,
            columnGroups.poDetailsPinned,
            columnGroups.pendingInvoice,
            columnGroups.invoiceDetailsPinned,
            columnGroups.invoiceDetails,
            columnGroups.grInformation,
            columnGroups.poDetails,
            ...columnGroups.endCols
        ]
        : [
            ...columnGroups.startCols,
            columnGroups.poDetailsPinned,
            columnGroups.invoiceDetailsPinned,
            columnGroups.invoiceDetails,
            columnGroups.pendingInvoice,
            columnGroups.grInformation,
            columnGroups.poDetails,
            ...columnGroups.endCols
        ]);
};
