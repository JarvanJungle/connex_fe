import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import useToast from "routes/hooks/useToast";
import useAttachment from "routes/hooks/useAttachment";
import useConversation from "routes/hooks/useConversation";
import useCustomState from "routes/hooks/useCustomState";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import { useAuditTrail } from "routes/hooks";
import { useSelector } from "react-redux";
import { Formik, Form } from "formik";
import { Container, Row, Col } from "components";
import { AuditTrail, Conversation, HeaderMain } from "routes/components";
import CurrenciesService from "services/CurrenciesService";
import TaxRecordDataService from "services/TaxRecordService";
import RequestForQuotationService from "services/RequestForQuotationService";
import ConversationService from "services/ConversationService/ConversationService";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS } from "helper/constantsDefined";
import {
    formatDateTime,
    convertToLocalTime,
    convertDate2String,
    getCurrentCompanyUUIDByStore
} from "helper/utilities";
import ActionModal from "routes/components/ActionModal";
import {
    InitialSettings,
    VendorInformation,
    GeneralInformation,
    RequestTerms,
    QuotationToSubmit
} from "../../components/Supplier";
import { Negotiation } from "../../components/Buyer";
import Footer from "./Footer";
import {
    quotationItemsSchema,
    quotationFormSchema,
    quotationUnconnectedSupplierFormSchema,
    RFQ_CONSTANTS,
    convertActionAuditTrail
} from "../../helper";
import { useQuotationToSubmit, useNegotiation } from "../../hooks";
import RFQ_ROUTES from "../../routes";

