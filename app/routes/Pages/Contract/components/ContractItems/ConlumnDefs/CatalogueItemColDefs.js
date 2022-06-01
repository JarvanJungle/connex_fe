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
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: (params) => {
            const { data, context } = params;
            return !(
                data.isSelected
                || context?.selected?.some((e) => e?.itemCode === data.catalogueItemCode)
            );
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
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TaxPercentage"),
        field: "taxRate",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Category"),
        field: "itemCategory"
    },
    {
        headerName: i18next.t("CatalogueType"),
        field: "supplierUuid",
        getQuickFilterText: (params) => {
            const { data } = params;
            if (data) {
                if (data.supplierUuid) return "Supplier catalogue";
                return "Generic";
            }
            return "";
        },
        cellRenderer: (params) => {
            const { data } = params;
            if (data) {
                if (data.supplierUuid) return "Supplier catalogue";
                return "Generic";
            }
            return "";
        },
        filterParams: {
            valueGetter: (params) => {
                return params.data.supplierUuid ? "Supplier catalogue" : "Generic";
            },
            textCustomComparator: (filter, value, filterText) => {
                const filterTextLowerCase = filterText.toLowerCase();
                const valueLowerCase = value.toLowerCase();
                switch (filter) {
                    case 'contains':
                        return valueLowerCase.indexOf(filterTextLowerCase) >= 0;
                    case 'notContains':
                        return valueLowerCase.indexOf(filterTextLowerCase) === -1;
                    case 'equals':
                        return valueLowerCase === filterTextLowerCase;
                    case 'notEqual':
                        return valueLowerCase != filterTextLowerCase;
                    case 'startsWith':
                        return valueLowerCase.indexOf(filterTextLowerCase) === 0;
                    case 'endsWith':
                        var index = valueLowerCase.lastIndexOf(filterTextLowerCase);
                        return index >= 0 && index === (valueLowerCase.length - filterTextLowerCase.length);
                    default:
                        // should never happen
                        console.warn('invalid filter type ' + filter);
                        return false;
                }
            }
        }
    }
];

export default CatalogueItemColDefs;
