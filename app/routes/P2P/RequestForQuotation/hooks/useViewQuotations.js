import { useEffect, useState } from "react";
import i18next from "i18next";
import { v4 as uuidv4 } from "uuid";
import { convertDate2String, convertToLocalTime, roundNumberWithUpAndDown } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { formatNumber, formatStyleNumber } from "../helper";
import { ComparisonColDefs } from "../ColumnDefs";

const ForecastColDefs = [
    {
        headerName: i18next.t("ForecastDetails"),
        children: [
            {
                headerName: i18next.t("ForecastedQty"),
                field: "forecastedQty",
                cellRenderer: formatNumber,
                cellStyle: formatStyleNumber,
                width: 150,
                suppressSizeToFit: true,
                colSpan: (params) => {
                    if (params?.node?.rowPinned === "bottom") {
                        return 3;
                    }
                    return 1;
                }
            },
            {
                headerName: i18next.t("ForecastedUnitPrice"),
                field: "forecastedUnitPrice",
                cellRenderer: formatNumber,
                cellStyle: formatStyleNumber,
                width: 150,
                suppressSizeToFit: true
            },
            {
                headerName: i18next.t("ForecastedNetPrice"),
                field: "forecastedNetPrice",
                cellRenderer: formatNumber,
                cellStyle: formatStyleNumber,
                width: 180,
                suppressSizeToFit: true
            }
        ]
    }
];

const setSupplierQuotationColDefs = (supplierName, index, showAwardedQty, editable) => ({
    headerName: supplierName,
    children: [
        {
            headerName: "",
            field: `selected${index}`,
            headerComponent: "headerCheckbox",
            headerComponentParams: { editable },
            cellRenderer: "checkboxRenderer",
            cellStyle: () => {
                const styles = {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                };
                if (!editable) {
                    return {
                        ...styles,
                        "pointer-events": "none",
                        opacity: "0.6"
                    };
                }
                return {
                    ...styles,
                    "pointer-events": "unset",
                    opacity: "1"
                };
            },
            filter: false,
            minWidth: 100,
            maxWidth: 100,
            hide: !showAwardedQty
        },
        {
            headerName: i18next.t("AwardedQty"),
            field: `awardedQty${index}`,
            editable: (params) => params?.node?.rowPinned !== "bottom"
                && editable
                && params.data[`selected${index}`],
            cellStyle: (params) => {
                if (
                    params?.node?.rowPinned !== "bottom"
                    && editable
                    && params.data[`selected${index}`]
                ) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB",
                        textAlign: "right"
                    };
                }
                return {
                    textAlign: "right",
                    backgroundColor: "transparent",
                    border: "1px solid transparent"
                };
            },
            cellRenderer: ({
                value, data, node, column
            }) => {
                if (node.rowPinned === "bottom") {
                    const supplierIndex = column.colId.match(/\d/g);
                    const pinnedRowData = { ...data?.[`supplier${supplierIndex[0]}`] };
                    return roundNumberWithUpAndDown(pinnedRowData?.totalAwarded);
                }
                return value;
            },
            width: 160,
            suppressSizeToFit: true,
            hide: !showAwardedQty
        },
        {
            headerName: i18next.t("QuotedCurrency"),
            field: `quotedCurrency${index}`,
            suppressSizeToFit: true,
            cellRenderer: "totalRenderer",
            colSpan: (params) => {
                if (params?.node?.rowPinned === "bottom") {
                    return 5;
                }
                return 1;
            },
            width: 160,
            maxWidth: 180
        },
        {
            headerName: i18next.t("QuotedUnitPriceInSourceCurrency"),
            field: `quotedUnitPrice${index}`,
            cellStyle: formatStyleNumber,
            width: 140,
            suppressSizeToFit: true,
            maxWidth: 280
        },
        {
            headerName: i18next.t("ExchangeRate"),
            field: `exchangeRate${index}`,
            cellRenderer: formatNumber,
            cellStyle: formatStyleNumber,
            width: 140,
            suppressSizeToFit: true,
            maxWidth: 160
        },
        {
            headerName: i18next.t("UnitPriceInDocCurrency"),
            field: `unitPriceInDocCurrency${index}`,
            cellRenderer: ({ value }) => roundNumberWithUpAndDown(value),
            cellStyle: formatStyleNumber,
            width: 140,
            suppressSizeToFit: true,
            maxWidth: 240
        },
        {
            headerName: i18next.t("NetPriceInDocCurrencyBeforeTax"),
            field: `netPrice${index}`,
            cellRenderer: ({ value }) => roundNumberWithUpAndDown(value),
            cellStyle: formatStyleNumber,
            width: 140,
            suppressSizeToFit: true,
            maxWidth: 260
        },
        {
            headerName: i18next.t("TaxPercentage%"),
            field: `taxPercentage${index}`,
            cellRenderer: formatNumber,
            cellStyle: formatStyleNumber,
            width: 140,
            suppressSizeToFit: true,
            maxWidth: 180
        }
    ]
});

