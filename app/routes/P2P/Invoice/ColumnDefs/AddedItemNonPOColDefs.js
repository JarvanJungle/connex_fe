import i18next from "i18next";
import { formatNumber } from "../helper/utilities";

const properties = (disabled, isNumber = false) => ({
    editable: !disabled,
    cellStyle: () => {
        if (!disabled) {
            return {
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB",
                textAlign: isNumber ? "right" : "left"
            };
        }
        return {
            textAlign: isNumber ? "right" : "left"
        };
    }
});

const getAddedItemNonPOColDefs = (uoms, taxRecords, disabled) => [
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "actionDelete",
        hide: disabled,
        width: 100,
        filter: false,
        cellStyle: {
            display: "flex",
            alignItem: "center",
            justifyContent: "center"
        }
    },
    {
        headerName: i18next.t("ItemCode"),
        field: "itemCode",
        valueGetter: (params) => params.data?.itemCode?.slice(0, 20),
        ...properties(disabled)
    },
    {
        headerName: i18next.t("ItemName"),
        field: "itemName",
        valueGetter: (params) => params.data?.itemName?.slice(0, 200),
        ...properties(disabled)
    },
    {
        headerName: i18next.t("ItemDescription"),
        field: "itemDescription",
        tooltipField: "itemDescription",
        cellEditor: "agLargeTextCellEditor",
        tooltipComponentParams: {
            fieldTooltip: "itemDescription",
            isShow: disabled
        },
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Model"),
        field: "model",
        valueGetter: (params) => params.data?.model?.slice(0, 200),
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Size"),
        field: "size",
        valueGetter: (params) => params.data?.size?.slice(0, 200),
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Brand"),
        field: "brand",
        valueGetter: (params) => params.data?.brand?.slice(0, 200),
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Quantity"),
        field: "invoiceQty",
        ...properties(disabled, true),
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "invoiceUnitPrice",
        ...properties(disabled, true),
        // cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("TaxCode"),
        field: "invoiceTaxCode",
        ...properties(disabled),
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
        }
    },
    {
        headerName: i18next.t("TaxPercentage"),
        field: "invoiceTaxCodeValue",
        ...properties(true, true),
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("UOM"),
        field: "uom",
        ...properties(disabled),
        valueFormatter: (params) => {
            const { value } = params;
            if (value) {
                if (typeof value === "string") return value;
                return value.uomCode;
            }
            return value;
        },
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: uoms,
            getOption: ({ uomCode }) => ({ label: uomCode, value: uomCode })
        }
    },
    {
        headerName: i18next.t("NetPrice"),
        field: "invoiceNetPrice",
        ...properties(true, true),
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("Notes"),
        field: "notes",
        ...properties(disabled),
        cellEditor: "agLargeTextCellEditor",
        tooltipField: "notes",
        tooltipComponentParams: {
            fieldTooltip: "notes",
            isShow: disabled
        }
    }
];

export default getAddedItemNonPOColDefs;
