/* eslint-disable camelcase */
/* eslint-disable max-len */
import React, {
    useState, useEffect, useRef, useMemo, useCallback
} from "react";
import useToast from "routes/hooks/useToast";
import {
    usePermission, useCustomState, useApprovalConfig,
    useAttachment, useConversation, useAuditTrail
} from "routes/hooks";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import {
    Container, Row, Col, Button, Input
} from "components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Formik, Form, setNestedObjectValues } from "formik";
import {
    Conversation, Overview, AuditTrail, Blockchain
} from "routes/components";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { useSelector } from "react-redux";
import _ from "lodash";
import { convertToLocalTime } from "helper/utilities";
import { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import { useLocation } from "react-router-dom";
import classNames from "classnames";
import { CommonConfirmDialog } from "routes/components";
import { HeaderMain } from "routes/components/HeaderMain";
import ActionModal from "routes/components/ActionModal";
import PurchaseOrderService from "services/PurchaseOrderService/PurchaseOrderService";
import ConversationService from "services/ConversationService/ConversationService";
import GLDataService from "services/GLService";
import AddressDataService from "services/AddressService";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import UOMDataService from "services/UOMService";
import TaxRecordDataService from "services/TaxRecordService";
import CurrenciesService from "services/CurrenciesService";
import CategoryService from "services/CategoryService/CategoryService";
import SupplierService from "services/SupplierService";
import PURCHASE_ORDER_ROUTES from "../route";
import {
    InitialSetting, GeneralInformation, RequestTerms,
    SupplierInfor, POPreviewModal, PurchaseOrderItems,
    Requisition
} from "../components";
import convertAction from "../helper/utilities";
import { itemSchema, formSchema } from "../helper/validation";
import DeliveryDetails from "./DeliveryDetails";
import Footer from "./Footer";
import { PO_STATUS } from "./helper";

const PODetails = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const refActionModalCancel = useRef(null);
    const refActionModalRecall = useRef(null);
    const previewModalRef = useRef(null);
    const approvalRef = useRef(null);
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { isBuyer, userPermission } = permissionReducer;
    const permission = usePermission(FEATURE.PO);
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
    const [loading, setLoading] = useState(true);
    const [enableConversation, setEnableConversation] = useState(false);
    const [poDetailsStates, setPODetailsStates] = useState({
        poDetails: null,
        poUuid: "",
        companyUuid: "",
        activeInternalTab: 1,
        activeExternalTab: 1,
        doItems: [],
        showReason: false,
        reason: "",
        showErrorReason: false,
        activeAuditTrailTab: 1,
        rowDataOverview: [],
        supplierAck: ""
    });
    const [companyUuid, setCompanyUuid] = useState("");
    const [glAccounts, setGLAccounts] = useCustomState([]);
    const [addresses, setAddresses] = useCustomState([]);
    const [taxRecords, setTaxRecords] = useCustomState([]);
    const [currencies, setCurrencies] = useCustomState([]);
    const [uoms, setUOMs] = useCustomState([]);
    const [categories, setCategories] = useCustomState([]);
    const [supplierAddress, setSupplierAddress] = useState([]);
    const [approvalRoutes, setApprovalRoutes] = useCustomState([]);
    const [gridApi, setGridApi] = useState(null);
    const [inSourceCurrencyTotal, setInSourceCurrencyTotal] = useState({});
    const [inDocumentCurrencyTotal, setInDocumentCurrencyTotal] = useState({});
    const [showReasonSendBack, setShowReasonSendBack] = useState(false);
    const [showReasonCancel, setShowReasonCancel] = useState(false);
    const [showErrorReasonSendBack, setShowErrorReasonSendBack] = useState(false);
    const [showErrorReasonCancel, setShowErrorReasonCancel] = useState(false);
    const [reasonSendBack, setReasonSendBack] = useState("");
    const [reasonCancel, setReasonCancel] = useState("");
    const approvalConfig = useApprovalConfig(FEATURE.PO);
    const [enablePrefix, setEnablePrefix] = useState(false);
    const [convertFrom, setConvertFrom] = useState("");
    const [contracted, setContracted] = useState(false);
    const [internalAttachments, externalAttachments, attachmentActions] = useAttachment({
        setDirtyFunc: setDirty,
        defaultValue: []
    });
    const [internalConversations, externalConversations, conversationActions] = useConversation();
    const [auditTrails, setAuditTrails] = useAuditTrail([]);
    const initialValues = {
        approvalConfig: false,
        project: false,
        projectCode: "",
        poNumber: "",
        prNumber: "",
        rfqNumber: "",
        rfqUuid: "",
        poUuid: "",
        poStatus: "",
        currencyCode: "",
        sourceCurrencyCode: "",
        supplier: {},
        prePoNumber: "",
        poTitle: "",
        procurementType: "",
        approvalRouteName: "",
        approvalRouteSequence: "",
        approvalRouteUuid: "",
        nextApprover: "",
        requestorUuid: "",
        requestorName: "",
        convertedDate: "",
        paymentTerms: "",
        addressUuid: "",
        remarks: "",
        poDate: "",
        issuedDate: "",
        prUuid: "",
        ppoUuid: "",
        currencyName: "",
        currency: "",
        enablePrefix: false,
        changeNatureApproval: false,
        natureOfRequisition: "",
        typeOfRequisition: "Purchase",
        addressLabel: "",
        addressFirstLine: "",
        addressSecondLine: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        isPR: false,
        isInsensitive: false
    };

    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        cellRendererParams: { suppressCount: true },
        valueFormatter: (params) => params.data.type
    };

    useEffect(() => {
        const data = location?.state?.data;
        const query = new URLSearchParams(location.search);
        const poUuid = query.get("uuid");
        setPODetailsStates((prevStates) => ({
            ...prevStates,
            poUuid,
            supplierAck: data?.supplierAck
        }));
    }, []);

    const initData = async () => {
        try {
            const { poUuid } = poDetailsStates;
            const data = location?.state?.data;
            const allowedToCall = (!data || [PO_STATUS.PENDING_REVIEW, PO_STATUS.SENT_BACK, PO_STATUS.RECALLED].includes(data && data?.status))
                && permission?.read
                && permission?.write;
            const responses = await Promise.allSettled([
                allowedToCall && isBuyer && GLDataService.getGLs(companyUuid),
                allowedToCall && isBuyer && AddressDataService.getCompanyAddresses(companyUuid),
                allowedToCall && isBuyer && ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                    companyUuid, FEATURE.PO
                ),
                allowedToCall && isBuyer && UOMDataService.getUOMRecords(companyUuid),
                allowedToCall && isBuyer && TaxRecordDataService.getTaxRecords(companyUuid),
                allowedToCall && isBuyer && CurrenciesService.getCurrencies(companyUuid),
                allowedToCall && isBuyer && CategoryService.getListCategory(companyUuid)
            ]);
            const [
                responseGLAccounts,
                responseAddresses,
                responseApprovalRoutes,
                responseUOMs,
                responseTaxRecords,
                responseCurrencies,
                responseCategories
            ] = responses;

            const responsePODetails = await PurchaseOrderService.getDetailsPO(
                companyUuid, poUuid, isBuyer
            );
            const {
                supplierCompanyUuid, prUuid, pprUuid, buyerCompanyUuid, supplierDto, buyerInformationDto
            } = responsePODetails.data && responsePODetails.data.data;
            let supplierBillingAddress = [];
            if (isBuyer) {
                try {
                    const resSupplierDetails = await SupplierService.retrieveSuppliersDetails(companyUuid, supplierDto?.uuid);
                    supplierBillingAddress = resSupplierDetails.data.data?.addressesDto;
                } catch (error) {
                    const message = error.response ? error.response.data.message ?? "" : error.message;
                }
            }
            const overview = [];
            try {
                const resOverview = await PurchaseOrderService
                    .getDetailsPOOverview(companyUuid, poUuid);
                if (resOverview.data.status === "OK") {
                    const getAllItemsPerChildren = (item, parent) => {
                        const newItem = { ...item };
                        newItem.type = item.documentType;
                        let documentTree = [item.documentNumber];
                        if (parent) {
                            documentTree = [...parent.documentType];
                            documentTree.push(item.documentNumber);
                        }
                        newItem.documentType = documentTree;
                        overview.push({ ...newItem, documentType: documentTree });
                        if (item.childNodes) {
                            item.childNodes.forEach(
                                (i) => getAllItemsPerChildren(i, newItem)
                            );
                        }
                    };
                    resOverview.data.data.forEach((item) => {
                        getAllItemsPerChildren(item, null);
                    });
                }
            } catch (error) {
                const message = error.response ? error.response.data.message ?? "" : error.message;
                console.debug(message);
            }

            const responsesConversation = await Promise.allSettled([
                // buyer
                isBuyer && ConversationService.getDetailInternalConversation(companyUuid, poUuid),
                isBuyer && ConversationService.getDetailExternalConversation(companyUuid, poUuid),
                isBuyer && supplierCompanyUuid && ConversationService.getDetailExternalConversation(supplierCompanyUuid, poUuid),
                // supplier
                !isBuyer && ConversationService.getDetailExternalConversation(companyUuid, poUuid),
                !isBuyer && buyerCompanyUuid && ConversationService.getDetailExternalConversation(buyerCompanyUuid, poUuid),
                // PR, PPR's conversation
                isBuyer && prUuid && ConversationService.getDetailInternalConversation(companyUuid, prUuid),
                prUuid && ConversationService.getDetailExternalConversation(isBuyer ? companyUuid : buyerCompanyUuid, prUuid),
                isBuyer && pprUuid && ConversationService.getDetailInternalConversation(companyUuid, pprUuid),
                pprUuid && ConversationService.getDetailExternalConversation(isBuyer ? companyUuid : buyerCompanyUuid, pprUuid)
            ]);
            const [
                // buyer
                responseInternalConversationsBuyer,
                responseExternalConversationsBuyer,
                responseSupplierExternalConversationsBuyer,
                // supplier
                responseExternalConversationsSupplier,
                responseBuyerExternalConversationsSupplier,
                // pr, ppr
                responseInternalConversationsPR,
                responseExternalConversationsPR,
                responseInternalConversationsPPR,
                responseExternalConversationsPPR
            ] = responsesConversation;

            // internal conversation
            await conversationActions.setConversations(
                [
                    responseInternalConversationsBuyer,
                    responseInternalConversationsPR,
                    responseInternalConversationsPPR
                ],
                true,
                true
            );
            // external conversation
            conversationActions.setConversations(
                [
                    responseExternalConversationsBuyer,
                    responseSupplierExternalConversationsBuyer,
                    responseExternalConversationsSupplier,
                    responseBuyerExternalConversationsSupplier,
                    responseExternalConversationsPR,
                    responseExternalConversationsPPR
                ],
                true,
                false
            );

            setPODetailsStates((prevStates) => ({
                ...prevStates,
                poDetails: responsePODetails.data.data,
                rowDataOverview: overview
            }));
            setGLAccounts(
                responseGLAccounts,
                {
                    isResponse: true,
                    filter: { condition: { active: true } }
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
            setApprovalRoutes(
                responseApprovalRoutes,
                {
                    isResponse: true,
                    filter: { condition: { active: true } },
                    sort: { key: "approvalName" }
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
            setCurrencies(
                responseCurrencies,
                {
                    isResponse: true,
                    filter: { condition: { active: true } },
                    sort: { key: "currencyName" }
                }
            );
            setCategories(
                responseCategories,
                {
                    isResponse: true,
                    filter: { condition: { active: true } },
                    sort: { key: "categoryName" }
                }
            );
            setSupplierAddress(supplierBillingAddress);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const poStatus = useMemo(() => poDetailsStates?.poDetails?.status, [poDetailsStates?.poDetails]);
    const prCreator = useMemo(() => poDetailsStates?.poDetails?.userInfo?.prCreator, [poDetailsStates?.poDetails]);

    const getRowData = () => {
        if (!gridApi) return [];

        const rowData = [];
        gridApi.forEachNode((node) => {
            if (node) rowData.push(node?.data);
        });

        return rowData;
    };

    const validateApprovalRoute = useCallback((originItems = [], currentItems = [], hasApprovalRoute) => {
        if (!approvalConfig) return;
        const throwErr = () => {
            approvalRef?.current?.focus();
            window.scrollTo(0, approvalRef?.current?.offsetTop);
            throw new Error(t("Please select a valid approval route"));
        };
        if (!hasApprovalRoute && originItems.length !== currentItems.length) {
            throwErr();
        }
        originItems.forEach((originItem) => {
            const currentItem = currentItems.find(({ itemCode }) => itemCode === originItem.itemCode);
            if (
                !hasApprovalRoute
                && (
                    (convertFrom === FEATURE.PR && originItem.itemUnitPrice !== currentItem?.itemUnitPrice)
                    || originItem.quantity !== currentItem?.quantity)
            ) {
                throwErr();
            }
        });
    }, [approvalConfig]);

    const onSubmitPressHandler = async (values) => {
        setPristine();
        try {
            const rowDataItemReq = getRowData();
            const { poUuid } = poDetailsStates;

            const body = {
                poUuid,
                poTitle: values.poTitle,
                poNumber: values.poNumber,
                poItems: [],
                poDocumentDtoList: [],
                notes: values.remarks,
                approvalRoute: values.approvalRouteUuid,
                supplierBillingAddress: {
                    addressFirstLine: values.addressFirstLine,
                    addressLabel: values.addressLabel,
                    addressSecondLine: values.addressSecondLine,
                    city: values.city,
                    country: values.country,
                    postalCode: values.postalCode,
                    state: values.state,
                    uuid: values.addressUuid
                }
            };
            if (!enablePrefix) delete body.poNumber;
            if (!poDetailsStates.approvalRoute) delete body.approvalRouteUuid;

            const poDocumentDtoList = await attachmentActions.getNewAttachments(FEATURE.PO);
            if (!Array.isArray(poDocumentDtoList)) throw new Error(poDocumentDtoList);
            body.poDocumentDtoList = poDocumentDtoList;

            rowDataItemReq.forEach((item) => {
                const glAccount = typeof item.accountNumber === "string"
                    ? item.accountNumber
                    : item?.accountNumber?.accountNumber;
                const uomCode = typeof item.uom === "string"
                    ? item.uom
                    : item?.uom?.uomCode;
                const taxCode = typeof item.taxCode === "string"
                    ? item.taxCode
                    : item?.taxCode?.taxCode;
                const currency = typeof item.sourceCurrency === "string"
                    ? item.sourceCurrency
                    : item?.sourceCurrency?.currencyCode;
                const itemCategory = typeof item.itemCategory === "string"
                    ? item.itemCategory
                    : item?.itemCategory?.categoryName;
                const requestedDeliveryDate = item.requestedDeliveryDate
                    ? (new Date(item.requestedDeliveryDate)).toISOString()
                    : "";
                const deliveryAddress = {
                    addressLabel: item.address?.addressLabel,
                    addressFirstLine: item.address?.addressFirstLine,
                    addressSecondLine: item.address?.addressSecondLine,
                    city: item.address?.city,
                    state: item.address?.state,
                    country: item.address?.country,
                    postalCode: item.address?.postalCode
                };
                const priceType = typeof (item?.priceType) === "object" ? item?.priceType?.priceType ?? "" : (item?.priceType ?? "");
                const poItem = {
                    itemCode: item.itemCode,
                    itemName: item.itemName,
                    supplierName: values?.supplier?.companyName,
                    supplierUuid: values?.supplier?.uuid,
                    uomCode,
                    currency,
                    itemUnitPrice: Number(item.itemUnitPrice),
                    taxCode,
                    taxRate: item.taxRate,
                    exchangeRate: item.exchangeRate,
                    deliveryAddress,
                    requestedDeliveryDate,
                    gl_account: glAccount,
                    note: item.note,
                    manualEntry: item.manualItem,
                    qtyConverted: item.qtyConverted ?? 0,
                    qtyReceived: item.qtyReceived ?? 0,
                    pendingDeliveryQty: item.pendingDeliveryQty ?? 0,
                    qtyRejected: item.qtyRejected ?? 0,
                    invoiceQty: item.invoiceQty ?? 0,
                    quantity: Number(item.itemQuantity),
                    pendingInvoiceQty: item.pendingInvoiceQty ?? 0,
                    itemId: item.itemId,
                    itemDescription: item.itemDescription,
                    itemModel: item.itemModel,
                    itemSize: item.itemSize,
                    itemBrand: item.itemBrand,
                    itemCategory,
                    priceType,
                    contractReferenceNumber: item.contractReferenceNumber,
                    contracted: item.contracted,
                    contractedPrice: item.contractedPrice
                };
                if (!poItem.itemId) delete poItem.itemId;
                if (convertFrom === FEATURE.PPR) {
                    delete poItem.currency;
                    delete poItem.itemUnitPrice;
                    delete poItem.taxCode;
                    delete poItem.taxRate;
                    delete poItem.exchangeRate;
                }
                if (convertFrom === FEATURE.PR) {
                    delete poItem.contractReferenceNumber;
                    delete poItem.contracted;
                    delete poItem.contractedPrice;
                }

                body.poItems.push(poItem);
            });
            // validateApprovalRoute(poDetailsStates?.poDetails?.poItemDtoList, body.poItems, !!body.approvalRoute);

            await itemSchema.validate(body.poItems);

            const response = await PurchaseOrderService.submitPO(companyUuid, poUuid, body);

            if (response.data.status === RESPONSE_STATUS.OK) {
                // conversation
                try {
                    conversationActions.postConversation(poUuid, companyUuid);
                } catch (error) {}

                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(PURCHASE_ORDER_ROUTES.PO_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message || response.data.data);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onIssuePressHandler = async (values) => {
        setPristine();
        try {
            const { poUuid, poDetails } = poDetailsStates;
            const { poDate, supplierCompanyUuid } = poDetails;
            const body = {
                poUuid,
                companyUuid: supplierCompanyUuid,
                poDate,
                poTitle: values.poTitle,
                poNumber: values.poNumber,
                poDocumentDtoList: [],
                approvalRouteUuid: values.approvalRouteUuid,
                supplierBillingAddress: {
                    addressFirstLine: values.addressFirstLine,
                    addressLabel: values.addressLabel,
                    addressSecondLine: values.addressSecondLine,
                    city: values.city,
                    country: values.country,
                    postalCode: values.postalCode,
                    state: values.state,
                    uuid: values.addressUuid
                }
            };
            if (!enablePrefix) delete body.poNumber;

            const poDocumentDtoList = await attachmentActions.getNewAttachments(FEATURE.PO);
            if (!Array.isArray(poDocumentDtoList)) throw new Error(poDocumentDtoList);
            body.poDocumentDtoList = poDocumentDtoList;

            const response = await PurchaseOrderService.issuePO(
                companyUuid, poUuid, body
            );

            if (response.data.status === RESPONSE_STATUS.OK) {
                // conversation
                try {
                    conversationActions.postConversation(poUuid, companyUuid);
                } catch (error) {}

                showToast("success", response.data.data);
                setTimeout(() => {
                    history.push(PURCHASE_ORDER_ROUTES.PO_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message || response.data.data);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onRecallPressHandler = async () => {
        setPristine();
        try {
            const { poUuid } = poDetailsStates;
            const response = await PurchaseOrderService.recallPO(companyUuid, poUuid);

            if (response.data.status === RESPONSE_STATUS.OK) {
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(PURCHASE_ORDER_ROUTES.PO_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message || response.data.data);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onCancelPressHandler = async () => {
        setPristine();
        try {
            const { poUuid } = poDetailsStates;
            const response = await PurchaseOrderService.cancelPO(companyUuid, poUuid);

            if (response.data.status === RESPONSE_STATUS.OK) {
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(PURCHASE_ORDER_ROUTES.PO_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message || response.data.data);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onRejectPressHandler = async () => {
        setPristine();
        setPODetailsStates((prevStates) => ({
            ...prevStates,
            showErrorReason: true
        }));

        if (poDetailsStates.reason) {
            setPODetailsStates((prevStates) => ({
                ...prevStates,
                showReason: false
            }));
            try {
                const { poUuid, poDetails } = poDetailsStates;
                const { status } = poDetails;

                const body = {
                    text: poDetailsStates.reason,
                    poDocumentDtoList: []
                };

                const poDocumentDtoList = await attachmentActions.getNewAttachments(FEATURE.PO);
                if (!Array.isArray(poDocumentDtoList)) throw new Error(poDocumentDtoList);
                body.poDocumentDtoList = poDocumentDtoList;

                let response;
                if (status !== PO_STATUS.PENDING_APPROVAL && !isBuyer) {
                    response = await PurchaseOrderService.rejectPO(companyUuid, poUuid, body);
                }
                if (status === PO_STATUS.PENDING_APPROVAL) {
                    response = await PurchaseOrderService.buyerRejectPO(companyUuid, poUuid, body);
                }

                if (response.data.status === RESPONSE_STATUS.OK) {
                    // conversation
                    try {
                        if (status !== PO_STATUS.PENDING_APPROVAL) {
                            conversationActions.postConversation(
                                poUuid, companyUuid,
                                null, { text: poDetailsStates.reason, isInternal: false }
                            );
                        }
                        if (status === PO_STATUS.PENDING_APPROVAL) {
                            conversationActions.postConversation(
                                poUuid, companyUuid,
                                null, { text: poDetailsStates.reason, isInternal: true }
                            );
                        }
                    } catch (error) {}

                    showToast("success", response.data.message);
                    setTimeout(() => {
                        history.push(PURCHASE_ORDER_ROUTES.PO_LIST);
                    }, 1000);
                } else {
                    showToast("error", response.data.message || response.data.data);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };

    const onSendBackPressHandler = async () => {
        setPristine();
        setShowErrorReasonSendBack(true);

        if (reasonSendBack) {
            setShowReasonSendBack(false);
            try {
                const { poUuid } = poDetailsStates;
                const body = { poDocumentDtoList: [] };

                const poDocumentDtoList = await attachmentActions.getNewAttachments(FEATURE.PO);
                if (!Array.isArray(poDocumentDtoList)) throw new Error(poDocumentDtoList);
                body.poDocumentDtoList = poDocumentDtoList;

                const response = await PurchaseOrderService.sendBackPO(companyUuid, poUuid, body);

                if (response.data.status === RESPONSE_STATUS.OK) {
                    // conversation
                    try {
                        conversationActions.postConversation(
                            poUuid, companyUuid,
                            null, { text: reasonSendBack, isInternal: true }
                        );
                    } catch (error) {}

                    showToast("success", response.data.message);
                    setTimeout(() => {
                        history.push(PURCHASE_ORDER_ROUTES.PO_LIST);
                    }, 1000);
                } else {
                    showToast("error", response.data.message || response.data.data);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };

    const onAcknowledgePressHandler = async () => {
        setPristine();
        try {
            const { poUuid } = poDetailsStates;
            const body = { poDocumentDtoList: [] };

            const poDocumentDtoList = await attachmentActions.getNewAttachments(FEATURE.PO);
            if (!Array.isArray(poDocumentDtoList)) throw new Error(poDocumentDtoList);
            body.poDocumentDtoList = poDocumentDtoList;

            const response = await PurchaseOrderService.acknowledgePO(
                companyUuid, poUuid, body
            );

            if (response.data.status === RESPONSE_STATUS.OK) {
                // conversation
                try {
                    conversationActions.postConversation(poUuid, companyUuid);
                } catch (error) {}

                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(PURCHASE_ORDER_ROUTES.PO_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message || response.data.data);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onClosePressHandler = async () => {
        setPristine();
        setShowErrorReasonCancel(true);
        if (reasonCancel) {
            setShowErrorReasonCancel(false);
            try {
                const { poUuid } = poDetailsStates;
                const response = await PurchaseOrderService.closePO(companyUuid, poUuid);

                if (response.data.status === RESPONSE_STATUS.OK) {
                    // conversation
                    try {
                        conversationActions.postConversation(
                            poUuid, companyUuid,
                            null, { text: reasonCancel, isInternal: false }
                        );
                    } catch (error) {}

                    showToast("success", response.data.message);
                    setTimeout(() => {
                        history.push(PURCHASE_ORDER_ROUTES.PO_LIST);
                    }, 1000);
                } else {
                    showToast("error", response.data.message || response.data.data);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };

    const onApprovePressHandler = async () => {
        setPristine();
        try {
            const { poUuid } = poDetailsStates;
            const body = { poDocumentDtoList: [] };

            const poDocumentDtoList = await attachmentActions.getNewAttachments(FEATURE.PO);
            if (!Array.isArray(poDocumentDtoList)) throw new Error(poDocumentDtoList);
            body.poDocumentDtoList = poDocumentDtoList;

            const response = await PurchaseOrderService.approvePO(
                companyUuid, poUuid, body
            );

            if (response.data.status === RESPONSE_STATUS.OK) {
                // conversation
                try {
                    conversationActions.postConversation(poUuid, companyUuid);
                } catch (error) {}

                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(PURCHASE_ORDER_ROUTES.PO_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message || response.data.data);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onViewPOPressHandler = async () => {
        try {
            const {
                poUuid
            } = poDetailsStates;

            const response = await PurchaseOrderService.viewPDF(
                companyUuid, poUuid, isBuyer
            );

            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const { url } = data;
                if (url) {
                    window.open(url);
                }
                const { supplierAck } = poDetailsStates;
                if (supplierAck === PO_STATUS.NOT_VIEWED) {
                    setPODetailsStates((prevStates) => ({
                        ...prevStates,
                        poUuid,
                        supplierAck: PO_STATUS.VIEWED
                    }));
                }
            } else {
                showToast("error", response.data.message || response.data.data);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (
            currentCompanyUUID
            && !_.isEmpty(userDetails)
            && typeof isBuyer === "boolean"
        ) {
            setCompanyUuid(currentCompanyUUID);
        }
    }, [userPermission, userDetails, isBuyer]);

    const getPOStatus = (status, supplierAck) => {
        if (status === PO_STATUS.ISSUED && supplierAck === PO_STATUS.VIEWED && !isBuyer) return "PENDING ACKNOWLEDGEMENT";
        if ([PO_STATUS.PENDING_ISSUE, PO_STATUS.PENDING_REVIEW].includes(status)) return "PENDING ISSUE";
        return status?.replaceAll("_", " ") ?? "";
    };

    return (
        <Container fluid>
            {Prompt}
            <Formik
                initialValues={initialValues}
                validationSchema={formSchema}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue, dirty, handleSubmit
                }) => {
                    useEffect(() => {
                        if (approvalConfig) setFieldValue("approvalConfig", approvalConfig);
                    }, [approvalConfig]);

                    useEffect(() => {
                        if (
                            poDetailsStates.poUuid
                            && companyUuid
                            && (permission?.read || permission?.write || permission?.approve)
                        ) {
                            initData(isBuyer);
                        }
                    }, [poDetailsStates.poUuid, companyUuid]);

                    useEffect(() => {
                        if (poDetailsStates.poDetails) {
                            const { poDetails, supplierAck } = poDetailsStates;
                            const {
                                auditTrailDtoList,
                                poDocumentDtoList,
                                poAuditTrailDtoList,
                                buyerInformationDto,
                                poItemDtoList
                            } = poDetails;
                            setFieldValue("sourceCurrencyCode", poDetails?.sourceCurrencyCode || "");
                            if (!poDetails?.sourceCurrencyCode) {
                                if (poItemDtoList.length > 0) {
                                    setFieldValue("sourceCurrencyCode", poItemDtoList[0]?.currency || "");
                                }
                            }
                            const procurementType = poDetails?.procurementType?.toLowerCase() === "goods" ? "Goods" : "Service";
                            const approvalRouteName = poDetails?.approvalRouteName ?? poDetails.approvalCode ?? "";
                            setEnablePrefix(poDetails.poNumber === "Manual");
                            setFieldValue("enablePrefix", poDetails.poNumber === "Manual");
                            setFieldValue("poNumber", poDetails.poNumber === "Manual" ? "" : poDetails.poNumber);
                            setFieldValue("project", !!poDetails.projectCode);
                            setFieldValue("natureOfRequisition", poDetails.projectCode ? "Project" : "Non-Project");
                            setFieldValue("projectCode", poDetails.projectCode ?? "");
                            setFieldValue("projectTitle", poDetails.projectTitle ?? "");
                            setFieldValue("prNumber", poDetails.prNumber);
                            setFieldValue("prUuid", poDetails.prUuid || "");
                            setFieldValue("ppoUuid", poDetails.ppoUuid || "");
                            setFieldValue("poUuid", poDetails.poUuid);
                            setFieldValue("rfqNumber", poDetails.rfqNumber);
                            setFieldValue("rfqUuid", poDetails.rfqUuid);
                            setFieldValue("poStatus", getPOStatus(poDetails.status, supplierAck, isBuyer));
                            setFieldValue("currencyCode", poDetails.currencyCode || "");
                            setFieldValue("currencyName", poDetails.currencyName || "");
                            setFieldValue("prePoNumber", poDetails.ppoNumber || "");
                            setFieldValue("poTitle", poDetails.poTitle);
                            setFieldValue("procurementType", procurementType);
                            setFieldValue("approvalRouteSequence", poDetails.approvalSequence || "");
                            setFieldValue("approvalRouteName", approvalRouteName);
                            setFieldValue("approvalRouteUuid", poDetails.approvalCodeUuid);
                            setFieldValue("requestorName", poDetails.requesterName || "");
                            setFieldValue("convertedDate", convertToLocalTime(poDetails.convertedDate || ""));
                            setFieldValue("paymentTerms", poDetails.paymentTerms || "");
                            setFieldValue("remarks", poDetails.remark || "");
                            setFieldValue("poDate", convertToLocalTime(poDetails.poDate || ""));
                            setFieldValue("addressLabel", poDetails.supplierBillingAddress?.addressLabel || "");
                            setFieldValue("addressUuid", poDetails.supplierBillingAddress?.uuid || "");
                            setFieldValue("addressFirstLine", poDetails.supplierBillingAddress?.addressFirstLine || "");
                            setFieldValue("addressSecondLine", poDetails.supplierBillingAddress?.addressSecondLine || "");
                            setFieldValue("city", poDetails.supplierBillingAddress?.city || "");
                            setFieldValue("state", poDetails.supplierBillingAddress?.state || "");
                            setFieldValue("country", poDetails.supplierBillingAddress?.country || "");
                            setFieldValue("postalCode", poDetails.supplierBillingAddress?.postalCode || "");
                            setConvertFrom(!poDetails?.contracted ? FEATURE.PR : FEATURE.PPR);
                            setContracted(!!poDetails?.contracted);
                            setFieldValue("isPR", !poDetails?.contracted);
                            if (isBuyer) {
                                setFieldValue("supplier", poDetails.supplierDto || {});
                            } else {
                                setFieldValue("supplier", {
                                    companyCode: buyerInformationDto.buyerCode,
                                    companyName: buyerInformationDto.buyerName,
                                    contactPersonName: buyerInformationDto.contactName,
                                    contactPersonEmail: buyerInformationDto.contactEmail,
                                    countryOfOrigin: buyerInformationDto.country,
                                    companyRegNo: buyerInformationDto.companyRegNo,
                                    contactPersonWorkNumber: buyerInformationDto.contactNumber,
                                    countryCode: buyerInformationDto.countryCode
                                });
                                setFieldValue("issuedDate", convertToLocalTime(poDetails.issuedDate ?? ""));
                            }

                            setAuditTrails(auditTrailDtoList ?? poAuditTrailDtoList, convertAction);
                            const documentList = poDocumentDtoList ?? [];
                            attachmentActions.setAttachments(documentList, true, true); // internal attachments
                            attachmentActions.setAttachments(documentList, true, false); // external attachments
                            setLoading(false);
                        }
                    }, [poDetailsStates.poDetails]);

                    return (
                        <Form>
                            <Row className="justify-content-between mx-0 mb-2 align-items-center">
                                <HeaderMain
                                    title={t("PurchaseOrderDetails")}
                                    className="mb-3 mb-lg-3"
                                />

                                {!loading && ![PO_STATUS.PENDING_REVIEW, PO_STATUS.PENDING_APPROVAL, PO_STATUS.SENT_BACK, PO_STATUS.RECALLED, PO_STATUS.CANCELLED, PO_STATUS.REJECTED].includes(poStatus) && (
                                    <Button
                                        color="secondary"
                                        onClick={() => onViewPOPressHandler()}
                                        style={{ height: 40, minWidth: 100 }}
                                    >
                                        {t("ViewPO")}
                                    </Button>
                                )}
                            </Row>
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {convertFrom === FEATURE.PPR && isBuyer && <Requisition t={t} values={values} />}
                                            <InitialSetting
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                disabled
                                                isBuyer={isBuyer}
                                                setFieldValue={setFieldValue}
                                                enablePrefix={enablePrefix}
                                            />
                                            <SupplierInfor t={t} values={values} isBuyer={isBuyer} />
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            <GeneralInformation
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                procurementTypes={poDetailsStates.procurementTypes}
                                                approvalRoutes={approvalRoutes}
                                                poStatus={poStatus}
                                                isBuyer={isBuyer}
                                                prCreator={prCreator}
                                                setDirty={setDirty}
                                                approvalRef={approvalRef}
                                            />
                                            {/* Request Terms */}
                                            <RequestTerms
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                poStatus={poStatus}
                                                isBuyer={isBuyer}
                                                prCreator={prCreator}
                                                setDirty={setDirty}
                                                setFieldValue={setFieldValue}
                                                addresses={addresses}
                                                supplierAddress={supplierAddress}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={12}>
                                    <PurchaseOrderItems
                                        uoms={uoms}
                                        currencies={currencies}
                                        addresses={addresses}
                                        glAccounts={glAccounts}
                                        taxRecords={taxRecords}
                                        categories={categories}
                                        gridHeight={350}
                                        disabled={![PO_STATUS.PENDING_REVIEW, PO_STATUS.RECALLED, PO_STATUS.SENT_BACK].includes(poStatus) || !prCreator}
                                        isSupplier={!isBuyer}
                                        isProject={values.project}
                                        gridApi={gridApi}
                                        setGridApi={setGridApi}
                                        poItemDtoList={poDetailsStates?.poDetails?.poItemDtoList ?? []}
                                        values={values}
                                        setDirty={setDirty}
                                        inSourceCurrencyTotal={inSourceCurrencyTotal}
                                        setInSourceCurrencyTotal={setInSourceCurrencyTotal}
                                        inDocumentCurrencyTotal={inDocumentCurrencyTotal}
                                        setInDocumentCurrencyTotal={setInDocumentCurrencyTotal}
                                        setFieldValue={setFieldValue}
                                        prCreator={prCreator}
                                        showToast={showToast}
                                        poStatus={poStatus}
                                        convertFrom={convertFrom}
                                        contracted={contracted}
                                        setContracted={setContracted}
                                        approvalRef={approvalRef}
                                    />
                                </Col>
                            </Row>

                            {isBuyer
                                && [PO_STATUS.ISSUED, PO_STATUS.CLOSED, PO_STATUS.PARTIALLY_DELIVERED].includes(poStatus)
                                && <DeliveryDetails items={poDetailsStates?.poDetails?.grItemDtoList} poStatus={poStatus} />}

                            <HeaderSecondary
                                title={t("Conversations")}
                                className="mb-2"
                            />
                            {isBuyer && (
                                <Row className="mb-2">
                                    <Col xs={12}>
                                        {/* Internal Conversations */}
                                        <Conversation
                                            title={t("InternalConversations")}
                                            activeTab={poDetailsStates.activeInternalTab}
                                            setActiveTab={(idx) => {
                                                setPODetailsStates((prevStates) => ({
                                                    ...prevStates,
                                                    activeInternalTab: idx
                                                }));
                                            }}
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
                                            disabled={!enableConversation}
                                        />
                                    </Col>
                                </Row>
                            )}

                            <Row className="mb-4">
                                <Col xs={12}>
                                    {/* External Conversations */}
                                    <Conversation
                                        title={t("ExternalConversations")}
                                        activeTab={poDetailsStates.activeExternalTab}
                                        setActiveTab={(idx) => {
                                            setPODetailsStates((prevStates) => ({
                                                ...prevStates,
                                                activeExternalTab: idx
                                            }));
                                        }}
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
                                        disabled={!enableConversation}
                                    />
                                </Col>
                            </Row>

                            {!isBuyer && (
                                <Row className="mb-4">
                                    <Col xs={12}>
                                        <Blockchain
                                            defaultExpanded
                                            borderTopColor="#fff"
                                            rowDataHashes={[]}
                                            rowDataDocuments={[]}
                                        />
                                    </Col>
                                </Row>
                            )}

                            <HeaderSecondary
                                title={t("AuditTrail")}
                                className="mb-2"
                            />
                            <Row className="mb-5">
                                <Col xs={12}>
                                    {isBuyer && (
                                        <Overview
                                            rowData={poDetailsStates.rowDataOverview}
                                            rowDataAuditTrail={auditTrails}
                                            onGridReady={(params) => {
                                                params.api.sizeColumnsToFit();
                                            }}
                                            autoGroupColumnDef={autoGroupColumnDef}
                                            groupDefaultExpanded={-1}
                                            getDataPath={getDataPath}
                                            gridHeight={350}
                                            defaultExpanded
                                            borderTopColor="#AEC57D"
                                            paginationPageSize={10}
                                            activeTab={poDetailsStates.activeAuditTrailTab}
                                            setActiveTab={(idx) => {
                                                setPODetailsStates((prevStates) => ({
                                                    ...prevStates,
                                                    activeAuditTrailTab: idx
                                                }));
                                            }}
                                            companyUuid={companyUuid}
                                            isBuyer={isBuyer}
                                        />
                                    )}
                                    {!isBuyer && (
                                        <AuditTrail
                                            rowData={auditTrails}
                                            onGridReady={(params) => {
                                                params.api.sizeColumnsToFit();
                                            }}
                                            paginationPageSize={10}
                                            gridHeight={350}
                                            defaultExpanded
                                        />
                                    )}
                                </Col>
                            </Row>

                            {/* Footer */}
                            <Footer
                                t={t}
                                showToast={showToast}
                                poDetailsStates={poDetailsStates}
                                dirty={dirty}
                                errors={errors}
                                values={values}
                                permission={permission}
                                isBuyer={isBuyer}
                                setEnableConversation={setEnableConversation}
                                setPODetailsStates={setPODetailsStates}
                                onBackPressHandler={() => history.goBack()}
                                onIssuePressHandler={onIssuePressHandler}
                                previewModalRef={previewModalRef}
                                refActionModalCancel={refActionModalCancel}
                                refActionModalRecall={refActionModalRecall}
                                onClosePressHandler={onClosePressHandler}
                                onSubmitPressHandler={onSubmitPressHandler}
                                onAcknowledgePressHandler={onAcknowledgePressHandler}
                                onApprovePressHandler={onApprovePressHandler}
                                setShowReasonSendBack={setShowReasonSendBack}
                                setShowReasonCancel={setShowReasonCancel}
                                setAllTouched={handleSubmit}
                            />

                            <POPreviewModal
                                ref={previewModalRef}
                                isBuyer={isBuyer}
                                data={{
                                    ...values,
                                    itemList: getRowData(),
                                    contractReferenceNumber: poDetailsStates.poDetails ? poDetailsStates.poDetails.contractReferenceNumber : null
                                }}
                                companyUuid={companyUuid}
                                poAmountTotal={{ ...inSourceCurrencyTotal }}
                            />
                        </Form>
                    );
                }}
            </Formik>
            <CommonConfirmDialog
                isShow={poDetailsStates.showReason}
                onHide={() => setPODetailsStates((prevStates) => ({
                    ...prevStates,
                    showReason: false
                }))}
                title={t("Reason")}
                positiveProps={
                    {
                        onPositiveAction: () => onRejectPressHandler(),
                        contentPositive: t("Reject"),
                        colorPositive: "danger"
                    }
                }
                negativeProps={
                    {
                        onNegativeAction: () => setPODetailsStates((prevStates) => ({
                            ...prevStates,
                            showReason: false
                        })),
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
                    name="rejectReason"
                    className={
                        classNames("form-control", {
                            "is-invalid": poDetailsStates.showErrorReason && !poDetailsStates.reason
                        })
                    }
                    placeholder={t("PleaseEnterReason")}
                    value={poDetailsStates.reason}
                    onChange={(e) => {
                        const { value } = e.target;
                        setPODetailsStates((prevStates) => ({
                            ...prevStates,
                            reason: value
                        }));
                    }}
                />
                {
                    poDetailsStates.showErrorReason && !poDetailsStates.reason
                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                }
            </CommonConfirmDialog>
            <CommonConfirmDialog
                isShow={showReasonSendBack}
                onHide={() => setShowReasonSendBack(false)}
                title={t("Reason")}
                positiveProps={
                    {
                        onPositiveAction: () => onSendBackPressHandler(),
                        contentPositive: t("SendBack"),
                        colorPositive: "warning"
                    }
                }
                negativeProps={
                    {
                        onNegativeAction: () => setShowReasonSendBack(false),
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
                    name="sendBackReason"
                    className={
                        classNames("form-control", {
                            "is-invalid": showErrorReasonSendBack && !reasonSendBack
                        })
                    }
                    placeholder={t("PleaseEnterReason")}
                    value={reasonSendBack}
                    onChange={(evt) => setReasonSendBack(evt?.target?.value)}
                />
                {
                    showErrorReasonSendBack && !reasonSendBack
                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                }
            </CommonConfirmDialog>
            <CommonConfirmDialog
                isShow={showReasonCancel}
                onHide={() => setShowReasonCancel(false)}
                title={t("Reason")}
                positiveProps={
                    {
                        onPositiveAction: () => onClosePressHandler(),
                        contentPositive: t("MarkCompleted"),
                        colorPositive: "warning"
                    }
                }
                negativeProps={
                    {
                        onNegativeAction: () => setShowReasonCancel(false),
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
                    name="cancelReason"
                    className={
                        classNames("form-control", {
                            "is-invalid": showErrorReasonCancel && !reasonCancel
                        })
                    }
                    placeholder={t("PleaseEnterReason")}
                    value={reasonCancel}
                    onChange={(evt) => setReasonCancel(evt?.target?.value)}
                />
                {
                    showErrorReasonCancel && !reasonCancel
                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                }
            </CommonConfirmDialog>
            <ActionModal
                ref={refActionModalCancel}
                title="Cancel Purchase Order"
                body="Do you wish to cancel this order?"
                button="Yes"
                color="primary"
                textCancel="No"
                colorCancel="danger"
                action={() => onCancelPressHandler()}
            />
            <ActionModal
                ref={refActionModalRecall}
                title="Recall Request"
                body="Do you wish to recall this request?"
                button="Yes"
                color="primary"
                textCancel="No"
                colorCancel="danger"
                action={() => onRecallPressHandler()}
            />
        </Container>
    );
};

export default PODetails;
