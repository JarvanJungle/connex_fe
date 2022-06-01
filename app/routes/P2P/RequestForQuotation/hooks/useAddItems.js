import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { convertDate2String } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";

const useAddItems = ({ setDirtyFunc }) => {
    const [gridApi, setGridApi] = useState(null);
    const [uuidDeleted, setUuidDeleted] = useState(null);

    const addItemManual = (values, addresses, currencies) => {
        if (setDirtyFunc) setDirtyFunc();

        let address;
        if (values.deliveryAddress) {
            address = addresses.find((item) => item.uuid === values.deliveryAddress);
        }
        let sourceCurrency;
        if (values.currencyCode) {
            sourceCurrency = currencies.find((item) => item.currencyCode === values.currencyCode);
        }
        const newRowData = {
            uuid: uuidv4(),
            itemCode: "",
            itemName: "",
            itemDescription: "",
            itemModel: "",
            itemSize: "",
            itemBrand: "",
            supplierName: "",
            supplierUuid: "",
            sourceCurrency: sourceCurrency || "",
            uom: "",
            itemUnitPrice: 0,
            itemQuantity: 0,
            taxCode: "",
            taxRate: 0,
            exchangeRate: 1,
            address: address || addresses[0],
            requestedDeliveryDate: values.deliveryDate
                ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
            accountNumber: "",
            note: "",
            projectForecastTradeCode: "",
            manualItem: true,
            isManual: true
        };
        gridApi?.applyTransaction({ add: [newRowData] });
    };

    const onCellValueChanged = (params) => {
        const {
            node, colDef, newValue, data, columnApi
        } = params;
        const { itemUnitPrice } = data;
        const { field } = colDef;
        const colIds = columnApi.getAllColumns().map((col) => col.colId);
        if (field === "itemQuantity" && colIds.includes("netPrice")) {
            node.setDataValue("netPrice", Number(newValue) * Number(itemUnitPrice));
        }
    };

    const getRowDataItems = () => {
        if (!gridApi) return [];
        const items = [];
        gridApi.forEachNode((node) => {
            if (node?.data) items.push(node.data);
        });
        return items;
    };

    const deleteRowDataItem = (uuid) => {
        setUuidDeleted(uuid);
    };

    useEffect(() => {
        if (uuidDeleted) {
            const rowDataItems = getRowDataItems();
            const deletedRows = rowDataItems.filter((item) => item.uuid === uuidDeleted);
            gridApi?.applyTransaction({ remove: deletedRows });
        }
    }, [uuidDeleted]);

    return [
        gridApi,
        {
            setGridApi,
            addItemManual,
            getRowDataItems,
            deleteRowDataItem,
            onCellValueChanged
        }
    ];
};

export default useAddItems;