const useViewQuotations = ({ setDirtyFunc }) => {
    const [gridApi, setGridApi] = useState(null);
    const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);
    const [suppliersData, setSuppliersData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);

    const setNewColumnDefs = (supplierNames, isProject, showAwardedQty, editable) => {
        const supplierColDefs = supplierNames.map(
            (name, index) => setSupplierQuotationColDefs(name, index, showAwardedQty, editable)
        );
        const colDefs = [
            ...ComparisonColDefs,
            ...(isProject ? ForecastColDefs : []),
            ...supplierColDefs
        ];
        setColumnDefs(colDefs);
    };

    const getRowDataItems = () => {
        if (!gridApi) return [];
        const items = [];
        gridApi.forEachNode((node) => {
            if (node?.data) items.push(node.data);
        });
        return items;
    };

    useEffect(() => {
        if (gridApi) {
            gridApi.setPinnedBottomRowData(pinnedBottomRowData);
        }
    }, [pinnedBottomRowData]);

    const onCellValueChanged = (params) => {
        if (setDirtyFunc) setDirtyFunc();
        const {
            node, colDef, newValue, data, columnApi
        } = params;
        const { itemUnitPrice, itemQuantity } = data;
        const { field } = colDef;
        const colIds = columnApi.getAllColumns().map((col) => col.colId);
        if (field === "itemQuantity" && colIds.includes("netPrice")) {
            node.setDataValue("netPrice", roundNumberWithUpAndDown(Number(newValue) * Number(itemUnitPrice)));
        }
        if (field.includes("selected")) {
            const index = field.match(/\d/g);
            if (newValue === true) {
                node.setDataValue(`awardedQty${index}`, Number(itemQuantity));
            }
            if (newValue === false && Number(data[`awardedQty${index}`]) !== 0) {
                node.setDataValue(`awardedQty${index}`, 0);
            }
            gridApi.refreshHeader();
            gridApi.refreshCells({
                rowNodes: [node],
                columns: [`awardedQty${index}`],
                force: true
            });
        }
        if (field.includes("awardedQty")) {
            const index = field.match(/\d/g);
            if (Number(newValue) === 0) {
                node.setDataValue(`selected${index}`, false);
            }
            if (pinnedBottomRowData[0]) {
                const rowData = getRowDataItems();
                const totalAwarded = rowData.reduce((sum, item) => Number(sum) + Number(item[`awardedQty${index}`]), 0);
                const newPinnedBottomRowData = [{ ...pinnedBottomRowData[0] }];
                newPinnedBottomRowData[0][`supplier${index}`].totalAwarded = totalAwarded;
                setPinnedBottomRowData(newPinnedBottomRowData);
            }
            gridApi.refreshCells({
                rowNodes: [node],
                columns: [`selected${index}`, `awardedQty${index}`],
                force: true
            });
        }
    };

    const setDataSupplierTab = (quotedItems, rfqItems, navItemSuppliers) => {
        if (!quotedItems.length || !rfqItems.length || !navItemSuppliers.length) return;
        const listSupplierData = [];
        navItemSuppliers.forEach((supplierName) => {
            const quotedItemBySupplier = quotedItems.find(
                (item) => item.supplierCompanyName === supplierName
            );
            const rowDataItem = [];
            const { quoteItemDtoList } = quotedItemBySupplier;
            rfqItems?.forEach((data) => {
                const quoteItem = quoteItemDtoList?.find(
                    (item) => item.rfqItemId === data.id
                );
                const unitPrice = quoteItem ? quoteItem?.quotedUnitPrice : 0;
                const taxCode = (quoteItem ? quoteItem?.taxCode : "");
                const taxValue = Number(quoteItem ? quoteItem?.taxRate : 0);
                const quoteItemNote = (quoteItem ? quoteItem?.quoteItemNote : "");
                const quotedDate = (quoteItem ? quoteItem?.quotedDate : "");
                const exchangeRate = (quoteItem ? quoteItem?.exchangeRate : 1);
                const sourceCurrency = (quoteItem ? quoteItem?.currencyCode : 1);
                const itemRequest = {
                    uuid: uuidv4(),
                    id: data.id,
                    quotedItem: !!quoteItem,
                    itemCode: [data.itemCode || ""],
                    itemName: data.itemName || "",
                    itemDescription: data.itemDescription || "",
                    itemModel: data.itemModel || "",
                    itemSize: data.itemSize || "",
                    itemBrand: data.itemBrand || "",
                    uom: data.uom || "",
                    note: data.note,
                    quoteItemNote,
                    taxCode,
                    taxPercentage: taxValue,
                    address: data?.address?.addressLabel ?? "",
                    requestedDeliveryDate: convertDate2String(
                        data.requestedDeliveryDate,
                        CUSTOM_CONSTANTS.YYYYMMDD
                    ),
                    itemUnitPrice: unitPrice,
                    itemQuantity: Number(data.itemQuantity),
                    sourceCurrency,
                    exchangeRate,
                    quotedUnitPriceInDocCurrency: unitPrice * exchangeRate,
                    netPrice: Number(unitPrice || 0) * Number(quoteItem?.itemQuantity ?? 0) * exchangeRate,
                    quotedDate: convertToLocalTime(quotedDate),
                    quoteUuid: quotedItemBySupplier?.uuid
                };
                rowDataItem.push(itemRequest);
                if (quoteItem) {
                    const { quoteItemAuditTrailDtoList } = quoteItem;
                    if (quoteItemAuditTrailDtoList?.length === 0) {
                        rowDataItem.push({
                            uuid: uuidv4(),
                            id: data.rfqItemId,
                            itemCode: [data.itemCode || "", ""],
                            itemUnitPrice: Number(unitPrice),
                            netPrice: roundNumberWithUpAndDown(Number(unitPrice)
                                * Number(quoteItem?.itemQuantity) * exchangeRate),
                            taxCode: quoteItem?.taxCode || "",
                            taxPercentage: quoteItem?.taxRate || 0,
                            quoteItemNote: quoteItem?.quoteItemNote || "",
                            exchangeRate: quoteItem?.exchangeRate ?? exchangeRate,
                            quotedUnitPriceInDocCurrency: Number(unitPrice)
                                * Number(quoteItem?.exchangeRate ?? exchangeRate),
                            quotedDate: convertToLocalTime(
                                quoteItem?.quotedDate
                            )
                        });
                    } else {
                        quoteItemAuditTrailDtoList?.reverse();
                        quoteItemAuditTrailDtoList.forEach((item) => {
                            rowDataItem.push({
                                uuid: uuidv4(),
                                id: data.rfqItemId,
                                itemCode: [data.itemCode || "", uuidv4()],
                                itemUnitPrice: Number(item.quotedUnitPrice),
                                netPrice: roundNumberWithUpAndDown(Number(item.quotedUnitPrice)
                                    * Number(item?.itemQuantity) * exchangeRate),
                                taxCode: item?.taxCode || "",
                                taxPercentage: item?.taxRate || 0,
                                quoteItemNote: item?.quoteItemNote || "",
                                exchangeRate: item?.exchangeRate ?? exchangeRate,
                                quotedUnitPriceInDocCurrency: Number(item.quotedUnitPrice)
                                    * Number(item?.exchangeRate ?? exchangeRate),
                                quotedDate: convertToLocalTime(
                                    item?.quotedDate
                                )
                            });
                        });
                    }
                }
            });

            const newSubTotal = rowDataItem.reduce(
                (sum, item) => {
                    if (item?.itemCode?.length === 1) {
                        return sum + Number(item.quotedUnitPriceInDocCurrency || 0)
                            * Number(item.itemQuantity || 0);
                    }
                    return sum;
                },
                0
            );
            const newTax = rowDataItem.reduce(
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

            listSupplierData.push({
                rowData: rowDataItem,
                total: {
                    subTotal: newSubTotal,
                    total: newTotal,
                    tax: newTax
                }
            });
        });
        setSuppliersData(listSupplierData);
    };

    return [
        gridApi,
        columnDefs,
        suppliersData,
        pinnedBottomRowData,
        {
            setGridApi,
            setColumnDefs,
            getRowDataItems,
            onCellValueChanged,
            setSuppliersData,
            setNewColumnDefs,
            setDataSupplierTab,
            setPinnedBottomRowData
        }
    ];
};

export default useViewQuotations;
