import {
    Button, ButtonToolbar, Col, Container, Input, Row
} from "components";
import { Formik, Form } from "formik";
import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useApprovalConfig } from "routes/hooks";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import {
    convertToLocalTime,
    formatDateString,
    formatDateTimeUpdated,
    formatDisplayDecimal,
    isNullOrUndefined,
    minusToPrecise,
    roundNumberWithUpAndDown
} from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import {
    AddItemDialog, CommonConfirmDialog, Conversation, Overview
} from "routes/components";
import useToast from "routes/hooks/useToast";
import EntitiesService from "services/EntitiesService";
import StickyFooter from "components/StickyFooter";
import { useHistory, useLocation } from "react-router";
import ConversationService from "services/ConversationService/ConversationService";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import classNames from "classnames";
import PaymentService from "services/PaymentService/PaymentService";
import { Loading } from "routes/EntityAdmin/ManageExternalVendor/components";
import { HeaderMain } from "routes/components/HeaderMain";
import InitialSettingsComponent from "../components/InitialSettingsComponent";
import GeneralInformationComponent from "../components/GeneralInformationComponent";
import { PaymentInvoicesTable } from "../components/PaymentTable";
import {
    PAYMENT_AUDIT_TRAIL_ROLE,
    PAYMENT_AUDIT_TRAIL_ROLE_CONVERT,
    PAYMENT_FE_STATUS, PAYMENT_ROLES,
    PAYMENT_STATUS
} from "../helper";
import PaymentCreditNoteTable from "../components/PaymentTable/PaymentCreditNoteTable";
import PaymentInvoiceColDefs from "../components/PaymentTable/PaymentInvoiceColDefs";
import PAYMENT_ROUTE from "../route";
import PaymentInvoiceItemColDefs from "./PaymentInvoiceItemColDefs";

