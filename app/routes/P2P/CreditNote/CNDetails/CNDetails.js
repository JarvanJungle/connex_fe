import {
    Button, Col, Container, Row, Input
} from "components";
import { Formik, Form } from "formik";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CUSTOM_CONSTANTS, { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import {
    convertDate2String, convertToLocalTime,
    getCurrentCompanyUUIDByStore, itemAttachmentSchema, roundNumberWithUpAndDown
} from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { Conversation, AuditTrail, CommonConfirmDialog } from "routes/components";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import { useHistory, useLocation } from "react-router";
import CreditNoteService from "services/CreditNoteService/CreditNoteService";
import EntitiesService from "services/EntitiesService";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { HeaderMain } from "routes/components/HeaderMain";
import ConversationService from "services/ConversationService/ConversationService";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import ExtVendorService from "services/ExtVendorService";
import UOMDataService from "services/UOMService";
import TaxRecordDataService from "services/TaxRecordService";
import GLDataService from "services/GLService";
import CurrenciesService from "services/CurrenciesService";
import classNames from "classnames";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import { useApprovalConfig, usePermission } from "routes/hooks";
import CREDIT_NOTE_ROUTES from "../route";
import {
    CREDIT_NOTE_CONSTANTS,
    onCellValueChanged,
    addItemManual,
    onDeleteItem,
    itemApprovedSchema
} from "../helper";
import {
    SupplierInformation,
    CreditNoteInformation,
    AddedItemCN,
    GeneralInformation
} from "../components";
import { CREDIT_NOTE_ROLE_VIEW } from "../helper/constant";

const CNDetails = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { isBuyer } = permissionReducer;
    const showToast = useToast();
    const cnPermission = usePermission(FEATURE.CREDIT_NOTE);

    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

    const [cnStates, setCNStates] = useState({
        loading: true,
        companyUuid: "",
        cnUuid: "",
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
        reasonReject: "",
        showReasonReject: false,
        showErrorReasonReject: false,
        roleView: ""
    });
    const [suppliers, setSuppliers] = useState([]);
    const [uoms, setUOMs] = useState([]);
    const [taxRecords, setTaxRecords] = useState([]);
    const [glAccounts, setGLAccounts] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [cnDetails, setCNDetails] = useState({});
    const [approvalRoutes, setApprovalRoutes] = useState([]);
    const [cnAmountTotal, setCNAmountTotal] = useState({
        subTotal: 0,
        tax: 0,
        total: 0
    });
    const approvalConfig = useApprovalConfig(FEATURE.CREDIT_NOTE);

    const initialValues = {
        approvalConfig: false,
        creditNoteNumber: "",
        creditNoteDate: convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
        invoiceUuid: "",
        invoiceNumber: "",
        remarks: "",
        referenceToInvoice: isBuyer,
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
        itemList: [],
        status: "",
        apSpecialist: false
    };

    const validationSchema = Yup.object().shape({
        supplierCode: Yup.string()
            .required(t("PleaseSelectValidSupplier")),
        creditNoteDate: Yup.string()
            .required(t("PleaseSelectValidCreditNoteDate")),
        approvalRouteUuid: Yup.string()
            .when("approvalConfig", {
                is: true,
                then: Yup.string().required(t("PleaseSelectValidApprovalRoute"))
            }),
        invoiceUuid: Yup.string()
            .test(
                "invoiceUuid",
                t("PleaseSelectValidReferenceInvoice"),
                (value, testContext) => {
                    const { parent } = testContext;
                    return ((value && parent.referenceToInvoice)
                        || (!value && !parent.referenceToInvoice)
                        || (value && !parent.referenceToInvoice)
                    );
                }
            )
    });

    const getDataResponse = (responseData, type = "array") => {
        if (responseData.status === RESPONSE_STATUS.FULFILLED) {
            const { value } = responseData;
            if (!value) return type === "array" ? [] : {};
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
                            externalConversation: true,
                            toCompany: data.toCompany
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

    const initData = async (companyUuid, cnUuid) => {
        try {
            const responses = await Promise.allSettled([
                ExtVendorService.getExternalVendors(companyUuid),
                UOMDataService.getUOMRecords(companyUuid),
                TaxRecordDataService.getTaxRecords(companyUuid),
                isBuyer
                    ? GLDataService.getGLs(companyUuid)
                    : Promise.resolve(null),
                CurrenciesService.getCurrencies(companyUuid),
                CreditNoteService.getDetailsCN(companyUuid, cnUuid, isBuyer),
                isBuyer
                    ? ConversationService.getDetailInternalConversation(companyUuid, cnUuid)
                    : Promise.resolve(null),
                ConversationService.getDetailExternalConversation(companyUuid, cnUuid),
                ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(companyUuid, FEATURE.CREDIT_NOTE)
            ]).catch((e) => console.log(e));
            const [
                responseSuppliers,
                responseUOMs,
                responseTaxRecords,
                responseGLAccounts,
                responseCurrencies,
                responseDetailsCN,
                responseInternalConversations,
                responseExternalConversations,
                responseApprovalRoutes
            ] = responses;
            setSuppliers(getDataResponse(responseSuppliers)
                .sort((a, b) => {
                    if (a.companyName < b.companyName) return -1;
                    if (a.companyName > b.companyName) return 1;
                    return 0;
                }));
            setUOMs(getDataResponse(responseUOMs)
                .sort((a, b) => {
                    if (a.uomName < b.uomName) return -1;
                    if (a.uomName > b.uomName) return 1;
                    return 0;
                }));
            setTaxRecords(getDataResponse(responseTaxRecords)
                .sort((a, b) => {
                    if (a.taxCode < b.taxCode) return -1;
                    if (a.taxCode > b.taxCode) return 1;
                    return 0;
                }));
            setGLAccounts(getDataResponse(responseGLAccounts));
            setCurrencies(getDataResponse(responseCurrencies).filter(
                (currency) => currency.active === true
            ).sort(
                (a, b) => {
                    if (a.currencyName < b.currencyName) return -1;
                    if (a.currencyName > b.currencyName) return 1;
                    return 0;
                }
            ));
            const detailsCN = getDataResponse(responseDetailsCN, "object");

            let rowDataExternalConversation = getDataConversation(
                responseExternalConversations,
                false
            );

            if (!isBuyer) {
                const { buyerCompanyUuid } = detailsCN && detailsCN.buyer;
                const [responseExternalConversationsBuyer] = await Promise.allSettled([
                    ConversationService.getDetailExternalConversation(buyerCompanyUuid, cnUuid)
                ]);
                rowDataExternalConversation.push(...getDataConversation(
                    responseExternalConversationsBuyer,
                    false
                ));
                // rowDataExternalConversation = rowDataExternalConversation
                //     .filter((item) => item.userUuid === item.toCompany);
            } else {
                const { supplierCompanyUuid } = detailsCN && detailsCN.supplier;
                const [responseExternalConversationsBuyer] = await Promise.allSettled([
                    ConversationService.getDetailExternalConversation(supplierCompanyUuid, cnUuid)
                ]);
                const newExtConvo = [];
                newExtConvo.push(...getDataConversation(
                    responseExternalConversationsBuyer,
                    false
                ));
                // newExtConvo = newExtConvo
                //     .filter((item) => item.userUuid === item.toCompany);
                rowDataExternalConversation = [...rowDataExternalConversation, ...newExtConvo];
            }
            setApprovalRoutes(getDataResponse(responseApprovalRoutes));
            setCNDetails(detailsCN);
            setCNStates((prevStates) => ({
                ...prevStates,
                companyUuid,
                cnUuid,
                loading: false,
                rowDataExternalConversation,
                rowDataInternalConversation: getDataConversation(responseInternalConversations)
            }));
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

    useEffect(() => {
        if (!_.isEmpty(permissionReducer)
            && !_.isEmpty(userDetails)) {
            const query = new URLSearchParams(location.search);
            const cnUuid = query.get("uuid");
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            if (companyUuid) {
                initData(companyUuid, cnUuid);
            }
        }
    }, [permissionReducer, userDetails]);

    const sendCommentConversation = async (comment, isInternal) => {
        setDirty();
        if (isInternal) {
            const internalConversationLines = [...cnStates.internalConversationLines];
            const { rowDataInternalConversation } = cnStates;
            const newRowData = [...rowDataInternalConversation];
            newRowData.push({
                userName: userDetails.name,
                userRole: userDetails.designation,
                userUuid: userDetails.uuid,
                dateTime: convertDate2String(
                    new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss
                ),
                comment,
                externalConversation: false
            });
            internalConversationLines.push({
                text: comment
            });
            setCNStates((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = cnStates;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...cnStates.externalConversationLines];
        newRowData.push({
            userName: userDetails.name,
            userRole: userDetails.designation,
            userUuid: userDetails.uuid,
            dateTime: convertDate2String(
                new Date().toISOString(), CUSTOM_CONSTANTS.DDMMYYYHHmmss
            ),
            comment,
            externalConversation: true
        });
        externalConversationLines.push({
            text: comment
        });
        setCNStates((prevStates) => ({
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
            const { rowDataInternalAttachment } = cnStates;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.push({
                isNew: true,
                guid: "",
                fileLabel: "",
                fileDescription: "",
                uploadedOn: convertToLocalTime(new Date()),
                uploadedBy: userDetails.name,
                uploaderUuid: userDetails.uuid,
                externalDocument: false,
                uuid: uuidv4()
            });
            setCNStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = cnStates;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.push({
            isNew: true,
            guid: "",
            fileLabel: "",
            fileDescription: "",
            uploadedOn: convertToLocalTime(new Date()),
            uploadedBy: userDetails.name,
            uploaderUuid: userDetails.uuid,
            externalDocument: true,
            uuid: uuidv4()
        });
        setCNStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onCellEditingStopped = (params, isInternal) => {
        setDirty();
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = cnStates;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setCNStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = cnStates;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setCNStates((prevStates) => ({
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
                setCNStates((prevStates) => ({
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
            setCNStates((prevStates) => ({
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
            setCNStates((prevStates) => ({
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
        setCNStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onApprovePressHandler = async (values) => {
        setPristine();
        try {
            const {
                cnUuid, companyUuid,
                rowDataInternalAttachment,
                rowDataExternalAttachment
            } = cnStates;

            await validationSchema.validate(values);

            const body = {
                companyUuid,
                cnUuid,
                approvalRouteUuid: values.approvalRouteUuid,
                itemList: [],
                documentList: []
            };
            body.itemList = values.itemList.map((item) => ({
                cnItemUuid: item.cnItemUuid,
                glAccountNumber: item.glAccount?.accountNumber ?? item.glAccount,
                costCode: item.costCode?.code ?? item.costCode,
                departmentCode: item.departmentCode?.code ?? item.departmentCode,
                glAccountUuid: item.glAccount?.uuid
            }));
            await itemApprovedSchema.validate(body.itemList);

            let documentList = rowDataInternalAttachment
                .concat(rowDataExternalAttachment);
            documentList = documentList.filter((item) => item.isNew === true);

            await itemAttachmentSchema.validate(documentList);

            documentList = documentList.map(
                ({
                    fileLabel, attachment, uploadedOn, uuid, isNew, ...rest
                }) => ({
                    ...rest,
                    fileLabel: fileLabel || attachment
                })
            );
            body.documentList = documentList;
            const response = await (cnDetails.status === CREDIT_NOTE_CONSTANTS.PENDING_APPROVAL
                ? CreditNoteService.approveCN(companyUuid, body)
                : CreditNoteService.approveCNPending(companyUuid, body)
            );
            if (response.data.status === RESPONSE_STATUS.OK) {
                try {
                    if (cnStates.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: cnUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: cnStates.externalConversationLines
                        };
                        ConversationService
                            .createExternalConversation(companyUuid, conversationBody);
                    }
                    if (cnStates.internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: cnUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: cnStates.internalConversationLines
                        };
                        ConversationService
                            .createInternalConversation(companyUuid, conversationBody);
                    }
                } catch (errror) {}
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(CREDIT_NOTE_ROUTES.CN_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.data : error.message);
        }
    };

    const onRejectPressHandler = async () => {
        setPristine();
        setCNStates((prevStates) => ({
            ...prevStates,
            showErrorReasonReject: true
        }));

        if (cnStates.reasonReject) {
            setCNStates((prevStates) => ({
                ...prevStates,
                showReasonReject: false
            }));
            try {
                const {
                    cnUuid, companyUuid, rowDataInternalAttachment, rowDataExternalAttachment
                } = cnStates;
                const body = {
                    companyUuid,
                    cnUuid,
                    documentList: []
                };
                let documentList = rowDataInternalAttachment
                    .concat(rowDataExternalAttachment);
                documentList = documentList.filter((item) => item.isNew === true);
                await itemAttachmentSchema.validate(documentList);
                documentList = documentList.map(
                    ({
                        fileLabel, attachment, uploadedOn, uuid, isNew, ...rest
                    }) => ({
                        ...rest,
                        fileLabel: fileLabel || attachment
                    })
                );
                body.documentList = documentList;
                const response = await (cnDetails.status === CREDIT_NOTE_CONSTANTS.PENDING_APPROVAL
                    ? CreditNoteService.rejectCN(companyUuid, body)
                    : CreditNoteService.rejectCNPending(companyUuid, body)
                );
                if (response.data.status === RESPONSE_STATUS.OK) {
                    try {
                        if (cnStates.externalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: cnUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: [...cnStates.externalConversationLines,
                                    { text: cnStates.reasonReject }
                                ]
                            };
                            ConversationService
                                .createExternalConversation(companyUuid, conversationBody);
                        } else {
                            const conversationBody = {
                                referenceId: cnUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: [{ text: cnStates.reasonReject }]
                            };
                            ConversationService
                                .createExternalConversation(companyUuid, conversationBody);
                        }
                        if (cnStates.internalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: cnUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: cnStates.internalConversationLines
                            };
                            ConversationService
                                .createInternalConversation(companyUuid, conversationBody);
                        }
                    } catch (error) {}

                    showToast("success", response.data.message);
                    setTimeout(() => {
                        history.push(CREDIT_NOTE_ROUTES.CN_LIST);
                    }, 1000);
                } else {
                    showToast("error", response.data.message);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.data : error.message);
            }
        }
    };

    const renderActionButton = (values, handleSubmit) => {
        if (
            isBuyer
            && (
                (cnDetails.status === CREDIT_NOTE_CONSTANTS.PENDING_APPROVAL && values.apSpecialist)
                || (
                    cnDetails.status === CREDIT_NOTE_CONSTANTS.PENDING_CN_APPROVAL
                    && cnDetails.approverRole
                    && !cnDetails.hasApproved
                )
            )
        ) {
            return (
                <>
                    <Row className="mx-0">
                        <Button
                            color="danger"
                            type="submit"
                            disabled={cnStates.loading}
                            className="mr-2"
                            onClick={
                                () => setCNStates((prevStates) => ({
                                    ...prevStates,
                                    showReasonReject: true
                                }))
                            }
                        >
                            {t("Reject")}
                        </Button>
                        <Button
                            color="primary"
                            type="button"
                            disabled={cnStates.loading}
                            onClick={
                                () => {
                                    handleSubmit();
                                    onApprovePressHandler(values)
                                }
                            }
                        >
                            {t("Approve")}
                        </Button>
                    </Row>
                </>
            );
        }
        return (<></>);
    };

    const onViewCreditNotePressHandler = async () => {
        try {
            const {
                companyUuid,
                cnUuid
            } = cnStates;

            const response = await CreditNoteService.viewPDF(
                companyUuid, cnUuid, isBuyer
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

    const convertAction = (value) => {
        switch (value) {
            case "Credit Note Created":
                return "Created Credit Note";
            case "Credit Note Approved":
                return "Approved Credit Note";
            case "Credit Note Rejected":
                return "Rejected Credit Note";
            default:
                return value;
        }
    };

    return (
        <Container fluid>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, setFieldValue, handleSubmit
                }) => {
                    useEffect(() => {
                        if (typeof isBuyer !== "boolean") return;
                        setFieldValue("referenceToInvoice", isBuyer);
                    }, [isBuyer]);

                    useEffect(() => {
                        if (approvalConfig) setFieldValue("approvalConfig", approvalConfig);
                    }, [approvalConfig]);

                    useEffect(() => {
                        if (!_.isEmpty(cnDetails)) {
                            setFieldValue("creditNoteNumber", cnDetails.creditNoteNumber);
                            setFieldValue("creditNoteDate", convertDate2String(cnDetails.creditNoteDate, CUSTOM_CONSTANTS.YYYYMMDD));
                            setFieldValue("invoiceUuid", cnDetails.invoiceUuid || "");
                            setFieldValue("invoiceNumber", cnDetails.invoiceNumber || "");
                            setFieldValue("remarks", cnDetails.remarks || "");
                            setFieldValue("status", cnDetails.status || "");
                            setFieldValue("referenceToInvoice", !!cnDetails.invoiceUuid);
                            setFieldValue("apSpecialist", cnDetails.apSpecialist || false);
                            setFieldValue("approvalRouteUuid", cnDetails.approvalRouteUuid);
                            setFieldValue("approvalSequence", cnDetails.approvalRouteSequence);
                            setFieldValue("currencyCode", cnDetails.currencyCode);

                            if (isBuyer) {
                                const { supplier } = cnDetails;
                                setFieldValue("supplierCode", supplier.supplierCode || "");
                                setFieldValue("supplierUuid", supplier.supplierUuid || "");
                                setFieldValue("supplierCompanyUuid", supplier.supplierCompanyUuid || "");
                                setFieldValue("companyName", supplier.companyName || "");
                                const { address } = supplier;
                                setFieldValue("addressLabel", address.addressLabel || "");
                                setFieldValue("addressFirstLine", address.addressFirstLine || "");
                                setFieldValue("addressSecondLine", address.addressSecondLine || "");
                                setFieldValue("city", address.city || "");
                                setFieldValue("state", address.state || "");
                                setFieldValue("country", address.country || "");
                                setFieldValue("postalCode", address.postalCode || "");
                                setFieldValue("postalCode", address.postalCode || "");
                            }

                            if (!isBuyer) {
                                const { buyer } = cnDetails;

                                setFieldValue("supplierCode", buyer.buyerCode || "");
                                setFieldValue("supplierUuid", buyer.buyerUuid || "");
                                setFieldValue("supplierCompanyUuid", buyer.buyerCompanyUuid || "");
                                setFieldValue("companyName", buyer.companyName || "");
                                const { address } = buyer;
                                setFieldValue("addressLabel", address.addressLabel || "");
                                setFieldValue("addressFirstLine", address.addressFirstLine || "");
                                setFieldValue("addressSecondLine", address.addressSecondLine || "");
                                setFieldValue("city", address.city || "");
                                setFieldValue("state", address.state || "");
                                setFieldValue("country", address.country || "");
                                setFieldValue("postalCode", address.postalCode || "");
                            }

                            const itemList = cnDetails.itemList.map((item) => {
                                if (item.glAccountNumber) {
                                    const glAccount = (!glAccounts || glAccounts.length === 0) ? item.glAccountNumber : glAccounts.find(
                                        (element) => element.accountNumber === item.glAccountNumber
                                    );
                                    return ({
                                        ...item,
                                        netPrice: roundNumberWithUpAndDown(item.itemQuantity
                                            * item.unitPrice
                                            * Number(item.exchangeRate)),
                                        glAccount,
                                        currencyCode: cnDetails.currencyCode,
                                        uuid: uuidv4()
                                    });
                                }
                                return ({
                                    ...item,
                                    netPrice: roundNumberWithUpAndDown(item.itemQuantity
                                        * item.unitPrice
                                        * Number(item.exchangeRate)),
                                    currencyCode: cnDetails.currencyCode,
                                    uuid: uuidv4()
                                });
                            });

                            setFieldValue("itemList", itemList);
                            const subTotal = roundNumberWithUpAndDown(itemList.reduce(
                                (sum, item) => sum + roundNumberWithUpAndDown(item.netPrice), 0
                            ));
                            const diffTax = itemList.some((item) => item.taxPercent !== itemList[0]?.taxPercent);
                            let tax;
                            if (diffTax) {
                                tax = roundNumberWithUpAndDown(itemList.reduce((sum, item) => {
                                    const result = roundNumberWithUpAndDown(roundNumberWithUpAndDown(
                                        (roundNumberWithUpAndDown(item.netPrice)
                                        * item.taxPercent) / 100
                                    ));
                                    return sum + result;
                                }, 0));
                            } else {
                                tax = roundNumberWithUpAndDown((subTotal * itemList[0]?.taxPercent) / 100);
                            }
                            // const tax = roundNumberWithUpAndDown(itemList.reduce((sum, item) => {
                            //     const result = roundNumberWithUpAndDown(roundNumberWithUpAndDown(
                            //         (roundNumberWithUpAndDown(item.netPrice)
                            //         * item.taxPercent) / 100
                            //     ));
                            //     return sum + result;
                            // }, 0));
                            const total = roundNumberWithUpAndDown(subTotal + tax);
                            console.log("useEffect ~ total", total);
                            setCNAmountTotal({
                                subTotal,
                                tax,
                                total
                            });

                            const rowDataAuditTrail = cnDetails.auditTrailList.map(
                                ({
                                    createdDate, role, ...rest
                                }) => ({
                                    ...rest,
                                    action: convertAction(rest.action),
                                    dateTime: convertToLocalTime(
                                        createdDate, CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    ),
                                    userRole: role
                                })
                            );
                            let roleView = "";
                            rowDataAuditTrail.forEach((item) => {
                                if (item.action === "Created Credit Note") {
                                    if (isBuyer) {
                                        if (item.userUuid === userDetails.uuid) {
                                            roleView = CREDIT_NOTE_ROLE_VIEW.BUYER_VIEW_BUYER;
                                        } else {
                                            roleView = CREDIT_NOTE_ROLE_VIEW.BUYER_VIEW_SUP;
                                        }
                                    } else if (item.userUuid === userDetails.uuid) {
                                        roleView = CREDIT_NOTE_ROLE_VIEW.SUP_VIEW_SUP;
                                    } else {
                                        roleView = CREDIT_NOTE_ROLE_VIEW.SUP_VIEW_BUYER;
                                    }
                                }
                            });

                            const rowDataInternalAttachment = cnDetails.documentList.filter(
                                (attachment) => attachment.externalDocument === false
                            ).map(
                                ({ uploadedOn, ...rest }) => ({
                                    ...rest,
                                    uploadedBy: rest.uploadedByName,
                                    uploadedOn: convertToLocalTime(
                                        uploadedOn,
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    )
                                })
                            );

                            const rowDataExternalAttachment = cnDetails.documentList.filter(
                                (attachment) => attachment.externalDocument === true
                            ).map(
                                ({ uploadedOn, ...rest }) => ({
                                    ...rest,
                                    uploadedBy: rest.uploadedByName,
                                    uploadedOn: convertToLocalTime(
                                        uploadedOn,
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    )
                                })
                            );

                            setCNStates((prevStates) => ({
                                ...prevStates,
                                rowDataAuditTrail,
                                rowDataInternalAttachment,
                                rowDataExternalAttachment,
                                roleView
                            }));
                        }
                    }, [cnDetails]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col md={12} lg={12}>
                                    <Row className="mx-0 justify-content-between align-items-center">
                                        <HeaderMain
                                            title={t("CreditNoteDetails")}
                                            className="mb-3 mb-lg-3"
                                        />
                                        <Button
                                            style={{
                                                border: "1px solid #7b7b7b7b",
                                                padding: "2px 8px",
                                                background: "#fff",
                                                height: 36
                                            }}
                                            className="text-secondary"
                                            type="button"
                                            onClick={() => onViewCreditNotePressHandler()}
                                        >
                                            {t("ViewCreditNote")}
                                        </Button>
                                    </Row>
                                    <Row>
                                        <Col md={6} lg={6}>
                                            <SupplierInformation
                                                t={t}
                                                disabled
                                                setFieldValue={setFieldValue}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                                suppliers={suppliers}
                                                isBuyer={isBuyer}
                                                showToast={showToast}
                                                setDirty={setDirty}
                                                companyUuid={cnStates.companyUuid}
                                                setInvoices={setInvoices}
                                            />
                                        </Col>
                                        <Col md={6} lg={6}>
                                            <CreditNoteInformation
                                                t={t}
                                                disabled
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                                setFieldValue={setFieldValue}
                                                companyUuid={cnStates.companyUuid}
                                                isBuyer={isBuyer}
                                                invoices={invoices}
                                                showToast={showToast}
                                                setDirty={setDirty}
                                                setCNAmountTotal={setCNAmountTotal}
                                            />
                                            {(
                                                isBuyer
                                                && (
                                                    (cnDetails.status === CREDIT_NOTE_CONSTANTS.PENDING_APPROVAL && values.apSpecialist)
                                                    || (
                                                        cnDetails.status === CREDIT_NOTE_CONSTANTS.PENDING_CN_APPROVAL
                                                        && cnDetails.approverRole
                                                        && !cnDetails.hasApproved
                                                    )
                                                )
                                            ) && (
                                                <GeneralInformation
                                                    t={t}
                                                    values={values}
                                                    touched={touched}
                                                    errors={errors}
                                                    setFieldValue={setFieldValue}
                                                    disabled={!(
                                                        isBuyer
                                                        && cnDetails.status === CREDIT_NOTE_CONSTANTS.PENDING_APPROVAL
                                                        && values.apSpecialist
                                                    ) || !values.approvalConfig}
                                                    approvalRoutes={approvalRoutes}
                                                />
                                            )}
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col xs={12}>
                                    <AddedItemCN
                                        borderTopColor="#fff"
                                        defaultExpanded
                                        gridHeight={400}
                                        rowDataItem={values.itemList}
                                        type={values.invoiceType}
                                        addItemManual={() => {
                                            addItemManual(
                                                values.itemList,
                                                setFieldValue,
                                                setDirty
                                            );
                                        }}
                                        uoms={uoms}
                                        taxRecords={taxRecords}
                                        glAccounts={glAccounts}
                                        currencies={currencies}
                                        onCellValueChanged={(params) => {
                                            onCellValueChanged(
                                                params,
                                                values.itemList,
                                                setFieldValue,
                                                setCNAmountTotal
                                            );
                                        }}
                                        onDeleteItem={
                                            (uuid, rowData, params) => {
                                                onDeleteItem(
                                                    uuid,
                                                    rowData,
                                                    params,
                                                    setFieldValue,
                                                    setCNAmountTotal
                                                );
                                            }
                                        }
                                        cnAmountTotal={cnAmountTotal}
                                        disabled
                                        status={cnDetails.status}
                                        isBuyer={isBuyer}
                                        values={values}
                                    />
                                </Col>
                            </Row>

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
                                                activeTab={cnStates.activeInternalTab}
                                                setActiveTab={(idx) => {
                                                    setCNStates((prevStates) => ({
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
                                                    cnStates.rowDataInternalConversation
                                                }
                                                rowDataAttachment={
                                                    cnStates.rowDataInternalAttachment
                                                }
                                                onDeleteAttachment={
                                                    (uuid, rowData) => onDeleteAttachment(
                                                        uuid, rowData, true
                                                    )
                                                }
                                                onAddAttachment={
                                                    (e, uuid,
                                                        rowData) => onAddAttachmentConversation(
                                                            e, uuid, rowData, true
                                                        )
                                                }
                                                onCellEditingStopped={
                                                    (params) => onCellEditingStopped(params, true)
                                                }
                                                defaultExpanded
                                                disabled={
                                                    cnStates.roleView
                                                    === CREDIT_NOTE_ROLE_VIEW.SUP_VIEW_SUP
                                                    || values.status === "APPROVED"
                                                    || values.status === "CREATED"
                                                    || values.status === "REJECTED"
                                                    || values.apSpecialist === false
                                                }
                                            />
                                        </Col>
                                    </Row>
                                )
                            }

                            <Row className="mb-4">
                                <Col xs={12}>
                                    <Conversation
                                        title={t("ExternalConversations")}
                                        activeTab={cnStates.activeExternalTab}
                                        setActiveTab={(idx) => {
                                            setCNStates((prevStates) => ({
                                                ...prevStates,
                                                activeExternalTab: idx
                                            }));
                                        }}
                                        sendConversation={
                                            (comment) => sendCommentConversation(
                                                comment, false
                                            )
                                        }
                                        addNewRowAttachment={
                                            () => addNewRowAttachment(false)
                                        }
                                        rowDataConversation={
                                            cnStates.rowDataExternalConversation
                                        }
                                        rowDataAttachment={
                                            cnStates.rowDataExternalAttachment
                                        }
                                        onDeleteAttachment={
                                            (uuid, rowData) => onDeleteAttachment(
                                                uuid, rowData, false
                                            )
                                        }
                                        onAddAttachment={
                                            (e, uuid, rowData) => {
                                                onAddAttachmentConversation(
                                                    e, uuid, rowData, false
                                                );
                                            }
                                        }
                                        onCellEditingStopped={
                                            (params) => onCellEditingStopped(params, false)
                                        }
                                        defaultExpanded
                                        borderTopColor="#A9A2C1"
                                        disabled={
                                            cnStates.roleView === CREDIT_NOTE_ROLE_VIEW.SUP_VIEW_SUP
                                            || values.status === "APPROVED"
                                            || values.status === "CREATED"
                                            || values.status === "REJECTED"
                                            || values.apSpecialist === false
                                        }
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
                                        rowData={cnStates.rowDataAuditTrail}
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
                                    {renderActionButton(values, handleSubmit)}
                                </Row>
                            </StickyFooter>
                        </Form>
                    );
                }}
            </Formik>

            <CommonConfirmDialog
                isShow={cnStates.showReasonReject}
                onHide={() => setCNStates((prevStates) => ({
                    ...prevStates,
                    showReasonReject: false
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
                        onNegativeAction: () => setCNStates((prevStates) => ({
                            ...prevStates,
                            showReasonReject: false
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
                            "is-invalid": cnStates.showErrorReasonReject && !cnStates.reasonReject
                        })
                    }
                    placeholder={t("PleaseEnterReason")}
                    value={cnStates.reasonReject}
                    onChange={(e) => {
                        const { value } = e.target;
                        setCNStates((prevStates) => ({
                            ...prevStates,
                            reasonReject: value
                        }));
                    }}
                />
                {
                    cnStates.showErrorReasonReject && !cnStates.reasonReject
                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                }
            </CommonConfirmDialog>

            {Prompt}
        </Container>
    );
};
export default CNDetails;
