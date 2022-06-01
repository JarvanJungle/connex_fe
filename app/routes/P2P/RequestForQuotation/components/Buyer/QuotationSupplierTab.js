import React, { useMemo } from "react";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import { AgGridTable } from "routes/components";
import {
    // ComparisonSupplierBeforeQuoteColDefs,
    getComparisonSupplierAfterQuoteColDefs
} from "../../ColumnDefs";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    sortable: true,
    tooltipComponent: "customTooltip"
};

const QuotationSupplierTab = React.memo(({
    t,
    gridHeight = 300,
    suppliersData,
    disabled,
    onChangeTotal,
    index
}) => {
    const suppliersTabData = useMemo(() => suppliersData, [suppliersData]);
    return (
        <AgGridTable
            columnDefs={
                getComparisonSupplierAfterQuoteColDefs(disabled)
            }
            rowData={suppliersTabData[index] ? suppliersTabData[index] : []}
            colDef={defaultColDef}
            pagination={false}
            paginationPageSize={10}
            treeData
            gridHeight={gridHeight}
            autoGroupColumnDef={{
                headerName: t("ItemCode"),
                cellRendererParams: {
                    suppressCount: true
                },
                width: 200,
                valueFormatter: (params) => {
                    const { data } = params;
                    if (data?.itemCode
                        .length === 1
                    ) {
                        return data?.itemCode[0];
                    }
                    return "";
                }
            }}
            animateRows
            groupDefaultExpanded={-1}
            getDataPath={(data) => data.itemCode}
            gridOptions={{
                getRowStyle: (params) => {
                    const { data } = params;
                    const { itemCode } = data;
                    if (itemCode?.length === 1) {
                        return { background: "#D2D8DE" };
                    }
                    return { background: "#fff" };
                },
                suppressScrollOnNewData: true
            }}
            frameworkComponents={{
                customTooltip: CustomTooltip
            }}
            singleClickEdit
            stopEditingWhenCellsLoseFocus
            onCellValueChanged={(params) => {
                const {
                    data, colDef, newValue, node
                } = params;
                const { field } = colDef;
                const { itemUnitPrice, itemQuantity } = data;
                if (field === "exchangeRate") {
                    node.setDataValue("quotedUnitPriceInDocCurrency", Number(newValue) * itemUnitPrice);
                    node.setDataValue("netPrice", Number(newValue) * itemUnitPrice * itemQuantity);
                    const newSuppliersData = [...suppliersTabData];
                    newSuppliersData[index]?.rowData?.forEach((item, idx) => {
                        if (item.itemCode.length === 1 && item.uuid === data.uuid) {
                            newSuppliersData[index].rowData[idx].exchangeRate = Number(newValue);
                            newSuppliersData[index].rowData[idx]
                                .quotedUnitPriceInDocCurrency = Number(newValue) * itemUnitPrice;
                            newSuppliersData[index].rowData[idx]
                                .netPrice = Number(newValue) * itemUnitPrice * itemQuantity;
                        }
                    });
                    const newSubTotal = newSuppliersData[index].reduce(
                        (sum, item) => {
                            if (item?.itemCode?.length === 1) {
                                return sum + Number(item.quotedUnitPriceInDocCurrency || 0)
                                    * Number(item.itemQuantity || 0);
                            }
                            return sum;
                        },
                        0
                    );
                    const newTax = newSuppliersData[index].reduce(
                        (sum, item) => {
                            if (item?.itemCode?.length === 1) {
                                return sum + (Number(item.quotedUnitPriceInDocCurrency || 0)
                                    * Number(item.itemQuantity || 0)
                                    * Number(item.taxPercentage || 0))
                                    / 100;
                            }
                            return sum;
                        },
                        0
                    );
                    const newTotal = newSubTotal + newTax;
                    onChangeTotal(
                        index,
                        {
                            subTotal: newSubTotal,
                            tax: newTax,
                            total: newTotal
                        },
                        newSuppliersData
                    );
                }
            }}
        />
    );
});

export default QuotationSupplierTab;