const PaymentDetails = () => {
    const requestFormRef = useRef(null);
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { userPermission } = permissionReducer;
    const showToast = useToast();

    const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.CREATE_PAYMENT);
    const [paymentRole, setPaymentRole] = useState(PAYMENT_ROLES.CREATOR);
    const [gridColumnApi, setGridColumnApi] = useState();
    const [gridApi, setGridApi] = useState();

    const [showAddInvoice, setShowAddInvoice] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState([]);
    const [invoiceItems, setInvoiceItems] = useState([]);

    const [paymentState, setPaymentState] = useState({
        loading: true,
        companyUuid: "",
        activeInternalTab: 1,
        activeExternalTab: 1,
        activeAuditTrailTab: 1,
        rowDataInternalConversation: [],
        rowDataExternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataAuditTrail: [],
        rowDataOverview: [],
        rowDataPaymentInvoices: [],
        rowDataPaymentCreditNotes: [],
        documentList: [],
        externalConversationLines: [],
        internalConversationLines: [],
        paymentUuid: "",
        approvalRoutes: [],
        subTotalInvoices: "",
        taxInvoices: "",
        totalAmountInvoices: "",
        amountToPayInvoices: "",
        subTotalCN: "",
        taxCN: "",
        totalAmountCN: "",
        finalAmountToPay: "",
        showErrorReasonSendBack: false,
        reasonSendBack: "",
        displaySendBackReasonDialog: false,
        showErrorReasonReject: false,
        reasonReject: "",
        displayRejectReasonDialog: false,
        changeData: uuidv4(),
        isDelete: "",
        currency: "",
        arr: []
    });
    const approvalConfig = useApprovalConfig(FEATURE.MPAYM);

    const initialValues = {
        approvalConfig: false,
        isEdit: true,
        paymentNumber: "",
        paymentReferenceNo: "",
        currency: "",
        currencyName: "",
        beneficiary: "",
        remarks: "",
        approvalRoute: "",
        createBy: "",
        createDate: "",
        status: "",
        paymentReleaseDate: "",
        approvalSequence: "",
        approvalSequenceValue: "",
        nextApprover: ""
    };
    useEffect(() => {
        if (location.pathname.includes("payment-details") && paymentState.rowDataPaymentInvoices.length !== 0) {
            const newRowData = [...paymentState.rowDataPaymentInvoices];
            newRowData[0].selectAll = true;
            newRowData.forEach((item, index) => {
                if (item.pendingPaymentAmount === 0) newRowData[index].completedPay = true
                else {
                    newRowData[index].completedPay = false
                    newRowData[0].selectAll = false
                }
                if(paymentStatus === "SENT_BACK"){
                    newRowData[index].pendingPaymentAmount += newRowData[index].amountToPay
                }
                newRowData[index].status = paymentStatus
            });
            setPaymentState((prevStates) => ({
                ...prevStates,
                rowDataPaymentInvoices: newRowData,
                changeData: uuidv4()
            }));
        }
    }, [...paymentState.rowDataPaymentInvoices])

    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        cellRendererParams: { suppressCount: true },
        valueFormatter: (params) => params.data.type
    };

    const validationSchema = Yup.object().shape({
        paymentReferenceNo: Yup.string()
            .required(t("Please Select Valid Payment Reference No.")),
        approvalRoute: Yup.string()
            .when("approvalConfig", {
                is: true,
                then: Yup.string().required(t("PleaseSelectValidApprovalRoute"))
            })
    });
    const itemSchema = Yup.array()
        .of(
            Yup.object().shape({
                amountToPay: Yup.number()
                    .positive(t("Invoices: Amount To Pay must be greater than 0"))
                    .test(
                        "positive-integer",
                        t("Invoices: Amount To Pay must be greater than 0"),
                        (itemQuantity) => itemQuantity > 0
                    )
            })
        );
    const sendCommentConversation = async (comment, isInternal) => {
        if (isInternal) {
            const internalConversationLines = [...paymentState.internalConversationLines];
            const { rowDataInternalConversation } = paymentState;
            const newRowData = [...rowDataInternalConversation];
            newRowData.push({
                userName: userDetails.name,
                userRole: userDetails.designation,
                userUuid: userDetails.uuid,
                dateTime: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                comment,
                externalConversation: false
            });
            internalConversationLines.push({
                text: comment
            });
            setPaymentState((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = paymentState;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...paymentState.externalConversationLines];
        newRowData.push({
            userName: userDetails.name,
            userRole: userDetails.designation,
            userUuid: userDetails.uuid,
            dateTime: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
            comment,
            externalConversation: true
        });
        externalConversationLines.push({
            text: comment
        });
        setPaymentState((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation: newRowData,
            externalConversationLines
        }));
    };
    const addNewRowAttachment = (isInternal) => {
        if (isInternal) {
            const { rowDataInternalAttachment } = paymentState;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.push({
                guid: "",
                fileLabel: "",
                fileDescription: "",
                uploadedOn: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                uploadedBy: userDetails.name,
                uploaderUuid: userDetails.uuid,
                externalDocument: false,
                uuid: uuidv4(),
                isNew: true
            });
            setPaymentState((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = paymentState;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.push({
            guid: "",
            fileLabel: "",
            fileDescription: "",
            uploadedOn: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
            uploadedBy: userDetails.name,
            uploaderUuid: userDetails.uuid,
            externalDocument: true,
            uuid: uuidv4(),
            isNew: true
        });
        setPaymentState((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
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
    const onAddAttachment = (event, uuid, rowData, isInternal) => {
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
                setPaymentState((prevStates) => ({
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
            setPaymentState((prevStates) => ({
                ...prevStates,
                rowDataExternalAttachment: newRowData
            }));
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
    };
    const onDeleteAttachment = (uuid, rowData, isInternal) => {
        if (isInternal) {
            const newRowData = rowData.filter((row) => row.uuid !== uuid);
            const rowDeleted = rowData.find((row) => row.uuid === uuid);
            if (rowDeleted && rowDeleted.guid) {
                handelDeleteFile(rowDeleted.guid);
            }
            setPaymentState((prevStates) => ({
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
        setPaymentState((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };
    const onCellEditingStopped = (params, isInternal) => {
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = paymentState;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setPaymentState((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = paymentState;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setPaymentState((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };
    const convertStatus = (params) => {
        switch (params) {
            case PAYMENT_STATUS.PENDING_APPROVAL:
                return PAYMENT_FE_STATUS.PENDING_APPROVAL;
            case PAYMENT_STATUS.SAVED_AS_DRAFT:
                return PAYMENT_FE_STATUS.SAVED_AS_DRAFT;
            case PAYMENT_STATUS.APPROVED:
                return PAYMENT_FE_STATUS.APPROVED;
            case PAYMENT_STATUS.PAID:
                return PAYMENT_FE_STATUS.PAID;
            case PAYMENT_STATUS.SENT_BACK:
                return PAYMENT_FE_STATUS.SENT_BACK;
            default: return params;
        }
    };

    const convertAuditTrailRole = (value) => {
        switch (value) {
            case PAYMENT_AUDIT_TRAIL_ROLE.SAVE_AS_DRAFT:
                return PAYMENT_AUDIT_TRAIL_ROLE_CONVERT.SAVE_AS_DRAFT;
            case PAYMENT_AUDIT_TRAIL_ROLE.SUBMIT:
                return PAYMENT_AUDIT_TRAIL_ROLE_CONVERT.SUBMIT;
            case PAYMENT_AUDIT_TRAIL_ROLE.SEND_BACK:
                return PAYMENT_AUDIT_TRAIL_ROLE_CONVERT.SEND_BACK;
            case PAYMENT_AUDIT_TRAIL_ROLE.REJECT:
                return PAYMENT_AUDIT_TRAIL_ROLE_CONVERT.REJECT;
            case PAYMENT_AUDIT_TRAIL_ROLE.APPROVED:
                return PAYMENT_AUDIT_TRAIL_ROLE_CONVERT.APPROVED;
            default: return value;
        }
    };

    const getPaymentDetails = async (paymentUuid, currentCompanyUUID, setFieldValue) => {
        if (!isNullOrUndefined(currentCompanyUUID)) {
            try {
                const res = await PaymentService
                    .getPaymentDetails(currentCompanyUUID, paymentUuid);
                const resApproval = await ApprovalMatrixManagementService
                    .getListApprovalMatrixFeature(
                        currentCompanyUUID,
                        { companyUuid: currentCompanyUUID, featureCode: FEATURE.MPAYM }
                    );
                const {
                    data, status, statusCode
                } = res.data;
                if (status === "OK" || statusCode === 200) {
                    const { approver, hasApproved, creator } = data;
                    if (!approver && !hasApproved && !creator) {
                        setPaymentRole("")
                    }
                    if (creator) {
                        try {
                            const resInvoices = await PaymentService
                                .getPendingPaymentList(currentCompanyUUID);
                            const filteredInvoice = resInvoices.data.data
                                .filter((item) => (item.supplierDto.companyName
                                    === data.invoices[0].supplierDto.companyName
                                    && item.currencyCode === data.invoices[0].currencyCode));
                            setInvoiceItems(filteredInvoice.map((item) => ({
                                ...item,
                                vendorName: item.supplierDto.companyName,
                                amountToPay: item.amountToPay || 0
                            })));
                        } catch (err) {
                            console.log("getPaymentDetails ~ err", err);
                        }
                    }
                    if (approver) {
                        if (hasApproved) {
                            setPaymentRole(PAYMENT_ROLES.HAS_APPROVED);
                        } else {
                            setPaymentRole(PAYMENT_ROLES.APPROVER);
                        }
                    } else if (creator) {
                        setPaymentRole(PAYMENT_ROLES.CREATOR);
                    } else if (hasApproved) {
                        setPaymentRole(PAYMENT_ROLES.HAS_APPROVED);
                    }

                    if (creator && (data.status === PAYMENT_STATUS.CREATE_PAYMENT
                        || data.status === PAYMENT_STATUS.SAVED_AS_DRAFT
                        || data.status === PAYMENT_STATUS.SENT_BACK)
                    ) {
                        setFieldValue("isEdit", true);
                    } else {
                        setFieldValue("isEdit", false);
                    }
                    if (data.status === PAYMENT_STATUS.PENDING_APPROVAL) {
                        setFieldValue("nextApprover", data.nextGroup || "");
                    } else {
                        setFieldValue("nextApprover", "");
                    }
                    const paymentInvoice = [...data.invoices];
                    paymentInvoice[0].selectAll = true;
                    data.invoices.forEach((rowData, index) => {
                        paymentInvoice[index].isEdit = (creator
                            && (data.status === PAYMENT_STATUS.CREATE_PAYMENT
                                || data.status === PAYMENT_STATUS.SAVED_AS_DRAFT
                                || data.status === PAYMENT_STATUS.SENT_BACK));
                        paymentInvoice[index].amountToPay = Number(rowData.amountToPay);
                        paymentInvoice[index].vendorName = rowData.supplierDto.companyName;
                        const completedPay = (Number(rowData.amountToPay)
                            === rowData.pendingPaymentAmount);
                        paymentInvoice[index].completedPay = completedPay;
                        if (completedPay === false) {
                            paymentInvoice[0].selectAll = false;
                        }
                    });

                    setPaymentStatus(data.status);
                    const statusData = convertStatus(data.status);
                    setFieldValue("paymentNumber", data.paymentNumber);
                    setFieldValue("paymentReferenceNo", data.refNumber);
                    setFieldValue("currency", data.currencyCode);
                    setFieldValue("currencyName", data?.currencyName);
                    setFieldValue("beneficiary", `${data.beneficiary.supplierCode} (${data.beneficiary.companyName})`);
                    setFieldValue("remarks", data.remarks);
                    setFieldValue("approvalRoute", data.approvalRouteUuid);
                    if (data.status !== PAYMENT_STATUS.CREATE_PAYMENT) {
                        setFieldValue("approvalSequence", data.approvalSequence);
                    }
                    setFieldValue("createBy", data.createdByName);
                    setFieldValue("createDate", convertToLocalTime(data.paymentCreationDate));
                    setFieldValue("status", statusData);
                    setFieldValue("paymentReleaseDate", "");
                    const rowDataInternalConversation = [
                        ...paymentState.rowDataInternalConversation];
                    try {
                        const resInternalConversation = await ConversationService
                            .getDetailInternalConversation(
                                currentCompanyUUID, paymentUuid
                            );
                        if (resInternalConversation.data.status === "OK") {
                            resInternalConversation?.data?.data?.conversations
                                .forEach((item) => {
                                    rowDataInternalConversation.push({
                                        userName: item.sender,
                                        userRole: item.designation,
                                        userUuid: item.userUuid,
                                        dateTime: formatDateString(new Date(item.date),
                                            CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                        comment: item.text,
                                        externalConversation: true
                                    });
                                });
                        }
                    } catch (error) {
                        console.log("error", error);
                    }

                    const applyCreditNotes = data.creditNoteDetails.filter((item) => (item.status === "APPROVED" || item.status === "CREATED"));

                    applyCreditNotes.forEach((item, index) => {
                        applyCreditNotes[index].isEdit = (creator
                            && (data.status === PAYMENT_STATUS.CREATE_PAYMENT
                                || data.status === PAYMENT_STATUS.SAVED_AS_DRAFT
                                || data.status === PAYMENT_STATUS.SENT_BACK));
                        data.creditNotes.forEach((cn) => {
                            if (item.cnUuid === cn.uuid) {
                                applyCreditNotes[index].apply = true;
                            }
                        });
                    });

                    const subTotalInvoices = roundNumberWithUpAndDown(data.invoices.reduce(
                        (a, b) => a + roundNumberWithUpAndDown(b.subTotal),
                        0
                    ));
                    const taxInvoices = roundNumberWithUpAndDown(data.invoices.reduce(
                        (a, b) => a + roundNumberWithUpAndDown(b.tax),
                        0
                    ));
                    const totalAmountInvoices = roundNumberWithUpAndDown(
                        subTotalInvoices + taxInvoices
                    );
                    const amountToPayInvoices = roundNumberWithUpAndDown(data.invoices.reduce(
                        (a, b) => a + roundNumberWithUpAndDown(b.amountToPay),
                        0
                    ));
                    const subTotalCN = applyCreditNotes.length > 0
                        ? roundNumberWithUpAndDown(
                            applyCreditNotes.filter((item) => item.apply).reduce(
                                (a, b) => a + roundNumberWithUpAndDown(b.subTotal),
                                0
                            )
                        ) : 0;
                    const taxCN = applyCreditNotes.length > 0
                        ? roundNumberWithUpAndDown(
                            applyCreditNotes.filter((item) => item.apply).reduce(
                                (a, b) => a + roundNumberWithUpAndDown(b.taxAmount),
                                0
                            )
                        ) : 0;
                    const totalAmountCN = roundNumberWithUpAndDown(subTotalCN + taxCN);
                    const finalAmountToPay = minusToPrecise(amountToPayInvoices, totalAmountCN);

                    const overview = [];
                    try {
                        const resOverview = await PaymentService.getPaymentOverview(
                            currentCompanyUUID, paymentUuid
                        );
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
                        console.log("error", error);
                    }
                    setPaymentState((prevStates) => ({
                        ...prevStates,
                        approvalRoutes: resApproval.data.data.filter((item) => item.active),
                        rowDataAuditTrail: data.auditTrails.map((item) => ({
                            userName: item.userName,
                            role: item.userRole,
                            date: formatDateString(formatDateTimeUpdated(
                                item.dateTime, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                            )),
                            action: convertAuditTrailRole(item.action)
                        })),
                        rowDataInternalAttachment: data.documents.map((item) => ({
                            ...item,
                            uploadedBy: item.uploadedByName,
                            uploadedOn: convertToLocalTime(item.uploadedOn)
                        })),
                        rowDataPaymentInvoices: paymentInvoice,
                        rowDataPaymentCreditNotes: applyCreditNotes,
                        documentList: data.documents,
                        rowDataInternalConversation,
                        subTotalInvoices,
                        taxInvoices,
                        totalAmountInvoices,
                        amountToPayInvoices,
                        subTotalCN,
                        taxCN,
                        totalAmountCN,
                        finalAmountToPay,
                        loading: false,
                        rowDataOverview: overview
                    }));
                }
            } catch (err) {
                showToast("error", err.message);
            }
        }
    };
    const initPaymentCreateDetail = async (currentCompanyUUID, paymentDetails, setFieldValue) => {
        setFieldValue("beneficiary", `${paymentDetails.supplierDto.supplierCode} (${paymentDetails.supplierDto.companyName})`);
        setFieldValue("currency", paymentDetails.currency);
        setFieldValue("currencyName", paymentDetails?.currencyName);
        const resApproval = await ApprovalMatrixManagementService
            .getListApprovalMatrixFeature(
                currentCompanyUUID,
                { companyUuid: currentCompanyUUID, featureCode: FEATURE.MPAYM }
            );
        const resInvoices = await PaymentService.getPendingPaymentList(currentCompanyUUID);
        const filteredInvoice = resInvoices.data.data
            .filter((item) => (item.supplierDto.companyName
                === paymentDetails.invoices[0].supplierDto.companyName
                && item.currencyCode === paymentDetails.invoices[0].currencyCode));
        setInvoiceItems(filteredInvoice.map((item) => ({
            ...item,
            vendorName: item.supplierDto.companyName,
            amountToPay: item.amountToPay || 0
        })));
        const subTotalInvoices = roundNumberWithUpAndDown(paymentDetails.invoices.reduce(
            (a, b) => a + roundNumberWithUpAndDown(b.subTotal),
            0
        ));
        const taxInvoices = roundNumberWithUpAndDown(paymentDetails.invoices.reduce(
            (a, b) => a + roundNumberWithUpAndDown(b.tax),
            0
        ));
        const totalAmountInvoices = roundNumberWithUpAndDown(subTotalInvoices + taxInvoices);
        const amountToPayInvoices = roundNumberWithUpAndDown(paymentDetails.invoices.reduce(
            (a, b) => a + roundNumberWithUpAndDown(b.amountToPay),
            0
        ));
        const creditNotes = paymentDetails.creditNotes.filter((item) => (item.status === "APPROVED" || item.status === "CREATED"));
        const subTotalCN = roundNumberWithUpAndDown(creditNotes.filter((item) => item.apply).reduce(
            (a, b) => a + roundNumberWithUpAndDown(b.subTotal),
            0
        ));
        const taxCN = roundNumberWithUpAndDown(creditNotes.filter((item) => item.apply).reduce(
            (a, b) => a + roundNumberWithUpAndDown(b.taxAmount),
            0
        ));
        const totalAmountCN = roundNumberWithUpAndDown(subTotalCN + taxCN);
        const finalAmountToPay = minusToPrecise(0, totalAmountCN);
        const rowDataInternalConversation = [
            ...paymentState.rowDataInternalConversation];
        const requests = paymentDetails.invoices.map(async (invoice) => {
            try {
                const resInternalConversation = await ConversationService
                    .getDetailInternalConversation(
                        currentCompanyUUID, invoice.invoiceUuid
                    );
                if (resInternalConversation.data.status === "OK") {
                    resInternalConversation?.data?.data?.conversations
                        .forEach((item) => {
                            rowDataInternalConversation.push({
                                userName: item.sender,
                                userRole: item.designation,
                                userUuid: item.userUuid,
                                dateTime: formatDateString(new Date(item.date),
                                    CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                comment: item.text,
                                externalConversation: true
                            });
                        });
                }
                return resInternalConversation.data.data;
            } catch (error) {
                console.log("error", error);
            }
        });
        await Promise.all(requests);
        const internalConversationLines = [...paymentState.internalConversationLines];
        rowDataInternalConversation.forEach((item) => {
            internalConversationLines.push({ text: item.comment });
        });
        setPaymentState((prevStates) => ({
            ...prevStates,
            approvalRoutes: resApproval.data.data.filter((item) => item.active),
            rowDataPaymentInvoices: paymentDetails.invoices.map((item) => ({
                ...item,
                isEdit: true,
                vendorName: item.supplierDto.companyName,
                amountToPay: item.amountToPay || 0
            })),
            rowDataPaymentCreditNotes: creditNotes.map((item) => ({
                ...item,
                isEdit: true
            })),
            subTotalInvoices,
            taxInvoices,
            totalAmountInvoices,
            amountToPayInvoices,
            subTotalCN,
            taxCN,
            totalAmountCN,
            finalAmountToPay,
            rowDataInternalConversation,
            internalConversationLines,
            loading: false
        }));
    };

    const mappingCreateBodyParams = (params) => {
        const paymentInvoicesList = paymentState.rowDataPaymentInvoices;
        const paymentCNList = paymentState.rowDataPaymentCreditNotes;
        const internalAttachmentDoc = paymentState.rowDataInternalAttachment;
        const invoices = paymentInvoicesList.map((e) => ({
            uuid: e.invoiceUuid,
            amountToPay: e.amountToPay,
            projectCode: e.projectCode
        }));
        const creditNotes = paymentCNList.filter((item) => item.apply).map((e) => ({
            uuid: e.cnUuid
        }));
        const listDocDto = internalAttachmentDoc.filter((item) => paymentState.documentList
            .filter((value) => value.guid === item.guid).length === 0);
        listDocDto.forEach((item) => {
            if (!item.guid) {
                throw new Error("Please attach a file!");
            }
        });
        const paymentBody = {
            uuid: paymentState.paymentUuid,
            approvalRouteUuid: params.approvalRoute,
            refNumber: params.paymentReferenceNo,
            remarks: params.remarks,
            invoices,
            creditNotes,
            documents: listDocDto.map((item) => ({
                fileDescription: item.fileDescription,
                fileLabel: item.fileLabel || item.attachment,
                guid: item.guid,
                attachment: item.attachment
            }))
        };
        return paymentBody;
    };
    const mappingApproveBodyParams = () => {
        const internalAttachmentDoc = paymentState.rowDataInternalAttachment;
        const listDocDto = internalAttachmentDoc.filter((item) => paymentState.documentList
            .filter((value) => value.guid === item.guid).length === 0);
        const paymentBody = {
            documents: listDocDto.map((item) => ({
                fileDescription: item.fileDescription,
                fileLabel: item.fileLabel || item.attachment,
                guid: item.guid,
                attachment: item.attachment
            }))
        };
        return paymentBody;
    };
    const createPayment = async (params, currentCompanyUUID) => {
        try {
            const createPaymentBody = mappingCreateBodyParams(params);
            if (createPaymentBody.invoices.length === 0) {
                showToast("error", "Please enter valid Invoices items");
                return;
            }
            await itemSchema.validate(createPaymentBody.invoices);
            const res = await PaymentService
                .createPayment(currentCompanyUUID, createPaymentBody);
            const { data, message, status } = res.data;
            if (status === "OK") {
                try {
                    if (paymentState.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: paymentState.externalConversationLines
                        };
                        ConversationService
                            .createExternalConversation(currentCompanyUUID, conversationBody);
                    }
                    if (paymentState.internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: paymentState.internalConversationLines
                        };
                        ConversationService
                            .createInternalConversation(currentCompanyUUID, conversationBody);
                    }
                } catch (error) {}
                history.push(PAYMENT_ROUTE.PAYMENT_LIST);
                showToast("success", message || "Payment has been successfully created");
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onEditItemsInvoices = (params) => {
        const { data } = params;
        const { rowDataPaymentInvoices } = paymentState;
        const newRowData = [...rowDataPaymentInvoices];

        newRowData[0].selectAll = true;
        rowDataPaymentInvoices.forEach((rowData, index) => {
            if (rowData.invoiceUuid === data.invoiceUuid) {
                newRowData[index] = data;
                newRowData[index].amountToPay = Number(data.amountToPay);
                const completedPay = (Number(data.amountToPay) === data.pendingPaymentAmount);
                newRowData[index].completedPay = completedPay;
                if (completedPay === false) {
                    newRowData[0].selectAll = false;
                }
            }
        });

        params.api.setRowData(newRowData);
        params.api.setColumnDefs(PaymentInvoiceColDefs);
        setPaymentState((prevStates) => ({
            ...prevStates,
            rowDataPaymentInvoices: newRowData,
            changeData: uuidv4()
        }));
    };

    const onCellValueChanged = (params) => {
        onEditItemsInvoices(params);
    };

    const handleRemoveRow = async (params) => {
        const rowToDelete = params.node.data;
        params.api.applyTransaction({ remove: [rowToDelete] });
        const arr = [];
        params.api.forEachNode((node) => arr.push(node.data));
        params.api.setRowData(arr);
        setPaymentState((prevStates) => ({
            ...prevStates,
            rowDataPaymentInvoices: arr,
            arr,
            changeData: uuidv4(),
            isDelete: uuidv4()
        }));
        setTimeout(() => {
            params.api.setColumnDefs(PaymentInvoiceColDefs);
        }, 100);
    };

    const onDelete = async () => {
        if (paymentState.isDelete
            && paymentState.companyUuid
            && paymentRole === PAYMENT_ROLES.CREATOR) {
            const listInv = paymentState.arr.map((item) => item.invoiceUuid);
            try {
                const res = await PaymentService
                    .getPaymentCreateDetails(
                        paymentState.companyUuid, listInv
                    );
                const { data, status, message } = res.data;
                const creditNotes = data?.creditNotes?.filter((item) => (item.status === "APPROVED" || item.status === "CREATED"));
                if (status === "OK") {
                    setPaymentState((prevStates) => ({
                        ...prevStates,
                        rowDataPaymentCreditNotes: creditNotes?.map((item) => ({
                            ...item, isEdit: true
                        })),
                        changeData: uuidv4()
                    }));
                } else {
                    showToast("error", message);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };

    useEffect(() => {
        onDelete();
    }, [paymentState.isDelete]);

    useEffect(() => {
        if (gridColumnApi) {
            if (paymentRole === PAYMENT_ROLES.CREATOR
                && (paymentStatus === PAYMENT_STATUS.CREATE_PAYMENT
                    || paymentStatus === PAYMENT_STATUS.SAVED_AS_DRAFT
                    || paymentStatus === PAYMENT_STATUS.SENT_BACK)) {
                gridColumnApi.setColumnsVisible(
                    ["action"], true
                );
            } else {
                gridColumnApi.setColumnsVisible(
                    ["action"], false
                );
            }
        }
    }, [paymentRole, paymentStatus, gridColumnApi]);

    const onChangeApprovalRoute = async (e, setFieldValue) => {
        const { value } = e.target;
        const { companyUuid } = paymentState;
        setFieldValue("approvalRoute", value);
        try {
            const response = await ApprovalMatrixManagementService
                .getApprovalMatrixByApprovalUuid(companyUuid, value);
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const { approvalRange } = data;
                let approvalSequence = "";
                approvalRange.forEach((approval, index) => {
                    const { approvalGroups } = approval;
                    if (index === 0) {
                        approvalSequence = approvalGroups[0].group.groupName;
                    } else {
                        approvalSequence += ` > ${approvalGroups[0].group.groupName}`;
                    }
                });
                setFieldValue("approvalSequenceValue", approvalSequence);
                if (paymentStatus !== PAYMENT_STATUS.CREATE_PAYMENT) {
                    setFieldValue("approvalSequence", approvalSequence);
                }
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };
    const onChangeCheckboxCN = (e, rowData, data, params) => {
        const newRowData = [...rowData];
        newRowData.forEach((item, index) => {
            if (item.cnUuid === data.cnUuid) {
                newRowData[index] = data;
                newRowData[index].apply = e.checked;
            }
        });
        params.api.setRowData(newRowData);
        setPaymentState((prevStates) => ({
            ...prevStates,
            rowDataPaymentCreditNotes: newRowData,
            changeData: uuidv4()
        }));
    };

    const onChangeCheckbox = (e, rowData, data, params) => {
        const newRowData = [...rowData];
        newRowData[0].selectAll = true;
        newRowData.forEach((item, index) => {
            if (item.invoiceUuid === data.invoiceUuid) {
                newRowData[index] = data;
                newRowData[index].completedPay = e.target.checked;
                if (e.target.checked) {
                    newRowData[index].amountToPay = data.pendingPaymentAmount;
                } else {
                    newRowData[index].amountToPay = 0;
                    newRowData[0].selectAll = false;
                }
            }
            if (!item.completedPay) {
                newRowData[0].selectAll = false;
            }
        });
        params.api.setRowData(newRowData);
        params.api.setColumnDefs(PaymentInvoiceColDefs);
        setPaymentState((prevStates) => ({
            ...prevStates,
            rowDataPaymentInvoices: newRowData,
            changeData: uuidv4()
        }));
    };

    const onChangeCheckboxHeader = (e, rowData, params) => {
        const newRowData = [...rowData];
        const checked = newRowData[0].selectAll;

        newRowData.forEach((item, index) => {
            if (!checked) {
                newRowData[index].completedPay = true;
                newRowData[0].selectAll = true;
                newRowData[index].amountToPay = newRowData[index].pendingPaymentAmount;
            } else {
                newRowData[index].completedPay = false;
                newRowData[0].selectAll = false;
                newRowData[index].amountToPay = 0;
            }
        });
        params.api.setRowData(newRowData);
        params.api.setColumnDefs(PaymentInvoiceColDefs);
        setPaymentState((prevStates) => ({
            ...prevStates,
            rowDataPaymentInvoices: newRowData,
            changeData: uuidv4()
        }));
    };

    const saveAsDraftPayment = async (params, currentCompanyUUID) => {
        try {
            const saveAsDraftPaymentBody = mappingCreateBodyParams(params);
            if (saveAsDraftPaymentBody.invoices.length === 0) {
                showToast("error", "Please enter valid Invoices");
                return;
            }
            await itemSchema.validate(saveAsDraftPaymentBody.invoices);
            const res = await PaymentService
                .saveAsDraftPayment(currentCompanyUUID, saveAsDraftPaymentBody);
            const { data, message, status } = res.data;
            if (status === "OK") {
                try {
                    if (paymentState.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: paymentState.externalConversationLines
                        };
                        await ConversationService
                            .createExternalConversation(currentCompanyUUID, conversationBody);
                    }
                    if (paymentState.internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: paymentState.internalConversationLines
                        };
                        await ConversationService
                            .createInternalConversation(currentCompanyUUID, conversationBody);
                    }
                } catch (error) {}
                history.push(PAYMENT_ROUTE.PAYMENT_LIST);
                showToast("success", message || "Payment has been successfully created");
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const approvalPayment = async (currentCompanyUUID) => {
        const approvePaymentBody = mappingApproveBodyParams();
        try {
            const res = await PaymentService
                .approvalPayment(currentCompanyUUID, paymentState.paymentUuid, approvePaymentBody);
            const { message, status } = res.data;
            if (status === "OK") {
                try {
                    if (paymentState.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: paymentState.paymentUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: paymentState.externalConversationLines
                        };
                        await ConversationService
                            .createExternalConversation(currentCompanyUUID, conversationBody);
                    }
                    if (paymentState.internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: paymentState.paymentUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: paymentState.internalConversationLines
                        };
                        await ConversationService
                            .createInternalConversation(currentCompanyUUID, conversationBody);
                    }
                } catch (error) {}
                history.push(PAYMENT_ROUTE.PAYMENT_LIST);
                showToast("success", message || "Payment has been successfully updated");
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onSavePressHandler = async (params, status) => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        switch (status) {
            case PAYMENT_STATUS.CREATE_PAYMENT:
                createPayment(params, currentCompanyUUID);
                break;
            case PAYMENT_STATUS.PENDING_APPROVAL:
                approvalPayment(params, currentCompanyUUID);
                break;
            case PAYMENT_STATUS.SAVED_AS_DRAFT:
                saveAsDraftPayment(params, currentCompanyUUID);
                break;
            default:
                break;
        }
    };

    const rejectPayment = async (reason) => {
        setPaymentState((prevStates) => ({
            ...prevStates,
            showErrorReasonReject: true
        }));
        if (paymentState.reasonReject) {
            setPaymentState((prevStates) => ({
                ...prevStates,
                showErrorReasonReject: false
            }));
            const rejectPaymentBody = mappingApproveBodyParams();
            try {
                const res = await PaymentService.rejectPayment(
                    paymentState.companyUuid, paymentState.paymentUuid, rejectPaymentBody
                );
                const { message, status } = res.data;
                if (status === "OK") {
                    try {
                        if (paymentState.externalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: paymentState.paymentUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: paymentState.externalConversationLines
                            };
                            await ConversationService
                                .createExternalConversation(paymentState.companyUuid, conversationBody);
                        }
                        const conversationLines = [...paymentState.internalConversationLines];
                        conversationLines.push({ text: reason });
                        if (conversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: paymentState.paymentUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: conversationLines
                            };
                            await ConversationService
                                .createInternalConversation(paymentState.companyUuid, conversationBody);
                        }
                    } catch (error) {}
                    history.push(PAYMENT_ROUTE.PAYMENT_LIST);
                    showToast("success", message || "Payment has been successfully rejected");
                } else {
                    showToast("error", message);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };

    const sendBackPayment = async (reason) => {
        setPaymentState((prevStates) => ({
            ...prevStates,
            showErrorReasonSendBack: true
        }));
        if (paymentState.reasonSendBack) {
            setPaymentState((prevStates) => ({
                ...prevStates,
                showErrorReasonSendBack: false
            }));
            const sendBackPaymentBody = mappingApproveBodyParams();
            try {
                const res = await PaymentService.sendBackPayment(
                    paymentState.companyUuid, paymentState.paymentUuid, sendBackPaymentBody
                );
                const { message, status } = res.data;
                if (status === "OK") {
                    try {
                        if (paymentState.externalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: paymentState.paymentUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: paymentState.externalConversationLines
                            };
                            await ConversationService
                                .createExternalConversation(paymentState.companyUuid, conversationBody);
                        }
                        const conversationLines = [...paymentState.internalConversationLines];
                        conversationLines.push({ text: reason });
                        if (conversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: paymentState.paymentUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: conversationLines
                            };
                            await ConversationService
                                .createInternalConversation(paymentState.companyUuid, conversationBody);
                        }
                    } catch (error) {};
                    history.push(PAYMENT_ROUTE.PAYMENT_LIST);
                    showToast("success", message || "Payment has been successfully sent back");
                } else {
                    showToast("error", message);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };

    const handleAddInvoice = () => {
        invoiceItems.forEach(
            (item, index) => {
                if (item.invoiceUuid) {
                    invoiceItems[index].isSelected = false;
                }
            }
        );
        paymentState.rowDataPaymentInvoices.forEach((data) => {
            invoiceItems.forEach(
                (item, index) => {
                    if (item.invoiceUuid === data.invoiceUuid) {
                        invoiceItems[index].isSelected = true;
                    }
                }
            );
        });
        setShowAddInvoice(true);
    };

    const handleAddInvoiceToList = async () => {
        const newListInvoice = paymentState?.rowDataPaymentInvoices
            .concat(selectedInvoice);
        const listInv = newListInvoice?.map((item) => item.invoiceUuid);
        try {
            const res = await PaymentService
                .getPaymentCreateDetails(
                    paymentState.companyUuid, listInv
                );
            const { data, status, message } = res.data;
            if (status === "OK") {
                gridApi.setRowData(newListInvoice?.map((item) => ({
                    ...item,
                    isEdit: true,
                    vendorName: item.supplierDto.companyName,
                    amountToPay: item.amountToPay || 0
                })));
                const creditNotes = data?.creditNotes?.filter((item) => (item.status === "APPROVED" || item.status === "CREATED"));
                setPaymentState((prevStates) => ({
                    ...prevStates,
                    rowDataPaymentInvoices: newListInvoice?.map((item) => ({
                        ...item,
                        isEdit: true,
                        vendorName: item.supplierDto.companyName,
                        amountToPay: item.amountToPay || 0
                    })),
                    rowDataPaymentCreditNotes: creditNotes?.map((item) => ({
                        ...item, isEdit: true
                    })),
                    changeData: uuidv4()
                }));
                setTimeout(() => {
                    gridApi.setColumnDefs(PaymentInvoiceColDefs);
                }, 100);
                setShowAddInvoice(false);
                setSelectedInvoice([]);
            } else {
                setShowAddInvoice(false);
                setSelectedInvoice([]);
                showToast("error", message);
            }
        } catch (error) {
            setShowAddInvoice(false);
            setSelectedInvoice([]);
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const handleSelectedItemInvoice = (value) => {
        const selectedData = value?.map((node) => node.data);
        setSelectedInvoice(selectedData);
    };

    useEffect(() => {
        if (paymentState) {
            const subTotalInvoices = roundNumberWithUpAndDown(
                paymentState.rowDataPaymentInvoices.reduce(
                    (a, b) => a + roundNumberWithUpAndDown(b.subTotal),
                    0
                )
            );
            const taxInvoices = roundNumberWithUpAndDown(
                paymentState.rowDataPaymentInvoices.reduce(
                    (a, b) => a + roundNumberWithUpAndDown(b.tax),
                    0
                )
            );
            const totalAmountInvoices = roundNumberWithUpAndDown(subTotalInvoices + taxInvoices);
            const amountToPayInvoices = roundNumberWithUpAndDown(
                paymentState.rowDataPaymentInvoices.reduce(
                    (a, b) => a + roundNumberWithUpAndDown(b.amountToPay),
                    0
                )
            );
            const subTotalCN = paymentState.rowDataPaymentCreditNotes.length > 0
                ? roundNumberWithUpAndDown(
                    paymentState.rowDataPaymentCreditNotes.filter((item) => item.apply).reduce(
                        (a, b) => a + roundNumberWithUpAndDown(b.subTotal),
                        0
                    )
                ) : 0;
            const taxCN = paymentState.rowDataPaymentCreditNotes.length > 0
                ? roundNumberWithUpAndDown(
                    paymentState.rowDataPaymentCreditNotes.filter((item) => item.apply).reduce(
                        (a, b) => a + roundNumberWithUpAndDown(b.taxAmount),
                        0
                    )
                ) : 0;
            const totalAmountCN = roundNumberWithUpAndDown(subTotalCN + taxCN);
            const finalAmountToPay = minusToPrecise(amountToPayInvoices, totalAmountCN);
            setPaymentState((prevStates) => ({
                ...prevStates,
                subTotalInvoices,
                taxInvoices,
                totalAmountInvoices,
                amountToPayInvoices,
                subTotalCN,
                taxCN,
                totalAmountCN,
                finalAmountToPay
            }));
        }
    }, [paymentState.changeData]);

    useEffect(() => {
    }, [paymentState.loading]);

    return (
        <Container fluid>
            <Formik
                innerRef={requestFormRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={() => {
                }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue, dirty, setValues, handleSubmit
                }) => {
                    useEffect(() => {
                        if (approvalConfig) setFieldValue("approvalConfig", approvalConfig);
                    }, [approvalConfig]);

                    useEffect(() => {
                        if (
                            !_.isEmpty(userDetails)
                            && !_.isEmpty(userPermission)
                        ) {
                            setFieldValue("createDate", formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss));
                            setFieldValue("createBy", userDetails.name);
                            const query = new URLSearchParams(location.search);
                            const paymentUuid = query.get("uuid");
                            const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
                            setPaymentState((prevStates) => ({
                                ...prevStates,
                                paymentUuid,
                                companyUuid: currentCompanyUUID
                            }));
                            if (!isNullOrUndefined(currentCompanyUUID) && currentCompanyUUID !== "") {
                                if (location.pathname.includes("payment-create")) {
                                    if (!isNullOrUndefined(location.state?.paymentDetails)) {
                                        initPaymentCreateDetail(
                                            currentCompanyUUID,
                                            location.state?.paymentDetails,
                                            setFieldValue
                                        );
                                    }
                                } else {
                                    getPaymentDetails(
                                        paymentUuid, currentCompanyUUID, setFieldValue, setValues
                                    );
                                }
                            }
                        }
                    }, [userDetails, userPermission, location]);
                    return (
                        !paymentState.loading ? (
                            <Form>
                                <Row className="mb-4">
                                    <Col
                                        md={12}
                                        lg={12}
                                    >

                                        <Row className="mb-2">
                                            <Col
                                                md={6}
                                                lg={6}
                                            >
                                                {
                                                    location.pathname.includes("payment-create") ? (
                                                        <HeaderMain
                                                            title={t("Create New Payment")}
                                                            className="mb-3 mb-lg-3"
                                                        />
                                                    ) : (
                                                        <HeaderMain
                                                            title={t("Payment Details")}
                                                            className="mb-3 mb-lg-3"
                                                        />
                                                    )
                                                }
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col
                                                md={6}
                                                lg={6}
                                            >
                                                <InitialSettingsComponent
                                                    t={t}
                                                    values={values}
                                                    errors={errors}
                                                    touched={touched}
                                                    handleChange={handleChange}
                                                    setFieldValue={setFieldValue}
                                                />
                                            </Col>

                                            <Col
                                                md={6}
                                                lg={6}
                                            >
                                                <GeneralInformationComponent
                                                    t={t}
                                                    values={values}
                                                    errors={errors}
                                                    touched={touched}
                                                    onChangeApprovalRoute={
                                                        (e) => onChangeApprovalRoute(e, setFieldValue)
                                                    }
                                                    setFieldValue={setFieldValue}
                                                    approvalRoutes={paymentState.approvalRoutes}
                                                    isCreate={location.pathname.includes("payment-create")}
                                                />
                                            </Col>
                                        </Row>

                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col
                                        md={12}
                                        lg={12}
                                    >
                                        <Row>
                                            <Col>
                                                <ButtonToolbar className="justify-content-end mb-2">
                                                    <Button
                                                        color="primary"
                                                        type="button"
                                                        onClick={() => { handleAddInvoice(); }}
                                                        disabled={!values.isEdit}
                                                    >
                                                        <span className="mr-1">+</span>
                                                        <span>{t("Add More")}</span>
                                                    </Button>
                                                </ButtonToolbar>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col xs={12}>
                                        <PaymentInvoicesTable
                                            rowData={paymentState.rowDataPaymentInvoices}
                                            onGridReady={(params) => {
                                                onGridReady(params);
                                            }}
                                            gridHeight={350}
                                            defaultExpanded
                                            borderTopColor="#AEC57D"
                                            onCellValueChanged={onCellValueChanged}
                                            handleRemoveRow={handleRemoveRow}
                                            onChangeCompletedPay={
                                                (e, rowData, data, params) => {
                                                    onChangeCheckbox(e, rowData, data, params);
                                                }
                                            }
                                            onChangeCheckboxHeader={
                                                (e, rowData, params) => {
                                                    onChangeCheckboxHeader(e, rowData, params);
                                                }
                                            }
                                            disabled={!values.isEdit}
                                        />
                                    </Col>
                                </Row>
                                <Row className="mx-0 align-items-end flex-column mb-4 text-secondary" style={{ fontSize: "1rem" }}>
                                    <Row className="justify-content-end" style={{ width: "550px", textAlign: "right" }}>
                                        <Col xs={8}>
                                            <div className="d-flex">{`${t("SubTotal")}:`}</div>
                                            <div className="d-flex">{`${t("Tax")}:`}</div>
                                            <div className="d-flex">{`${t("Total Amount (Incl. Tax)")}:`}</div>
                                            <b className="d-flex">{`${t("Amount To Pay (Incl. Tax)")}:`}</b>
                                        </Col>
                                        <Col xs={1}>
                                            <div className="mr-2">{values.currency}</div>
                                            <div className="mr-2">{values.currency}</div>
                                            <div className="mr-2">{values.currency}</div>
                                            <b className="mr-2">{values.currency}</b>
                                        </Col>
                                        <Col xs={3}>
                                            <div>
                                                {paymentState.subTotalInvoices ? formatDisplayDecimal(paymentState.subTotalInvoices, 2) : "0.00"}
                                            </div>
                                            <div>
                                                {paymentState.taxInvoices ? formatDisplayDecimal(paymentState.taxInvoices, 2) : "0.00"}
                                            </div>
                                            <div>
                                                {paymentState.totalAmountInvoices ? formatDisplayDecimal(paymentState.totalAmountInvoices, 2) : "0.00"}
                                            </div>
                                            <b>
                                                {paymentState.amountToPayInvoices ? formatDisplayDecimal(paymentState.amountToPayInvoices, 2) : "0.00"}
                                            </b>
                                        </Col>
                                    </Row>
                                </Row>
                                <Row className="mb-3">
                                    <Col xs={12}>
                                        <PaymentCreditNoteTable
                                            rowData={paymentState.rowDataPaymentCreditNotes}
                                            onGridReady={(params) => {
                                                console.log({ params });
                                            }}
                                            onChangeApply={
                                                (e, rowData, data, params) => {
                                                    onChangeCheckboxCN(e, rowData, data, params);
                                                }
                                            }
                                            gridHeight={
                                                paymentState.rowDataPaymentCreditNotes.length > 0
                                                    ? 350
                                                    : 145
                                            }
                                            defaultExpanded
                                            borderTopColor="#AEC57D"
                                        />
                                    </Col>
                                </Row>
                                <Row className="mx-0 align-items-end flex-column mb-4 text-secondary" style={{ fontSize: "1rem" }}>
                                    <Row className="justify-content-end" style={{ width: "550px", textAlign: "right" }}>
                                        <Col xs={8}>
                                            <div className="d-flex">{`${t("Sub Total of Credit Note(s) applied")}:`}</div>
                                            <div className="d-flex">{`${t("Tax")}:`}</div>
                                            <b className="d-flex">{`${t("Total Amount of Credit Note(s) applied")}:`}</b>
                                        </Col>
                                        <Col xs={1}>
                                            <div className="mr-2">{values.currency}</div>
                                            <div className="mr-2">{values.currency}</div>
                                            <b className="mr-2">{values.currency}</b>
                                        </Col>
                                        <Col xs={3}>
                                            <div>
                                                {paymentState.subTotalCN ? formatDisplayDecimal(paymentState.subTotalCN, 2) : "0.00"}
                                            </div>
                                            <div>
                                                {paymentState.taxCN ? formatDisplayDecimal(paymentState.taxCN, 2) : "0.00"}
                                            </div>
                                            <b>
                                                {paymentState.totalAmountCN ? formatDisplayDecimal(paymentState.totalAmountCN, 2) : "0.00"}
                                            </b>
                                        </Col>
                                    </Row>
                                </Row>
                                <Row className="mx-0 align-items-end flex-column mb-4 text-secondary" style={{ fontSize: "1rem" }}>
                                    <Row className="justify-content-end" style={{ width: "550px", textAlign: "right", border: "2px solid" }}>
                                        <Col xs={8}>
                                            <b className="d-flex">{`${t("Final Amount to Pay (Incl. Tax)")}:`}</b>
                                        </Col>
                                        <Col xs={1}>
                                            <b className="mr-2">{values.currency}</b>
                                        </Col>
                                        <Col xs={3}>
                                            <b>
                                                {paymentState.finalAmountToPay ? formatDisplayDecimal(paymentState.finalAmountToPay, 2) : "0.00"}
                                            </b>
                                        </Col>
                                    </Row>
                                </Row>
                                <HeaderSecondary
                                    title={t("Conversations")}
                                    className="mb-2"
                                />
                                <Row className="mb-2">
                                    <Col xs={12}>
                                        <Conversation
                                            title={t("InternalConversations")}
                                            activeTab={paymentState.activeInternalTab}
                                            setActiveTab={(idx) => {
                                                setPaymentState((prevStates) => ({
                                                    ...prevStates,
                                                    activeInternalTab: idx
                                                }));
                                            }}
                                            sendConversation={
                                                (comment) => sendCommentConversation(
                                                    comment, true
                                                )
                                            }
                                            addNewRowAttachment={
                                                () => addNewRowAttachment(true)
                                            }
                                            rowDataConversation={
                                                paymentState.rowDataInternalConversation
                                            }
                                            rowDataAttachment={
                                                paymentState.rowDataInternalAttachment
                                            }
                                            onDeleteAttachment={
                                                (uuid, rowData) => onDeleteAttachment(
                                                    uuid, rowData, true
                                                )
                                            }
                                            onAddAttachment={
                                                (e, uuid, rowData) => onAddAttachment(
                                                    e, uuid, rowData, true
                                                )
                                            }
                                            onCellEditingStopped={
                                                (params) => onCellEditingStopped(params, true)
                                            }
                                            defaultExpanded
                                            disabled={paymentStatus === PAYMENT_STATUS.APPROVED
                                                || paymentStatus === PAYMENT_STATUS.REJECTED}
                                        />
                                    </Col>
                                </Row>
                                <HeaderSecondary
                                    title={t("AuditTrail")}
                                    className="mb-2"
                                />
                                <Row className="mb-5">
                                    <Col xs={12}>
                                        {/* Audit Trail */}
                                        <Overview
                                            rowData={paymentState.rowDataOverview}
                                            rowDataAuditTrail={paymentState.rowDataAuditTrail}
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
                                            activeTab={paymentState.activeAuditTrailTab}
                                            setActiveTab={(idx) => {
                                                setPaymentState((prevStates) => ({
                                                    ...prevStates,
                                                    activeAuditTrailTab: idx
                                                }));
                                            }}
                                            companyUuid={paymentState.companyUuid}
                                        />
                                    </Col>
                                </Row>
                                <AddItemDialog
                                    isShow={showAddInvoice}
                                    onHide={() => setShowAddInvoice(false)}
                                    title={t("Add Invoices")}
                                    onPositiveAction={() => { handleAddInvoiceToList(); }}
                                    onNegativeAction={() => {
                                        setShowAddInvoice(false);
                                        setSelectedInvoice([]);
                                    }}
                                    columnDefs={PaymentInvoiceItemColDefs}
                                    rowDataItem={invoiceItems}
                                    onSelectionChanged={(params) => {
                                        handleSelectedItemInvoice(params.api.getSelectedNodes());
                                    }}
                                    hideSearch
                                />
                                <CommonConfirmDialog
                                    isShow={paymentState.displaySendBackReasonDialog}
                                    onHide={() => setPaymentState((prevStates) => ({
                                        ...prevStates,
                                        displaySendBackReasonDialog: false
                                    }))}
                                    title={t("Reason")}
                                    positiveProps={
                                        {
                                            onPositiveAction: () => {
                                                sendBackPayment(paymentState.reasonSendBack);
                                            },
                                            contentPositive: t("SendBack"),
                                            colorPositive: "warning"
                                        }
                                    }
                                    negativeProps={
                                        {
                                            onNegativeAction: () => setPaymentState((prevStates) => ({
                                                ...prevStates,
                                                displaySendBackReasonDialog: false
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
                                        name="sendBackReason"
                                        className={
                                            classNames("form-control", {
                                                "is-invalid": paymentState.showErrorReasonSendBack && !paymentState.reasonSendBack
                                            })
                                        }
                                        placeholder={t("Please enter reason...")}
                                        value={paymentState.reasonSendBack}
                                        onChange={(e) => {
                                            const { value } = e.target;
                                            setPaymentState((prevStates) => ({
                                                ...prevStates,
                                                reasonSendBack: value
                                            }));
                                        }}
                                    />
                                    {
                                        paymentState.showErrorReasonSendBack
                                        && !paymentState.reasonSendBack
                                        && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                                    }
                                </CommonConfirmDialog>

                                <CommonConfirmDialog
                                    isShow={paymentState.displayRejectReasonDialog}
                                    onHide={() => setPaymentState((prevStates) => ({
                                        ...prevStates,
                                        displayRejectReasonDialog: false
                                    }))}
                                    title={t("Reason")}
                                    positiveProps={
                                        {
                                            onPositiveAction: () => {
                                                rejectPayment(paymentState.reasonReject);
                                            },
                                            contentPositive: t("Reject"),
                                            colorPositive: "danger"
                                        }
                                    }
                                    negativeProps={
                                        {
                                            onNegativeAction: () => setPaymentState((prevStates) => ({
                                                ...prevStates,
                                                displayRejectReasonDialog: false
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
                                                "is-invalid": paymentState.showErrorReasonReject && !paymentState.reasonReject
                                            })
                                        }
                                        placeholder={t("Please enter reason..")}
                                        value={paymentState.reasonReject}
                                        onChange={(e) => {
                                            const { value } = e.target;
                                            setPaymentState((prevStates) => ({
                                                ...prevStates,
                                                reasonReject: value
                                            }));
                                        }}
                                    />
                                    {
                                        paymentState.showErrorReasonReject
                                        && !paymentState.reasonReject
                                        && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                                    }
                                </CommonConfirmDialog>
                                <StickyFooter>
                                    <Row className="mx-0 px-3 justify-content-between">
                                        <Button
                                            color="secondary"
                                            onClick={() => history.goBack()}
                                        >
                                            {t("Back")}
                                        </Button>
                                        <Row className="mx-0">
                                            {((paymentStatus === PAYMENT_STATUS.CREATE_PAYMENT
                                                || paymentStatus === PAYMENT_STATUS.SAVED_AS_DRAFT)
                                                && paymentRole === PAYMENT_ROLES.CREATOR)
                                                && (
                                                    <>
                                                        <Button
                                                            color="secondary"
                                                            className="mr-3"
                                                            type="button"
                                                            onClick={
                                                                () => {
                                                                    handleSubmit();
                                                                    if (!dirty || (dirty && Object.keys(errors).length)) {
                                                                        showToast("error", "Validation error, please check your input.");
                                                                        return;
                                                                    }
                                                                    onSavePressHandler(values,
                                                                        PAYMENT_STATUS.SAVED_AS_DRAFT);
                                                                }
                                                            }
                                                        >
                                                            {t("Save As Draft")}
                                                        </Button>
                                                        <Button
                                                            color="primary"
                                                            className="mr-3"
                                                            type="button"
                                                            onClick={
                                                                () => {
                                                                    handleSubmit();
                                                                    if (!dirty || (dirty && Object.keys(errors).length)) {
                                                                        showToast("error", "Validation error, please check your input.");
                                                                        return;
                                                                    }
                                                                    onSavePressHandler(values,
                                                                        PAYMENT_STATUS.CREATE_PAYMENT);
                                                                }
                                                            }
                                                        >
                                                            {paymentStatus === PAYMENT_STATUS.SAVED_AS_DRAFT ? t("Submit") : t("Create")}
                                                        </Button>
                                                    </>
                                                )}
                                            {((paymentStatus === PAYMENT_STATUS.SENT_BACK)
                                                && paymentRole === PAYMENT_ROLES.CREATOR)
                                                && (
                                                    <>
                                                        <Button
                                                            color="primary"
                                                            className="mr-3"
                                                            type="button"
                                                            onClick={
                                                                () => {
                                                                    handleSubmit();
                                                                    if (!dirty || (dirty && Object.keys(errors).length)) {
                                                                        showToast("error", "Validation error, please check your input.");
                                                                        return;
                                                                    }
                                                                    onSavePressHandler(values,
                                                                        PAYMENT_STATUS.CREATE_PAYMENT);
                                                                }
                                                            }
                                                        >
                                                            {t("Submit")}
                                                        </Button>
                                                    </>
                                                )}
                                            {(paymentStatus === PAYMENT_STATUS.PENDING_APPROVAL
                                                && paymentRole === PAYMENT_ROLES.APPROVER)
                                                && (
                                                    <>
                                                        <Button
                                                            color="danger"
                                                            className="mr-3"
                                                            type="button"
                                                            label={t("Reject")}
                                                            onClick={() => setPaymentState(
                                                                (prevStates) => ({
                                                                    ...prevStates,
                                                                    displayRejectReasonDialog: true
                                                                })
                                                            )}
                                                        >
                                                            <span>{t("Reject")}</span>
                                                        </Button>
                                                        <Button
                                                            color="warning"
                                                            className="mr-3"
                                                            type="button"
                                                            label={t("Send Back")}
                                                            onClick={() => setPaymentState(
                                                                (prevStates) => ({
                                                                    ...prevStates,
                                                                    displaySendBackReasonDialog: true
                                                                })
                                                            )}
                                                        >
                                                            <span>{t("Send Back")}</span>
                                                        </Button>
                                                        <Button
                                                            color="primary"
                                                            className="mr-3"
                                                            type="button"
                                                            onClick={
                                                                () => {
                                                                    handleSubmit();
                                                                    approvalPayment(
                                                                        paymentState.companyUuid
                                                                    );
                                                                }
                                                            }
                                                        >
                                                            {t("Approve")}
                                                        </Button>
                                                    </>
                                                )}
                                        </Row>
                                    </Row>
                                </StickyFooter>
                            </Form>
                        ) : (
                            <Loading />
                        )
                    );
                }}
            </Formik>
        </Container>
    );
};
export default PaymentDetails;
