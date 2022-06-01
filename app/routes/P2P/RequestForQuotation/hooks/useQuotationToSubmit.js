import { useState } from "react";

const useAddItems = ({ setDirtyFunc }) => {
    const [gridApi, setGridApi] = useState(null);
    const [colApi, setColApi] = useState(null);
    const [subTotal, setSubTotal] = useState(0);
    const [total, setTotal] = useState(0);
    const [tax, setTax] = useState(0);

    const setColumnApi = (api) => {
        setColApi(api);
    };

    const getRowDataItems = () => {
        if (!gridApi) return [];
        const items = [];
        gridApi.forEachNode((node) => {
            if (node?.data) items.push(node.data);
        });
        return items;
    };

    const getTotal = () => {
        const rowDataItems = getRowDataItems();
        const newSubTotal = rowDataItems.reduce(
            (sum, item) => {
                if (item?.itemCode?.length === 1) {
                    return sum + Number(item.itemUnitPrice || 0) * Number(item.itemQuantity || 0);
                }
                return sum;
            },
            0
        );
        const newTax = rowDataItems.reduce(
            (sum, item) => {
                if (item?.itemCode?.length === 1) {
                    return sum + (Number(item.itemUnitPrice || 0)
                        * Number(item.itemQuantity || 0)
                        * Number(item.taxPercentage || 0))
                        / 100;
                }
                return sum;
            },
            0
        );
        const newTotal = newSubTotal + newTax;
        setSubTotal(newSubTotal);
        setTotal(newTotal);
        setTax(newTax);
    };

    const cellEditingStopped = () => {
        getTotal();
    };

    const onCellValueChanged = (params) => {
        if (setDirtyFunc) setDirtyFunc();
        const {
            node, colDef, newValue, data, columnApi
        } = params;
        const { itemUnitPrice } = data;
        const { field } = colDef;
        const colIds = columnApi.getAllColumns().map((col) => col.colId);
        if (field === "itemUnitPrice" && colIds.includes("netPrice")) {
            node.setDataValue("netPrice", Number(newValue) * Number(itemUnitPrice));
        }
        if (field === "taxCode") {
            const { taxRate } = newValue;
            node.setDataValue("taxPercentage", taxRate ?? 0);
        }
        if (field === "available") {
            gridApi.redrawRows({ rowNodes: [node] });
            if (newValue === false) {
                node.setDataValue("itemUnitPrice", 0);
            }
        }
        getTotal();
    };

    return [
        gridApi,
        colApi,
        subTotal,
        total,
        tax,
        {
            setGridApi,
            getRowDataItems,
            onCellValueChanged,
            cellEditingStopped,
            setColumnApi
        }
    ];
};

export default useAddItems;
