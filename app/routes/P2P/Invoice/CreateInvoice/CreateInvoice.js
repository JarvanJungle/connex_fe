import {
    Button, Col, Container, Row
} from "components";
import { Formik, Form } from "formik";
import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS } from "helper/constantsDefined";
import {
    clearNumber,
    convertDate2String, convertToLocalTime,
    formatDateString,
    formatDisplayDecimal,
    getCurrentCompanyUUIDByStore, itemAttachmentSchema, minusToPrecise, roundNumberWithUpAndDown
} from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { Conversation, AuditTrail } from "routes/components";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import { useHistory, useLocation } from "react-router";
import EntitiesService from "services/EntitiesService";
import ExtVendorService from "services/ExtVendorService";
import UOMDataService from "services/UOMService";
import TaxRecordDataService from "services/TaxRecordService";
import InvoiceService from "services/InvoiceService/InvoiceService";
import { v4 as uuidv4 } from "uuid";
import queryString from "query-string";
import { HeaderMain } from "routes/components/HeaderMain";
import ConversationService from "services/ConversationService/ConversationService";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import CurrenciesService from "services/CurrenciesService";
import DocumentPrefixService from "services/DocumentPrefixService/DocumentPrefixService";
import INVOICE_ROUTES from "../route";
import {
    GeneralInformation,
    InitialSettings,
    InvoiceDetailsComponent,
    SupplierInformation,
    AddedItem,
    AddedItemNonPO,
    Badge
} from "../components";
import {
    INVOICE_CONSTANTS,
    addItemManualTypeNonPO,
    onDeleteItemNonPO,
    onCellValueChangedItemNonPO,
    onCellValueChangedItemPO,
    onCellValueChangedItemDO,
    addItemManual,
    getTotalInvoiceAmount,
    getBalanceWithExceptedValue,
    getBalance,
    validationFormCreateInvSchema,
    onDeleteItem,
    checkObjectExistInArrayPO,
    checkObjectExistInArrayDO,
    oneManualItemSchema,
    manyManualItemsSchema,
    oneSelectedItemSchema,
    manySelectedItemsSchema,
    oneNonPOItemSchema
} from "../helper";

import InvoicePreviewModal from "../components/InvoicePreviewModal/InvoicePreviewModal";
import SummaryInvoiceTable from "../components/SummaryInvoiceTable";
import OfficialProgressiveClaimService from "../../../../services/OfficialProgressiveClaimService/OfficialProgressiveClaimService";

