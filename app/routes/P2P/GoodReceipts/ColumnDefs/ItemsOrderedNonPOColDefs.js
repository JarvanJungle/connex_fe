import i18next from "i18next";
import { formatDisplayDecimal } from "helper/utilities";

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

const getItemsOrderedNonDOColDefs = (addresses, uoms, disabled) => [
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "actionDelete",
        hide: disabled,
        width: 100,
        filter: false
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
        cellEditorParams: { maxLength: 250 },
        tooltipComponentParams: {
            fieldTooltip: "itemDescription",
            isShow: disabled
        },
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel",
        valueGetter: (params) => params.data?.itemModel?.slice(0, 200),
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize",
        valueGetter: (params) => params.data?.itemSize?.slice(0, 200),
        ...properties(disabled)
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand",
        valueGetter: (params) => params.data?.itemBrand?.slice(0, 200),
        ...properties(disabled)
    },
    {
        headerName: i18next.t("UOM"),
        field: "uomCode",
        ...properties(disabled),
        cellRenderer: ({ value }) => value?.uomName || value,
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: uoms,
            getOption: (value) => ({ label: value?.uomName, value: value?.uomCode })
        }
    },
    {
        headerName: i18next.t("DeliveryAddress"),
        field: "address",
        cellRenderer: ({ value }) => value?.addressLabel || value,
        cellEditor: "agDropdownSelection",
        cellEditorParams: {
            values: addresses,
            getOption: (value) => ({ label: value?.addressLabel, value: value?.uuid })
        },
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return { };
        }
    },
    {
        headerName: i18next.t("Quantity"),
        field: "quantity",
        editable: !disabled,
        cellStyle: () => {
            if (disabled) return { textAlign: "right" };
            return {
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB",
                textAlign: "right"
            };
        },
        cellRenderer: formatNumber
    },
    {
        headerName: i18next.t("CommentsOnDelivery"),
        field: "commentsOnDelivery",
        cellEditor: "agLargeTextCellEditor",
        cellEditorParams: { maxLength: 300 },
        editable: !disabled,
        cellStyle: () => {
            if (!disabled) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB"
                };
            }
            return { };
        },
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

export default getItemsOrderedNonDOColDefs;
