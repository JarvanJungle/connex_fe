/* eslint-disable max-len */
import React, {
    useState, useEffect, useRef, useMemo
} from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import useToast from "routes/hooks/useToast";
import { useApprovalConfig } from "routes/hooks";
import useAttachment from "routes/hooks/useAttachment";
import useConversation from "routes/hooks/useConversation";
import useBudgetDetails from "routes/hooks/useBudgetDetails";
import useCustomState from "routes/hooks/useCustomState";
import { useAuditTrail, usePermission } from "routes/hooks";
import { Formik, Form } from "formik";
import {
    Container, Row, Col, Button, ButtonToolbar, Input
} from "components";
import {
    AuditTrail, BudgetDetails, Conversation, AddItemDialog, HeaderMain,
    CommonConfirmDialog
} from "routes/components";
import { v4 as uuidv4 } from "uuid";
import CatalogueService from "services/CatalogueService";
import CurrenciesService from "services/CurrenciesService";
import ExtVendorService from "services/ExtVendorService";
import AddressDataService from "services/AddressService";
import UOMDataService from "services/UOMService";
import TaxRecordDataService from "services/TaxRecordService";
import RequestForQuotationService from "services/RequestForQuotationService";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { useSelector } from "react-redux";
import _ from "lodash";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import {
    formatDateTime, convertToLocalTime, convertDate2String, isNullOrUndefinedOrEmpty,
    formatDateString, getCurrentCompanyUUIDByStore, roundNumberWithUpAndDown
} from "helper/utilities";
import ConversationService from "services/ConversationService/ConversationService";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import { CatalogueItemColDefs, ForecastItemColDefs } from "routes/P2P/PrePurchaseOrder/ColumnDefs";
import ActionModal from "routes/components/ActionModal";
import classNames from "classnames";
import UserService from "services/UserService";
import {
    InitialSettings, VendorInformation, GeneralInformation,
    RequestTerms, AddItems, RaiseRequisition, Comparison
} from "../../components/Buyer";
import {
    itemsSchema, rfqFormSchema, RFQ_CONSTANTS, convertActionAuditTrail
} from "../../helper";
import { useAddItems, useViewQuotations, useNegotiation } from "../../hooks";
import RFQ_ROUTES from "../../routes";
import Footer from "./Footer";
import ShortListSelectVendors from "./ShortListSelectVendors";

