import {
    Button, Col, Container, Row
} from "components";
import { Formik, Form } from "formik";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CUSTOM_CONSTANTS, { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import { convertDate2String, getCurrentCompanyUUIDByStore, roundNumberWithUpAndDown } from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { Conversation, Overview } from "routes/components";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import { useHistory, useLocation } from "react-router";
import InvoiceService from "services/InvoiceService/InvoiceService";
import { HeaderMain } from "routes/components/HeaderMain";
import ConversationService from "services/ConversationService/ConversationService";
import { convertToLocalTime } from "helper/utilities";
import CurrenciesService from "services/CurrenciesService";
import { usePermission } from "routes/hooks";
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
    getTotalInvoiceAmount,
    getBalance
} from "../helper";
import SummaryInvoiceTable from "../components/SummaryInvoiceTable";
import { DVPC_INVOICE_TYPE } from "../helper/constant";

const InvoiceDetails = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { isBuyer } = permissionReducer;
    const showToast = useToast();

    const [invState, setInvState] = useState({
        companyUuid: "",
        invoiceUuid: "",
        activeInternalTab: 1,
        activeExternalTab: 1,
        rowDataExternalConversation: [],
        rowDataInternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataAuditTrail: [],
        activeAuditTrailTab: 1,
        rowDataOverview: []
    });
    const [invoiceDetails, setInvoiceDetails] = useState(null);
    const [currencies, setCurrencies] = useState([]);
    const [rowDataItemsTypeNonPO, setRowDataItemsTypeNonPO] = useState([]);
    const [rowDataItemsTypePO, setRowDataItemsTypePO] = useState([]);
    const [rowDataItemsTypeDO, setRowDataItemsTypeDO] = useState([]);
    const [invoiceTypes, setInvoiceTypes] = useState([]);
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

    const handleRolePermission = usePermission(FEATURE.INV);

    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        cellRendererParams: { suppressCount: true },
        valueFormatter: (params) => params.data.type
    };

    const initialValues = {
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
        invoiceDate: "", // convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
        invoiceDueDate: "",
        invoiceSubmittedDate: "",
        totalAmount: 0,
        expectedAmount: 0,
        expectedAmountGiven: false
    };

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

    const getDataConversation = (responseData, isInternal = true) => {
        const result = [];
        if (responseData.status === RESPONSE_STATUS.FULFILLED) {
            const { value } = responseData;
            if (!value) return result;
            const { data, status, message } = value && value.data;
            if (status === RESPONSE_STATUS.OK) {
                if (data) {
                    data.conversations.forEach((item) => {
                        result.push({
                            userName: item.sender,
                            userRole: item.designation,
                            userUuid: item.userUuid,
                            dateTime: convertDate2String(
                                isInternal ? item.date : item.createdAt,
                                CUSTOM_CONSTANTS.DDMMYYYHHmmss
                            ),
                            comment: item.text,
                            externalConversation: true
                        });
                    });
                }
            } else {
                showToast("error", message);
            }
        } else {
            const { response } = responseData && responseData.reason;
            showToast("error", response.data.message || response.data.error);
        }
        return result;
    };

    const initData = async (companyUuid, invoiceUuid) => {
        try {
            const query = new URLSearchParams(location.search);
            const OPC = query.get("isOPC");

            let responses;
            if (OPC) {
                responses = await Promise.allSettled([
                    InvoiceService.getOPCInvoiceDetail(companyUuid, invoiceUuid, isBuyer),
                    CurrenciesService.getCurrencies(companyUuid)
                ]);
            } else {
                responses = await Promise.allSettled([
                    InvoiceService.getInvDetails(companyUuid, invoiceUuid, isBuyer),
                    CurrenciesService.getCurrencies(companyUuid)
                ]);
            }
            const [
                responseInvDetails,
                responseCurrencies
            ] = responses;
            const invDetails = getDataResponse(responseInvDetails, "object");
            setInvoiceDetails(invDetails);

            const { supplierDto, buyerDto } = invDetails;
            let rowDataExternalConversation = [];
            let rowDataInternalConversation = [];

            const responsesConversation = await Promise.allSettled([
                // buyer
                isBuyer && ConversationService.getDetailInternalConversation(
                    companyUuid, invoiceUuid
                ),
                ConversationService.getDetailExternalConversation(companyUuid, invoiceUuid),
                isBuyer && supplierDto
                && supplierDto.supplierCompanyUuid
                && ConversationService.getDetailExternalConversation(
                    supplierDto.supplierCompanyUuid, invoiceUuid
                ),
                // supplier
                !isBuyer && buyerDto
                && buyerDto.buyerCompanyUuid
                && ConversationService.getDetailExternalConversation(
                    buyerDto.buyerCompanyUuid, invoiceUuid
                ),
                ConversationService.getDetailExternalConversation(companyUuid, invoiceUuid)
            ]);

            const [
                // buyer
                internalConversationBuyerSide,
                externalConversationBuyerSide,
                supplierExternalConversationBuyerSide,
                // supplier
                buyerExternalConversationSupplierSide,
                externalConversationSupplierSide
            ] = responsesConversation;

            if (isBuyer) {
                rowDataInternalConversation = rowDataInternalConversation.concat(
                    getDataConversation(internalConversationBuyerSide)
                );

                rowDataExternalConversation = rowDataExternalConversation.concat(
                    getDataConversation(externalConversationBuyerSide, false),
                    getDataConversation(supplierExternalConversationBuyerSide, false)
                );
            }

            if (!isBuyer) {
                rowDataExternalConversation = rowDataExternalConversation.concat(
                    getDataConversation(buyerExternalConversationSupplierSide, false),
                    getDataConversation(externalConversationSupplierSide, false)
                );
            }

            const overview = [];
            try {
                const resOverview = await InvoiceService
                    .getInvOverviewDetails(companyUuid, invoiceUuid, isBuyer);
                if (resOverview.data.status === RESPONSE_STATUS.OK) {
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
                console.log(error);
                showToast("error", error.response ? error.response.data.message : error.message);
            }

            setInvState((prevStates) => ({
                ...prevStates,
                companyUuid,
                invoiceUuid,
                rowDataExternalConversation,
                rowDataInternalConversation,
                rowDataOverview: overview
            }));
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

    const onViewInvoicePressHandler = async () => {
        try {
            const {
                companyUuid,
                invoiceUuid
            } = invState;

            const response = await InvoiceService.viewPDF(
                companyUuid, invoiceUuid, isBuyer
            );

            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const { url } = data;
                if (url) {
                    window.open(url);
                }
            } else {
                showToast("error", response.data.message || response.data.data);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const invoiceUuid = query.get("uuid");
        if (!_.isEmpty(permissionReducer)
            && !_.isEmpty(userDetails)
        ) {
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            if (companyUuid && typeof isBuyer === "boolean") {
                initData(companyUuid, invoiceUuid);
            }
        }
    }, [permissionReducer, userDetails, isBuyer]);

    const convertActionAuditTrail = (action) => {
        switch (action) {
        case INVOICE_CONSTANTS.PROJECT_INVOICE_CREATED:
            return "Created Project Invoice";
        case INVOICE_CONSTANTS.NON_PO_INVOICE_CREATED:
            return "Created Non-PO Invoice";
        case INVOICE_CONSTANTS.ISSUE_PENDING_APPROVAL_INVOICE:
            return "Issued Invoice";
        case INVOICE_CONSTANTS.INVOICE_REJECTED:
        case INVOICE_CONSTANTS.REJECT_PENDING_APPROVAL_INVOICE:
            return "Rejected Invoice";
        case INVOICE_CONSTANTS.INVOICE_APPROVED:
            return "Approved Invoice";
        case INVOICE_CONSTANTS.DO_INVOICE_CREATED:
            return "Created DO Invoice";
        case INVOICE_CONSTANTS.INVOICE_REISSUED:
            return "Reissued invoice";
        default:
            return action;
        }
    };
    const onReissueInvoiceHandler = (values) => {
        history.push({
            pathname: INVOICE_ROUTES.CREATE_INV,
            invState,
            values,
            invoiceDetails
        });
    };
    const renderActionButton = (values) => {
        if (invoiceDetails !== null && invoiceDetails.invoiceStatus === "REJECTED") {
            return (
                <div className="mx-0">
                    <Button
                        className="mr-3"
                        color="primary"
                        type="button"
                        onClick={() => {
                            onReissueInvoiceHandler(values);
                        }}
                    >
                        {t("Reissue")}
                    </Button>
                </div>
            );
        }
        return (<></>);
    };

    return (
        <Container fluid>
            <Formik
                initialValues={initialValues}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue
                }) => {
                    useEffect(() => {
                        if (typeof isBuyer !== "boolean") return;
                        setInvoiceTypes([
                            { label: "DO Invoice", value: INVOICE_CONSTANTS.DO },
                            { label: "PO Invoice", value: INVOICE_CONSTANTS.PO },
                            { label: "Non-PO Invoice", value: INVOICE_CONSTANTS.NON_PO }
                        ]);
                    }, [isBuyer]);

                    useEffect(() => {
                        if (invoiceDetails) {
                            const {
                                buyerDto = {},
                                supplierDto = {},
                                invoiceItemDtoList = [],
                                invoiceAuditTrailDtoList = [],
                                invoiceDocumentMetadataDtoList = []
                            } = invoiceDetails;
                            if ([
                                DVPC_INVOICE_TYPE.DVPC_INVOICE_PROJECT.key,
                                DVPC_INVOICE_TYPE.DVPC_INVOICE_NON_PROJECT.key
                            ].includes(invoiceDetails?.invoiceType)) {
                                setFieldValue("invoiceNo", invoiceDetails.invoiceNumber);
                                setFieldValue("project", invoiceDetails.projectTitle);
                                setFieldValue("currencyCode", invoiceDetails.currencyCode);
                                setFieldValue("woTitle", invoiceDetails.workOrderTitle);
                                setFieldValue("invoiceDate", convertDate2String(invoiceDetails.invoiceDate, CUSTOM_CONSTANTS.YYYYMMDD));
                                setFieldValue("invoiceDueDate", convertDate2String(invoiceDetails.invoiceDueDate, CUSTOM_CONSTANTS.YYYYMMDD));
                                setFieldValue("invoiceRefNumber", invoiceDetails.invoiceReferenceNumber);
                                setFieldValue("claimReferenceMonth", invoiceDetails.paymentClaimReferenceMonth);
                                setFieldValue("note", invoiceDetails.note);
                                const venderInformation = (
                                    isBuyer
                                        ? invoiceDetails.supplierInformation
                                        : invoiceDetails.buyerInformation)
                                    || {};
                                const { address = {} } = venderInformation;
                                setFieldValue("supplierCode", venderInformation.vendorCode || "");
                                setFieldValue("companyName", venderInformation.vendorName);
                                setFieldValue("addressLabel", address.addressLabel || "");
                                setFieldValue("addressFirstLine", address.addressFirstLine || "");
                                setFieldValue("addressSecondLine", address.addressSecondLine || "");
                                setFieldValue("city", address.city || "");
                                setFieldValue("state", address.state || "");
                                setFieldValue("country", address.country || "");
                                setFieldValue("postalCode", address.postalCode || "");
                                setFieldValue("paymentTerms", invoiceDetails.paymentTerm || "0");
                                setFieldValue("ptDays", Number(invoiceDetails.paymentTerm || "0"));
                            } else {
                                setFieldValue("invoiceType", invoiceDetails.invoiceType);
                                setFieldValue("invoiceNo", invoiceDetails.invoiceNo);
                                setFieldValue("currencyCode", invoiceDetails.currencyCode);
                                if (isBuyer) {
                                    setFieldValue("supplierCode", supplierDto.supplierCode || "");
                                    setFieldValue("supplierUuid", supplierDto.supplierUuid);
                                    setFieldValue("companyName", supplierDto.companyName);
                                    const { address = {} } = supplierDto;
                                    setFieldValue("addressLabel", address.addressLabel);
                                    setFieldValue("addressFirstLine", address.addressFirstLine);
                                    setFieldValue("addressSecondLine", address.addressSecondLine || "");
                                    setFieldValue("country", address.country);
                                    setFieldValue("city", address.city);
                                    setFieldValue("state", address.state);
                                    setFieldValue("postalCode", address.postalCode);
                                } else {
                                    setFieldValue("supplierCode", buyerDto.buyerCode || "");
                                    setFieldValue("buyerCompanyUuid", buyerDto.buyerCompanyUuid);
                                    setFieldValue("companyName", buyerDto.companyName);
                                    const { address = {} } = buyerDto;
                                    setFieldValue("addressLabel", address.addressLabel);
                                    setFieldValue("addressFirstLine", address.addressFirstLine);
                                    setFieldValue("addressSecondLine", address.addressSecondLine || "");
                                    setFieldValue("country", address.country);
                                    setFieldValue("city", address.city);
                                    setFieldValue("state", address.state);
                                    setFieldValue("postalCode", address.postalCode);
                                }
                                setFieldValue("paymentTerms", invoiceDetails.paymentTerms || "");
                                setFieldValue("expectedAmount", invoiceDetails.expectedAmount);
                                setFieldValue("expectedAmountGiven", invoiceDetails.expectedAmountGiven);
                                setFieldValue("invoiceDate", convertDate2String(invoiceDetails.invoiceDate, CUSTOM_CONSTANTS.YYYYMMDD));
                                setFieldValue("invoiceDueDate", convertDate2String(invoiceDetails.invoiceDueDate, CUSTOM_CONSTANTS.YYYYMMDD));
                                setFieldValue("invoiceSubmittedDate", convertDate2String(invoiceDetails.invoiceSubmissionDate, CUSTOM_CONSTANTS.DDMMYYYHHmmss));
                            }

                            if (invoiceDetails.invoiceType === INVOICE_CONSTANTS.DO) {
                                const newRowDataItemsTypeDO = invoiceItemDtoList.map((item) => ({
                                    ...item,
                                    poNetPrice: item.invoiceQty * item.poUnitPrice
                                }));
                                setRowDataItemsTypeDO(newRowDataItemsTypeDO);
                                let subTotal = roundNumberWithUpAndDown(newRowDataItemsTypeDO.reduce(
                                    (sum, item) => sum
                                        + roundNumberWithUpAndDown(item.invoiceNetPrice),
                                    0
                                ));
                                const diffTax = newRowDataItemsTypeDO.some((item) => item.invoiceTaxCodeValue !== newRowDataItemsTypeDO[0]?.invoiceTaxCodeValue);
                                let tax;
                                if (diffTax) {
                                    tax = roundNumberWithUpAndDown(newRowDataItemsTypeDO.reduce((sum, item) => {
                                        const result = roundNumberWithUpAndDown((
                                            roundNumberWithUpAndDown(item.invoiceNetPrice)
                                            * roundNumberWithUpAndDown(item.invoiceTaxCodeValue)
                                        ) / 100);
                                        return sum + result;
                                    }, 0));
                                } else {
                                    tax = roundNumberWithUpAndDown((subTotal * newRowDataItemsTypeDO[0]?.invoiceTaxCodeValue) / 100);
                                }

                                let total = roundNumberWithUpAndDown(subTotal + tax);
                                setInvoiceAmountDO({
                                    subTotal,
                                    tax,
                                    total
                                });

                                subTotal = roundNumberWithUpAndDown(newRowDataItemsTypeDO.reduce(
                                    (sum, item) => sum
                                        + roundNumberWithUpAndDown(item.poNetPrice),
                                    0
                                ));
                                const diffTaxPO = newRowDataItemsTypeDO.some((item) => item.poTaxCodeValue !== newRowDataItemsTypeDO[0]?.poTaxCodeValue);
                                if (diffTaxPO) {
                                    tax = roundNumberWithUpAndDown(newRowDataItemsTypeDO.reduce(
                                        (sum, item) => {
                                            const result = roundNumberWithUpAndDown((
                                                roundNumberWithUpAndDown(item.poNetPrice)
                                                * roundNumberWithUpAndDown(item.poTaxCodeValue)
                                            ) / 100);
                                            return sum + result;
                                        },
                                        0
                                    ));
                                } else {
                                    tax = roundNumberWithUpAndDown((subTotal * newRowDataItemsTypeDO[0]?.poTaxCodeValue) / 100);
                                }

                                total = roundNumberWithUpAndDown(subTotal + tax);
                                setAmountToInvoiceDO({
                                    subTotal,
                                    tax,
                                    total
                                });
                            }
                            if (invoiceDetails.invoiceType === INVOICE_CONSTANTS.PO) {
                                const newRowDataItemsTypePO = invoiceItemDtoList.map((item) => ({
                                    ...item,
                                    pendingInvoiceUnitPrice: item.poUnitPrice,
                                    pendingInvoiceNetPrice: item.poUnitPrice
                                        * item.pendingInvoiceQty
                                }));
                                setRowDataItemsTypePO(newRowDataItemsTypePO);
                                let subTotal = roundNumberWithUpAndDown(
                                    newRowDataItemsTypePO.reduce(
                                        (sum, item) => sum
                                            + roundNumberWithUpAndDown(item.invoiceNetPrice), 0
                                    )
                                );
                                let tax;
                                const diffTax = newRowDataItemsTypePO.some((item) => item.invoiceTaxCodeValue !== newRowDataItemsTypePO[0]?.invoiceTaxCodeValue);
                                if (diffTax) {
                                    tax = roundNumberWithUpAndDown(
                                        newRowDataItemsTypePO.reduce((sum, item) => {
                                            const result = roundNumberWithUpAndDown((
                                                roundNumberWithUpAndDown(item.invoiceNetPrice)
                                                * (item.invoiceTaxCodeValue)
                                            ) / 100);
                                            return sum + result;
                                        }, 0)
                                    );
                                } else {
                                    tax = roundNumberWithUpAndDown((subTotal * newRowDataItemsTypePO[0]?.invoiceTaxCodeValue) / 100);
                                }

                                let total = roundNumberWithUpAndDown(subTotal + tax);
                                setInvoiceAmountPO({
                                    subTotal,
                                    tax,
                                    total
                                });

                                subTotal = roundNumberWithUpAndDown(newRowDataItemsTypePO.reduce(
                                    (sum, item) => sum
                                        + roundNumberWithUpAndDown(item.pendingInvoiceNetPrice),
                                    0
                                ));
                                const diffTaxPO = newRowDataItemsTypePO.some((item) => item.poTaxCodeValue !== newRowDataItemsTypePO[0]?.poTaxCodeValue);
                                if (diffTaxPO) {
                                    tax = roundNumberWithUpAndDown(newRowDataItemsTypePO.reduce(
                                        (sum, item) => {
                                            const result = roundNumberWithUpAndDown((
                                                roundNumberWithUpAndDown(item.pendingInvoiceNetPrice)
                                                * roundNumberWithUpAndDown(item.poTaxCodeValue)
                                            ) / 100);
                                            return sum + result;
                                        },
                                        0
                                    ));
                                } else {
                                    tax = roundNumberWithUpAndDown((subTotal * newRowDataItemsTypePO[0]?.poTaxCodeValue) / 100);
                                }

                                total = roundNumberWithUpAndDown(subTotal + tax);
                                setAmountToInvoicePO({
                                    subTotal,
                                    tax,
                                    total
                                });
                            }
                            if (invoiceDetails.invoiceType === INVOICE_CONSTANTS.NON_PO) {
                                setRowDataItemsTypeNonPO(invoiceItemDtoList);
                                const subTotal = roundNumberWithUpAndDown(invoiceItemDtoList.reduce(
                                    (sum, item) => sum
                                        + roundNumberWithUpAndDown(item.invoiceNetPrice),
                                    0
                                ));
                                const diffTax = invoiceItemDtoList.some((item) => item.invoiceTaxCodeValue !== invoiceItemDtoList[0]?.invoiceTaxCodeValue);
                                let tax;
                                if (diffTax) {
                                    tax = roundNumberWithUpAndDown(
                                        invoiceItemDtoList.reduce((sum, item) => {
                                            const result = roundNumberWithUpAndDown((
                                                roundNumberWithUpAndDown(item.invoiceNetPrice)
                                                * roundNumberWithUpAndDown(item.invoiceTaxCodeValue)
                                            ) / 100);
                                            return sum + result;
                                        }, 0)
                                    );
                                } else {
                                    tax = roundNumberWithUpAndDown((subTotal * invoiceItemDtoList[0]?.invoiceTaxCodeValue) / 100);
                                }

                                const total = roundNumberWithUpAndDown(subTotal + tax);
                                setInvoiceAmountNonPO({
                                    subTotal,
                                    tax,
                                    total
                                });
                            }

                            const rowDataAuditTrail = invoiceAuditTrailDtoList.map(
                                ({
                                    date, role, action, ...rest
                                }) => ({
                                    ...rest,
                                    date: convertDate2String(
                                        date, CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    ),
                                    role,
                                    action: convertActionAuditTrail(action)
                                })
                            );

                            const rowDataInternalAttachment = invoiceDocumentMetadataDtoList.filter(
                                (attachment) => attachment.externalDocument === false
                            ).map(
                                ({ uploadedOn, ...rest }) => ({
                                    ...rest,
                                    uploadedOn: convertToLocalTime(
                                        uploadedOn,
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    )
                                })
                            );

                            const rowDataExternalAttachment = invoiceDocumentMetadataDtoList.filter(
                                (attachment) => attachment.externalDocument === true
                            ).map(
                                ({ uploadedOn, ...rest }) => ({
                                    ...rest,
                                    uploadedOn: convertToLocalTime(
                                        uploadedOn,
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    )
                                })
                            );

                            setInvState((prevStates) => ({
                                ...prevStates,
                                rowDataAuditTrail,
                                rowDataInternalAttachment,
                                rowDataExternalAttachment
                            }));
                        }
                    }, [invoiceDetails]);

                    return (
                        <Form>
                            <Row className="mx-0 justify-content-between">
                                <HeaderMain
                                    title={t("InvoiceDetails")}
                                    className="mb-3 mb-lg-3"
                                />
                                <Row className="mx-0 mb-3 mb-lg-3">
                                    <Button
                                        style={{
                                            border: "1px solid #7b7b7b7b",
                                            padding: "2px 8px",
                                            background: "#fff",
                                            height: 48,
                                            minWidth: 100
                                        }}
                                        onClick={() => onViewInvoicePressHandler()}
                                        className="text-secondary mr-2"
                                        type="button"
                                    >
                                        {t("ViewInvoice")}
                                    </Button>
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
                                </Row>
                            </Row>
                            <Row className="mb-4">
                                <Col md={12} lg={12}>
                                    <Row>
                                        <Col md={6} lg={6}>
                                            <InvoiceDetailsComponent
                                                t={t}
                                                opcDetail={invoiceDetails}
                                                options={invoiceTypes}
                                                handleChange={handleChange}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                                disabled
                                            />
                                            <InitialSettings
                                                t={t}
                                                opcDetail={invoiceDetails}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                                currencies={currencies}
                                                setFieldValue={setFieldValue}
                                            />
                                            <SupplierInformation
                                                t={t}
                                                disabled
                                                opcDetail={invoiceDetails}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                                suppliers={[]}
                                                setFieldValue={setFieldValue}
                                                companyUuid={invState.companyUuid}
                                                isBuyer={isBuyer}
                                                onSelectSupplier={() => { }}
                                            />
                                        </Col>
                                        <Col md={6} lg={6}>
                                            <GeneralInformation
                                                t={t}
                                                opcDetail={invoiceDetails}
                                                disabled
                                                setFieldValue={setFieldValue}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            {
                                [DVPC_INVOICE_TYPE.DVPC_INVOICE_PROJECT.key, DVPC_INVOICE_TYPE.DVPC_INVOICE_NON_PROJECT.key].includes(invoiceDetails?.invoiceType)
                                    ? (
                                        <SummaryInvoiceTable
                                            invoiceDetails={invoiceDetails}
                                            taxRecords={[]}
                                            viewMode
                                        />
                                    )
                                    : (
                                        <>
                                            {
                                                (values.invoiceType === INVOICE_CONSTANTS.DO)
                                                && (
                                                    <Row className="mb-4">
                                                        <Col xs={12}>
                                                            <AddedItem
                                                                borderTopColor="#fff"
                                                                defaultExpanded
                                                                gridHeight={340}
                                                                rowDataSelect={[]}
                                                                rowDataItem={rowDataItemsTypeDO}
                                                                type={values.invoiceType}
                                                                addItemManual={() => { }}
                                                                onCellValueChanged={() => { }}
                                                                taxRecords={[]}
                                                                uoms={[]}
                                                                disabled
                                                                invoiceAmount={invoiceAmountDO}
                                                                amountToInvoice={amountToInvoiceDO}
                                                                onSelectionChanged={() => { }}
                                                                companyUuid={invState.companyUuid}
                                                                isBuyer={isBuyer}
                                                                values={values}
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
                                                                rowDataSelect={[]}
                                                                rowDataItem={rowDataItemsTypePO}
                                                                type={values.invoiceType}
                                                                addItemManual={() => { }}
                                                                onCellValueChanged={() => { }}
                                                                taxRecords={[]}
                                                                uoms={[]}
                                                                disabled
                                                                invoiceAmount={invoiceAmountPO}
                                                                amountToInvoice={amountToInvoicePO}
                                                                onSelectionChanged={() => { }}
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
                                                                addItemManual={() => { }}
                                                                onCellValueChanged={() => { }}
                                                                taxRecords={[]}
                                                                uoms={[]}
                                                                disabled
                                                                onDeleteItem={() => { }}
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
                                                disabled
                                                title={t("InternalConversations")}
                                                activeTab={invState.activeInternalTab}
                                                setActiveTab={(idx) => {
                                                    setInvState((prevStates) => ({
                                                        ...prevStates,
                                                        activeInternalTab: idx
                                                    }));
                                                }}
                                                sendConversation={() => { }}
                                                addNewRowAttachment={() => { }}
                                                rowDataConversation={
                                                    invState.rowDataInternalConversation
                                                }
                                                rowDataAttachment={
                                                    invState.rowDataInternalAttachment
                                                }
                                                onDeleteAttachment={() => { }}
                                                onAddAttachment={() => { }}
                                                onCellEditingStopped={() => { }}
                                                defaultExpanded
                                            />
                                        </Col>
                                    </Row>
                                )
                            }
                            <Row className="mb-4">
                                <Col xs={12}>
                                    <Conversation
                                        disabled
                                        title={t("ExternalConversations")}
                                        activeTab={invState.activeExternalTab}
                                        setActiveTab={(idx) => {
                                            setInvState((prevStates) => ({
                                                ...prevStates,
                                                activeExternalTab: idx
                                            }));
                                        }}
                                        sendConversation={() => { }}
                                        addNewRowAttachment={() => { }}
                                        rowDataConversation={
                                            invState.rowDataExternalConversation
                                        }
                                        rowDataAttachment={
                                            invState.rowDataExternalAttachment
                                        }
                                        onDeleteAttachment={() => { }}
                                        onAddAttachment={() => { }}
                                        onCellEditingStopped={() => { }}
                                        defaultExpanded
                                        borderTopColor="#A9A2C1"
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-5">
                                <Col xs={12}>
                                    <Overview
                                        rowData={invState.rowDataOverview}
                                        rowDataAuditTrail={invState.rowDataAuditTrail}
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
                                        activeTab={invState.activeAuditTrailTab}
                                        setActiveTab={(idx) => {
                                            setInvState((prevStates) => ({
                                                ...prevStates,
                                                activeAuditTrailTab: idx
                                            }));
                                        }}
                                        companyUuid={invState.companyUuid}
                                        isBuyer={isBuyer}
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
                                    {renderActionButton(values)}
                                    {/* <Row className="mx-0">
                                        <></>
                                    </Row> */}
                                </Row>
                            </StickyFooter>
                        </Form>
                    );
                }}
            </Formik>
        </Container>
    );
};
export default InvoiceDetails;