const CreateInvoice = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { isBuyer } = permissionReducer;
    const showToast = useToast();
    const requestFormRef = useRef(null);
    const flag = useRef(false);
    const location = useLocation();

    const [selectedBuyerOrSupplier, setSelectedBuyerOrSupplier] = useState(null);

    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

    const [invState, setInvState] = useState({
        loading: false,
        companyUuid: "",
        activeInternalTab: 1,
        activeExternalTab: 1,
        activeAuditTrailTab: 1,
        rowDataExternalConversation: [],
        rowDataInternalConversation: [],
        internalConversationLines: [],
        externalConversationLines: [],
        externalConversationLinesDO: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataAuditTrail: [],
        rowDataOverview: [],
        rowDataItems: [],
        enablePrefix: false
    });
    const [gridApiSelectPO, setGridApiSelectPO] = useState(null);
    const [gridApiSelectDO, setGridApiSelectDO] = useState(null);
    const [uoms, setUOMs] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [taxRecords, setTaxRecords] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [listItemSelect, setListItemSelect] = useState([]);
    const [rowDataItemsTypeNonPO, setRowDataItemsTypeNonPO] = useState([]);
    const [rowDataItemsTypePO, setRowDataItemsTypePO] = useState([]);
    const [rowDataItemsTypeDO, setRowDataItemsTypeDO] = useState([]);
    const [invoiceTypes, setInvoiceTypes] = useState([]);
    const [isOPC, setIsOPC] = useState(false);
    const [isProjectOPC, setIsProjectOPC] = useState(false);
    const [paramsUrl, setParamsUrl] = useState();
    const [opcDetail, setOpcDetail] = useState({});
    const [defaultTax, setDefaultTax] = useState(null);
    const [invoiceAmountNonPO, setInvoiceAmountNonPO] = useState({
        subTotal: 0,
        tax: 0,
        total: 0
    });
    const [invoiceAmountPO, setInvoiceAmountPO] = useState({
        subTotal: 0,
        tax: 0,
        total: 0
    });
    const [amountToInvoicePO, setAmountToInvoicePO] = useState({
        subTotal: 0,
        tax: 0,
        total: 0
    });
    const [invoiceAmountDO, setInvoiceAmountDO] = useState({
        subTotal: 0,
        tax: 0,
        total: 0
    });
    const [amountToInvoiceDO, setAmountToInvoiceDO] = useState({
        subTotal: 0,
        tax: 0,
        total: 0
    });
    const summaryInvoiceRef = useRef();
    const [initialValues] = useState(() => ({
        invoiceType: "",
        currencyCode: "",
        currency: "",
        invoiceNo: "",
        supplierCode: "",
        supplierUuid: "",
        supplierCompanyUuid: "",
        companyName: "",
        addressLabel: "",
        addressFirstLine: "",
        addressSecondLine: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        paymentTerms: "",
        ptDays: 0,
        invoiceDate: convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
        invoiceDueDate: "",
        totalAmount: 0,
        expectedAmount: 0,
        expectedAmountGiven: false,
        project: false,
        projectTitle: "",
        enablePrefix: false,
        reissuedInvoiceUuid: null
    }));

    useEffect(() => {
        if (location.values && invState.companyUuid && typeof isBuyer === "boolean") {
            requestFormRef.current.setFieldValue("invoiceType", location.values.invoiceType);
            requestFormRef.current.setFieldValue("currencyCode", location.values.currencyCode);
            requestFormRef.current.setFieldValue("currency", location.values.currency);
            requestFormRef.current.setFieldValue("invoiceNo", location.values.invoiceNo);
            requestFormRef.current.setFieldValue("supplierCode", location.values.supplierCode);
            requestFormRef.current.setFieldValue("supplierUuid", location.values.supplierUuid);
            requestFormRef.current.setFieldValue("buyerCompanyUuid", location.values.buyerCompanyUuid);
            requestFormRef.current.setFieldValue("supplierCompanyUuid", location.values.supplierCompanyUuid);
            requestFormRef.current.setFieldValue("companyName", location.values.companyName);
            requestFormRef.current.setFieldValue("addressLabel", location.values.addressLabel);
            requestFormRef.current.setFieldValue("addressFirstLine", location.values.addressFirstLine);
            requestFormRef.current.setFieldValue("addressSecondLine", location.values.addressSecondLine);
            requestFormRef.current.setFieldValue("city", location.values.city);
            requestFormRef.current.setFieldValue("state", location.values.state);
            requestFormRef.current.setFieldValue("country", location.values.country);
            requestFormRef.current.setFieldValue("postalCode", location.values.postalCode);
            requestFormRef.current.setFieldValue("paymentTerms", location.values.paymentTerms);
            requestFormRef.current.setFieldValue("ptDays", location.values.ptDays);
            requestFormRef.current.setFieldValue("invoiceDate", location.values.invoiceDate);
            requestFormRef.current.setFieldValue("invoiceDueDate", location.values.invoiceDueDate);
            requestFormRef.current.setFieldValue("totalAmount", location.values.totalAmount);
            requestFormRef.current.setFieldValue("expectedAmount", location.values.expectedAmount);
            requestFormRef.current.setFieldValue("expectedAmountGiven", location.values.expectedAmountGiven);
            requestFormRef.current.setFieldValue("project", location.values.project);
            requestFormRef.current.setFieldValue("projectTitle", location.values.projectTitle);
            requestFormRef.current.setFieldValue("enablePrefix", location.values.enablePrefix);
            requestFormRef.current.setFieldValue("reissuedInvoiceUuid", location.values.invoiceUuid);
            if (isBuyer) {
                ExtVendorService.getExternalVendorDetails(invState.companyUuid, location.values.supplierUuid).then((response) => {
                    const { data } = response && response.data;
                    const taxDefault = {
                        taxCode: data?.tax?.taxCode ?? "",
                        taxRate: data?.tax?.taxRate ?? null,
                        uuid: data?.tax?.uuid ?? ""
                    };
                    setDefaultTax(taxDefault);
                });
            }
        }
    }, [location.values, invState.companyUuid, isBuyer]);

    useEffect(() => {
        if (taxRecords.length && typeof isBuyer === "boolean" && !isBuyer) {
            const tax = taxRecords?.find((item) => item.default === true);
            const taxDefault = {
                taxCode: tax?.taxCode ?? "",
                taxRate: tax?.taxRate ?? null,
                uuid: tax?.uuid ?? ""
            };
            setDefaultTax(taxDefault);
        }
    }, [taxRecords, isBuyer]);

    useState(() => {
        if (location.values) {
            setInvState((prevState) => ({
                ...prevState,
                rowDataAuditTrail: location?.invState?.rowDataAuditTrail ?? [],
                rowDataExternalAttachment: location?.invState?.rowDataExternalAttachment ?? [],
                rowDataExternalConversation: location?.invState?.rowDataExternalConversation ?? [],
                rowDataInternalAttachment: location?.invState?.rowDataInternalAttachment ?? []
            }));
            if (location.values.invoiceType === INVOICE_CONSTANTS.PO) {
                InvoiceService.getPOListForCreatingINV(
                    location.invState.companyUuid,
                    location.values.supplierUuid ? location.values.supplierUuid : location.values.buyerCompanyUuid, isBuyer
                ).then((e) => {
                    const result = e.data.data.map((item) => ({
                        ...item,
                        allowSelected: true,
                        status: item.status.replaceAll("_", " ")
                    }));
                    setListItemSelect(result);
                });
            }

            if (location.values.invoiceType === INVOICE_CONSTANTS.DO) {
                InvoiceService.getDOListForCreatingINV(
                    location.invState.companyUuid,
                    location.values.supplierUuid ? location.values.supplierUuid : location.values.buyerCompanyUuid, isBuyer
                ).then((e) => {
                    const result = e.data.data.map(({ poList, ...rest }) => ({
                        ...rest,
                        poNumber: poList,
                        allowSelected: true,
                        status: rest.status.replaceAll("_", " ")
                    }));
                    setListItemSelect(result);
                });
            }
        }
    }, [location]);

    useEffect(() => {
        if (
            location?.invoiceDetails && listItemSelect.length
            && (gridApiSelectPO || gridApiSelectDO)
            && flag.current === false && defaultTax
        ) {
            flag.current = true;
            const { invoiceItemDtoList, invoiceType } = location?.invoiceDetails;
            if (invoiceItemDtoList.length) {
                let newItemSelects = [...listItemSelect];
                if (invoiceType === INVOICE_CONSTANTS.PO) {
                    const poUuids = invoiceItemDtoList.map((item) => item.poUuid);
                    const selectedItems = newItemSelects.filter((item) => poUuids.includes(item.poUuid));

                    newItemSelects = newItemSelects.map((item) => {
                        if (item.currencyCode === selectedItems[0].currencyCode
                            && item.projectCode === selectedItems[0].projectCode
                        ) {
                            return { ...item, allowSelected: true };
                        }
                        return { ...item, allowSelected: false };
                    });

                    setListItemSelect(newItemSelects);

                    setTimeout(() => {
                        gridApiSelectPO.forEachNode((node) => {
                            if (poUuids.includes(node?.data?.poUuid)) node.setSelected(true);
                        });
                    }, 100);
                }
                if (invoiceType === INVOICE_CONSTANTS.DO) {
                    const doUuids = invoiceItemDtoList.map((item) => item.doUuid);
                    const selectedItems = newItemSelects.filter((item) => doUuids.includes(item.doUuid));

                    newItemSelects = newItemSelects.map((item) => {
                        if (item.currencyCode === selectedItems[0]?.currencyCode
                            && item.projectCode === selectedItems[0]?.projectCode
                        ) {
                            return { ...item, allowSelected: true };
                        }
                        return { ...item, allowSelected: false };
                    });

                    setListItemSelect(newItemSelects);

                    setTimeout(() => {
                        gridApiSelectDO.forEachNode((node) => {
                            if (doUuids.includes(node?.data?.doUuid)) node.setSelected(true);
                        });
                    }, 100);
                }
            }
        }
    }, [location?.invoiceDetails, listItemSelect, gridApiSelectPO, gridApiSelectDO, defaultTax]);

    const getDataResponse = (responseData, type = "array") => {
        if (responseData.status === RESPONSE_STATUS.FULFILLED) {
            const { value } = responseData;
            const { status, data, message } = value && value.data;
            if (status === RESPONSE_STATUS.OK) {
                return data;
            }
            showToast("error", message);
        } else {
            const { response } = responseData && responseData.reason;
            showToast("error", response.data.message || response.data.error);
        }
        return type === "array" ? [] : {};
    };

    const initData = async (companyUuid) => {
        try {
            const responses = await Promise.allSettled([
                ExtVendorService.getExternalVendors(companyUuid),
                UOMDataService.getUOMRecords(companyUuid),
                TaxRecordDataService.getTaxRecords(companyUuid),
                CurrenciesService.getCurrencies(companyUuid)
            ]);
            const [
                responseSuppliers,
                responseUOMs,
                responseTaxRecords,
                responseCurrencies
            ] = responses;
            setSuppliers(getDataResponse(responseSuppliers)
                .sort((a, b) => {
                    if (a.companyCode < b.companyCode) return -1;
                    if (a.companyCode > b.companyCode) return 1;
                    return 0;
                }).map((item) => ({ ...item, companyLabel: `${item.companyCode} (${item.companyName})` })));
            setUOMs(getDataResponse(responseUOMs)
                .sort((a, b) => {
                    if (a.uomName < b.uomName) return -1;
                    if (a.uomName > b.uomName) return 1;
                    return 0;
                }));
            const taxList = getDataResponse(responseTaxRecords)
                .sort((a, b) => {
                    if (a.taxCode < b.taxCode) return -1;
                    if (a.taxCode > b.taxCode) return 1;
                    return 0;
                });
            setTaxRecords(taxList.filter((item) => item.active === true));
            setCurrencies(getDataResponse(responseCurrencies).filter(
                (currency) => currency.active === true
            ).sort(
                (a, b) => {
                    if (a.currencyName < b.currencyName) return -1;
                    if (a.currencyName > b.currencyName) return 1;
                    return 0;
                }
            ));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onCreateInvoice = async (values) => {
        const summaryInvoice = summaryInvoiceRef?.current?.getSubmitSummaryInvoice();
        setPristine();
        if (summaryInvoice?.messageError) {
            return ("error", summaryInvoice.messageError);
        }
        try {
            const {
                companyUuid
            } = invState;
            const body = {
                companyUuid,
                invoiceUuid: paramsUrl.OPC,
                invoiceReferenceNumber: values.invoiceRefNumber || "",
                invoiceDueDate: convertToLocalTime(
                    values.invoiceDueDate,
                    CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                invoiceDate: convertToLocalTime(
                    values.invoiceDate,
                    CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                note: values.note || "",
                cumulativeContractorWorksInvoiceTaxApplicable: summaryInvoice.cumulativeContractorWorksInvoiceTaxApplicable,
                cumulativeContractorWorksInvoiceTaxUuid: summaryInvoice.cumulativeContractorWorksInvoiceTaxUuid,
                cumulativeUnfixedGoodsInvoiceTaxApplicable: summaryInvoice.cumulativeUnfixedGoodsInvoiceTaxApplicable,
                cumulativeUnfixedGoodsInvoiceTaxUuid: summaryInvoice.cumulativeUnfixedGoodsInvoiceTaxUuid,
                cumulativeVariationWorksInvoiceTaxApplicable: summaryInvoice.cumulativeVariationWorksInvoiceTaxApplicable,
                cumulativeVariationWorksInvoiceTaxUuid: summaryInvoice.cumulativeVariationWorksInvoiceTaxUuid,
                retentionOfWorkDoneInvoiceTaxApplicable: summaryInvoice.retentionOfWorkDoneInvoiceTaxApplicable,
                retentionOfWorkDoneInvoiceTaxUuid: summaryInvoice.retentionOfWorkDoneInvoiceTaxUuid
            };
            const response = await InvoiceService.createOPCInvoice(
                companyUuid,
                paramsUrl.OPC,
                body
            );
            showToast("success", response.data.message);
            setTimeout(() => {
                history.push(INVOICE_ROUTES.INVOICE_LIST);
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
        return "";
    };

    const onIssuePressHandler = async (values) => {
        setPristine();
        try {
            const {
                rowDataInternalAttachment,
                rowDataExternalAttachment,
                companyUuid
            } = invState;
            const body = {
                reissuedInvoiceUuid: values.reissuedInvoiceUuid,
                invoiceType: values.invoiceType,
                invoiceNo: values.invoiceNo,
                supplierDto: {
                    supplierCode: values.supplierCode,
                    supplierUuid: values.supplierUuid,
                    companyName: values.companyName
                },
                buyerDto: {
                    buyerUuid: userDetails.uuid,
                    buyerCompanyUuid: companyUuid
                },
                currencyCode: values.currencyCode || "SGD",
                paymentTerms: values.paymentTerms,
                invoiceDate: convertToLocalTime(
                    values.invoiceDate,
                    CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                invoiceDueDate: convertToLocalTime(
                    values.invoiceDueDate,
                    CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                totalAmount: Number(clearNumber(formatDisplayDecimal(invoiceAmountNonPO.total, 2))),
                expectedAmount: Number(values.expectedAmount),
                expectedAmountGiven: values.expectedAmountGiven,
                invoiceDocumentMetadataDtoList: []
            };

            if (!isBuyer) {
                body.supplierDto = {
                    supplierUuid: userDetails.uuid,
                    supplierCompanyUuid: companyUuid
                };
                body.buyerDto = {
                    buyerCode: values.supplierCode,
                    buyerUuid: values.supplierUuid,
                    buyerCompanyUuid: values.buyerCompanyUuid
                };
            }

            if (values.invoiceType === INVOICE_CONSTANTS.DO) {
                const listItemManual = [];
                const listSelectedItem = [];
                body.doInvoiceItemDtoList = [];
                body.totalAmount = Number(clearNumber(formatDisplayDecimal(invoiceAmountDO.total, 2)));
                const doInvoiceItemDtoList = rowDataItemsTypeDO.map((item) => {
                    if (item.isManualItem) {
                        const {
                            uuid,
                            isManualItem,
                            invoiceNetPrice,
                            invoiceTaxCode,
                            uom,
                            ...rest
                        } = item;
                        const result = {
                            ...rest,
                            uom: uom?.uomCode,
                            invoiceTaxCode: invoiceTaxCode?.taxCode
                        };
                        listItemManual.push(result);
                        return result;
                    }
                    const result = {
                        doNumber: item.doNumber,
                        doUuid: item.doUuid,
                        poNumber: item.poNumber,
                        poUuid: item.poUuid,
                        itemCode: item.itemCode,
                        invoiceQty: item.invoiceQty,
                        invoiceUnitPrice: item.invoiceUnitPrice,
                        invoiceTaxCode: item.invoiceTaxCode?.taxCode ?? item.invoiceTaxCode,
                        invoiceTaxCodeUuid: item.invoiceTaxCodeUuid,
                        invoiceTaxCodeValue: item.invoiceTaxCodeValue,
                        priceType: item?.priceType
                    };
                    listSelectedItem.push(result);
                    return result;
                });

                // validate item
                if (listItemManual.length === 1 && doInvoiceItemDtoList.length === 1) {
                    await oneManualItemSchema.validate(listItemManual);
                }
                if (listSelectedItem.length === 1 && doInvoiceItemDtoList.length === 1) {
                    await oneSelectedItemSchema.validate(listSelectedItem);
                }
                if (doInvoiceItemDtoList.length >= 2) {
                    if (listItemManual.length > 0) {
                        await manyManualItemsSchema.validate(listItemManual);
                    }
                    if (listSelectedItem.length > 0) {
                        await manySelectedItemsSchema.validate(listSelectedItem);
                    }
                    const totalUnitPrice = listSelectedItem.reduce((sum, item) => sum
                        + Number(item.invoiceUnitPrice), 0);

                    if (totalUnitPrice <= 0) {
                        throw new Error(t("Total Invoice amount must be greater than 0"));
                    }
                    // validate invoiceQty >= 0
                    if (doInvoiceItemDtoList.some((item) => Number(item.invoiceQty) < 0)) {
                        throw new Error(t("InvoiceQuantityCannotBeANegativeNumber"));
                    }
                    // validate at least one item have invoiceQty > 0
                    if (!doInvoiceItemDtoList.some((item) => Number(item.invoiceQty) > 0)) {
                        throw new Error(t("AtLeastOneItemShouldHaveInvoiceQtyGreaterThanZero"));
                    }
                }

                body.doInvoiceItemDtoList = doInvoiceItemDtoList;
            }

            if (values.invoiceType === INVOICE_CONSTANTS.PO) {
                const listItemManual = [];
                const listSelectedItem = [];
                body.projectInvoiceItemDtoList = [];
                body.totalAmount = Number(clearNumber(formatDisplayDecimal(invoiceAmountPO.total, 2)));
                const projectInvoiceItemDtoList = rowDataItemsTypePO.map((item) => {
                    if (item.isManualItem) {
                        const {
                            uuid,
                            isManualItem,
                            invoiceNetPrice,
                            invoiceTaxCode,
                            invoiceTaxCodeValue,
                            uom,
                            ...rest
                        } = item;
                        const result = {
                            ...rest,
                            uom: uom?.uomCode,
                            invoiceTaxCode: invoiceTaxCode?.taxCode ?? invoiceTaxCode,
                            invoiceTaxCodeValue: item.invoiceTaxCodeValue
                        };
                        listItemManual.push(result);
                        return result;
                    }
                    const result = {
                        poNumber: item.poNumber,
                        poUuid: item.poUuid,
                        itemCode: item.itemCode,
                        invoiceQty: item.invoiceQty,
                        invoiceUnitPrice: item.invoiceUnitPrice,
                        invoiceTaxCode: item.invoiceTaxCode?.taxCode ?? item?.invoiceTaxCode,
                        invoiceTaxCodeUuid: item.invoiceTaxCodeUuid,
                        invoiceTaxCodeValue: item.invoiceTaxCodeValue,
                        priceType: item?.priceType
                    };
                    listSelectedItem.push(result);
                    return result;
                });

                // validate item
                if (listItemManual.length === 1 && projectInvoiceItemDtoList.length === 1) {
                    await oneManualItemSchema.validate(listItemManual);
                }
                if (listSelectedItem.length === 1 && projectInvoiceItemDtoList.length === 1) {
                    await oneSelectedItemSchema.validate(listSelectedItem);
                }
                if (projectInvoiceItemDtoList.length >= 2) {
                    if (listItemManual.length > 0) {
                        await manyManualItemsSchema.validate(listItemManual);
                    }
                    if (listSelectedItem.length > 0) {
                        await manySelectedItemsSchema.validate(listSelectedItem);
                    }

                    const totalUnitPrice = listSelectedItem.reduce((sum, item) => sum
                        + Number(item.invoiceUnitPrice), 0);

                    if (totalUnitPrice <= 0) {
                        throw new Error(t("Total Invoice amount must be greater than 0"));
                    }

                    // validate invoiceQty >= 0
                    if (projectInvoiceItemDtoList.some((item) => Number(item.invoiceQty) < 0)) {
                        throw new Error(t("InvoiceQuantityCannotBeANegativeNumber"));
                    }
                    // validate at least one item have invoiceQty > 0
                    if (!projectInvoiceItemDtoList.some((item) => Number(item.invoiceQty) > 0)) {
                        throw new Error(t("AtLeastOneItemShouldHaveInvoiceQtyGreaterThanZero"));
                    }
                }

                body.projectInvoiceItemDtoList = projectInvoiceItemDtoList;
            }

            if (values.invoiceType === INVOICE_CONSTANTS.NON_PO) {
                body.nonPOInvoiceItemDtoList = [];
                const nonPOInvoiceItemDtoList = rowDataItemsTypeNonPO.map(
                    ({
                        uuid, uom, invoiceTaxCode, invoiceNetPrice, ...rest
                    }) => ({
                        ...rest,
                        uom: uom?.uomCode,
                        invoiceTaxCode: invoiceTaxCode?.taxCode,
                        invoiceTaxCodeUuid: invoiceTaxCode?.uuid
                    })
                );
                body.nonPOInvoiceItemDtoList = nonPOInvoiceItemDtoList;
                if (nonPOInvoiceItemDtoList.length > 0) {
                    await oneNonPOItemSchema.validate(nonPOInvoiceItemDtoList);
                }
            }

            const documentList = rowDataInternalAttachment
                .concat(rowDataExternalAttachment);

            await itemAttachmentSchema.validate(documentList);

            const invoiceDocumentMetadataDtoList = documentList.map(
                ({
                    fileLabel, attachment, uploadedOn, uuid, isNew, ...rest
                }) => ({
                    ...rest,
                    fileLabel: fileLabel || attachment,
                    uploadedOn: convertToLocalTime(uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                })
            );
            body.invoiceDocumentMetadataDtoList = invoiceDocumentMetadataDtoList;
            if (body.invoiceType === INVOICE_CONSTANTS.NON_PO) {
                const invoiceList = [...body?.nonPOInvoiceItemDtoList];
                if (invoiceList.length === 0) {
                    throw Error("Please Add valid Item");
                }
            }
            if (body.invoiceType === INVOICE_CONSTANTS.PO) {
                const invoiceList = [...body?.projectInvoiceItemDtoList];
                if (invoiceList.length === 0) {
                    throw Error("Please select valid PO Item");
                }
                const filterArr = invoiceList.filter((item) => item.poUuid);
                if (filterArr.length === 0) {
                    body.invoiceType = INVOICE_CONSTANTS.NON_PO;
                    delete body.projectInvoiceItemDtoList;
                    body.nonPOInvoiceItemDtoList = invoiceList;
                }
            }
            if (body.invoiceType === INVOICE_CONSTANTS.DO) {
                const invoiceList = [...body?.doInvoiceItemDtoList];
                if (invoiceList.length === 0) {
                    throw Error("Please select valid DO Item");
                }
                const filterArr = invoiceList.filter((item) => item.doUuid);
                if (filterArr.length === 0) {
                    body.invoiceType = INVOICE_CONSTANTS.NON_PO;
                    delete body.doInvoiceItemDtoList;
                    body.nonPOInvoiceItemDtoList = invoiceList;
                }
            }

            const response = await InvoiceService.createINV(
                companyUuid,
                isBuyer ? values.supplierUuid : values.buyerCompanyUuid,
                body,
                body.invoiceType,
                isBuyer
            );

            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                try {
                    if (invState.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: invState.externalConversationLines
                        };
                        ConversationService
                            .createExternalConversation(companyUuid, conversationBody);
                    }
                    if (invState.internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: invState.internalConversationLines
                        };
                        ConversationService
                            .createInternalConversation(companyUuid, conversationBody);
                    }
                } catch (error) {}
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(INVOICE_ROUTES.INVOICE_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const handleFileUpload = async (event) => {
        try {
            const data = new FormData();
            const file = event.target.files[0];
            data.append("file", file);
            data.append("category", "purchase-service/documents");
            data.append("uploaderRole", "user");
            const response = await EntitiesService.uploadDocuments(data);
            const responseData = response.data.data;
            if (response.data.status === "OK") {
                return ({
                    fileLabel: responseData.fileName,
                    guid: responseData.guid
                });
            }
            showToast("error", response.data.message);
        } catch (error) {
            if (error.response) {
                if (error.response.data.status === "BAD_REQUEST") {
                    showToast("error", "We don't support this file format, please upload another.");
                } else {
                    showToast("error", error.response.data.message);
                }
            } else {
                showToast("error", error.message);
            }
        }
        return null;
    };

    const prefixStatus = async (currentCompanyUUID) => {
        let enablePrefix = false;
        const response = await DocumentPrefixService.getAllPrefixes(currentCompanyUUID);
        if (response.data.status === "OK") {
            const { data } = response.data;
            data.supplierPortalList.forEach((item) => {
                if (item.functionName === "Invoice" && item.type === "Manual") {
                    enablePrefix = true;
                }
            });
        } else {
            throw new Error(response.data.message);
        }
        requestFormRef?.current?.setFieldValue("enablePrefix", enablePrefix);
        setInvState((prevStates) => ({
            ...prevStates,
            enablePrefix
        }));
    };

    useEffect(() => {
        if (!_.isEmpty(permissionReducer)
            && !_.isEmpty(userDetails)) {
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            if (companyUuid) {
                initData(companyUuid);
                prefixStatus(companyUuid);
                setInvState((prevStates) => ({
                    ...prevStates,
                    companyUuid
                }));
            }
        }
    }, [permissionReducer, userDetails]);

    const sendCommentConversation = async (comment, isInternal) => {
        setDirty();
        if (isInternal) {
            const internalConversationLines = [...invState.internalConversationLines];
            const { rowDataInternalConversation } = invState;
            const newRowData = [...rowDataInternalConversation];
            newRowData.push({
                userName: userDetails.name,
                userRole: userDetails.designation,
                userUuid: userDetails.uuid,
                dateTime: new Date(),
                comment,
                externalConversation: false
            });
            internalConversationLines.push({
                text: comment
            });
            setInvState((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = invState;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...invState.externalConversationLines];
        newRowData.push({
            userName: userDetails.name,
            userRole: userDetails.designation,
            userUuid: userDetails.uuid,
            dateTime: new Date(),
            comment,
            externalConversation: true
        });
        externalConversationLines.push({
            text: comment
        });
        setInvState((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation: newRowData,
            externalConversationLines
        }));
    };

    const handelDeleteFile = async (guid) => {
        try {
            const response = await EntitiesService.deleteDocuments(guid);
            if (response.data.status === "OK") {
                return true;
            }
            showToast("error", response.data.message);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
        return false;
    };

    const addNewRowAttachment = (isInternal) => {
        setDirty();
        if (isInternal) {
            const { rowDataInternalAttachment } = invState;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.push({
                isNew: true,
                guid: "",
                fileLabel: "",
                fileDescription: "",
                uploadedOn: new Date(),
                uploadedBy: userDetails.name,
                uploaderUuid: userDetails.uuid,
                externalDocument: false,
                uuid: uuidv4()
            });
            setInvState((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = invState;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.push({
            isNew: true,
            guid: "",
            fileLabel: "",
            fileDescription: "",
            uploadedOn: new Date(),
            uploadedBy: userDetails.name,
            uploaderUuid: userDetails.uuid,
            externalDocument: true,
            uuid: uuidv4()
        });
        setInvState((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onCellEditingStopped = (params, isInternal) => {
        setDirty();
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = invState;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setInvState((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = invState;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setInvState((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onAddAttachmentConversation = (event, uuid, rowData, isInternal) => {
        setDirty();
        handleFileUpload(event).then((result) => {
            if (!result) return;
            if (isInternal) {
                const newRowData = [...rowData];
                newRowData.forEach((row, index) => {
                    if (row.uuid === uuid) {
                        newRowData[index] = {
                            ...row,
                            guid: result.guid,
                            attachment: result.fileLabel
                        };
                    }
                });
                setInvState((prevStates) => ({
                    ...prevStates,
                    rowDataInternalAttachment: newRowData
                }));
                return;
            }

            const newRowData = [...rowData];
            newRowData.forEach((row, index) => {
                if (row.uuid === uuid) {
                    newRowData[index] = {
                        ...row,
                        guid: result.guid,
                        attachment: result.fileLabel
                    };
                }
            });
            setInvState((prevStates) => ({
                ...prevStates,
                rowDataExternalAttachment: newRowData
            }));
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const onDeleteAttachment = (uuid, rowData, isInternal) => {
        setDirty();
        if (isInternal) {
            const newRowData = rowData.filter((row) => row.uuid !== uuid);
            const rowDeleted = rowData.find((row) => row.uuid === uuid);
            if (rowDeleted && rowDeleted.guid) {
                handelDeleteFile(rowDeleted.guid);
            }
            setInvState((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const newRowData = rowData.filter((row) => row.uuid !== uuid);
        const rowDeleted = rowData.find((row) => row.uuid === uuid);
        if (rowDeleted && rowDeleted.guid) {
            handelDeleteFile(rowDeleted.guid);
        }
        setInvState((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onSelectSupplier = async (event, companyUuid, setFieldValue, values) => {
        setDirty();
        try {
            const { target } = event;
            const { value } = target;
            const supplier = suppliers.find((item) => item.companyCode === value);
            const response = await ExtVendorService.getExternalVendorDetails(
                companyUuid, supplier.uuid
            );
            const { data } = response && response.data;
            let vendorCompanyUuid = "";
            if (data) {
                setSelectedBuyerOrSupplier(data);
                vendorCompanyUuid = data.vendorCompanyUuid;
                const { addressesDto, paymentTerm } = data;
                const address = addressesDto.find((item) => item.default === true);
                setFieldValue("supplierCode", value);
                setFieldValue("supplierUuid", supplier.uuid);
                setFieldValue("companyName", data.companyName);
                setFieldValue("addressLabel", address.addressLabel);
                setFieldValue("addressFirstLine", address.addressFirstLine);
                setFieldValue("addressSecondLine", address.addressSecondLine);
                setFieldValue("country", address.country);
                setFieldValue("city", address.city);
                setFieldValue("state", address.state);
                setFieldValue("postalCode", address.postalCode);
                setFieldValue("paymentTerms", paymentTerm?.ptName);
                if (isBuyer) {
                    setDefaultTax({
                        taxCode: data?.tax?.taxCode ?? "",
                        taxRate: data?.tax?.taxRate ?? null,
                        uuid: data?.tax?.uuid ?? ""
                    });
                } else {
                    const tax = taxRecords?.find((item) => item.default === true);
                    if (tax) {
                        setDefaultTax({
                            taxCode: tax?.taxCode ?? "",
                            taxRate: tax?.taxRate ?? null,
                            uuid: tax?.uuid ?? ""
                        });
                    } else {
                        setDefaultTax({
                            taxCode: "",
                            taxRate: null,
                            uuid: ""
                        });
                    }
                }
                setFieldValue("ptDays", paymentTerm?.ptDays);
                if (!isBuyer) setFieldValue("buyerCompanyUuid", vendorCompanyUuid);
            }

            if (values.invoiceType === INVOICE_CONSTANTS.PO) {
                if (isBuyer) {
                    const responsePOList = await InvoiceService.getPOListForCreatingINV(
                        companyUuid, supplier.uuid, isBuyer
                    );
                    const result = responsePOList.data.data.map((item) => ({
                        ...item,
                        allowSelected: true,
                        status: item.status.replaceAll("_", " ")
                    }));
                    setListItemSelect(result);
                } else {
                    const responsePOList = await InvoiceService.getPOListForCreatingINV(
                        companyUuid, vendorCompanyUuid, isBuyer
                    );
                    const result = responsePOList.data.data.map((item) => ({
                        ...item,
                        allowSelected: true,
                        status: item.status.replaceAll("_", " ")
                    }));
                    setListItemSelect(result);
                }
            } else if (values.invoiceType === INVOICE_CONSTANTS.DO) {
                const responseDOList = await InvoiceService.getDOListForCreatingINV(
                    companyUuid, vendorCompanyUuid
                );
                const doList = responseDOList.data.data.map(({ poList, ...rest }) => ({
                    ...rest,
                    poNumber: poList,
                    allowSelected: true,
                    status: rest.status.replaceAll("_", " ")
                }));
                setListItemSelect(doList);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onSelectionChangedPO = (
        event,
        rowDataPO,
        setRowData,
        setInvAmountPO,
        setAmountToInv,
        setFieldValue,
        itemSelects,
        setItemSelects,
        gridApi
    ) => {
        setDirty();
        let newItemSelects = [...itemSelects];
        let newRowData = [];
        const listItemManual = rowDataPO.filter((item) => item.isManualItem === true);
        const oldRowDataPO = rowDataPO.filter((item) => !item.isManualItem);
        const oldPOObjectList = oldRowDataPO.map((item) => ({
            poUuid: item.poUuid,
            itemName: item.itemName
        }));
        const { companyUuid } = invState;
        const selectedNodes = event.api.getSelectedNodes();
        const nodeData = selectedNodes.map((item) => item.data);
        if (nodeData.length === 0) {
            newItemSelects = newItemSelects.map((item) => ({
                ...item,
                allowSelected: true,
                status: item.status.replaceAll("_", " ")
            }));
            setItemSelects(newItemSelects);
            setFieldValue("project", false);
            setFieldValue("projectTitle", "");
        }
        if (nodeData.length > 0) {
            const { currencyCode, projectCode, projectTitle } = nodeData[0];
            setFieldValue("projectTitle", projectTitle);
            setFieldValue("currencyCode", currencyCode || "");
            setFieldValue("project", !!projectCode);

            newItemSelects = newItemSelects.map((item) => {
                if (item.currencyCode === nodeData[0].currencyCode
                    && item.projectCode === nodeData[0].projectCode
                ) {
                    return {
                        ...item,
                        allowSelected: true,
                        status: item.status.replaceAll("_", " ")
                    };
                }
                return {
                    ...item,
                    allowSelected: false,
                    status: item.status.replaceAll("_", " ")
                };
            });
            setItemSelects(newItemSelects);
            if (nodeData.length === 1) {
                setTimeout(() => {
                    gridApi.forEachNode((node) => {
                        node.setSelected(
                            node.data.poNumber === nodeData[0].poNumber
                        );
                    });
                });
            }
        }
        const poUuidList = nodeData.map((item) => item.poUuid);
        InvoiceService.getPODetailsForCreatingInv(companyUuid, { poUuidList }).then((response) => {
            const { data } = response && response.data;
            if (data) {
                data.forEach((item) => {
                    const { poNumber, poUuid, poItemDtoList } = item;
                    poItemDtoList.forEach((poItem) => {
                        const rowData = { poNumber, poUuid };
                        const contractedPrice = poItem.contracted ? poItem.contractedPrice : 0;
                        rowData.invoicedQty = poItem.invoiceQty || 0;
                        rowData.itemCode = poItem.itemCode || "";
                        rowData.itemName = poItem.itemName || "";
                        rowData.itemDescription = poItem.itemDescription || "";
                        rowData.model = poItem.itemModel || "";
                        rowData.size = poItem.itemSize || "";
                        rowData.brand = poItem.itemBrand || "";
                        rowData.uom = poItem.uomCode || "";
                        rowData.notes = poItem.note || "";
                        rowData.poUnitPrice = poItem.itemUnitPrice || contractedPrice;
                        rowData.poQty = poItem.quantity || 0;
                        rowData.poNetPrice = roundNumberWithUpAndDown(
                            rowData.poQty * rowData.poUnitPrice
                        );
                        rowData.poTaxCode = poItem.taxCode || "";
                        rowData.poTaxCodeValue = poItem.taxRate || 0;
                        rowData.doQtyConverted = poItem.qtyConverted || 0;
                        rowData.grQtyReceived = poItem.qtyReceived || 0;
                        rowData.grQtyRejected = poItem.qtyRejected || 0;
                        rowData.pendingInvoiceQty = poItem.pendingInvoiceQty;
                        rowData.pendingInvoiceUnitPrice = rowData.poUnitPrice;
                        rowData.pendingInvoiceNetPrice = roundNumberWithUpAndDown(
                            rowData.pendingInvoiceQty * Number(rowData.pendingInvoiceUnitPrice)
                        );
                        rowData.isManualItem = false;
                        rowData.uuid = uuidv4();
                        rowData.invoiceQty = poItem.pendingInvoiceQty;
                        rowData.invoiceTaxCode = defaultTax?.taxCode || "";
                        rowData.invoiceTaxCodeValue = taxRecords
                            ?.find((e) => e.taxCode === defaultTax?.taxCode)
                            ?.taxRate
                            || 0;
                        rowData.invoiceUnitPrice = rowData.poUnitPrice;
                        rowData.priceType = poItem?.priceType;
                        rowData.invoiceNetPrice = roundNumberWithUpAndDown(
                            rowData.invoiceQty * rowData.invoiceUnitPrice
                        );
                        rowData.isEditInvQty = false;
                        rowData.isEditInvUnitPrice = false;
                        newRowData.push(rowData);
                    });
                });
            }
            newRowData = newRowData.map((item) => {
                const object = { poUuid: item.poUuid, itemName: item.itemName };
                if (checkObjectExistInArrayPO(object, oldPOObjectList)) {
                    const rowData = oldRowDataPO.find((element) => element.poUuid === item.poUuid
                        && element.itemName === item.itemName);
                    if (rowData) return rowData || item;
                }
                return item;
            });
            newRowData = newRowData.concat(listItemManual);
            setRowData(newRowData);

            let subTotal = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => sum
                + roundNumberWithUpAndDown(item.invoiceNetPrice), 0));
            const diffTax = newRowData.some((item) => item.invoiceTaxCodeValue !== newRowData[0]?.invoiceTaxCodeValue);
            let tax;
            if (diffTax) {
                tax = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => {
                    const result = roundNumberWithUpAndDown(
                        (roundNumberWithUpAndDown(item.invoiceNetPrice)
                            * Number(item.invoiceTaxCodeValue)) / 100
                    );
                    return sum + result;
                }, 0));
            } else {
                tax = roundNumberWithUpAndDown((subTotal * newRowData[0]?.invoiceTaxCodeValue) / 100);
            }

            let total = roundNumberWithUpAndDown(subTotal + tax);
            setInvAmountPO({
                subTotal,
                tax,
                total
            });
            subTotal = roundNumberWithUpAndDown(newRowData.reduce(
                (sum, item) => sum + roundNumberWithUpAndDown(item.pendingInvoiceNetPrice),
                0
            ));
            const diffTaxPO = newRowData.some((item) => item.poTaxCodeValue !== newRowData[0]?.poTaxCodeValue);
            if (diffTaxPO) {
                tax = roundNumberWithUpAndDown(newRowData.reduce(
                    (sum, item) => {
                        const result = roundNumberWithUpAndDown(
                            (roundNumberWithUpAndDown(item.pendingInvoiceNetPrice)
                                * Number(item.poTaxCodeValue)) / 100
                        );
                        return sum + result;
                    },
                    0
                ));
            } else {
                tax = roundNumberWithUpAndDown((subTotal * newRowData[0]?.poTaxCodeValue) / 100);
            }
            total = roundNumberWithUpAndDown(subTotal + tax);
            setAmountToInv({
                subTotal,
                tax,
                total
            });
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const onSelectionChangedDO = (
        event,
        rowDataDO,
        setRowData,
        setInvAmountDO,
        setAmountToInv,
        setFieldValue,
        itemSelects,
        setItemSelects,
        gridApi
    ) => {
        setDirty();
        let newItemSelects = [...itemSelects];
        let newRowData = [];
        const listItemManual = rowDataDO.filter((item) => item.isManualItem === true);
        const oldRowDataDO = rowDataDO.filter((item) => !item.isManualItem);
        const oldDOObjectList = oldRowDataDO.map((item) => ({
            doUuid: item.doUuid,
            poUuid: item.poUuid,
            itemName: item.itemName
        }));
        const { companyUuid } = invState;
        const selectedNodes = event.api.getSelectedNodes();
        const nodeData = selectedNodes.map((item) => item.data);
        if (nodeData.length === 0) {
            newItemSelects = newItemSelects.map((item) => ({
                ...item,
                allowSelected: true,
                status: item.status.replaceAll("_", " ")
            }));
            setItemSelects(newItemSelects);
            setFieldValue("project", false);
            setFieldValue("projectTitle", "");
        }
        if (nodeData.length > 0) {
            const { currencyCode, projectCode, projectTitle } = nodeData[0];
            setFieldValue("currencyCode", currencyCode || "");
            setFieldValue("project", !!projectCode);
            setFieldValue("projectTitle", projectTitle || "");

            newItemSelects = newItemSelects.map((item) => {
                if (item.currencyCode === nodeData[0].currencyCode
                    && item.projectCode === nodeData[0].projectCode
                ) {
                    return {
                        ...item,
                        allowSelected: true,
                        status: item.status.replaceAll("_", " ")
                    };
                }
                return {
                    ...item,
                    allowSelected: false,
                    status: item.status.replaceAll("_", " ")
                };
            });
            setItemSelects(newItemSelects);
            if (nodeData.length === 1) {
                setTimeout(() => {
                    gridApi.forEachNode((node) => {
                        node.setSelected(
                            node.data.deliveryOrderNumber === nodeData[0].deliveryOrderNumber
                        );
                    });
                });
            }
        }
        const doUuidList = nodeData.map((item) => item.doUuid);
        InvoiceService.getDODetailsForCreatingInv(companyUuid, { doUuidList }).then((response) => {
            const { data } = response && response.data;
            if (data) {
                data.forEach((item) => {
                    const { doNumber, doUuid, doItemDtoList } = item;
                    doItemDtoList.forEach((doItem) => {
                        const contractedPrice = doItem.contracted ? doItem.contractedPrice : 0;
                        const rowData = { doNumber, doUuid };
                        rowData.poNumber = doItem.poNumber;
                        rowData.poUuid = doItem.poUuid;
                        rowData.invoicedQty = doItem.invoiceQty || 0;
                        rowData.invoiceQty = doItem.qtyConverted || 0;
                        rowData.itemCode = doItem.itemCode || "";
                        rowData.itemName = doItem.itemName || "";
                        rowData.itemDescription = doItem.itemDescription || "";
                        rowData.model = doItem.itemModel || "";
                        rowData.size = doItem.itemSize || "";
                        rowData.brand = doItem.itemBrand || "";
                        rowData.uom = doItem.uomCode || "";
                        rowData.notes = doItem.note || "";
                        rowData.poUnitPrice = doItem?.poUnitPrice || contractedPrice;
                        rowData.priceType = doItem?.priceType;
                        rowData.poQty = doItem.poQuantity || 0;
                        rowData.poNetPrice = roundNumberWithUpAndDown(
                            rowData.invoiceQty * rowData.poUnitPrice
                        );
                        rowData.poTaxCode = doItem.poTaxCode || "";
                        rowData.poTaxCodeValue = doItem.poTaxRate || 0;
                        rowData.doQtyConverted = doItem.qtyConverted || 0;
                        rowData.grQtyReceived = doItem.qtyReceived || 0;
                        rowData.grQtyRejected = doItem.qtyRejected || 0;
                        rowData.pendingInvoiceQty = minusToPrecise(
                            doItem.poQuantity, rowData.invoicedQty
                        );
                        rowData.pendingInvoiceUnitPrice = rowData.poUnitPrice;
                        rowData.pendingInvoiceNetPrice = roundNumberWithUpAndDown(
                            rowData.pendingInvoiceQty * rowData.pendingInvoiceUnitPrice
                        );
                        rowData.isManualItem = false;
                        rowData.uuid = uuidv4();
                        rowData.invoiceUnitPrice = rowData.poUnitPrice || 0;
                        rowData.invoiceNetPrice = roundNumberWithUpAndDown(
                            rowData.invoiceUnitPrice * rowData.invoiceQty
                        );
                        rowData.isEditInvQty = false;
                        rowData.isEditInvUnitPrice = true;
                        rowData.invoiceTaxCode = defaultTax?.taxCode || "";
                        rowData.invoiceTaxCodeValue = taxRecords
                            ?.find((e) => e.taxCode === defaultTax?.taxCode)
                            ?.taxRate
                            || 0;
                        newRowData.push(rowData);
                    });
                });
            }
            newRowData = newRowData.map((item) => {
                const object = {
                    doUuid: item.doUuid,
                    poUuid: item.poUuid,
                    itemName: item.itemName
                };
                if (checkObjectExistInArrayDO(object, oldDOObjectList)) {
                    const rowData = oldRowDataDO.find((element) => element.doUuid === item.doUuid
                        && element.poUuid === item.poUuid
                        && element.itemName === item.itemName);
                    if (rowData) return rowData || item;
                }
                return item;
            });
            newRowData = newRowData.concat(listItemManual);
            setRowData(newRowData);

            let subTotal = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => sum
                + roundNumberWithUpAndDown(item.invoiceNetPrice), 0));
            const diffTax = newRowData.some((item) => item.invoiceTaxCodeValue !== newRowData[0]?.invoiceTaxCodeValue);
            let tax;
            if (diffTax) {
                tax = roundNumberWithUpAndDown(newRowData.reduce((sum, item) => {
                    const result = roundNumberWithUpAndDown(
                        (roundNumberWithUpAndDown(item.invoiceNetPrice)
                            * Number(item.invoiceTaxCodeValue)) / 100
                    );
                    return sum + result;
                }, 0));
            } else {
                tax = roundNumberWithUpAndDown((subTotal * newRowData[0]?.invoiceTaxCodeValue) / 100);
            }
            let total = roundNumberWithUpAndDown(subTotal + tax);
            setInvAmountDO({
                subTotal,
                tax,
                total
            });

            subTotal = roundNumberWithUpAndDown(newRowData.reduce(
                (sum, item) => sum + roundNumberWithUpAndDown(item.poNetPrice),
                0
            ));

            const diffTaxPO = newRowData.some((item) => item.poTaxCodeValue !== newRowData[0]?.poTaxCodeValue);
            if (diffTaxPO) {
                tax = roundNumberWithUpAndDown(newRowData.reduce(
                    (sum, item) => {
                        const result = roundNumberWithUpAndDown((
                            roundNumberWithUpAndDown(item.poNetPrice)
                            * Number(item.poTaxCodeValue)
                        ) / 100);
                        return sum + result;
                    },
                    0
                ));
            } else {
                tax = roundNumberWithUpAndDown((subTotal * newRowData[0]?.poTaxCodeValue) / 100);
            }
            total = roundNumberWithUpAndDown(subTotal + tax);
            setAmountToInv({
                subTotal,
                tax,
                total
            });
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };

    const onChangePc = async (event, setValues, values, companyUuid) => {
        try {
            const res = await OfficialProgressiveClaimService.getProgressiveClaimDetail(companyUuid, event.target.value, isBuyer);
            const dataDetail = res.data.data;
            const { pcWorkSpace } = dataDetail;
            const venderInformation = isBuyer ? dataDetail.supplierInformation : dataDetail.buyerInformation;

            setTimeout(() => {
                setValues({
                    ...values,
                    pcNumber: dataDetail.pcNumber,
                    currency: pcWorkSpace.currencyCode,
                    project: pcWorkSpace.projectCode,
                    woTitle: dataDetail.workOrderTitle,
                    claimReferenceMonth: dataDetail.paymentClaimReferenceMonth, // moment(dataDetail.claimDate).format("MM-YYYY"),
                    supplierCode: venderInformation.vendorCode,
                    companyName: venderInformation.vendorName,
                    amountContract: pcWorkSpace.cumulativeMainConWorks
                });
            }, 1000);
        } catch (error) {
            showToast(
                "error",
                error.response ? error.response.data.message : error.message
            );
        }
    };

    const onChangeInvoiceType = async (event, setFieldValue, values, companyUuid, setTaxDefault, taxList) => {
        setDirty();
        try {
            const { target } = event;
            const { value } = target;
            setFieldValue("invoiceType", value);
            setFieldValue("projectTitle", "");
            setFieldValue("project", false);

            if (value === INVOICE_CONSTANTS.NON_PO) {
                const tax = taxList?.find((item) => item.default === true);
                setTaxDefault({
                    taxCode: tax?.taxCode ?? "",
                    taxRate: tax?.taxRate ?? null,
                    uuid: tax?.uuid ?? ""
                });
            }

            // on the buyer side
            if (values.supplierUuid && isBuyer) {
                if (value === INVOICE_CONSTANTS.PO) {
                    const responsePOList = await InvoiceService.getPOListForCreatingINV(
                        companyUuid, values.supplierUuid, isBuyer
                    );
                    const result = responsePOList.data.data.map((item) => ({
                        ...item,
                        allowSelected: true,
                        status: item.status.replaceAll("_", " ")
                    }));
                    setListItemSelect(result);
                }
            }
            // on the supplier side
            if (values.buyerCompanyUuid && !isBuyer) {
                if (value === INVOICE_CONSTANTS.PO) {
                    const responsePOList = await InvoiceService.getPOListForCreatingINV(
                        companyUuid, values.buyerCompanyUuid, isBuyer
                    );
                    const result = responsePOList.data.data.map((item) => ({
                        ...item,
                        allowSelected: true,
                        status: item.status.replaceAll("_", " ")
                    }));
                    setListItemSelect(result);
                } else if (value === INVOICE_CONSTANTS.DO) {
                    const responseDOList = await InvoiceService.getDOListForCreatingINV(
                        companyUuid, values.buyerCompanyUuid
                    );
                    const result = responseDOList.data.data.map(({ poList, ...rest }) => ({
                        ...rest,
                        allowSelected: true,
                        poNumber: poList,
                        status: rest.status.replaceAll("_", " ")
                    }));
                    setListItemSelect(result.filter((item) => item.pendingInvoiceAmount > 0));
                }
            }
            if (!isBuyer) {
                if (value === INVOICE_CONSTANTS.OPC) {
                    setIsOPC(true);
                    setIsProjectOPC(true);
                } else if (value === INVOICE_CONSTANTS.NON_OPC) {
                    setIsOPC(true);
                    setIsProjectOPC(false);
                } else {
                    setIsOPC(false);
                    setIsProjectOPC(false);
                }
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const getItemList = (values) => {
        switch (values.invoiceType) {
        case INVOICE_CONSTANTS.DO:
            return rowDataItemsTypeDO;
        case INVOICE_CONSTANTS.PO:
            return rowDataItemsTypePO;
        case INVOICE_CONSTANTS.NON_PO:
            return rowDataItemsTypeNonPO;
        default:
            return [];
        }
    };

    const enablePreviewInvoice = (values, itemList) => {
        if (!values.supplierCode) return false;
        if (!itemList.length) return false;
        let enable = true;
        if (enable) {
            enable = itemList.some((item) => (Number(item.invoiceQty)));
            if (enable) {
                enable = itemList.some((item) => (Number(item.invoiceUnitPrice)));
            }
        }
        return enable;
    };

    return (
        <Container fluid>
            <Formik
                innerRef={requestFormRef}
                initialValues={initialValues}
                validationSchema={() => validationFormCreateInvSchema(isBuyer)}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, setFieldValue, dirty, handleChange,
                    setTouched,
                    setValues, handleSubmit
                }) => {
                    const previewModalRef = useRef(null);

                    useEffect(() => {
                        if (typeof isBuyer !== "boolean") return;
                        if (isBuyer) {
                            setInvoiceTypes([
                                { label: "PO Invoice", value: INVOICE_CONSTANTS.PO },
                                { label: "Non-PO Invoice", value: INVOICE_CONSTANTS.NON_PO }

                            ]);
                            setFieldValue("invoiceType", values.invoiceType === "" ? INVOICE_CONSTANTS.PO : values.invoiceType);
                        } else {
                            setInvoiceTypes([
                                { label: "DO Invoice", value: INVOICE_CONSTANTS.DO },
                                { label: "PO Invoice", value: INVOICE_CONSTANTS.PO },
                                { label: "OPC Invoice", value: INVOICE_CONSTANTS.OPC },
                                { label: "Non-PO Invoice", value: INVOICE_CONSTANTS.NON_PO },
                                { label: "NON-OPO Invoice", value: INVOICE_CONSTANTS.NON_OPC }
                            ]);
                            setFieldValue("invoiceType", values.invoiceType === "" ? INVOICE_CONSTANTS.DO : values.invoiceType);
                        }
                    }, [isBuyer, values.invoiceType]);

                    useEffect(() => {
                        if (location.search && !_.isEmpty(permissionReducer?.currentCompany)) {
                            setParamsUrl(queryString.parse(location.search));
                            setIsOPC(true);
                            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
                            (async () => {
                                try {
                                    const res = await InvoiceService.getOPCInvoiceDetail(companyUuid, queryString.parse(location.search).OPC, permissionReducer.isBuyer);
                                    const dataDetail = res.data.data;
                                    setOpcDetail(dataDetail);
                                    const { buyerInformation = {} } = dataDetail;
                                    const { address = {} } = buyerInformation;
                                    setValues({
                                        invoiceNo: dataDetail.invoiceNumber || "",
                                        currency: dataDetail.currencyCode || "",
                                        supplierCode: buyerInformation.vendorCode || "",
                                        companyName: buyerInformation.vendorName || "",
                                        woTitle: dataDetail.workOrderTitle || "",
                                        claimReferenceMonth: dataDetail.paymentClaimReferenceMonth || "",
                                        invoiceDate: formatDateString(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
                                        addressLabel: address.addressLabel || "",
                                        addressFirstLine: address.addressFirstLine || "",
                                        addressSecondLine: address.addressSecondLine || "",
                                        city: address.city || "",
                                        state: address.state || "",
                                        country: address.country || "",
                                        postalCode: address.postalCode || "",
                                        paymentTerms: dataDetail.paymentTerm || "",
                                        ptDays: Number(dataDetail.paymentTerm || 0)
                                    });
                                } catch (error) {
                                    showToast("error", error.response ? error.response.data.message : error.message);
                                }
                            })();
                        }
                    }, [location.search, permissionReducer]);

                    return (
                        <Form>
                            <Row className="mx-0 justify-content-between">
                                <HeaderMain
                                    title={t("CreateInvoice")}
                                    className="mb-3 mb-lg-3"
                                />
                                <Row className="mx-0 mb-3 mb-lg-3">
                                    <Badge
                                        bg="secondary"
                                        className="mr-2"
                                        amount={
                                            getTotalInvoiceAmount(
                                                values,
                                                invoiceAmountDO,
                                                invoiceAmountPO,
                                                invoiceAmountNonPO
                                            )
                                        }
                                    />
                                    {!isOPC && (
                                        <>
                                            <Badge
                                                bg={
                                                    Number(getBalanceWithExceptedValue(
                                                        values,
                                                        invoiceAmountDO,
                                                        invoiceAmountPO,
                                                        invoiceAmountNonPO
                                                    ).value.toFixed(2)) ? "danger" : "primary"
                                                }
                                                className="mr-2"
                                                amount={
                                                    getBalanceWithExceptedValue(
                                                        values,
                                                        invoiceAmountDO,
                                                        invoiceAmountPO,
                                                        invoiceAmountNonPO
                                                    )
                                                }
                                            />
                                            <Badge
                                                bg={
                                                    Number(getBalance(
                                                        values,
                                                        amountToInvoiceDO,
                                                        invoiceAmountDO,
                                                        amountToInvoicePO,
                                                        invoiceAmountPO,
                                                        invoiceAmountNonPO
                                                    ).value.toFixed(2)) ? "danger" : "primary"
                                                }
                                                className=""
                                                amount={
                                                    getBalance(
                                                        values,
                                                        amountToInvoiceDO,
                                                        invoiceAmountDO,
                                                        amountToInvoicePO,
                                                        invoiceAmountPO,
                                                        invoiceAmountNonPO
                                                    )
                                                }
                                            />
                                        </>
                                    )}
                                </Row>
                            </Row>
                            <Row className="mb-4">
                                <Col md={12} lg={12}>
                                    <Row>
                                        <Col md={6} lg={6}>
                                            {
                                                permissionReducer && permissionReducer?.currentCompany
                                                && (
                                                    <InvoiceDetailsComponent
                                                        isOPC={isOPC}
                                                        opcDetail={opcDetail}
                                                        paramsUrl={paramsUrl}
                                                        t={t}
                                                        options={invoiceTypes}
                                                        onChangeInvoiceType={(event) => {
                                                            onChangeInvoiceType(
                                                                event,
                                                                setFieldValue,
                                                                values,
                                                                invState.companyUuid,
                                                                setDefaultTax,
                                                                taxRecords
                                                            );
                                                        }}
                                                        onChangePc={(event) => {
                                                            onChangePc(
                                                                event,
                                                                setValues,
                                                                values,
                                                                invState.companyUuid
                                                            );
                                                        }}
                                                        values={values}
                                                        touched={touched}
                                                        errors={errors}
                                                        currentCompany={permissionReducer.currentCompany}
                                                        isBuyer={isBuyer}
                                                    />
                                                )
                                            }
                                            <InitialSettings
                                                t={t}
                                                values={values}
                                                opcDetail={opcDetail}
                                                touched={touched}
                                                errors={errors}
                                                isProjectOPC={isProjectOPC}
                                                currencies={currencies}
                                                setFieldValue={setFieldValue}
                                                enablePrefix={invState.enablePrefix}
                                            />
                                            <SupplierInformation
                                                t={t}
                                                disabled={false}
                                                opcDetail={opcDetail}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                                suppliers={suppliers}
                                                isOPC={isOPC}
                                                setFieldValue={setFieldValue}
                                                companyUuid={invState.companyUuid}
                                                isBuyer={isBuyer}
                                                onSelectSupplier={
                                                    (e, companyUuid) => {
                                                        onSelectSupplier(
                                                            e,
                                                            companyUuid,
                                                            setFieldValue,
                                                            values
                                                        );
                                                    }
                                                }
                                            />
                                        </Col>
                                        <Col md={6} lg={6}>
                                            <GeneralInformation
                                                t={t}
                                                disabled={false}
                                                isOPC={isOPC}
                                                opcDetail={opcDetail}
                                                setFieldValue={setFieldValue}
                                                setTouched={setTouched}
                                                handleChange={handleChange}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            {
                                isOPC
                                    ? <SummaryInvoiceTable refCb={summaryInvoiceRef} taxRecords={taxRecords} invoiceDetails={opcDetail} />
                                    : (
                                        <>
                                            {values.invoiceType === INVOICE_CONSTANTS.DO && (
                                                <HeaderSecondary
                                                    title={t("SelectDO")}
                                                    className="mb-2"
                                                />
                                            )}
                                            {values.invoiceType === INVOICE_CONSTANTS.PO && (
                                                <HeaderSecondary
                                                    title={t("SelectPO")}
                                                    className="mb-2"
                                                />
                                            )}
                                            {
                                                (values.invoiceType === INVOICE_CONSTANTS.DO)
                                                && (
                                                    <Row className="mb-4">
                                                        <Col xs={12}>
                                                            <AddedItem
                                                                borderTopColor="#fff"
                                                                defaultExpanded
                                                                gridHeight={340}
                                                                rowDataSelect={listItemSelect}
                                                                rowDataItem={rowDataItemsTypeDO}
                                                                type={values.invoiceType}
                                                                addItemManual={() => {
                                                                    addItemManual(
                                                                        rowDataItemsTypeDO,
                                                                        setRowDataItemsTypeDO,
                                                                        values.invoiceType,
                                                                        setAmountToInvoiceDO,
                                                                        setAmountToInvoicePO,
                                                                        setDirty,
                                                                        defaultTax
                                                                    );
                                                                }}
                                                                onCellValueChanged={(params) => {
                                                                    onCellValueChangedItemDO(
                                                                        params,
                                                                        rowDataItemsTypeDO,
                                                                        setInvoiceAmountDO,
                                                                        setRowDataItemsTypeDO
                                                                    );
                                                                }}
                                                                taxRecords={taxRecords}
                                                                uoms={uoms}
                                                                disabled={false}
                                                                invoiceAmount={invoiceAmountDO}
                                                                amountToInvoice={amountToInvoiceDO}
                                                                onSelectionChanged={(event) => {
                                                                    onSelectionChangedDO(
                                                                        event,
                                                                        rowDataItemsTypeDO,
                                                                        setRowDataItemsTypeDO,
                                                                        setInvoiceAmountDO,
                                                                        setAmountToInvoiceDO,
                                                                        setFieldValue,
                                                                        listItemSelect,
                                                                        setListItemSelect,
                                                                        gridApiSelectDO,
                                                                        values
                                                                    );
                                                                }}
                                                                onDeleteItem={(uuid, rowData, params) => {
                                                                    onDeleteItem(
                                                                        uuid, rowData,
                                                                        params, values,
                                                                        setRowDataItemsTypePO,
                                                                        setRowDataItemsTypeDO,
                                                                        setInvoiceAmountPO,
                                                                        setInvoiceAmountDO
                                                                    );
                                                                }}
                                                                setGridApiSelectDO={(api) => {
                                                                    setGridApiSelectDO(api);
                                                                }}
                                                                setGridApiSelectPO={(api) => {
                                                                    setGridApiSelectPO(api);
                                                                }}
                                                                values={values}
                                                                companyUuid={invState.companyUuid}
                                                                isBuyer={isBuyer}
                                                            />
                                                        </Col>
                                                    </Row>
                                                )
                                            }

                                            {
                                                (values.invoiceType === INVOICE_CONSTANTS.PO)
                                                && (
                                                    <Row className="mb-4">
                                                        <Col xs={12}>
                                                            <AddedItem
                                                                borderTopColor="#fff"
                                                                defaultExpanded
                                                                gridHeight={340}
                                                                rowDataSelect={listItemSelect}
                                                                rowDataItem={rowDataItemsTypePO}
                                                                type={values.invoiceType}
                                                                addItemManual={() => {
                                                                    addItemManual(
                                                                        rowDataItemsTypePO,
                                                                        setRowDataItemsTypePO,
                                                                        values.invoiceType,
                                                                        setAmountToInvoiceDO,
                                                                        setAmountToInvoicePO,
                                                                        setDirty,
                                                                        defaultTax
                                                                    );
                                                                }}
                                                                onCellValueChanged={(params) => {
                                                                    onCellValueChangedItemPO(
                                                                        params,
                                                                        rowDataItemsTypePO,
                                                                        setInvoiceAmountPO,
                                                                        setRowDataItemsTypePO,
                                                                        setDirty
                                                                    );
                                                                }}
                                                                taxRecords={taxRecords}
                                                                uoms={uoms}
                                                                disabled={false}
                                                                invoiceAmount={invoiceAmountPO}
                                                                amountToInvoice={amountToInvoicePO}
                                                                onSelectionChanged={(event) => {
                                                                    onSelectionChangedPO(
                                                                        event,
                                                                        rowDataItemsTypePO,
                                                                        setRowDataItemsTypePO,
                                                                        setInvoiceAmountPO,
                                                                        setAmountToInvoicePO,
                                                                        setFieldValue,
                                                                        listItemSelect,
                                                                        setListItemSelect,
                                                                        gridApiSelectPO,
                                                                        values
                                                                    );
                                                                }}
                                                                onDeleteItem={(uuid, rowData, params) => {
                                                                    onDeleteItem(
                                                                        uuid, rowData,
                                                                        params, values,
                                                                        setRowDataItemsTypePO,
                                                                        setRowDataItemsTypeDO,
                                                                        setInvoiceAmountPO,
                                                                        setInvoiceAmountDO
                                                                    );
                                                                }}
                                                                setGridApiSelectDO={(api) => {
                                                                    setGridApiSelectDO(api);
                                                                }}
                                                                setGridApiSelectPO={(api) => {
                                                                    setGridApiSelectPO(api);
                                                                }}
                                                                values={values}
                                                            />
                                                        </Col>
                                                    </Row>
                                                )
                                            }

                                            {
                                                values.invoiceType === INVOICE_CONSTANTS.NON_PO
                                                && (
                                                    <Row className="mb-4">
                                                        <Col xs={12}>
                                                            <AddedItemNonPO
                                                                borderTopColor="#fff"
                                                                defaultExpanded
                                                                gridHeight={340}
                                                                rowDataItem={rowDataItemsTypeNonPO}
                                                                addItemManual={() => {
                                                                    addItemManualTypeNonPO(
                                                                        rowDataItemsTypeNonPO,
                                                                        setRowDataItemsTypeNonPO,
                                                                        setDirty,
                                                                        defaultTax
                                                                    );
                                                                }}
                                                                onCellValueChanged={(params) => {
                                                                    onCellValueChangedItemNonPO(
                                                                        rowDataItemsTypeNonPO,
                                                                        setRowDataItemsTypeNonPO,
                                                                        params,
                                                                        setInvoiceAmountNonPO,
                                                                        setDirty
                                                                    );
                                                                }}
                                                                taxRecords={taxRecords}
                                                                uoms={uoms}
                                                                disabled={false}
                                                                onDeleteItem={(uuid, rowData, params) => {
                                                                    onDeleteItemNonPO(
                                                                        uuid,
                                                                        rowData,
                                                                        params,
                                                                        setRowDataItemsTypeNonPO,
                                                                        setInvoiceAmountNonPO
                                                                    );
                                                                }}
                                                                invoiceAmountNonPO={invoiceAmountNonPO}
                                                                values={values}
                                                            />
                                                        </Col>
                                                    </Row>
                                                )
                                            }
                                        </>
                                    )
                            }
                            <HeaderSecondary
                                title={t("Conversations")}
                                className="mb-2"
                            />
                            {
                                isBuyer
                                && (
                                    <Row className="mb-2">
                                        <Col xs={12}>
                                            <Conversation
                                                title={t("InternalConversations")}
                                                activeTab={invState.activeInternalTab}
                                                setActiveTab={(idx) => {
                                                    setInvState((prevStates) => ({
                                                        ...prevStates,
                                                        activeInternalTab: idx
                                                    }));
                                                }}
                                                sendConversation={
                                                    (comment) => sendCommentConversation(
                                                        comment, true
                                                    )
                                                }
                                                addNewRowAttachment={() => addNewRowAttachment(
                                                    true
                                                )}
                                                rowDataConversation={
                                                    invState.rowDataInternalConversation
                                                }
                                                rowDataAttachment={
                                                    invState.rowDataInternalAttachment
                                                }
                                                onDeleteAttachment={
                                                    (uuid, rowData) => onDeleteAttachment(
                                                        uuid, rowData, true
                                                    )
                                                }
                                                onAddAttachment={
                                                    (e,
                                                        uuid,
                                                        rowData) => onAddAttachmentConversation(
                                                        e, uuid, rowData, true
                                                    )
                                                }
                                                onCellEditingStopped={
                                                    (params) => onCellEditingStopped(params, true)
                                                }
                                                defaultExpanded
                                            />
                                        </Col>
                                    </Row>
                                )
                            }
                            <Row className="mb-4">
                                <Col xs={12}>
                                    <Conversation
                                        title={t("ExternalConversations")}
                                        activeTab={invState.activeExternalTab}
                                        setActiveTab={(idx) => {
                                            setInvState((prevStates) => ({
                                                ...prevStates,
                                                activeExternalTab: idx
                                            }));
                                        }}
                                        sendConversation={
                                            (comment) => sendCommentConversation(comment, false)
                                        }
                                        addNewRowAttachment={() => addNewRowAttachment(false)}
                                        rowDataConversation={
                                            invState.rowDataExternalConversation
                                        }
                                        rowDataAttachment={
                                            invState.rowDataExternalAttachment
                                        }
                                        onDeleteAttachment={
                                            (uuid, rowData) => onDeleteAttachment(
                                                uuid, rowData, false
                                            )
                                        }
                                        onAddAttachment={
                                            (e, uuid, rowData) => onAddAttachmentConversation(
                                                e, uuid, rowData, false
                                            )
                                        }
                                        onCellEditingStopped={
                                            (params) => onCellEditingStopped(params, false)
                                        }
                                        defaultExpanded
                                        borderTopColor="#A9A2C1"
                                    />
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("AuditTrail")}
                                className="mb-2"
                            />
                            <Row className="mb-5">
                                <Col xs={12}>
                                    <AuditTrail
                                        rowData={invState.rowDataAuditTrail}
                                        onGridReady={(params) => {
                                            params.api.sizeColumnsToFit();
                                        }}
                                        paginationPageSize={10}
                                        gridHeight={350}
                                        defaultExpanded
                                    />
                                </Col>
                            </Row>

                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-between">
                                    <Button
                                        color="secondary"
                                        onClick={() => history.goBack()}
                                    >
                                        {t("Back")}
                                    </Button>
                                    <Row className="mx-0">
                                        <Button
                                            style={{
                                                border: "1px solid #7b7b7b7b",
                                                padding: "2px 8px",
                                                background: "#fff",
                                                height: 36
                                            }}
                                            className="text-secondary mr-2"
                                            type="button"
                                            onClick={previewModalRef?.current?.toggle}
                                            disabled={!enablePreviewInvoice(
                                                values, getItemList(values)
                                            )}
                                        >
                                            {t("PreviewInvoice")}
                                        </Button>
                                        {isOPC
                                            ? (
                                                <Button
                                                    color="primary"
                                                    type="button"
                                                    onClick={
                                                        () => {
                                                            handleSubmit();
                                                            if (!dirty || (dirty && Object.keys(errors).length)) {
                                                                showToast("error", "Validation error, please check your input.");
                                                                return;
                                                            }

                                                            onCreateInvoice(values);
                                                        }
                                                    }
                                                >
                                                    {t("Create")}
                                                </Button>
                                            )
                                            : (
                                                <Button
                                                    color="primary"
                                                    type="button"
                                                    onClick={
                                                        () => {
                                                            handleSubmit();

                                                            if (!dirty
                                                                || (dirty && Object.keys(errors).length)) {
                                                                showToast("error", "Validation error, please check your input.");
                                                                return;
                                                            }

                                                            onIssuePressHandler(values);
                                                        }
                                                    }
                                                    disabled={
                                                        !!Number(getBalanceWithExceptedValue(
                                                            values,
                                                            invoiceAmountDO,
                                                            invoiceAmountPO,
                                                            invoiceAmountNonPO
                                                        ).value.toFixed(2))
                                                    }
                                                >
                                                    {t("Issue")}
                                                </Button>
                                            )}

                                    </Row>
                                </Row>
                            </StickyFooter>
                            <InvoicePreviewModal
                                ref={previewModalRef}
                                isBuyer={isBuyer}
                                data={values}
                                currentCompany={permissionReducer?.currentCompany}
                                buyerOrSupplier={selectedBuyerOrSupplier}
                                itemList={getItemList(values)}
                            />
                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
        </Container>
    );
};
export default CreateInvoice;
