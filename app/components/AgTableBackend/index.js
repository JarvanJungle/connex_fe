import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { defaultColDef } from "helper/utilities";
import PropTypes from "prop-types";
import { CheckboxHeader } from "components/AgTableBackend/components";
import { v4 as uuidv4 } from "uuid";

/**
 * @typedef Server
 * @property {(function(request): Promise.<{totalRow: *, rows: *}>)} getData
 */

const FILTER_OPERATORS = {
    LIKE: ":",
    EQUALS: "=",
    GREATER: ">",
    LESS_THAN: "<",
    GREATER_OR_EQUAL: ">=",
    LESS_THAN_OR_EQUAL: "<="
};

/**
 * @typedef ServerConfig
 * @property {string} [pageField="page"]
 * @property {string} [pageSizeField="size"]
 * @property {string} [filterField="s"]
 * @property {string} [filterSeparator=","]
 * @property {string} [orderField="orderBy"]
 * @property {string} [totalField="totalRow"]
 * @property {string} [quickSearchField="q"]
 * @property {string} dataField
 * @property {(object) => Promise.<{}>} getDataFunc
 */

/**
 * @param {ServerConfig} config
 * @return {Server}
 * @constructor
 */
function Server(config) {
    const {
        pageField = "page",
        pageSizeField = "size",
        filterField = "s",
        filterSeparator = ",",
        orderField = "orderBy",
        totalField = "totalRow",
        quickSearchField = "q",
        quickFilterText = "",
        dataField,
        getDataFunc
    } = config;
    return {
        getData: async ({
            page, pageSize, filterModel
        }) => {
            const filter = Object.keys(filterModel).map((field) => `${field}${
                filterModel[field].filterType === "number"
                    ? FILTER_OPERATORS.EQUALS
                    : FILTER_OPERATORS.LIKE
            }${filterModel[field].filter}`);
            const data = await getDataFunc({
                [pageField]: page,
                [pageSizeField]: pageSize,
                [filterField]: filter.length ? filter.join(filterSeparator) : undefined,
                [quickSearchField]: quickFilterText,
                [orderField]: undefined // Not implemented yet
            });
            return {
                rows: data[dataField],
                totalRow: data[totalField]
            };
        }
    };
}

/**
 * @param {Server} server
 * @constructor
 */
function ServerSideDatasource(server) {
    return {
        getRows: async ({
            request, success, fail, api
        }) => {
            try {
                const { rows, totalRow } = await server.getData({
                    ...request,
                    page: api.paginationGetCurrentPage(),
                    pageSize: api.paginationGetPageSize()
                });
                success({
                    rowData: rows,
                    rowCount: totalRow
                });
            } catch (e) {
                fail(e);
            }
        }
    };
}

/**
 * @param {ServerConfig} backendServerConfig
 * @param {number} pageSize
 * @param quickFilterText
 * @param gridHeight
 * @param onGridReadyOverride
 * @param gridOptions
 * @return {JSX.Element}
 */
const AgGridTableBackend = ({
    backendServerConfig,
    pageSize: configPageSize,
    quickFilterText,
    gridHeight,
    onGridReady: onGridReadyOverride,
    frameworkComponents: customFrameworkComponents,
    getRowNodeId,
    ...gridOptions
}) => {
    const [gridApi, setGridApi] = useState();
    const [pageSize, setPageSize] = useState(10);
    useEffect(() => {
        if (gridApi) {
            gridApi.gridOptionsWrapper.setProperty("cacheBlockSize", pageSize);
            gridApi.paginationSetPageSize(pageSize);
            const updateData = () => {
                const dataSource = new ServerSideDatasource(new Server({
                    ...backendServerConfig,
                    quickFilterText
                }));
                gridApi.setServerSideDatasource(dataSource);
            };
            updateData();
        }
    }, [gridApi, backendServerConfig, quickFilterText, pageSize]);
    useEffect(() => {
        setPageSize(configPageSize || 10);
    }, [configPageSize]);
    const onGridReady = (params) => {
        onGridReadyOverride?.(params);
        const { api } = params;
        setGridApi(api);
    };

    return (
        <div style={{ position: "relative" }}>
            <div
                style={{ height: `${gridHeight}px` }}
            >
                <AgGridReact
                    {...gridOptions}
                    className="ag-theme-custom-react"
                    rowModelType="serverSide"
                    serverSideStoreType="partial"
                    paginationPageSize={pageSize}
                    cacheBlockSize={pageSize}
                    pagination
                    rowSelection="multiple"
                    rowMultiSelectWithClick
                    suppressRowClickSelection
                    animateRows
                    frameworkComponents={{
                        ...customFrameworkComponents,
                        CheckboxHeader
                    }}
                    onGridReady={onGridReady}
                    // eslint-disable-next-line no-unneeded-ternary
                    getRowNodeId={getRowNodeId}
                />
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0 }} className="ml-3 mb-2">
                <span className="mr-2">Page size:</span>
                <select
                    className="form-control d-inline m-0"
                    style={{ width: 100 }}
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                </select>
            </div>
        </div>
    );
};

AgGridTableBackend.propTypes = {
    ...AgGridReact.propTypes,
    pageSize: PropTypes.number,
    gridHeight: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    backendServerConfig: PropTypes.object.isRequired,
    getRowNodeId: PropTypes.func
};

AgGridTableBackend.defaultProps = {
    ...AgGridReact.defaultProps,
    pageSize: 10,
    gridHeight: 300,
    defaultColDef: {
        ...defaultColDef,
        floatingFilter: false
    },
    getRowNodeId: () => uuidv4()
};

export default AgGridTableBackend;
