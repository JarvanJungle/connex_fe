import i18next from "i18next";
import { formatDisplayDecimal } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const CatalogueItemColDefs = [
    {
        headerName: i18next.t("ItemCode"),
        field: "catalogueItemCode",
        headerComponent: "CheckboxHeader",
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: (params) => {
            const { data, context } = params;
            return !(data.isSelected || context?.selected?.some((e) => e?.itemCode === data.catalogueItemCode));
        },
        minWidth: 200
    },
    {
        headerName: i18next.t("ItemName"),
        field: "catalogueItemName"
    },
    {
        headerName: i18next.t("ItemDescription"),
        field: "description",
        tooltipField: "description",
        tooltipComponentParams: {
            fieldTooltip: "description",
            isShow: true
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
        headerName: i18next.t("UOMForecast"),
        field: "uomCode"
    },
    {
        headerName: i18next.t("Supplier"),
        field: "supplierName"
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode"
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "unitPrice",
        filter: "agNumberColumnFilter",
        // cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TaxPercentage"),
        field: "taxRate",
        cellRenderer: formatNumber,
        filter: "agNumberColumnFilter",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Category"),
        field: "itemCategory"
    },
    {
        headerName: i18next.t("GLAccount"),
        field: "glAccountNumber"
    },
    {
        headerName: i18next.t("CatalogueType"),
        field: "itemType",
        filter: false,
        cellRenderer: (params) => {
            const { data } = params;
            if (data) {
                if (data.supplierCode) return "Supplier catalogue";
                return "Generic";
            }
            return "";
        },
        valueGetter: (params) => {
            const { data } = params;
            if (data) {
                if (data.supplierCode) return "Supplier catalogue";
                return "Generic";
            }
            return "";
        }
    }
];

export default CatalogueItemColDefs;