const RFQDetailsSupplier = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const modalSubmitRef = useRef(null);
    const modalUpdateRef = useRef(null);
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
    const [activeExternalTab, setActiveExternalTab] = useState(1);
    const [rfqUuid, setRFQUuid] = useState("");
    const [companyUuid, setCompanyUuid] = useState("");
    const [rfqDetails, setRFQDetails] = useCustomState({});
    const [taxRecords, setTaxRecords] = useCustomState([]);
    const [currencies, setCurrencies] = useCustomState([]);
    const [gridApi, columnApi, subTotal, total, tax, addItemActions] = useQuotationToSubmit(
        { setDirtyFunc: setDirty }
    );
    const [, externalAttachments, attachmentActions] = useAttachment({
        setDirtyFunc: setDirty,
        defaultValue: []
    });
    const [, externalConversations, conversationActions] = useConversation();
    const [auditTrails, setAuditTrails] = useAuditTrail([]);
    const [, negotiations, negotiationActions] = useNegotiation({ defaultValue: [] });
    const [loading, setLoading] = useState(true);
    const [rfqToken, setRFQToken] = useState(null);
    const [validationSchema, setValidationSchema] = useState(quotationFormSchema);

    const initialValues = {
        isUpdate: true,
        isEdit: false,
        // Initial Settings Form
        rfqNumber: "",
        rfqStatus: "",
        currencyCode: "",
        // Vendor Information Form
        vendorCode: "",
        vendorName: "",
        contactName: "",
        contactEmail: "",
        contactNumber: "",
        country: "",
        companyRegNo: "",
        // General Information Form
        rfqTitle: "",
        procurementType: "",
        requester: "",
        submittedDate: "",
        // Request Terms Form
        rfqType: "",
        validityStartDate: "",
        validityEndDate: "",
        dueDate: "",
        taxCode: "",
        note: ""
    };

    const initData = async (currentCompanyUuid) => {
        try {
            const query = new URLSearchParams(location.search);
            const uuid = query.get("uuid");
            negotiationActions.setRFQUuid(uuid);
            const token = query.get("token");
            const response = await Promise.allSettled([
                !token && CurrenciesService.getCurrencies(currentCompanyUuid),
                !token && TaxRecordDataService.getTaxRecords(currentCompanyUuid),
                !token && RequestForQuotationService.getRFQDetails(currentCompanyUuid, uuid, false),
                token && RequestForQuotationService.unconnectedSupplierGetRFQDetails(token)
            ]);
            const [
                responseCurrencies,
                responseTaxRecords,
                responseRFQDetails,
                responseUnconnectedSupplierRFQDetails
            ] = response;
            setCurrencies(
                responseCurrencies,
                {
                    isResponse: true,
                    filter: { condition: { active: true } },
                    sort: { key: "currencyName" }
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
                !token ? responseRFQDetails : responseUnconnectedSupplierRFQDetails,
                { isResponse: true }
            );
            setRFQUuid(uuid);
            setCompanyUuid(currentCompanyUuid);
            setRFQToken(token ?? "");
            if (token) {
                setValidationSchema(quotationUnconnectedSupplierFormSchema);
                setLoading(false);
            }
            if (!token) {
                setValidationSchema(quotationFormSchema);
            }
        } catch (error) {
            showToast("error", error.response
                ? `initData: ${error.response.data.message}`
                : `initData: ${error.message}`);
        }
    };

    const mappingBody = async (values) => {
        try {
            const body = {
                rfqUuid,
                quoteUuid: values.quoteUuid || "",
                currencyCode: values.currencyCode,
                taxCode: values.taxCode,
                quoteItemDtoList: [],
                documentMetaDataDtoList: []
            };

            // quoteItemDtoList
            const rowDataItems = addItemActions.getRowDataItems();
            body.quoteItemDtoList = rowDataItems.map((rowItem) => {
                if (rowItem.available === true) {
                    const currencyCode = typeof rowItem?.sourceCurrency === "string"
                        ? rowItem?.sourceCurrency
                        : rowItem?.sourceCurrency?.currencyCode;
                    const taxCodeItem = typeof rowItem?.taxCode === "string"
                        ? rowItem?.taxCode
                        : rowItem?.taxCode?.taxCode;

                    return {
                        rfqItemId: rowItem?.id?.[0],
                        currencyCode,
                        quotedUnitPrice: Number(rowItem.itemUnitPrice || 0),
                        taxCode: taxCodeItem,
                        taxRate: rowItem.taxPercentage,
                        quoteItemNote: rowItem.quoteItemNote
                    };
                }
                return {};
            }).filter((item) => !_.isEmpty(item));

            await quotationItemsSchema.validate(body.quoteItemDtoList);

            // documentMetaDataDtoList
            const documents = await attachmentActions.getNewAttachments();
            if (!Array.isArray(documents)) return documents;
            body.documentMetaDataDtoList = documents;

            if (!body.quoteUuid) delete body.quoteUuid;
            if (!body.taxCode) delete body.taxCode;

            return body;
        } catch (error) {
            return error.message;
        }
    };

    const mappingBodyUnconnectedSupplier = async (values) => {
        try {
            const body = {
                rfqUuid,
                token: rfqToken,
                currencyCode: values.currencyCode,
                taxCode: values.taxCode,
                quoteItemDtoList: []
            };

            // quoteItemDtoList
            const rowDataItems = addItemActions.getRowDataItems();
            body.quoteItemDtoList = rowDataItems.map((rowItem) => {
                if (rowItem.available === true) {
                    const currencyCode = typeof rowItem?.sourceCurrency === "string"
                        ? rowItem?.sourceCurrency
                        : rowItem?.sourceCurrency?.currencyCode;
                    const taxCodeItem = typeof rowItem?.taxCode === "string"
                        ? rowItem?.taxCode
                        : rowItem?.taxCode?.taxCode;

                    return {
                        rfqItemId: rowItem?.id?.[0] ?? rowItem?.id,
                        currencyCode,
                        quotedUnitPrice: Number(rowItem.itemUnitPrice || 0),
                        taxCode: taxCodeItem,
                        taxRate: rowItem.taxPercentage,
                        quoteItemNote: rowItem.quoteItemNote
                    };
                }
                return {};
            }).filter((item) => !_.isEmpty(item));

            await quotationItemsSchema.validate(body.quoteItemDtoList);

            if (!body.taxCode) delete body.taxCode;

            return body;
        } catch (error) {
            return error.message;
        }
    };

    const onUpdateQuotePressHandler = async (values) => {
        setPristine();
        try {
            if (!rfqToken) {
                const body = await mappingBody(values);
                if (!(typeof body === "object")) throw new Error(body);
                let hasQuotedUnitPriceZero = false;
                body.quoteItemDtoList.forEach((item) => {
                    if (item.quotedUnitPrice === 0) hasQuotedUnitPriceZero = true;
                });
                if (hasQuotedUnitPriceZero) {
                    modalUpdateRef?.current?.toggleModal();
                    return;
                }
                const response = await RequestForQuotationService.updateQuote(companyUuid, body);
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
            }
            // unconnected supplier
            if (rfqToken) {
                const body = await mappingBodyUnconnectedSupplier(values);
                if (!(typeof body === "object")) throw new Error(body);
                let hasQuotedUnitPriceZero = false;
                body.quoteItemDtoList.forEach((item) => {
                    if (item.quotedUnitPrice === 0) hasQuotedUnitPriceZero = true;
                });
                if (hasQuotedUnitPriceZero) {
                    modalSubmitRef?.current?.toggleModal();
                    return;
                }
                const response = await RequestForQuotationService.unconnectedSupplierSubmitQuote(
                    rfqToken, body
                );
                const { message, status } = response && response.data;
                if (status === RESPONSE_STATUS.OK) {
                    showToast("success", response.data.message);
                    setTimeout(() => {
                        history.push(RFQ_ROUTES.RFQ_LIST);
                    }, 1000);
                } else {
                    showToast("error", message);
                }
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const continueUpdateQuote = async (values) => {
        setPristine();
        try {
            if (!rfqToken) {
                const body = await mappingBody(values);
                const response = await RequestForQuotationService.updateQuote(companyUuid, body);
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
            }
            // unconnected supplier
            if (rfqToken) {
                const body = await mappingBodyUnconnectedSupplier(values);
                if (!(typeof body === "object")) throw new Error(body);
                const response = await RequestForQuotationService.unconnectedSupplierSubmitQuote(
                    rfqToken, body
                );
                const { message, status } = response && response.data;
                if (status === RESPONSE_STATUS.OK) {
                    showToast("success", response.data.message);
                    setTimeout(() => {
                        history.push(RFQ_ROUTES.RFQ_LIST);
                    }, 1000);
                } else {
                    showToast("error", message);
                }
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onSubmitQuotePressHandler = async (values) => {
        setPristine();
        try {
            // connected supplier
            if (!rfqToken) {
                const body = await mappingBody(values);
                if (!(typeof body === "object")) throw new Error(body);
                let hasQuotedUnitPriceZero = false;
                body.quoteItemDtoList.forEach((item) => {
                    if (item.quotedUnitPrice === 0) hasQuotedUnitPriceZero = true;
                });
                if (hasQuotedUnitPriceZero) {
                    modalSubmitRef?.current?.toggleModal();
                    return;
                }
                const response = await RequestForQuotationService.submitQuote(companyUuid, body);
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
            }
            // unconnected supplier
            if (rfqToken) {
                const body = await mappingBodyUnconnectedSupplier(values);
                if (!(typeof body === "object")) throw new Error(body);
                let hasQuotedUnitPriceZero = false;
                body.quoteItemDtoList.forEach((item) => {
                    if (item.quotedUnitPrice === 0) hasQuotedUnitPriceZero = true;
                });
                if (hasQuotedUnitPriceZero) {
                    modalSubmitRef?.current?.toggleModal();
                    return;
                }
                const response = await RequestForQuotationService.unconnectedSupplierSubmitQuote(
                    rfqToken, body
                );
                const { message, status } = response && response.data;
                if (status === RESPONSE_STATUS.OK) {
                    showToast("success", response.data.message);
                    setTimeout(() => {
                        history.push(RFQ_ROUTES.RFQ_LIST);
                    }, 1000);
                } else {
                    showToast("error", message);
                }
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const continueSubmitQuote = async (values) => {
        setPristine();
        try {
            // connected supplier
            if (!rfqToken) {
                const body = await mappingBody(values);
                if (!(typeof body === "object")) throw new Error(body);
                const response = await RequestForQuotationService.submitQuote(companyUuid, body);
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
            }
            // unconnected supplier
            if (rfqToken) {
                const body = await mappingBodyUnconnectedSupplier(values);
                if (!(typeof body === "object")) throw new Error(body);
                const response = await RequestForQuotationService.unconnectedSupplierSubmitQuote(
                    rfqToken, body
                );
                const { message, status } = response && response.data;
                if (status === RESPONSE_STATUS.OK) {
                    showToast("success", response.data.message);
                    setTimeout(() => {
                        history.push(RFQ_ROUTES.RFQ_LIST);
                    }, 1000);
                } else {
                    showToast("error", message);
                }
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const getConversation = async (pprUuid, uuid, buyerCompanyUuid) => {
        const responses = await Promise.allSettled([
            pprUuid && ConversationService.getDetailExternalConversation(buyerCompanyUuid, pprUuid),
            uuid && ConversationService.getDetailExternalConversation(buyerCompanyUuid, uuid)
        ]);
        const [
            responseExternalConversations,
            responseExternalConversationsRFQ
        ] = responses;
        conversationActions.setConversations([responseExternalConversations], true, false);
        conversationActions.setConversations([responseExternalConversationsRFQ], true, false);
        setLoading(false);
    };

    const convertRFQStatus = (status) => {
        switch (status) {
        case RFQ_CONSTANTS.CLOSED:
            return RFQ_CONSTANTS.CLOSED_FE;
        default:
            return status?.replaceAll("_", " ");
        }
    };

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
                    errors, values, touched, setFieldValue, dirty, setTouched, handleSubmit, isSubmitting
                }) => {
                    useEffect(() => {
                        if (!_.isEmpty(rfqDetails) && (rfqToken || companyUuid)) {
                            const {
                                pprUuid,
                                uuid,
                                rfqDocumentList,
                                rfqAuditTrailList,
                                buyerInfo,
                                rfqNegotiationList
                            } = rfqDetails;
                            if (rfqDetails.rfqStatus === RFQ_CONSTANTS.PENDING_QUOTATION
                                || rfqDetails.rfqStatus === RFQ_CONSTANTS.QUOTATION_IN_PROGRESS
                            ) {
                                setFieldValue("isEdit", true);
                            }
                            setFieldValue("rfqNumber", rfqDetails.rfqNumber);
                            setFieldValue("rfqStatus", convertRFQStatus(rfqDetails.rfqStatus));
                            setFieldValue("rfqTitle", rfqDetails.rfqTitle);
                            setFieldValue("rfqType", rfqDetails.rfqType);
                            setFieldValue("vendorCode", buyerInfo?.buyerCode ?? "");
                            setFieldValue("vendorName", buyerInfo?.buyerName ?? "");
                            setFieldValue("contactName", buyerInfo?.contactName ?? "");
                            setFieldValue("contactEmail", buyerInfo?.contactEmail ?? "");
                            setFieldValue("currencyCode", rfqDetails?.currencyCode ?? "");
                            setFieldValue("currencyName", rfqDetails?.currencyName ?? "");
                            const contactNumber = `+${buyerInfo?.countryCode} ${buyerInfo?.contactNumber}`;
                            setFieldValue("contactNumber", contactNumber);
                            setFieldValue("country", buyerInfo?.country ?? "");
                            setFieldValue("companyRegNo", buyerInfo?.companyRegNo ?? "");
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
                            const validityEndDate = formatDateTime(
                                rfqDetails.validityEndDate,
                                CUSTOM_CONSTANTS.YYYYMMDD
                            );
                            setFieldValue("validityEndDate", new Date(validityEndDate));
                            const validityStartDate = formatDateTime(
                                rfqDetails.validityStartDate,
                                CUSTOM_CONSTANTS.YYYYMMDD
                            );
                            setFieldValue("validityStartDate", new Date(validityStartDate));
                            const dueDate = formatDateTime(
                                rfqDetails.dueDate,
                                CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                            );
                            if (!rfqUuid) setRFQUuid(uuid);
                            setFieldValue("dueDate", new Date(dueDate));
                            setFieldValue("note", rfqDetails.note || "");
                            attachmentActions.setAttachments(rfqDocumentList ?? [], true, false);
                            setAuditTrails(rfqAuditTrailList, convertActionAuditTrail);
                            if (buyerInfo?.companyUuid) {
                                getConversation(pprUuid, uuid, buyerInfo?.companyUuid);
                            }
                            if (companyUuid && !rfqToken) {
                                negotiationActions.setNewNegotiations(rfqNegotiationList ?? []);
                            }
                        }
                    }, [rfqDetails, companyUuid, rfqToken]);

                    useEffect(() => {
                        if (gridApi && columnApi && (typeof rfqToken === "string")) {
                            const { rfqItemList } = rfqDetails;
                            const rowDataItem = [];
                            let quoteItems = [];
                            if (rfqDetails.quoteSubmitted === true) {
                                const { quoteDto } = rfqDetails;
                                const { quoteItemDtoList } = quoteDto;
                                quoteItems = quoteItemDtoList;
                                setFieldValue("quoteUuid", quoteDto.uuid);
                                if (quoteDto?.currencyCode) setFieldValue("currencyCode", quoteDto.currencyCode);
                                if (quoteDto?.currencyName) setFieldValue("currencyName", quoteDto.currencyName);
                                setFieldValue("taxCode", quoteDto.taxCode);
                            } else {
                                // const defaultCurrency = currencies.find(
                                //     (item) => item.defaultCurrency === true
                                // );
                                // if (!rfqToken) {
                                //     setFieldValue("currencyCode", defaultCurrency?.currencyCode ?? "");
                                // }
                            }
                            const disabled = (
                                rfqDetails.rfqStatus !== RFQ_CONSTANTS.PENDING_QUOTATION
                                && rfqDetails.rfqStatus !== RFQ_CONSTANTS.QUOTATION_IN_PROGRESS
                            );
                            if (!rfqDetails?.quoteSubmitted) {
                                rfqItemList.forEach((data) => {
                                    const itemRequest = {
                                        uuid: uuidv4(),
                                        id: [data.id],
                                        available: true,
                                        quotationItem: true,
                                        itemCode: [data.itemCode || ""],
                                        itemName: data.itemName || "",
                                        itemDescription: data.itemDescription || "",
                                        itemModel: data.itemModel || "",
                                        itemSize: data.itemSize || "",
                                        itemBrand: data.itemBrand || "",
                                        uom: data.uom || "",
                                        note: data.note,
                                        quoteItemNote: "",
                                        taxCode: "",
                                        taxPercentage: 0,
                                        address: data?.address?.addressLabel ?? "",
                                        requestedDeliveryDate: convertDate2String(
                                            data.requestedDeliveryDate,
                                            CUSTOM_CONSTANTS.YYYYMMDD
                                        ),
                                        itemUnitPrice: 0,
                                        itemQuantity: Number(data.itemQuantity),
                                        sourceCurrency: currencies.find(
                                            (item) => item.currencyCode === data.sourceCurrency
                                        ) ?? data.sourceCurrency,
                                        disabled,
                                        unconnectedSupplier: !!rfqToken,
                                        submitted: rfqDetails?.quoteSubmitted
                                    };
                                    rowDataItem.push(itemRequest);
                                });
                                gridApi.setRowData(rowDataItem);
                                addItemActions.cellEditingStopped();
                            }
                            if (rfqDetails?.quoteSubmitted) {
                                rfqItemList?.forEach((data) => {
                                    const quoteItem = quoteItems.find(
                                        (item) => item.rfqItemId === data.id
                                    );
                                    const unitPrice = quoteItem ? quoteItem?.quotedUnitPrice : 0;
                                    const taxCode = (quoteItem ? quoteItem?.taxCode : "");
                                    const taxValue = Number(quoteItem ? quoteItem?.taxRate : 0);
                                    const quoteItemNote = (quoteItem ? quoteItem?.quoteItemNote : "");
                                    const currencyCode = (quoteItem ? quoteItem?.currencyCode : "");
                                    const itemRequest = {
                                        uuid: uuidv4(),
                                        id: [data.id],
                                        // available: quoteItems.some(
                                        //     (item) => item.rfqItemId === data.id
                                        // ) || quoteItems.length === 0,
                                        available: true,
                                        quotationItem: quoteItems.some(
                                            (item) => item.rfqItemId === data.id
                                        ) || quoteItems.length === 0,
                                        itemCode: [data.itemCode || ""],
                                        itemName: data.itemName || "",
                                        itemDescription: data.itemDescription || "",
                                        itemModel: data.itemModel || "",
                                        itemSize: data.itemSize || "",
                                        itemBrand: data.itemBrand || "",
                                        uom: data.uom || "",
                                        note: data.note,
                                        quoteItemNote: rfqDetails.quoteSubmitted ? quoteItemNote : "",
                                        taxCode: rfqDetails.quoteSubmitted ? taxCode : "",
                                        taxPercentage: rfqDetails.quoteSubmitted ? taxValue : 0,
                                        address: data?.address?.addressLabel ?? "",
                                        requestedDeliveryDate: convertDate2String(
                                            data.requestedDeliveryDate,
                                            CUSTOM_CONSTANTS.YYYYMMDD
                                        ),
                                        itemUnitPrice: rfqDetails.quoteSubmitted ? unitPrice : 0,
                                        itemQuantity: Number(data.itemQuantity),
                                        sourceCurrency: currencies.find(
                                            (item) => item.currencyCode === currencyCode
                                        ) ?? currencyCode,
                                        disabled,
                                        unconnectedSupplier: !!rfqToken,
                                        submitted: rfqDetails?.quoteSubmitted
                                    };
                                    rowDataItem.push(itemRequest);
                                    if (quoteItem) {
                                        const { quoteItemAuditTrailDtoList } = quoteItem;
                                        if (quoteItemAuditTrailDtoList?.length === 0) {
                                            rowDataItem.push({
                                                uuid: uuidv4(),
                                                id: [data.id, ""],
                                                itemCode: [data.itemCode || "", ""],
                                                itemUnitPrice: Number(unitPrice),
                                                netPrice: Number(unitPrice)
                                                    * Number(quoteItem?.itemQuantity),
                                                taxCode: quoteItem?.taxCode || "",
                                                taxPercentage: quoteItem?.taxRate || 0,
                                                quoteItemNote: quoteItem?.quoteItemNote || "",
                                                quotedDate: convertToLocalTime(
                                                    quoteItem?.quotedDate
                                                ),
                                                sourceCurrency: currencies.find(
                                                    (item) => item.currencyCode === currencyCode
                                                ) ?? currencyCode
                                            });
                                        } else {
                                            quoteItemAuditTrailDtoList?.reverse();
                                            quoteItemAuditTrailDtoList.forEach((item) => {
                                                console.debug("123123", item);
                                                rowDataItem.push({
                                                    uuid: uuidv4(),
                                                    id: [data.id, uuidv4()],
                                                    itemCode: [data.itemCode || "", uuidv4()],
                                                    itemUnitPrice: Number(item.quotedUnitPrice),
                                                    netPrice: Number(item.quotedUnitPrice)
                                                        * Number(item?.itemQuantity),
                                                    taxCode: item?.taxCode || "",
                                                    taxPercentage: item?.taxRate || 0,
                                                    quoteItemNote: item?.quoteItemNote || "",
                                                    quotedDate: convertToLocalTime(
                                                        item?.quotedDate
                                                    ),
                                                    sourceCurrency: currencies.find(
                                                        (currency) => currency
                                                            .currencyCode === item.currencyCode
                                                    ) ?? item.currencyCode
                                                });
                                            });
                                        }
                                    }
                                });

                                gridApi.setRowData(rowDataItem);
                                addItemActions.cellEditingStopped();
                            }
                        }
                    }, [gridApi, columnApi, rfqToken]);

                    useEffect(() => {
                        const query = new URLSearchParams(location.search);
                        const token = query.get("token");
                        if (token) {
                            initData("");
                        }
                    }, []);

                    useEffect(() => {
                        if (!_.isEmpty(userDetails) && !_.isEmpty(permissionReducer)
                        ) {
                            const currentCompanyUuid = getCurrentCompanyUUIDByStore(
                                permissionReducer
                            );
                            if (currentCompanyUuid) initData(currentCompanyUuid);
                        }
                    }, [userDetails, permissionReducer]);

                    useEffect(() => {
                        if (values.currencyCode) {
                            setTouched(({
                                ...touched,
                                currencyCode: true
                            }));
                        }
                    }, [values.currencyCode]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* Initial Settings */}
                                            <InitialSettings
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                setFieldValue={setFieldValue}
                                                currencies={currencies}
                                                disabled={!values.isEdit}
                                                gridApi={gridApi}
                                                loading={loading}
                                                rfqToken={rfqToken}
                                            />
                                            {/* Vendor Information */}
                                            <VendorInformation
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                loading={loading}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* General Information */}
                                            <GeneralInformation
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                loading={loading}
                                            />
                                            {/* Request Terms */}
                                            <RequestTerms
                                                t={t}
                                                errors={errors}
                                                touched={touched}
                                                values={values}
                                                taxRecords={taxRecords}
                                                setFieldValue={setFieldValue}
                                                disabled={!values.isEdit}
                                                loading={loading}
                                                gridApi={gridApi}
                                                unconnectedSupplier={!!rfqToken}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            {!loading && (
                                <>
                                    <Row className={rfqToken ? "mb-5" : "mb-4"}>
                                        <Col xs={12}>
                                            <QuotationToSubmit
                                                t={t}
                                                unconnectedSupplier={!!rfqToken}
                                                onCellValueChanged={addItemActions
                                                    .onCellValueChanged}
                                                cellEditingStopped={addItemActions
                                                    .cellEditingStopped}
                                                onGridReady={(params) => {
                                                    addItemActions.setGridApi(params.api);
                                                    addItemActions.setColumnApi(params.columnApi);
                                                }}
                                                taxRecords={taxRecords}
                                                currencies={currencies}
                                                subTotal={subTotal}
                                                tax={tax}
                                                total={total}
                                                values={values}
                                                isBuyer={false}
                                            />
                                        </Col>
                                    </Row>

                                    {!rfqToken && (
                                        <>
                                            <HeaderSecondary
                                                title={t("Negotiation")}
                                                className="mb-2"
                                            />
                                            <Row>
                                                <Col xs={12} md={12} lg={12}>
                                                    <Negotiation
                                                        t={t}
                                                        disabled={!values.isEdit}
                                                        negotiations={negotiations}
                                                        negotiationActions={negotiationActions}
                                                        isBuyer={false}
                                                    />
                                                </Col>
                                            </Row>
                                        </>
                                    )}

                                    {!rfqToken && (
                                        <>
                                            <HeaderSecondary
                                                title={t("Conversations")}
                                                className="mb-2"
                                            />
                                            <Row className="mb-4">
                                                <Col xs={12}>
                                                    {/* External Conversations */}
                                                    <Conversation
                                                        title={t("ExternalConversations")}
                                                        activeTab={activeExternalTab}
                                                        setActiveTab={(idx) => {
                                                            setActiveExternalTab(idx);
                                                        }}
                                                        sendConversation={
                                                            (comment) => conversationActions
                                                                .sendCommentConversation(
                                                                    comment, false
                                                                )
                                                        }
                                                        addNewRowAttachment={() => attachmentActions
                                                            .addNewRowAttachment(false)}
                                                        rowDataConversation={externalConversations}
                                                        rowDataAttachment={externalAttachments}
                                                        onDeleteAttachment={
                                                            (uuid, rowData) => attachmentActions
                                                                .onDeleteAttachment(
                                                                    uuid, rowData, false
                                                                )
                                                        }
                                                        onAddAttachment={
                                                            (e, uuid, rowData) => attachmentActions
                                                                .onAddAttachment(
                                                                    e, uuid, rowData, false
                                                                )
                                                        }
                                                        onCellEditingStopped={
                                                            (params) => attachmentActions
                                                                .onCellEditingStopped(
                                                                    params, false
                                                                )
                                                        }
                                                        defaultExpanded
                                                        borderTopColor="#A9A2C1"
                                                        disabled={
                                                            !values.isEdit
                                                            && !values.isUpdate
                                                        }
                                                    />
                                                </Col>
                                            </Row>
                                        </>
                                    )}
                                </>
                            )}

                            {!rfqToken && (
                                <>
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
                                </>
                            )}

                            {/* Footer */}
                            <Footer
                                t={t}
                                showToast={showToast}
                                rfqDetails={rfqDetails}
                                dirty={dirty}
                                errors={errors}
                                values={values}
                                loading={loading}
                                handleSubmit={handleSubmit}
                                onSubmitQuotePressHandler={onSubmitQuotePressHandler}
                                onUpdateQuotePressHandler={onUpdateQuotePressHandler}
                                onBackPressHandler={() => history.goBack()}
                                isSubmitting={isSubmitting}
                            />
                            <ActionModal
                                ref={modalUpdateRef}
                                title={t("UpdateQuote")}
                                body={t("You have (an) item(s) having Quoted Unit Price = 0. Still you want to submit the quote?")}
                                button={t("Update")}
                                color="warning"
                                action={() => continueUpdateQuote(values)}
                            />
                            <ActionModal
                                ref={modalSubmitRef}
                                title={t("SubmitQuote")}
                                body={t("You have (an) item(s) having Quoted Unit Price = 0. Still you want to submit the quote?")}
                                button={t("Submit")}
                                color="warning"
                                action={() => continueSubmitQuote(values)}
                            />
                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
        </Container>
    );
};

export default RFQDetailsSupplier;
