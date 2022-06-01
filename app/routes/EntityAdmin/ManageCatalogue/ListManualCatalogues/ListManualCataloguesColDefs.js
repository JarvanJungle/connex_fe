import i18next from "i18next";
import { formatDateTimeUpdated, formatDisplayDecimal } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";

const ListManualCataloguesColDefs = [
    {
        headerName: i18next.t("CatalogueItemCode"),
        field: "catalogueItemCode"
    },
    {
        headerName: i18next.t("CatalogueItemName"),
        field: "catalogueItemName",
        tooltipField: "catalogueItemName"
    },
    {
        headerName: i18next.t("CatalogueItemDescription"),
        field: "description",
        tooltipField: "description"
    },
    {
        headerName: i18next.t("CatalogueUOM"),
        field: "uomCode"
    },
    {
        headerName: i18next.t("Category"),
        field: "itemCategory"
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
        headerName: i18next.t("G/L Code"),
        field: "glAccountNumber"
    },
    {
        headerName: i18next.t("Trade Code"),
        field: "tradeCode"
    },
    {
        headerName: i18next.t("CatalogueCurrency"),
        field: "currencyCode"
    },
    {
        headerName: i18next.t("CatalogueUUP"),
        field: "unitPrice",
        cellStyle: () => ({
            textAlign: "right"
        }),
        valueFormatter: (param) => formatDisplayDecimal(param.value,
            CUSTOM_CONSTANTS.DEFAULT_PRECISION_NUMBER)
    },
    {
        headerName: i18next.t("CatalogueTaxCode"),
        field: "taxCode"
    },
    {
        headerName: i18next.t("CatalogueTaxPercentage"),
        field: "taxRate",
        cellStyle: () => ({
            textAlign: "right"
        }),
        valueFormatter: (param) => formatDisplayDecimal(param.value,
            CUSTOM_CONSTANTS.DEFAULT_PRECISION_NUMBER)
    },
    {
        headerName: i18next.t("Created On"),
        field: "createdOn",
        valueFormatter: (param) => formatDateTimeUpdated(
            param.value,
            CUSTOM_CONSTANTS.DDMMYYYHHmmss
        ),
        sort: "desc",
        sortIndex: 0
    }
];

export default ListManualCataloguesColDefs;