const RFQDetailsBuyer = () => {
    const showToast = useToast();
    const showToastError = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userPermission } = permissionReducer;
    const { userDetails } = authReducer;
    const rfqPermission = usePermission(FEATURE.RFQF);
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
    const [activeInternalTab, setActiveInternalTab] = useState(1);
    const [activeExternalTab, setActiveExternalTab] = useState(1);
    const [
        rowDataProject, rowDataTrade, ,
        getBudgetDetailsByProjectCode
    ] = useBudgetDetails();
    const modalRef = useRef();
    const modalCancelRef = useRef();
    const [isConvertPR, setIsConvertPR] = useState(false);
    const [prevVendors, setPrevVendors] = useState([]);
    const [contactPersons, setContactPersons] = useState({});
    const [rfqUuid, setRFQUuid] = useState("");
    const [companyUuid, setCompanyUuid] = useState("");
    const [rfqDetails, setRFQDetails] = useCustomState({});
    const [vendors, setVendors] = useCustomState([]);
    const [uoms, setUOMs] = useCustomState([]);
    const [taxRecords, setTaxRecords] = useCustomState([]);
    const [currencies, setCurrencies] = useCustomState([]);
    const [addresses, setAddresses] = useCustomState([]);
    const [approvalRoutes, setApprovalRoutes] = useCustomState([]);
    const [showAddCatalogue, setShowAddCatalogue] = useState(false);
    const [selectedCatalogueItems, setSelectedCatalogueItems] = useState([]);
    const [showAddForecast, setShowAddForecast] = useState(false);
    const [selectedForecastItems, setSelectedForecastItems] = useState([]);
    const [gridApi, addItemActions] = useAddItems({ setDirtyFunc: setDirty });
    const [
        gridApiViewQuotations, comparisonColDefs,
        suppliersData, pinnedBottomRowData, viewQuotationsActions
    ] = useViewQuotations({
        setDirtyFunc: setDirty
    });
    const [internalAttachments, externalAttachments, attachmentActions] = useAttachment({
        setDirtyFunc: setDirty,
        defaultValue: []
    });
    const [currentSupplier, negotiations, negotiationActions] = useNegotiation({
        setDirtyFunc: setDirty,
        defaultValue: []
    });
    const [internalConversations, externalConversations, conversationActions] = useConversation();
    const [auditTrails, setAuditTrails] = useAuditTrail([]);
    const [typeOfRequisitions, setTypeOfRequisitions] = useState([]);
    const [rfqStates] = useState({
        natureOfRequisitions: [
            { label: "Project", value: true },
            { label: "Non-Project", value: false }
        ],
        procurementTypes: [
            { label: "Goods", value: "Goods" },
            { label: "Service", value: "Service" }
        ],
        rfqTypes: [
            { label: "One-off quotation", value: "One-off" },
            { label: "Contract", value: "Contract" }
        ]
    });
    const [navItemSuppliers, setNavItemSuppliers] = useState([]);
    const [activeTabComparisons, setActiveTabComparisons] = useState(1);
    const [viewQuotations, setViewQuotations] = useState(false);
    const [quotedItems, setQuotedItems] = useState([]);
    const [rfqItems, setRFQItems] = useState([]);
    const [validationSchema, setValidationSchema] = useState(null);
    const [reason, setReason] = useState("");
    const [showReason, setShowReason] = useState(false);
    const [showErrorReason, setShowErrorReason] = useState(false);
    const [supplierUuids, setSupplierUuids] = useState([]);
    const [projectCode, setProjectCode] = useState("");
    const [quoted, setQuoted] = useState(false);
    const approvalConfig = useApprovalConfig(FEATURE.RFQF);
    const [gridApis, setGridApis] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showSelectVendors, setShowSelectVendors] = useState(false);
    const [showErrorSelectVendors, setShowErrorSelectVendors] = useState(false);
    const [listNonVendors, setListNonVendors] = useState([]);

    const initialValues = {
        approvalConfig: false,
        isUpdate: true,
        isEdit: false,
        // Raise Requisition Form
        requisitionType: "",
        pprNumber: "",
        pprUuid: "",
        project: false,
        projectCode: "",
        projectUuid: "",
        rfqProcess: true,
        // Initial Settings Form
        rfqNumber: "",
        rfqStatus: "",
        currencyCode: "",
        // Vendor Information Form
        vendors: [],
        // General Information Form
        rfqTitle: "",
        procurementType: "",
        requester: "",
        submittedDate: "",
        approvalRouteUuid: "",
        // Request Terms Form
        rfqType: "",
        validityStartDate: "",
        validityEndDate: "",
        dueDate: "",
        deliveryAddress: "",
        deliveryDate: "",
        note: "",
        // non Vendor shortList
        listNonVendors: []
    };

    const getTypeOfRequisitions = () => {
        const permissionUser = userPermission[permissionReducer.featureBasedOn];
        const listTypeOfRequisition = [];
        if (permissionUser) {
            permissionUser.features.forEach((item) => {
                if (
                    [FEATURE.PR, FEATURE.WR, FEATURE.VR, FEATURE.BC, FEATURE.DWR].indexOf(item.featureCode) > -1
                    && !listTypeOfRequisition.find(({ value }) => value === item.featureCode)
                ) {
                    listTypeOfRequisition.push({
                        label: item.feature.featureName,
                        value: item.featureCode
                    });
                }
            });
        }
        return listTypeOfRequisition;
    };

    const initData = async (currentCompanyUuid) => {
        try {
            const query = new URLSearchParams(location.search);
            const uuid = query.get("uuid");
            negotiationActions.setRFQUuid(uuid);
            const status = query.get("status");
            const isGetAddress = (
                status === RFQ_CONSTANTS.PENDING_ISSUE
                || status === RFQ_CONSTANTS.PENDING_QUOTATION
                || status === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS
            );
            const response = await Promise.allSettled([
                CurrenciesService.getCurrencies(currentCompanyUuid),
                ExtVendorService.getExternalVendors(currentCompanyUuid),
                isGetAddress && AddressDataService.getCompanyAddresses(currentCompanyUuid),
                UOMDataService.getUOMRecords(currentCompanyUuid),
                TaxRecordDataService.getTaxRecords(currentCompanyUuid),
                RequestForQuotationService.getRFQDetails(currentCompanyUuid, uuid, true),
                ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                    currentCompanyUuid, FEATURE.RFQF
                )
            ]);
            const [
                responseCurrencies,
                responseSuppliers,
                responseAddresses,
                responseUOMs,
                responseTaxRecords,
                responseRFQDetails,
                responseApprovalRoutes
            ] = response;
            setCurrencies(
                responseCurrencies,
                {
                    isResponse: true,
                    filter: { condition: { active: true } },
                    sort: { key: "currencyName" }
                }
            );
            setVendors(
                responseSuppliers,
                {
                    isResponse: true,
                    filter: { condition: { seller: true } },
                    sort: { key: "companyName" }
                }
            );
            setAddresses(
                responseAddresses,
                {
                    isResponse: true,
                    filter: { condition: { active: true } },
                    sort: { key: "addressLabel" }
                }
            );
            setUOMs(
                responseUOMs,
                {
                    isResponse: true,
                    filter: { condition: { active: true } }
                }
            );
            setTaxRecords(
                responseTaxRecords,
                {
                    isResponse: true,
                    filter: { condition: { active: true } }
                }
            );
            setRFQDetails(
                responseRFQDetails,
                { isResponse: true }
            );
            setApprovalRoutes(
                responseApprovalRoutes,
                { isResponse: true }
            );
            setRFQUuid(uuid);
            setCompanyUuid(currentCompanyUuid);
            setTypeOfRequisitions(getTypeOfRequisitions());
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const getBudgetDetails = async (code) => {
        try {
            setProjectCode(code);
            await getBudgetDetailsByProjectCode(companyUuid, code);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onAddNewItemCatalogue = (values) => {
        setDirty();
        let address;
        if (values.deliveryAddress) {
            address = addresses.find((item) => item.uuid === values.deliveryAddress);
        }
        setShowAddCatalogue(false);

        const newRowData = [];
        selectedCatalogueItems.forEach((node) => {
            const { data } = node;

            const sourceCurrency = currencies.find(
                (item) => item.currencyCode.toLowerCase() === data.currencyCode.toLowerCase()
            );

            let exchangeRate = 0;
            if (sourceCurrency) {
                exchangeRate = sourceCurrency.exchangeRate;
            }

            const itemAdded = {
                uuid: uuidv4(),
                itemCode: data.catalogueItemCode,
                itemName: data.catalogueItemName,
                itemCategory: data?.categoryDto?.categoryName,
                itemCategoryUuid: data?.categoryDto?.uuid,
                itemDescription: data.description,
                itemModel: data.itemModel || "",
                itemSize: data.itemSize || "",
                itemBrand: data.itemBrand || "",
                uom: uoms.find(
                    (item) => item.uomCode.toLowerCase() === data.uomCode.toLowerCase()
                ),
                itemQuantity: data.itemQuantity,
                sourceCurrency,
                editableCurrency: !sourceCurrency,
                itemUnitPrice: data.unitPrice,
                editableUnitPrice: !Number(data.unitPrice),
                exchangeRate,
                taxCode: taxRecords.find(
                    (item) => item.taxCode.toLowerCase() === data.taxCode?.toLowerCase()
                ),
                taxRate: data.taxRate,
                note: "",
                address: address || addresses[0],
                requestedDeliveryDate: values.deliveryDate
                    ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                    : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
                manualItem: false
            };
            newRowData.push(itemAdded);
        });
        gridApi?.applyTransaction({ add: newRowData });
        setSelectedCatalogueItems([]);
    };

    const onAddNewItemForecast = (values) => {
        setDirty();
        let address;
        if (values.deliveryAddress) {
            address = addresses.find((item) => item.uuid === values.deliveryAddress);
        }
        const newRowData = [];
        setShowAddForecast(false);
        selectedForecastItems.forEach((node) => {
            const { data } = node;

            const sourceCurrency = currencies.find(
                (item) => item.currencyCode.toLowerCase() === data.currencyCode.toLowerCase()
            );

            let exchangeRate = 0;
            if (sourceCurrency) {
                exchangeRate = sourceCurrency.exchangeRate;
            }
            const itemRequest = {
                uuid: uuidv4(),
                itemCode: data.catalogueItemCode,
                itemName: data.catalogueItemName,
                itemCategory: data?.categoryDto?.categoryName,
                itemCategoryUuid: data?.categoryDto?.uuid,
                itemDescription: data.description,
                itemModel: data.itemModel || "",
                itemSize: data.itemSize || "",
                itemBrand: data.itemBrand || "",
                uom: uoms.find(
                    (item) => item.uomCode.toLowerCase() === data.uomCode.toLowerCase()
                ),
                itemQuantity: data.itemQuantity,
                sourceCurrency,
                editableCurrency: !sourceCurrency,
                itemUnitPrice: values.project
                    ? data?.forecast?.itemUnitPrice ?? data.unitPrice
                    : data.unitPrice,
                editableUnitPrice: !Number(data.unitPrice),
                exchangeRate,
                taxCode: taxRecords.find(
                    (item) => item.taxCode.toLowerCase() === data.taxCode?.toLowerCase()
                ),
                taxRate: data.taxRate,
                note: "",
                address: address || addresses[0],
                requestedDeliveryDate: values.deliveryDate
                    ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                    : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
                projectForecastTradeCode: data?.forecast?.tradeCode,
                manualItem: false
            };

            newRowData.push(itemRequest);
        });
        gridApi?.applyTransaction({ add: newRowData });
        setSelectedForecastItems([]);
    };

    const validateItems = (items = []) => {
        // Not allow item with same itemCode
        const itemCodes = items.map(({ itemCode }) => itemCode);
        if ([...(new Set(itemCodes))].length !== items.length) throw new Error("Duplicated item found");
    };

    const mappingBody = async (values) => {
        try {
            const addressItem = addresses.find((item) => item.uuid === values.deliveryAddress);
            const deliveryAddress = {
                addressLabel: addressItem.addressLabel,
                addressFirstLine: addressItem.addressFirstLine,
                addressSecondLine: addressItem.addressSecondLine,
                city: addressItem.city,
                state: addressItem.state,
                country: addressItem.country,
                postalCode: addressItem.postalCode
            };
            const deliveryDate = convertToLocalTime(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss);
            const validityStartDate = convertToLocalTime(values.validityStartDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss);
            const validityEndDate = convertToLocalTime(values.validityEndDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss);
            const dueDate = formatDateString(values.dueDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss);
            const body = {
                uuid: rfqUuid,
                pprUuid: values.pprUuid,
                project: String(values.project) === "true",
                currencyCode: values.currencyCode,
                projectCode: values.projectCode,
                projectUuid: values.projectUuid,
                rfqTitle: values.rfqTitle,
                rfqType: values.rfqType,
                procurementType: values.procurementType,
                note: values.note,
                validityStartDate,
                validityEndDate,
                dueDate,
                rfqItemDtoList: [],
                rfqDocumentMetaDataDtoList: [],
                rfqVendorDtoList: [],
                deliveryAddress,
                deliveryDate
            };

            // rfqItemDtoList
            const rowDataItems = addItemActions.getRowDataItems();
            body.rfqItemDtoList = rowDataItems.map((rowItem) => {
                const address = {
                    addressLabel: rowItem?.address?.addressLabel,
                    addressFirstLine: rowItem?.address?.addressFirstLine,
                    addressSecondLine: rowItem?.address?.addressSecondLine,
                    city: rowItem?.address?.city,
                    state: rowItem?.address?.state,
                    country: rowItem?.address?.country,
                    postalCode: rowItem?.address?.postalCode
                };
                const sourceCurrency = typeof rowItem?.sourceCurrency === "string"
                    ? rowItem?.sourceCurrency
                    : rowItem?.sourceCurrency.currencyCode;
                const exchangeRate = rowItem?.sourceCurrency?.exchangeRate
                    ?? rowItem?.exchangeRate
                    ?? 1;
                const uom = typeof rowItem?.uom === "string"
                    ? rowItem?.uom
                    : rowItem?.uom.uomCode;
                const requestedDeliveryDate = convertToLocalTime(
                    rowItem?.requestedDeliveryDate,
                    CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                );
                return {
                    itemCode: rowItem.itemCode,
                    itemName: rowItem.itemName,
                    itemCategory: rowItem.itemCategory,
                    itemCategoryUuid: rowItem.itemCategoryUuid,
                    itemDescription: rowItem.itemDescription,
                    itemModel: rowItem.itemModel,
                    itemSize: rowItem.itemSize,
                    itemBrand: rowItem.itemBrand,

                    sourceCurrency,
                    exchangeRate,
                    uom,
                    itemUnitPrice: Number(rowItem.itemUnitPrice || 0),
                    itemQuantity: Number(rowItem.itemQuantity || 0),
                    address,
                    requestedDeliveryDate,
                    note: rowItem.note,
                    projectForecastTradeCode: rowItem.projectForecastTradeCode,
                    manualItem: rowItem.manualItem
                };
            });
            validateItems(body.rfqItemDtoList);
            await itemsSchema.validate(body.rfqItemDtoList);

            // rfqDocumentMetaDataDtoList
            const documents = await attachmentActions.getNewAttachments();
            if (!Array.isArray(documents)) return documents;
            body.rfqDocumentMetaDataDtoList = documents;

            // rfqVendorDtoList
            values.vendors.forEach((vendor) => {
                if (vendor.isNew) {
                    body.rfqVendorDtoList.push({
                        nonVendorCompanyName: vendor.supplierName,
                        contactPersonName: vendor.contactPersonName,
                        contactPersonEmail: vendor.contactPersonEmail
                    });
                } else {
                    body.rfqVendorDtoList.push({
                        supplierUuid: vendor.supplierUuid,
                        contactPersonName: vendor.contactPersonName,
                        contactPersonEmail: vendor.contactPersonEmail
                    });
                }
            });

            if (!body.pprUuid) delete body.pprUuid;
            if (!body.project) {
                delete body.projectCode;
                delete body.projectUuid;
            }

            return body;
        } catch (error) {
            return error.message;
        }
    };

    const mappingBodyUpdate = async (values) => {
        const addressItem = addresses.find((item) => item.uuid === values.deliveryAddress);
        const deliveryAddress = {
            addressLabel: addressItem.addressLabel,
            addressFirstLine: addressItem.addressFirstLine,
            addressSecondLine: addressItem.addressSecondLine,
            city: addressItem.city,
            state: addressItem.state,
            country: addressItem.country,
            postalCode: addressItem.postalCode
        };
        const deliveryDate = convertToLocalTime(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss);
        const validityStartDate = convertToLocalTime(values.validityStartDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss);
        const validityEndDate = convertToLocalTime(values.validityEndDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss);
        const dueDate = formatDateString(values.dueDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss);
        const body = {
            uuid: rfqUuid,
            rfqTitle: values.rfqTitle,
            note: values.note,
            validityStartDate,
            validityEndDate,
            dueDate,
            rfqItemDtoList: [],
            rfqDocumentMetaDataDtoList: [],
            newlyAddedVendors: [],
            rfqQuoteItemDtoList: [],
            deliveryAddress,
            deliveryDate
        };

        // rfqItemDtoList
        const rowDataItems = addItemActions.getRowDataItems();
        body.rfqItemDtoList = rowDataItems.map((rowItem) => {
            const address = {
                addressLabel: rowItem?.address?.addressLabel,
                addressFirstLine: rowItem?.address?.addressFirstLine,
                addressSecondLine: rowItem?.address?.addressSecondLine,
                city: rowItem?.address?.city,
                state: rowItem?.address?.state,
                country: rowItem?.address?.country,
                postalCode: rowItem?.address?.postalCode
            };
            const sourceCurrency = typeof rowItem?.sourceCurrency === "string"
                ? rowItem?.sourceCurrency
                : rowItem?.sourceCurrency.currencyCode;
            const uom = typeof rowItem?.uom === "string"
                ? rowItem?.uom
                : rowItem?.uom.uomCode;
            const requestedDeliveryDate = convertToLocalTime(
                rowItem?.requestedDeliveryDate,
                CUSTOM_CONSTANTS.YYYYMMDDHHmmss
            );
            return {
                id: rowItem.id,
                itemCode: rowItem.itemCode,
                itemName: rowItem.itemName,
                itemDescription: rowItem.itemDescription,
                itemModel: rowItem.itemModel,
                itemSize: rowItem.itemSize,
                itemBrand: rowItem.itemBrand,
                sourceCurrency,
                uom,
                itemUnitPrice: Number(rowItem.itemUnitPrice || 0),
                itemQuantity: Number(rowItem.itemQuantity || 0),
                address,
                requestedDeliveryDate,
                note: rowItem.note,
                projectForecastTradeCode: rowItem.projectForecastTradeCode,
                manualItem: rowItem.manualItem
            };
        });

        // rfqDocumentMetaDataDtoList
        const documents = await attachmentActions.getNewAttachments();
        if (!Array.isArray(documents)) throw new Error(documents);
        body.rfqDocumentMetaDataDtoList = documents;

        // newlyAddedVendors
        values.vendors.forEach((vendor) => {
            if (!prevVendors.includes(vendor.supplierUuid)) {
                // body.newlyAddedVendors.push({
                //     supplierUuid: vendor.supplierUuid,
                //     contactPersonName: vendor.contactPersonName,
                //     contactPersonEmail: vendor.contactPersonEmail
                // });
                if (vendor.isNew) {
                    body.newlyAddedVendors.push({
                        nonVendorCompanyName: vendor.supplierName,
                        contactPersonName: vendor.contactPersonName,
                        contactPersonEmail: vendor.contactPersonEmail
                    });
                } else {
                    body.newlyAddedVendors.push({
                        supplierUuid: vendor.supplierUuid,
                        contactPersonName: vendor.contactPersonName,
                        contactPersonEmail: vendor.contactPersonEmail
                    });
                }
            }
        });

        // rfqQuoteItemDtoList
        const supplierQuotes = suppliersData.map((item) => item.rowData);
        const rowDataQuotes = supplierQuotes.reduce((arr, item) => [...arr, ...item], []);
        rowDataQuotes.forEach((rowData) => {
            if (rowData.itemCode.length === 1) {
                body.rfqQuoteItemDtoList.push({
                    quoteUuid: rowData.quoteUuid,
                    rfqItemId: rowData.id,
                    exchangeRate: rowData.exchangeRate
                });
            }
        });

        if (!body.pprUuid) delete body.pprUuid;
        if (!body.project) {
            delete body.projectCode;
            delete body.projectUuid;
        }

        return body;
    };

    const mappingBodyShortlist = async (values) => {
        try {
            const body = {
                uuid: rfqUuid,
                approvalRouteUuid: values.approvalRouteUuid,
                shortListRfqItemDtoList: [],
                newlyAddedDocumentList: [],
                vendorList: []
            };
            if (!body.approvalRouteUuid) delete body.approvalRouteUuid;

            // shortListRfqItemDtoList
            const rowDataItems = viewQuotationsActions.getRowDataItems();
            rowDataItems.forEach((item) => {
                navItemSuppliers.forEach((supplier, index) => {
                    if (item[`quoteUuid${index}`]
                        && item[`selected${index}`]
                    ) {
                        body.shortListRfqItemDtoList.push({
                            rfqItemId: item.id,
                            awardedQty: Number(item[`awardedQty${index}`] || 0),
                            quoteUuid: item[`quoteUuid${index}`],
                            itemQuantity: Number(item.itemQuantity || 0)
                        });
                        body.vendorList.push(values?.vendors[index]);
                    }
                });
            });

            const groupByItemId = _.groupBy(body.shortListRfqItemDtoList, "rfqItemId");
            const groupByQuoteUuid = _.groupBy(body.shortListRfqItemDtoList, "quoteUuid");
            let hasError1 = false;
            let hasError2 = false;
            Object.keys(groupByItemId).forEach((key) => {
                const group = groupByItemId[key];
                if (group.length > 0) {
                    const { itemQuantity } = group[0];
                    const sumAwardedQty = group.reduce((sum, item) => sum + roundNumberWithUpAndDown(item.awardedQty), 0);
                    if (sumAwardedQty > itemQuantity) hasError1 = true;
                }
            });
            Object.keys(groupByQuoteUuid).forEach((key) => {
                const group = groupByQuoteUuid[key];
                if (group.length > 0) {
                    const sumAwardedQty = group.reduce((sum, item) => sum + roundNumberWithUpAndDown(item.awardedQty), 0);
                    if (sumAwardedQty === 0) hasError2 = true;
                }
            });
            if (hasError1 === true) {
                throw new Error("Sum of Awarded Qty of each item cannot be greater than Requested Quantity");
            }
            if (hasError2 === true || Object.keys(groupByItemId).length === 0) {
                throw new Error("All items must have awarded quantity. Please recheck");
            }

            body.shortListRfqItemDtoList = body.shortListRfqItemDtoList.map(
                ({ itemQuantity, ...rest }) => rest
            );

            // newlyAddedDocumentList
            const documents = await attachmentActions.getNewAttachments();
            if (!Array.isArray(documents)) throw new Error(documents);
            body.newlyAddedDocumentList = documents;

            return body;
        } catch (error) {
            return error.message;
        }
    };

    const mappingBodyRecall = async () => {
        try {
            const body = {
                uuid: rfqUuid,
                newlyAddedDocumentList: []
            };

            // newlyAddedDocumentList
            const documents = await attachmentActions.getNewAttachments();
            if (!Array.isArray(documents)) throw new Error(documents);
            body.newlyAddedDocumentList = documents;

            return body;
        } catch (error) {
            return error.message;
        }
    };

    const mappingBodyReopen = async (values) => {
        try {
            const body = {
                uuid: rfqUuid,
                dueDate: formatDateString(
                    values.dueDate,
                    CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                newlyAddedDocumentList: []
            };

            // newlyAddedDocumentList
            const documents = await attachmentActions.getNewAttachments();
            if (!Array.isArray(documents)) throw new Error(documents);
            body.newlyAddedDocumentList = documents;

            return body;
        } catch (error) {
            return error.message;
        }
    };

    const onSavePressHandler = async (values) => {
        setPristine();
        try {
            const body = await mappingBody(values);
            if (!(typeof body === "object")) throw new Error(body);
            const response = await RequestForQuotationService.saveAsDraftRFQ(companyUuid, body);
            const { data, message, status } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                try {
                    conversationActions.postConversation(data, companyUuid);
                } catch (error) {}
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onSendToVendorsPressHandler = async (values) => {
        setPristine();
        try {
            const body = await mappingBody(values);
            if (!(typeof body === "object")) throw new Error(body);
            const response = await RequestForQuotationService.submitRFQ(companyUuid, body);
            const { data, message, status } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                try {
                    conversationActions.postConversation(data, companyUuid);
                } catch (error) {}

                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onUpdatePressHandler = async (values) => {
        setPristine();
        try {
            const body = await mappingBodyUpdate(values);
            const response = await RequestForQuotationService.editRFQ(companyUuid, rfqUuid, body);
            const { message, status } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                try {
                    conversationActions.postConversation(rfqUuid, companyUuid);
                } catch (error) {}

                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onCloseRFQPressHandler = async () => {
        setPristine();
        try {
            const body = {
                uuid: rfqUuid,
                newlyAddedDocumentList: []
            };
            const documents = await attachmentActions.getNewAttachments();
            if (!Array.isArray(documents)) throw new Error(documents);
            body.newlyAddedDocumentList = documents;

            const response = await RequestForQuotationService.closeRFQ(companyUuid, body);
            const { message, status } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                try {
                    conversationActions.postConversation(rfqUuid, companyUuid);
                } catch (error) {}

                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onCancelRFQPressHandler = async () => {
        setPristine();
        try {
            const response = await RequestForQuotationService.cancelRFQ(companyUuid, rfqUuid);
            const { message, status } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                try {
                    conversationActions.postConversation(rfqUuid, companyUuid);
                } catch (error) {}

                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onShortlistRFQPressHandler = async (values) => {
        setPristine();
        try {
            const body = await mappingBodyShortlist(values);
            if (!(typeof body === "object")) throw new Error(body);
            delete body.vendorList;
            const response = await RequestForQuotationService.shortlistRFQ(
                companyUuid, body
            );
            const { message, status } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                try {
                    conversationActions.postConversation(rfqUuid, companyUuid);
                } catch (error) {}
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onRecallPressHandler = async () => {
        setShowReason(false);
        setShowErrorReason(true);
        if (!reason) return;
        setPristine();
        try {
            const body = await mappingBodyRecall();
            if (!(typeof body === "object")) throw new Error(body);
            const response = await RequestForQuotationService.recallRFQ(
                companyUuid, body
            );
            const { message, status } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                try {
                    conversationActions.postConversation(
                        rfqUuid, companyUuid,
                        null, { text: reason, isInternal: true }
                    );
                } catch (error) {}

                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onSendBackPressHandler = async () => {
        setShowReason(false);
        setShowErrorReason(true);
        if (!reason) return;
        setPristine();
        try {
            const body = await mappingBodyRecall();
            if (!(typeof body === "object")) throw new Error(body);
            const response = await RequestForQuotationService.sendBackRFQ(
                companyUuid, body
            );
            const { message, status } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                try {
                    conversationActions.postConversation(
                        rfqUuid, companyUuid,
                        null, { text: reason, isInternal: true }
                    );
                } catch (error) {}

                showToast("success", "Your RFQ has been successfully sent back");
                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onApprovePressHandler = async () => {
        setPristine();
        try {
            const body = await mappingBodyRecall();
            if (!(typeof body === "object")) throw new Error(body);
            const response = await RequestForQuotationService.approveRFQ(
                companyUuid, body
            );
            const { message, status } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                try {
                    conversationActions.postConversation(rfqUuid, companyUuid);
                } catch (error) {}

                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onConvertToPOPressHandler = async (setFieldValue) => {
        setPristine();
        try {
            const { quoteDtoList, rfqType } = rfqDetails;
            const nonVendors = [];
            quoteDtoList.forEach((item) => {
                if (isNullOrUndefinedOrEmpty(item.supplierUuid) && item?.quoteItemDtoList[0]?.awardedQty > 0) {
                    nonVendors.push({ supplierCompanyName: item.supplierCompanyName, code: "" });
                }
            });
            setFieldValue("listNonVendors", nonVendors);
            if (nonVendors.length > 0) {
                setShowSelectVendors(true);
            } else {
                const vendorUuids = quoteDtoList.filter((quoteItem) => quoteItem?.supplierUuid).map((item) => item?.supplierUuid);
                const documents = await attachmentActions.getNewAttachments();
                if (!Array.isArray(documents)) throw new Error(documents);
                const promises = vendorUuids.map((vendorUuid) => RequestForQuotationService.convertRFQToPO(
                    companyUuid, rfqUuid, vendorUuid, rfqType, { documentMetaDataDtoList: documents || [] }
                ));
                const responses = await Promise.allSettled(promises);
                const successMessages = [];
                const errorMessages = [];
                responses.forEach((responseData) => {
                    if (responseData?.status === RESPONSE_STATUS.FULFILLED) {
                        const { value } = responseData;
                        const { status, message } = value && value.data;
                        if (status === RESPONSE_STATUS.OK) {
                            successMessages.push(message);
                        } else {
                            errorMessages.push(message);
                        }
                    } else {
                        const { response } = responseData && responseData.reason;
                        if (response) {
                            errorMessages.push(response.data?.message || response.data?.error);
                        }
                        if (!response) {
                            errorMessages.push(responseData?.reason?.message ?? "Error");
                        }
                    }
                });

                if (successMessages.length) {
                    showToast("success", successMessages);
                }
                if (errorMessages.length) {
                    showToastError("error", errorMessages);
                }
                try {
                    conversationActions.postConversation(rfqUuid, companyUuid);
                } catch (error) {}

                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const handleConvert = async (values) => {
        try {
            const { quoteDtoList, rfqType } = rfqDetails;
            const missingField = values.listNonVendors.some((item) => isNullOrUndefinedOrEmpty(item.code));
            if (missingField) {
                setShowErrorSelectVendors(true);
                return;
            }
            const vendorUuids = quoteDtoList.filter((quoteItem) => quoteItem?.supplierUuid).map((item) => ({ code: item.supplierUuid }));
            values.listNonVendors.forEach((item) => vendorUuids.push({ isMapping: true, code: item.code, name: item.supplierCompanyName }));
            const documents = await attachmentActions.getNewAttachments();
            if (!Array.isArray(documents)) throw new Error(documents);
            const promises = vendorUuids.map((vendor) => RequestForQuotationService.convertRFQToPO(
                companyUuid, rfqUuid, vendor.code, rfqType,
                vendor.isMapping ? { nonVendorCompanyName: vendor.name, documentMetaDataDtoList: documents || [] } : { documentMetaDataDtoList: documents || [] }
            ));
            const responses = await Promise.allSettled(promises);
            const successMessages = [];
            const errorMessages = [];
            responses.forEach((responseData) => {
                if (responseData?.status === RESPONSE_STATUS.FULFILLED) {
                    const { value } = responseData;
                    const { status, message } = value && value.data;
                    if (status === RESPONSE_STATUS.OK) {
                        successMessages.push(message);
                    } else {
                        errorMessages.push(message);
                    }
                } else {
                    const { response } = responseData && responseData.reason;
                    if (response) {
                        errorMessages.push(response.data?.message || response.data?.error);
                    }
                    if (!response) {
                        errorMessages.push(responseData?.reason?.message ?? "Error");
                    }
                }
            });

            if (successMessages.length) {
                showToast("success", successMessages);
                try {
                    conversationActions.postConversation(rfqUuid, companyUuid);
                } catch (error) {}
                setShowErrorSelectVendors(false);
                setShowSelectVendors(false);
                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            }
            if (errorMessages.length) {
                showToastError("error", errorMessages);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onReOpenRFQPressHandler = async (values) => {
        setPristine();
        try {
            const body = await mappingBodyReopen(values);
            if (!(typeof body === "object")) throw new Error(body);
            const response = await RequestForQuotationService.reopenRFQ(
                companyUuid, body
            );
            const { message, status } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                try {
                    conversationActions.postConversation(rfqUuid, companyUuid);
                } catch (error) {}
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const getConversation = async (pprUuid, uuid) => {
        const responses = await Promise.allSettled([
            pprUuid && ConversationService.getDetailInternalConversation(companyUuid, pprUuid),
            pprUuid && ConversationService.getDetailExternalConversation(companyUuid, pprUuid),
            uuid && ConversationService.getDetailInternalConversation(companyUuid, uuid),
            uuid && ConversationService.getDetailExternalConversation(companyUuid, uuid)
        ]);
        const [
            responseInternalConversations,
            responseExternalConversations,
            responseInternalConversationsRFQ,
            responseExternalConversationsRFQ
        ] = responses;
        conversationActions.setConversations(
            [
                responseInternalConversations,
                responseInternalConversationsRFQ
            ],
            true,
            true
        );
        conversationActions.setConversations(
            [
                responseExternalConversations,
                responseExternalConversationsRFQ
            ],
            true,
            false
        );
        setLoading(false);
    };

    const getVendorList = async (rfqVendorDtoList, setFieldValue) => {
        const vendorDtoList = [];
        const listPrevVendor = [];
        rfqVendorDtoList.forEach((element) => {
            if (element.supplierUuid) {
                const vendor = vendors.find(
                    (item) => item.uuid === element.supplierUuid
                );
                vendorDtoList.push({
                    contactPersonEmail: element.contactPersonEmail,
                    contactPersonName: element.contactPersonName,
                    supplierCompanyUuid: element.supplierCompanyUuid,
                    supplierUuid: element.supplierUuid,
                    supplierName: vendor?.companyName
                });
                listPrevVendor.push(element.supplierUuid);
            } else {
                const uuid = uuidv4();
                vendorDtoList.push({
                    supplierName: element.nonVendorCompanyName,
                    contactPersonEmail: element.contactPersonEmail,
                    contactPersonName: element.contactPersonName,
                    isNew: true,
                    supplierUuid: uuid
                });
                listPrevVendor.push(uuid);
            }
        });
        const responses = await Promise.allSettled(
            vendorDtoList.filter((item) => !item.isNew).map(
                (vendor) => ExtVendorService.getExternalVendorDetails(
                    companyUuid, vendor.supplierUuid
                )
            )
        );
        const newContactPerson = {};
        responses.forEach((response) => {
            const { value } = response;
            const { uuid, supplierUserList } = value.data.data;
            newContactPerson[uuid] = supplierUserList;
        });
        setContactPersons(newContactPerson);
        setPrevVendors(listPrevVendor);
        setFieldValue("vendors", vendorDtoList);
    };

    const getDataFunc = async (query) => {
        try {
            const response = await CatalogueService.getCataloguesV2(
                UserService.getCurrentCompanyUuid(), query
            );
            return response?.data?.data;
        } catch (error) {
            showToast(
                "error",
                error.response
                    ? `getDataFunc: ${error.response.data.message}`
                    : `getDataFunc: ${error.message}`
            );
        }
        return [];
    };

    const setDataViewQuotations = (quoteDtoList, isProject, values) => {
        const showAwardedQty = !(rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_QUOTATION)
            && !(rfqDetails.rfqStatus === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS);
        const editable = (rfqDetails.rfqStatus === RFQ_CONSTANTS.CLOSED)
            || (rfqDetails.rfqStatus === RFQ_CONSTANTS.RECALLED)
            || (rfqDetails.rfqStatus === RFQ_CONSTANTS.SENT_BACK);
        const supplierNames = quoteDtoList.map((item) => item.supplierCompanyName);
        setSupplierUuids(quoteDtoList.map((item) => item.supplierUuid));
        setNavItemSuppliers(supplierNames);
        viewQuotationsActions.setNewColumnDefs(supplierNames, isProject, showAwardedQty, editable);
        if (!suppliersData.length) {
            viewQuotationsActions.setDataSupplierTab(quotedItems, rfqItems, supplierNames);
        }

        const rowDataItem = [];
        rfqItems?.forEach((data) => {
            const forecastedItem = rowDataTrade
                ?.find((e) => e.code === data.projectForecastTradeCode)
                ?.children
                ?.find((e) => e.code === data.itemCode);
            const itemRequest = {
                uuid: uuidv4(),
                id: data.id,
                itemCode: data.itemCode || "",
                itemName: data.itemName || "",
                itemDescription: data.itemDescription || "",
                itemModel: data.itemModel || "",
                itemSize: data.itemSize || "",
                itemBrand: data.itemBrand || "",
                uom: data.uom || "",
                note: data.note,
                address: data?.address?.addressLabel ?? "",
                requestedDeliveryDate: convertDate2String(
                    data.requestedDeliveryDate,
                    CUSTOM_CONSTANTS.YYYYMMDD
                ),
                itemUnitPrice: data.itemUnitPrice,
                itemQuantity: Number(data.itemQuantity),
                sourceCurrency: currencies.find(
                    (item) => item.currencyCode === data.sourceCurrency
                )?.currencyCode ?? data.sourceCurrency,
                exchangeRate: 1,
                netPrice: Number(data?.itemUnitPrice ?? 0)
                    * Number(data?.itemQuantity ?? 0),
                forecastedQty: forecastedItem?.quantity ?? 0,
                forecastedUnitPrice: forecastedItem?.unitPrice ?? 0,
                forecastedNetPrice: Number(forecastedItem?.unitPrice ?? 0)
                    * Number(data?.itemQuantity ?? 0)
            };
            supplierNames.forEach((name, index) => {
                const quotedItemBySupplier = quoteDtoList.find(
                    (item) => item.supplierCompanyName === name
                );
                const { quoteItemDtoList } = quotedItemBySupplier;
                const quotedItem = quoteItemDtoList.find((item) => item.rfqItemId === data.id);
                const exchangeRate = Number(quotedItem?.exchangeRate ?? 1);
                const quotedUnitPrice = Number(quotedItem?.quotedUnitPrice ?? 0);
                itemRequest[`quoteUuid${index}`] = quotedItemBySupplier?.uuid;
                // itemRequest[`quotedCurrency${index}`] = currencies.find(
                //     (item) => item.currencyCode === data?.sourceCurrency
                // )?.currencyCode ?? data?.sourceCurrency;
                itemRequest[`quotedCurrency${index}`] = currencies.find(
                    (item) => item.currencyCode === quotedItem?.currencyCode
                )?.currencyCode ?? quotedItem?.currencyCode;
                itemRequest[`quotedUnitPrice${index}`] = quotedUnitPrice;
                itemRequest[`exchangeRate${index}`] = exchangeRate;
                itemRequest[`awardedQty${index}`] = quotedItem?.awardedQty ?? 0;
                itemRequest[`selected${index}`] = (quotedItem?.awardedQty ?? 0) > 0;
                itemRequest[`unitPriceInDocCurrency${index}`] = quotedUnitPrice * exchangeRate;
                itemRequest[`netPrice${index}`] = quotedUnitPrice * Number(data.itemQuantity) * exchangeRate;
                itemRequest[`taxPercentage${index}`] = quotedItem?.taxRate;
            });

            rowDataItem.push(itemRequest);
        });

        gridApiViewQuotations.setRowData(rowDataItem);
        gridApi.refreshHeader();

        const pinnedData = {};
        supplierNames.forEach((name, index) => {
            const subTotal = rowDataItem.reduce((sum, item) => {
                const keyQuotedPrice = `quotedUnitPrice${index}`;
                const keyExchangeRate = `exchangeRate${index}`;
                const { itemQuantity } = item;
                return sum + (
                    Number(itemQuantity ?? 0)
                    * Number(item[keyQuotedPrice] ?? 0)
                    * Number(item[keyExchangeRate] ?? 0)
                );
            }, 0);
            const tax = rowDataItem.reduce((sum, item) => {
                const keyQuotedPrice = `quotedUnitPrice${index}`;
                const keyExchangeRate = `exchangeRate${index}`;
                const keyTaxValue = `taxPercentage${index}`;
                const { itemQuantity } = item;
                return sum + (
                    Number(itemQuantity ?? 0)
                    * Number(item[keyQuotedPrice] ?? 0)
                    * Number(item[keyExchangeRate] ?? 0)
                    * Number(item[keyTaxValue] ?? 0)
                ) / 100;
            }, 0);
            const total = roundNumberWithUpAndDown(subTotal + tax);
            const totalAwarded = rowDataItem.reduce((sum, item) => sum + item[`awardedQty${index}`], 0);

            pinnedData[`supplier${index}`] = {
                subTotal,
                tax,
                total,
                totalAwarded,
                sourceCurrency: values.currencyCode
            };
        });
        viewQuotationsActions.setPinnedBottomRowData(!_.isEmpty(pinnedData) ? [pinnedData] : []);
    };

    const backendServerConfigForecast = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (query) => getDataFunc({
            ...query,
            project: projectCode
        })
    }), [projectCode]);

    const backendServerConfigCatalogue = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (query) => getDataFunc(query, false)
    }), []);

    return (
        <Container fluid>
            <HeaderMain
                title={t("RequestForQuotationDetails")}
                className="mb-2"
                loading={loading}
            />
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, actions) => {
                    setTimeout(() => {
                        actions.setSubmitting(false);
                    }, 1500);
                }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue, dirty, setTouched, handleSubmit, isSubmitting
                }) => {
                    useEffect(() => {
                        if (approvalConfig) setFieldValue("approvalConfig", approvalConfig);
                    }, [approvalConfig]);

                    useEffect(() => {
                        if (
                            !_.isEmpty(rfqDetails)
                            && companyUuid
                            && (rfqPermission?.read || rfqPermission?.write || rfqPermission?.approve)
                        ) {
                            const {
                                rfqItemList,
                                pprUuid,
                                uuid,
                                rfqDocumentList,
                                rfqVendorDtoList,
                                rfqAuditTrailList,
                                quoteDtoList,
                                rfqNegotiationList
                            } = rfqDetails;
                            setFieldValue("requisitionType", rfqDetails.requisitionType || FEATURE.PR);
                            setFieldValue("approvalRouteName", rfqDetails.approvalRouteName || "");
                            setFieldValue("approvalRouteUuid", rfqDetails.approvalRouteUuid || "");
                            setFieldValue("approvalSequence", rfqDetails.approvalRouteSequence || "");
                            setFieldValue("rfqNumber", rfqDetails.rfqNumber);
                            setFieldValue("rfqStatus", rfqDetails.rfqStatus.replaceAll("_", " "));
                            setFieldValue("pprNumber", rfqDetails.pprNumber || "");
                            setFieldValue("pprUuid", rfqDetails.pprUuid || "");
                            setFieldValue("project", rfqDetails.project);
                            setFieldValue("currencyCode", rfqDetails.currencyCode);
                            setFieldValue("rfqTitle", rfqDetails.rfqTitle);
                            setFieldValue("rfqType", rfqDetails.rfqType);
                            setFieldValue(
                                "procurementType",
                                rfqDetails.procurementType.toUpperCase() === "GOODS"
                                    ? "Goods"
                                    : "Service"
                            );
                            setFieldValue("requester", rfqDetails.requesterName || "");
                            setFieldValue("submittedDate",
                                rfqDetails.submittedDate
                                    ? convertToLocalTime(rfqDetails.submittedDate)
                                    : "");
                            const validityEndDate = formatDateTime(rfqDetails.validityEndDate, CUSTOM_CONSTANTS.YYYYMMDD);
                            setFieldValue("validityEndDate", validityEndDate);
                            const validityStartDate = formatDateTime(rfqDetails.validityStartDate, CUSTOM_CONSTANTS.YYYYMMDD);
                            setFieldValue("validityStartDate", validityStartDate);
                            const dueDate = formatDateTime(rfqDetails.dueDate, CUSTOM_CONSTANTS.YYYYMMDDTHHmm);
                            setFieldValue("dueDate", new Date(dueDate));
                            setFieldValue("deliveryAddress", addresses.find(
                                (item) => item.addressLabel === rfqDetails?.deliveryAddress?.addressLabel
                            )?.uuid ?? rfqItemList[0].address.addressLabel);
                            const deliveryDate = formatDateTime(rfqDetails.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD);
                            setFieldValue("deliveryDate", deliveryDate);
                            setFieldValue("note", rfqDetails.note || "");
                            attachmentActions.setAttachments(
                                rfqDocumentList, true, true
                            );
                            attachmentActions.setAttachments(
                                rfqDocumentList, true, false
                            );
                            getConversation(pprUuid, uuid);
                            getVendorList(rfqVendorDtoList, setFieldValue);
                            setAuditTrails(rfqAuditTrailList, convertActionAuditTrail);
                            if (rfqDetails.project) {
                                setFieldValue("projectCode", rfqDetails.projectCode || "");
                                setFieldValue("projectUuid", rfqDetails.projectUuid || "");
                                getBudgetDetails(rfqDetails.projectCode);
                            }
                            if ((rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_QUOTATION
                                || rfqDetails.rfqStatus === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS)
                                && rfqPermission?.read && rfqPermission?.write
                            ) {
                                setFieldValue("isUpdate", true);
                            } else {
                                setFieldValue("isUpdate", false);
                            }
                            setIsConvertPR(!!rfqDetails.pprUuid);
                            setViewQuotations(
                                rfqDetails.rfqStatus === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS
                                || rfqDetails.rfqStatus === RFQ_CONSTANTS.CLOSED
                                || rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_QUOTATION
                                || rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_APPROVAL
                                || rfqDetails.rfqStatus === RFQ_CONSTANTS.SHORTLISTED
                                || rfqDetails.rfqStatus === RFQ_CONSTANTS.SENT_BACK
                                || rfqDetails.rfqStatus === RFQ_CONSTANTS.RECALLED
                                || rfqDetails.rfqStatus === RFQ_CONSTANTS.COMPLETED
                            );
                            setQuotedItems(quoteDtoList);
                            setQuoted(quoteDtoList?.length > 0);
                            setRFQItems(rfqItemList);
                            if (rfqDetails.rfqStatus === RFQ_CONSTANTS.CLOSED
                                || rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_APPROVAL
                                || rfqDetails.rfqStatus === RFQ_CONSTANTS.RECALLED
                                || rfqDetails.rfqStatus === RFQ_CONSTANTS.SENT_BACK
                                || rfqDetails.rfqStatus === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS
                            ) {
                                setValidationSchema(null);
                            } else {
                                setValidationSchema(rfqFormSchema);
                            }
                            negotiationActions.setNewNegotiations(rfqNegotiationList ?? []);
                        }
                    }, [rfqDetails, companyUuid, rfqPermission]);

                    useEffect(() => {
                        if (
                            !_.isEmpty(rfqDetails)
                            && gridApi
                        ) {
                            const { rfqItemList } = rfqDetails;
                            const rowDataItem = [];
                            rfqItemList.forEach((data) => {
                                const itemRequest = {
                                    ...data,
                                    uuid: uuidv4(),
                                    id: data.id,
                                    itemCode: data.itemCode || "",
                                    itemName: data.itemName || "",
                                    itemDescription: data.itemDescription || "",
                                    itemModel: data.itemModel || "",
                                    itemSize: data.itemSize || "",
                                    itemBrand: data.itemBrand || "",
                                    uom: uoms.find(
                                        (item) => item.uomCode === data.uom
                                    ),
                                    note: data.note,
                                    address: addresses.find((item) => item.addressLabel
                                        === data.address.addressLabel)
                                        ?? data.address.addressLabel,
                                    requestedDeliveryDate: convertDate2String(
                                        data.requestedDeliveryDate,
                                        CUSTOM_CONSTANTS.YYYYMMDD
                                    ),
                                    itemUnitPrice: Number(data.itemUnitPrice),
                                    itemQuantity: Number(data.itemQuantity),
                                    sourceCurrency: currencies
                                        .find((item) => item.currencyCode === data.sourceCurrency)
                                        ?? data.sourceCurrency,
                                    manualItem: data.manualItem,
                                    forecast: data.forecast
                                };
                                rowDataItem.push(itemRequest);
                            });
                            gridApi.setRowData(rowDataItem);
                            gridApi.redrawRows();
                        }
                    }, [rfqDetails, gridApi]);

                    useEffect(() => {
                        if (viewQuotations && gridApiViewQuotations) {
                            const { quoteDtoList, project } = rfqDetails;
                            setDataViewQuotations(quoteDtoList, project, values);
                        }
                    }, [viewQuotations, gridApiViewQuotations, rowDataTrade]);

                    useEffect(() => {
                        if (
                            !_.isEmpty(userDetails)
                            && !_.isEmpty(permissionReducer)
                        ) {
                            setFieldValue("requester", userDetails.name);
                            setFieldValue("submittedDate", convertToLocalTime(new Date()));
                            setFieldValue("requisitionType", FEATURE.PR);
                            if (location.pathname.includes(RFQ_ROUTES.RFQ_DETAILS)) {
                                setFieldValue("isEdit", false);
                            } else {
                                setFieldValue("isEdit", true);
                            }
                            const currentCompanyUuid = getCurrentCompanyUUIDByStore(
                                permissionReducer
                            );
                            if (currentCompanyUuid) initData(currentCompanyUuid);
                        }
                    }, [userDetails, permissionReducer]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col xs={6}>
                                    {/* Raise Requisition */}
                                    <RaiseRequisition
                                        t={t}
                                        values={values}
                                        errors={errors}
                                        touched={touched}
                                        handleChange={handleChange}
                                        typeOfRequisitions={typeOfRequisitions}
                                        natureOfRequisitions={rfqStates.natureOfRequisitions}
                                        projects={[]}
                                        setFieldValue={setFieldValue}
                                        onChangeProject={() => { }}
                                        disabled
                                        loading={loading}
                                    />
                                    {/* Initial Settings */}
                                    <InitialSettings
                                        t={t}
                                        values={values}
                                        errors={errors}
                                        touched={touched}
                                        currencies={currencies}
                                        setFieldValue={setFieldValue}
                                        gridApi={gridApi}
                                        isConvertPR={isConvertPR}
                                        disabled={!values.isEdit}
                                        loading={loading}
                                    />
                                    {/* Vendor Information */}
                                    <VendorInformation
                                        t={t}
                                        values={values}
                                        errors={errors}
                                        touched={touched}
                                        setFieldValue={setFieldValue}
                                        setTouched={setTouched}
                                        vendors={vendors}
                                        companyUuid={companyUuid}
                                        contactPersons={contactPersons}
                                        setContactPersons={setContactPersons}
                                        disabled={
                                            !values.isEdit
                                            || (rfqPermission?.read && rfqPermission?.approve && !rfqPermission?.write
                                                && rfqDetails.rfqStatus === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS)
                                        }
                                        prevVendors={prevVendors}
                                        loading={loading}
                                    />

                                </Col>
                                <Col xs={6}>

                                    {/* General Information */}
                                    <GeneralInformation
                                        t={t}
                                        values={values}
                                        errors={errors}
                                        touched={touched}
                                        handleChange={handleChange}
                                        setFieldValue={setFieldValue}
                                        procurementTypes={rfqStates.procurementTypes}
                                        isConvertPR={isConvertPR}
                                        approvalRoutes={approvalRoutes}
                                        rfqPermission={rfqPermission}
                                        disabled={
                                            !values.isEdit
                                            || (rfqPermission?.read && rfqPermission?.approve && !rfqPermission?.write
                                                && rfqDetails.rfqStatus === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS)
                                        }
                                        loading={loading}
                                    />
                                    {/* Request Terms */}
                                    <RequestTerms
                                        t={t}
                                        errors={errors}
                                        touched={touched}
                                        addresses={addresses}
                                        rfqTypes={rfqStates.rfqTypes}
                                        handleChange={handleChange}
                                        values={values}
                                        disabled={
                                            !values.isEdit
                                            || (rfqPermission?.read && rfqPermission?.approve && !rfqPermission?.write
                                                && rfqDetails.rfqStatus === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS)
                                        }
                                        loading={loading}
                                    />
                                </Col>
                            </Row>

                            {!loading && (
                                <>
                                    {String(values.project) === "true" && (
                                        <>
                                            <HeaderSecondary
                                                title={t("BudgetDetails")}
                                                className="mb-2"
                                            />
                                            <Row className="mb-4">
                                                <Col xs={12}>
                                                    {/* Budget Details */}
                                                    <BudgetDetails
                                                        rowDataProject={rowDataProject}
                                                        rowDataTrade={rowDataTrade}
                                                    />
                                                </Col>
                                            </Row>
                                        </>
                                    )}

                                    <Row className="mb-4">
                                        <Col xs={12}>
                                            <Row className="mx-0 justify-content-between">
                                                <HeaderSecondary
                                                    title={t("Items")}
                                                    className="mb-2"
                                                />
                                                {(values.isEdit || values.isUpdate) && (
                                                    <ButtonToolbar className="justify-content-end mb-2">
                                                        <Button
                                                            color="primary"
                                                            onClick={() => {
                                                                if (String(values.project) === "true") {
                                                                    setShowAddForecast(true);
                                                                } else setShowAddCatalogue(true);
                                                            }}
                                                            className="mr-1"
                                                        >
                                                            <span className="mr-1">+</span>
                                                            <span>{t("AddCatalogue")}</span>
                                                        </Button>
                                                        <Button
                                                            color="primary"
                                                            onClick={() => addItemActions.addItemManual(
                                                                values, addresses, currencies
                                                            )}
                                                            className="mr-1"
                                                        >
                                                            <span className="mr-1">+</span>
                                                            <span>{t("AddManual")}</span>
                                                        </Button>
                                                    </ButtonToolbar>
                                                )}
                                                {(!values.isEdit && !values.isUpdate) && (<></>)}
                                            </Row>
                                            <AddItems
                                                t={t}
                                                gridHeight={350}
                                                onDeleteItem={(uuid) => addItemActions
                                                    .deleteRowDataItem(uuid)}
                                                onCellValueChanged={addItemActions.onCellValueChanged}
                                                onGridReady={(params) => {
                                                    addItemActions.setGridApi(params.api);
                                                }}
                                                gridApi={gridApi}
                                                addresses={addresses}
                                                disabled={(!values.isEdit && !values.isUpdate) || rfqDetails?.rfqStatus === "CLOSED"}
                                                isProject={Boolean(values.project)}
                                                uoms={uoms}
                                                currencies={currencies}
                                                values={values}
                                                subTotal={0}
                                                tax={0}
                                                total={0}
                                                showTotal={false}
                                            />
                                        </Col>
                                    </Row>

                                    {/* View Quotations */}
                                    {viewQuotations && (
                                        <>
                                            <HeaderSecondary
                                                title={t("ViewQuotations")}
                                                className="mb-2"
                                            />
                                            <Row>
                                                <Col xs={12} md={12} lg={12}>
                                                    <Comparison
                                                        t={t}
                                                        rowData={[]}
                                                        navItemSuppliers={navItemSuppliers}
                                                        activeTabComparisons={activeTabComparisons}
                                                        onChangeTab={(index) => {
                                                            setActiveTabComparisons(index);
                                                            negotiationActions.setSupplierUuid(supplierUuids[index - 2]);
                                                        }}
                                                        onGridComparisonReady={(params) => {
                                                            viewQuotationsActions.setGridApi(params.api);
                                                        }}
                                                        viewQuotationsActions={viewQuotationsActions}
                                                        onCellValueChanged={
                                                            viewQuotationsActions.onCellValueChanged
                                                        }
                                                        comparisonColDefs={comparisonColDefs}
                                                        rfqDetails={rfqDetails}
                                                        currencies={currencies}
                                                        suppliersData={suppliersData}
                                                        negotiations={negotiations}
                                                        negotiationActions={negotiationActions}
                                                        pinnedBottomRowData={pinnedBottomRowData}
                                                        currentSupplier={currentSupplier}
                                                        isBuyer
                                                        disabled={
                                                            rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_APPROVAL
                                                            || rfqDetails.rfqStatus === RFQ_CONSTANTS.COMPLETED
                                                            || rfqDetails.rfqStatus === RFQ_CONSTANTS.SHORTLISTED
                                                            || rfqDetails.rfqStatus === RFQ_CONSTANTS.CLOSED
                                                        }
                                                        gridApis={gridApis}
                                                        setGridApis={setGridApis}
                                                        values={values}
                                                    />
                                                </Col>
                                            </Row>
                                        </>
                                    )}

                                    <HeaderSecondary
                                        title={t("Conversations")}
                                        className="mb-2"
                                    />
                                    <Row className="mb-2">
                                        <Col xs={12}>
                                            {/* Internal Conversations */}
                                            <Conversation
                                                title={t("InternalConversations")}
                                                activeTab={activeInternalTab}
                                                setActiveTab={(idx) => setActiveInternalTab(idx)}
                                                sendConversation={(comment) => conversationActions
                                                    .sendCommentConversation(comment, true)}
                                                addNewRowAttachment={() => attachmentActions.addNewRowAttachment(true)}
                                                rowDataConversation={internalConversations}
                                                rowDataAttachment={internalAttachments}
                                                onDeleteAttachment={(uuid, rowData) => attachmentActions
                                                    .onDeleteAttachment(uuid, rowData, true)}
                                                onAddAttachment={(e, uuid, rowData) => attachmentActions
                                                    .onAddAttachment(e, uuid, rowData, true)}
                                                onCellEditingStopped={(params) => attachmentActions
                                                    .onCellEditingStopped(params, true)}
                                                defaultExpanded
                                                disabled={
                                                    (!values.isEdit
                                                        && !values.isUpdate
                                                        && !(rfqDetails.rfqStatus === RFQ_CONSTANTS.CLOSED)
                                                        && !(rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_APPROVAL
                                                            && rfqPermission?.read && rfqPermission?.approve)
                                                        && !(rfqDetails.rfqStatus === RFQ_CONSTANTS.RECALLED)
                                                        && !(rfqDetails.rfqStatus === RFQ_CONSTANTS.SHORTLISTED)
                                                        && !(rfqDetails.rfqStatus === RFQ_CONSTANTS.SENT_BACK
                                                            && rfqPermission?.read && rfqPermission?.write))
                                                    || !(rfqPermission?.read
                                                        && (rfqPermission?.write || rfqPermission?.approve))
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mb-4">
                                        <Col xs={12}>
                                            {/* External Conversations */}
                                            <Conversation
                                                title={t("ExternalConversations")}
                                                activeTab={activeExternalTab}
                                                setActiveTab={(idx) => setActiveExternalTab(idx)}
                                                sendConversation={(comment) => conversationActions
                                                    .sendCommentConversation(comment, false)}
                                                addNewRowAttachment={() => attachmentActions.addNewRowAttachment(false)}
                                                rowDataConversation={externalConversations}
                                                rowDataAttachment={externalAttachments}
                                                onDeleteAttachment={(uuid, rowData) => attachmentActions
                                                    .onDeleteAttachment(uuid, rowData, false)}
                                                onAddAttachment={(e, uuid, rowData) => attachmentActions
                                                    .onAddAttachment(e, uuid, rowData, false)}
                                                onCellEditingStopped={(params) => attachmentActions
                                                    .onCellEditingStopped(params, false)}
                                                defaultExpanded
                                                borderTopColor="#A9A2C1"
                                                disabled={
                                                    (!values.isEdit
                                                        && !values.isUpdate
                                                        && !(rfqDetails.rfqStatus === RFQ_CONSTANTS.CLOSED)
                                                        && !(rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_APPROVAL
                                                            && rfqPermission?.read && rfqPermission?.approve)
                                                        && !(rfqDetails.rfqStatus === RFQ_CONSTANTS.RECALLED)
                                                        && !(rfqDetails.rfqStatus === RFQ_CONSTANTS.SHORTLISTED)
                                                        && !(rfqDetails.rfqStatus === RFQ_CONSTANTS.SENT_BACK
                                                            && rfqPermission?.read && rfqPermission?.write))
                                                    || !(rfqPermission?.read
                                                        && (rfqPermission?.write || rfqPermission?.approve))
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </>
                            )}

                            <HeaderSecondary
                                title={t("AuditTrail")}
                                className="mb-2"
                                loading={loading}
                            />
                            <Row className="mb-5">
                                <Col xs={12}>
                                    {/* Audit Trail */}
                                    <AuditTrail
                                        rowData={auditTrails}
                                        paginationPageSize={10}
                                        gridHeight={350}
                                        defaultExpanded
                                        loading={loading}
                                    />
                                </Col>
                            </Row>

                            {/* Footer */}
                            <Footer
                                t={t}
                                showToast={showToast}
                                rfqDetails={rfqDetails}
                                dirty={dirty}
                                errors={errors}
                                values={values}
                                setFieldValue={setFieldValue}
                                handleSubmit={handleSubmit}
                                onBackPressHandler={() => history.goBack()}
                                rfqPermission={rfqPermission}
                                loading={loading}
                                modalCancelRef={modalCancelRef}
                                modalRef={modalRef}
                                onSavePressHandler={onSavePressHandler}
                                onSendToVendorsPressHandler={onSendToVendorsPressHandler}
                                onUpdatePressHandler={onUpdatePressHandler}
                                onReOpenRFQPressHandler={onReOpenRFQPressHandler}
                                onShortlistRFQPressHandler={onShortlistRFQPressHandler}
                                onApprovePressHandler={onApprovePressHandler}
                                onConvertToPOPressHandler={onConvertToPOPressHandler}
                                setValidationSchema={setValidationSchema}
                                setShowReason={setShowReason}
                                approvalConfig={approvalConfig}
                                isSubmitting={isSubmitting}
                            />

                            {/* Add Forecast And Catalogue Dialog */}
                            <AddItemDialog
                                isShow={showAddForecast}
                                onHide={() => {
                                    setShowAddForecast(false);
                                    setSelectedForecastItems([]);
                                }}
                                title={t("AddCatalogue")}
                                onPositiveAction={() => onAddNewItemForecast(values)}
                                onNegativeAction={() => {
                                    setShowAddForecast(false);
                                    setSelectedForecastItems([]);
                                }}
                                columnDefs={ForecastItemColDefs}
                                rowDataItem={[]}
                                onSelectionChanged={(params) => {
                                    setSelectedForecastItems(params.api.getSelectedNodes());
                                }}
                                selected={addItemActions.getRowDataItems()}
                                backendPagination
                                backendServerConfig={backendServerConfigForecast}
                                pageSize={10}
                            />
                            {/* Add Catalogue Dialog */}
                            <AddItemDialog
                                isShow={showAddCatalogue}
                                onHide={() => {
                                    setShowAddCatalogue(false);
                                    setSelectedCatalogueItems([]);
                                }}
                                title={t("AddCatalogue")}
                                onPositiveAction={() => onAddNewItemCatalogue(values)}
                                onNegativeAction={() => {
                                    setShowAddCatalogue(false);
                                    setSelectedCatalogueItems([]);
                                }}
                                columnDefs={CatalogueItemColDefs}
                                rowDataItem={[]}
                                onSelectionChanged={(params) => {
                                    setSelectedCatalogueItems(params.api.getSelectedNodes());
                                }}
                                selected={addItemActions.getRowDataItems()}
                                backendPagination
                                backendServerConfig={backendServerConfigCatalogue}
                                pageSize={10}
                            />
                            <ShortListSelectVendors
                                isShow={showSelectVendors}
                                showErrorCode={showErrorSelectVendors}
                                onHide={() => {
                                    setShowErrorSelectVendors(false);
                                    setShowSelectVendors(false);
                                }}
                                title={t("Vendor Tagging")}
                                onPositiveAction={() => { handleConvert(values); }}
                                onNegativeAction={() => {
                                    setShowSelectVendors(false);
                                    setShowErrorSelectVendors(false);
                                }}
                                pageSize={10}
                                getRowNodeId={(data) => data?.uuid}
                                setFieldValue={setFieldValue}
                                values={values}
                                vendorList={vendors}
                                t={t}
                            />
                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
            <ActionModal
                ref={modalRef}
                title={t("CloseRFQ")}
                body={
                    quoted
                        ? t("Are you sure you want to close this RFQ?")
                        : t("There are still suppliers that have yet to revert their quotes. Do you still want to close this RFQ?")
                }
                button={quoted ? t("Close") : t("Yes")}
                color="primary"
                textCancel={quoted ? t("Cancel") : t("No")}
                colorCancel={quoted ? "danger" : "danger"}
                colorTitle={quoted ? "danger" : "warning"}
                action={() => onCloseRFQPressHandler()}
            />
            <ActionModal
                ref={modalCancelRef}
                title={t("CancelRFQ")}
                body={t("Are you sure you want to cancel this RFQ?")}
                button={t("Cancel")}
                color="danger"
                action={() => onCancelRFQPressHandler()}
            />
            <CommonConfirmDialog
                footerBetween={false}
                isShow={showReason}
                onHide={() => setShowReason(false)}
                title={t("Reason")}
                positiveProps={
                    {
                        onPositiveAction: () => {
                            if (
                                rfqDetails?.rfqStatus === RFQ_CONSTANTS.PENDING_APPROVAL
                                && rfqDetails?.approverRole === true
                            ) {
                                return onSendBackPressHandler();
                            }
                            if (
                                rfqDetails?.rfqStatus === RFQ_CONSTANTS.PENDING_APPROVAL
                                && rfqDetails?.rfqCreator === true
                            ) {
                                return onRecallPressHandler();
                            }
                            return null;
                        },
                        contentPositive: (rfqDetails?.rfqStatus === RFQ_CONSTANTS.PENDING_APPROVAL
                            && rfqDetails?.approverRole === true)
                            ? t("SendBack")
                            : t("Recall"),
                        colorPositive: "warning"
                    }
                }
                negativeProps={
                    {
                        onNegativeAction: () => setShowReason(false),
                        contentNegative: t("Close"),
                        colorNegative: "secondary"
                    }
                }
                size="xs"
                titleCenter
                titleRequired
            >
                <Input
                    type="textarea"
                    rows={5}
                    name="reason"
                    className={
                        classNames("form-control", {
                            "is-invalid": showErrorReason && !reason
                        })
                    }
                    placeholder={t("PleaseEnterReason")}
                    value={reason}
                    onChange={(e) => setReason(e?.target?.value)}
                />
                {showErrorReason && !reason && (
                    <div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>
                )}
            </CommonConfirmDialog>
        </Container>
    );
};

export default RFQDetailsBuyer;
