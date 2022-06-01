import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import {
    formatDateString, formatDateTime, formatDisplayDecimal
} from "helper/utilities";
import AgGridTableBackend from "components/AgTableBackend";
import CatalogueService from "services/CatalogueService";
import CATALOGUES_ROUTE from "../route";
import classes from "./ListCatalogues.scss";

export const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    sortable: false
};

const CatalogueTable = (props) => {
    const {
        onGridReady, selectCell, onSelectionChanged, write, companyUuid, lastFetch
    } = props;
    const { t } = useTranslation();
    const history = useHistory();

    const onRowDoubleClick = (event) => {
        history.push(`${CATALOGUES_ROUTE.MANAGE_CATALOGUES_DETAILS}?uuid=${event.data.uuid}`);
    };

    const columnDefs = (isWrite) => [
        {
            headerName: t("CatalogueItemCode"),
            field: "catalogueItemCode",
            headerComponent: isWrite && "CheckboxHeader",
            headerCheckboxSelection: isWrite,
            headerCheckboxSelectionFilteredOnly: isWrite,
            checkboxSelection: isWrite
        },
        {
            headerName: t("CatalogueItemName"),
            field: "catalogueItemName"
        },
        {
            headerName: t("CatalogueItemDescription"),
            field: "description"
        },
        {
            headerName: t("CatalogueSupplier"),
            field: "supplierName"
        },
        {
            headerName: t("CatalogueUOM"),
            field: "uomCode",
            width: 120
        },
        {
            headerName: t("Category"),
            field: "itemCategory"
        },
        {
            headerName: t("Model"),
            field: "itemModel",
            width: 120
        },
        {
            headerName: t("Size"),
            field: "itemSize",
            width: 120
        },
        {
            headerName: t("Brand"),
            field: "itemBrand",
            width: 120
        },
        {
            headerName: t("Contracted"),
            field: "contracted",
            valueGetter: ({ data }) => (data.contracted ? "Yes" : "No"),
            width: 120
        },
        {
            headerName: t("ContractReferenceNo"),
            field: "contractedRefNo",
            width: 180
        },
        {
            headerName: t("ContractedQuantity"),
            field: "contractedQty",
            cellStyle: { textAlign: "right" },
            valueGetter: ({ data }) => (data.contractedQty || ""),
            width: 170
        },
        {
            headerName: t("Project"),
            field: "projectCodes",
            width: 180
        },
        {
            headerName: t("G/L Code"),
            field: "glAccountNumber",
            width: 140
        },
        {
            headerName: t("CatalogueCurrency"),
            field: "currencyCode",
            width: 140
        },
        {
            headerName: t("ContractedUnitPrice"),
            field: "contractedPrice",
            cellStyle: { textAlign: "right" },
            valueGetter: ({ data }) => (data.contractedPrice || ""),
            width: 180
        },
        {
            headerName: t("CatalogueUUP"),
            field: "unitPrice",
            cellStyle: { textAlign: "right" },
            valueFormatter: (param) => param.value,
            width: 180
        },
        {
            headerName: t("CatalogueValidFrom"),
            field: "validFrom",
            valueFormatter: (param) => formatDateTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY),
            width: 160
        },
        {
            headerName: t("CatalogueValidTo"),
            field: "validTo",
            valueFormatter: (param) => formatDateTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY),
            width: 160
        },
        {
            headerName: t("CatalogueTaxCode"),
            field: "taxCode",
            width: 160
        },
        {
            headerName: t("CatalogueTaxPercentage"),
            field: "taxRate",
            cellStyle: { textAlign: "right" },
            valueFormatter: (param) => formatDisplayDecimal(param.value,
                CUSTOM_CONSTANTS.DEFAULT_PRECISION_NUMBER),
            width: 160
        },
        {
            headerName: t("CatalogueIsActive"),
            field: "isActive",
            valueGetter: ({ data }) => (data?.active || data?.isActive ? "Yes" : "No"),
            sort: "asc",
            width: 160
        },
        {
            headerName: t("CatalogueUpdatedOn"),
            field: "updatedOn",
            valueGetter:
            (params) => (params.data.updatedOn ? params.data.updatedOn : params.data.createdOn),
            valueFormatter: (param) => formatDateString(
                param.value,
                CUSTOM_CONSTANTS.DDMMYYYHHmmss
            ),
            sort: "desc",
            sortIndex: 0
        },
        {
            field: "createdOn",
            sort: "desc",
            sortIndex: 1,
            valueFormatter: (param) => formatDateString(
                param.value,
                CUSTOM_CONSTANTS.DDMMYYYHHmmss
            ),
            hide: true
        },
        {
            headerName: t("Action"),
            field: "action",
            cellRenderer: "actionButton",
            resizable: true,
            filter: false,
            hide: !isWrite,
            width: 140
        }
    ];

    const ActionButton = (btnProps) => {
        const { data } = btnProps;
        return (
            <>
                {
                    data?.active || data?.isActive ? (
                        <span className={classes.activeButton}>
                            <i className="fa fa-close" />
                            {` ${t("Deactivate")}`}
                        </span>
                    ) : (
                        <span className={classes.deactiveButton}>
                            <i className="fa fa-plus" />
                            {` ${t("Activate")}`}
                        </span>
                    )
                }
            </>
        );
    };
    const catalogueBEServerConfig = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (query) => CatalogueService
            .getCataloguesV2Manage(companyUuid, query).then(({ data: { data } }) => data),
        lastFetch
    }), [companyUuid, lastFetch]);

    return (
        <div
            className="ag-theme-custom-react"
            style={{ height: "500px" }}
        >
            <AgGridTableBackend
                frameworkComponents={{
                    actionButton: ActionButton
                }}
                columnDefs={columnDefs(write)}
                defaultColDef={defaultColDef}
                pagination
                paginationPageSize={10}
                onGridReady={onGridReady}
                rowSelection="multiple"
                rowMultiSelectWithClick
                onRowDoubleClicked={onRowDoubleClick}
                onCellClicked={selectCell}
                suppressRowClickSelection
                onSelectionChanged={onSelectionChanged}
                gridHeight={580}
                backendServerConfig={catalogueBEServerConfig}
                pageSize={10}
            />
        </div>
    );
};

CatalogueTable.propTypes = {
    onGridReady: PropTypes.func.isRequired,
    selectCell: PropTypes.func.isRequired,
    onSelectionChanged: PropTypes.func.isRequired
};

export default CatalogueTable;
