import React, { useState, useEffect, useMemo } from "react";
import {
    Row,
    Col,
    Button
} from "components";
import { v4 as uuidv4 } from "uuid";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { formatDisplayDecimal, roundNumberWithUpAndDown } from "helper/utilities";
import {
    AddItemDialog
} from "routes/components";
import CatalogueService from "services/CatalogueService";
import UserService from "services/UserService";
import ItemContractList from "./ItemContractList";
import CatalogueItemColDefs from "./ConlumnDefs/CatalogueItemColDefs";
import classes from "./ContractItems.scss";

const ContractItems = (props) => {
    const {
        t,
        values,
        uoms,
        addresses,
        taxRecords,
        glAccounts,
        currencies,
        rowContractItems,
        setRowContractItems,
        catalogueItems,
        setCatalogueItems,
        setSubTotal,
        modeView,
        refreshSummaryItems,
        setDirty,
        forceCalculator
    } = props;

    const [showAddCatalogue, setShowAddCatalogue] = useState(false);
    const [itemCatalogueDeleted, setItemCatalogueDeleted] = useState("");
    const [selectedCatalogueItems, setSelectedCatalogueItems] = useState([]);
    const [summary, setSummary] = useState({
        subTotal: 0,
        tax: 0,
        total: 0
    });

    useEffect(() => {
        if (itemCatalogueDeleted) {
            const newCatalogueItems = [...catalogueItems];
            newCatalogueItems.forEach(
                (item, index) => {
                    // uncheck item that deleted  already
                    if (item.catalogueItemCode === itemCatalogueDeleted) {
                        newCatalogueItems[index].isSelected = false;
                    }
                }
            );
            setCatalogueItems(newCatalogueItems);
        }
    }, [itemCatalogueDeleted]);

    useEffect(() => {
        const catalogueItemsFilter = catalogueItems.map((catalogueItem) => {
            if (values.supplierUuid) {
                if (catalogueItem.supplierUuid
                    && catalogueItem.supplierUuid !== values.supplierUuid) {
                    catalogueItem.hidden = true;
                } else {
                    catalogueItem.hidden = false;
                }
            }
            return catalogueItem;
        });
        setCatalogueItems(catalogueItemsFilter);
        // const catalogueItemsFilter = catalogueItems.filter((x) => x.supplierUuid
        //     === values.supplierUuid || !x.supplierUuid);
        // setCatalogueItems(catalogueItemsFilter);
    }, [values.supplierUuid]);

    const calSummary = (newRows) => {
        const subTotal = newRows.reduce((a, b) => a + b.inDocumentCurrencyBeforeTax, 0);
        const tax = newRows.reduce((a, b) => a + b.inDocumentCurrencyTaxAmount, 0);
        const total = roundNumberWithUpAndDown(subTotal) + roundNumberWithUpAndDown(tax);
        setSubTotal(subTotal);
        setSummary({
            subTotal,
            tax,
            total
        });
    };

    useEffect(() => {
        if (refreshSummaryItems) {
            if (forceCalculator) {
                const newRowData = [...rowContractItems];
                newRowData.forEach((rowData, index) => {
                    newRowData[index].inSourceCurrencyBeforeTax = newRowData[index].itemQuantity
                        * newRowData[index].itemUnitPrice;
                    newRowData[index].inDocumentCurrencyBeforeTax = newRowData[index]
                        .inSourceCurrencyBeforeTax * newRowData[index].exchangeRate;
                    newRowData[index].inDocumentCurrencyTaxAmount = (newRowData[index].taxPercentage
                        * newRowData[index].inDocumentCurrencyBeforeTax) / 100;
                    newRowData[index].inDocumentCurrencyAfterTax = newRowData[index]
                        .inDocumentCurrencyBeforeTax
                        + newRowData[index].inDocumentCurrencyTaxAmount;
                });
                setRowContractItems(newRowData);
                calSummary(newRowData);
            } else {
                calSummary(rowContractItems);
            }
        }
    }, [refreshSummaryItems]);

    const onEditRowItems = (params) => {
        setDirty();
        const { data, colDef, newValue } = params;
        const { field } = colDef;
        const newRowData = [...rowContractItems];
        if (field === "taxCode") {
            rowContractItems.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].taxPercentage = newValue?.taxPercentage || newValue?.taxRate;
                    newRowData[index].inSourceCurrencyBeforeTax = data.itemQuantity
                        * data.itemUnitPrice;
                    newRowData[index].inDocumentCurrencyBeforeTax = newRowData[index]
                        .inSourceCurrencyBeforeTax * data.exchangeRate;
                    newRowData[index].inDocumentCurrencyTaxAmount = (newRowData[index].taxPercentage
                        * newRowData[index].inDocumentCurrencyBeforeTax) / 100;
                    newRowData[index].inDocumentCurrencyAfterTax = newRowData[index]
                        .inDocumentCurrencyBeforeTax
                        + newRowData[index].inDocumentCurrencyTaxAmount;
                }
            });
        } else if (field === "currency") {
            const { currency } = data;
            const { exchangeRate } = currency;

            rowContractItems.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].exchangeRate = exchangeRate;
                    newRowData[index].inSourceCurrencyBeforeTax = data.itemQuantity
                        * data.itemUnitPrice;
                    newRowData[index].inDocumentCurrencyBeforeTax = newRowData[index]
                        .inSourceCurrencyBeforeTax * data.exchangeRate;
                    newRowData[index].inDocumentCurrencyTaxAmount = (newRowData[index].taxPercentage
                        * newRowData[index].inDocumentCurrencyBeforeTax) / 100;
                    newRowData[index].inDocumentCurrencyAfterTax = newRowData[index]
                        .inDocumentCurrencyBeforeTax
                        + newRowData[index].inDocumentCurrencyTaxAmount;
                }
            });
        } else {
            rowContractItems.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].inSourceCurrencyBeforeTax = data.itemQuantity
                        * data.itemUnitPrice;
                    newRowData[index].inDocumentCurrencyBeforeTax = newRowData[index]
                        .inSourceCurrencyBeforeTax * data.exchangeRate;
                    newRowData[index].inDocumentCurrencyTaxAmount = (newRowData[index].taxPercentage
                        * newRowData[index].inDocumentCurrencyBeforeTax) / 100;
                    newRowData[index].inDocumentCurrencyAfterTax = newRowData[index]
                        .inDocumentCurrencyBeforeTax
                        + newRowData[index].inDocumentCurrencyTaxAmount;
                }
            });
        }
        // need this line to update for the table
        params.api.setRowData(newRowData);
        setRowContractItems(newRowData);
        calSummary(newRowData);
    };

    const onDeleteItem = (uuid, rowData, params) => {
        setDirty();
        const { data } = params;
        const newRows = rowData.filter((x) => x.uuid !== uuid);
        params.api.setRowData(newRows);

        // uncheck for catalogue
        setItemCatalogueDeleted(data.itemCode);
        setRowContractItems(newRows);
        calSummary(newRows);
    };

    const onAddNewItemCatalogue = () => {
        setDirty();
        // all of catalogueItems
        const newCatalogueItems = [...catalogueItems];
        // all of current rows
        const newRowData = [...rowContractItems];
        setShowAddCatalogue(false);

        selectedCatalogueItems.forEach((node) => {
            const { data } = node;
            // check item that picked up already
            // let address;
            // if (values.deliveryAddress) {
            //     address = addresses.find((item) => item.uuid === values.deliveryAddress);
            // }

            newCatalogueItems.forEach(
                (item, index) => {
                    if (item.catalogueItemCode === data.catalogueItemCode) {
                        newCatalogueItems[index].isSelected = true;
                    }
                }
            );

            const sourceCurrency = currencies.find(
                (item) => item.currencyCode.toLowerCase() === data.currencyCode.toLowerCase()
            );
            const { exchangeRate } = sourceCurrency;
            const itemRequest = {
                uuid: uuidv4(),
                itemCode: data.catalogueItemCode,
                itemName: data.catalogueItemName,
                itemDescription: data.description,
                itemModel: data.itemModel || "",
                itemSize: data.itemSize || "",
                itemBrand: data.itemBrand || "",
                trade: data.trade || "",
                uomCode: uoms.find(
                    (item) => item.uomCode.toLowerCase() === data.uomCode.toLowerCase()
                ),
                itemQuantity: data.itemQuantity || 0,
                currencyCode: data.currencyCode || "",
                itemUnitPrice: data.unitPrice,
                taxCode: taxRecords.find(
                    (item) => item.taxCode.toLowerCase() === data.taxCode?.toLowerCase()
                ),
                taxPercentage: data.taxRate || 0,
                inSourceCurrencyBeforeTax: "",
                exchangeRate,
                inDocumentCurrencyBeforeTax: 0,
                inDocumentCurrencyTaxAmount: 0,
                inDocumentCurrencyAfterTax: 0,
                // address: address || addresses[0],
                // requestedDeliveryDate: data.deliveryDate || new Date(),
                // glAccount: glAccounts.find(
                //     (item) => item.accountNumber === data.glAccountNumber
                // ),
                note: "",
                manualItem: false
            };
            newRowData.push(itemRequest);
        });
        setRowContractItems(newRowData);
        setCatalogueItems(newCatalogueItems);
        // setGRDetailsState((prevStates) => ({
        //     ...prevStates,
        //     rowDataItemsOrdered: newRowData,
        //     selectedCatalogueItems: [],
        //     catalogueItems: newCatalogueItems
        // }));
    };

    const addItemReqManual = () => {
        setDirty();
        const newRowData = [...rowContractItems];
        newRowData.push({
            uuid: uuidv4(),
            itemCode: "",
            itemName: "",
            itemDescription: "",
            itemModel: "",
            itemSize: "",
            itemBrand: "",
            trade: "",
            uomCode: "",
            itemQuantity: 0,
            currencyCode: "",
            itemUnitPrice: 0,
            taxCode: "",
            taxPercentage: 0,
            inSourceCurrencyBeforeTax: "",
            exchangeRate: 0,
            inDocumentCurrencyBeforeTax: 0,
            inDocumentCurrencyTaxAmount: 0,
            inDocumentCurrencyAfterTax: 0,
            // address: "",
            // requestedDeliveryDate: "",
            // glAccount: "",
            note: "",
            manualItem: true // add by manual way
        });
        setRowContractItems(newRowData);
    };

    const catalogueBEServerConfig = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (q) => CatalogueService
            .getCataloguesV2(UserService.getCurrentCompanyUuid(), {
                ...q,
                supplier: values.supplierUuid ? ["GENERIC", values.supplierUuid].join(",") : "GENERIC"
            }).then(({ data: { data } }) => data)
    }), [values.supplierUuid]);

    return (
        <>
            <Row className="mb-2 mx-0 justify-content-between">
                <HeaderSecondary
                    title={t("ContractItems")}
                />
                <div className="d-flex align-items-end">
                    <Button
                        color="primary"
                        onClick={() => addItemReqManual()}
                        className="mr-1"
                        disabled={!values.isEdit}
                    >
                        <span className="mr-1">+</span>
                        <span>{t("AddManual")}</span>
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => {
                            setShowAddCatalogue(true);
                        }}
                        className="mr-1"
                        disabled={!values.isEdit}
                    >
                        <span className="mr-1">+</span>
                        <span>{t("AddCatalogue")}</span>
                    </Button>
                </div>
            </Row>
            <Row className="mb-5">
                <Col xs={12}>
                    <ItemContractList
                        rowDataItem={rowContractItems}
                        onCellValueChanged={(params) => onEditRowItems(params)}
                        onDeleteItem={(uuid, rowData, params) => {
                            onDeleteItem(uuid, rowData, params);
                        }}
                        defaultExpanded
                        addresses={addresses}
                        disabled={!values.isEdit}
                        uoms={uoms}
                        note={values.note}
                        taxRecords={taxRecords}
                        glAccounts={glAccounts}
                        currencies={currencies}
                        modeView={modeView}
                    />
                </Col>
            </Row>
            <Row className="mx-0 justify-content-end mb-4 text-secondary" style={{ fontSize: "1rem" }}>
                <Col lg={12} md={12} className="d-flex justify-content-end">
                    <div className="d-flex flex-column">
                        <div className={`text-right ${classes["font-size-16"]}`}>{`${t("SubTotal")}:`}</div>
                        <div className={`text-right ${classes["font-size-16"]}`}>{`${t("Tax")}:`}</div>
                        <div className={`text-right ${classes["font-size-16"]}`}>{`${t("Total(include GST)")}:`}</div>
                    </div>
                    <div className="d-flex flex-column" style={{ width: "150px" }}>
                        <div className={`text-center ${classes["font-size-16"]}`}>{values.currency}</div>
                        <div className={`text-center ${classes["font-size-16"]}`}>{values.currency}</div>
                        <div className={`text-center ${classes["font-size-16"]}`}>{values.currency}</div>
                    </div>
                    <div className="d-flex flex-column">
                        <div className={`text-right ${classes["font-size-16"]}`}>{formatDisplayDecimal(summary.subTotal, 2) || "0.00"}</div>
                        <div className={`text-right ${classes["font-size-16"]}`}>{formatDisplayDecimal(summary.tax, 2) || "0.00"}</div>
                        <div className={`text-right ${classes["font-size-16"]}`}>{formatDisplayDecimal(summary.total, 2) || "0.00"}</div>
                    </div>
                </Col>
            </Row>

            {/* Add Catalogue Dialog */}
            <AddItemDialog
                isShow={showAddCatalogue}
                onHide={() => {
                    setShowAddCatalogue(false);
                }}
                title={t("AddCatalogue")}
                onPositiveAction={() => onAddNewItemCatalogue()}
                onNegativeAction={() => {
                    setShowAddCatalogue(false);
                }}
                columnDefs={CatalogueItemColDefs}
                rowDataItem={catalogueItems.filter((item) => !item.hidden)}
                onSelectionChanged={(params) => {
                    setSelectedCatalogueItems(params.api.getSelectedNodes());
                }}
                pageSize={10}
                selected={rowContractItems}
                backendPagination
                backendServerConfig={catalogueBEServerConfig}
            />
        </>
    );
};

export default ContractItems;
