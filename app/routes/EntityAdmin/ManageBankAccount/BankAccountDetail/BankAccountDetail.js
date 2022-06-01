import React, { useEffect, useState } from "react";
import {
    Container, Row, Col, Button, Input
} from "components";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router";
import useToast from "routes/hooks/useToast";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import StickyFooter from "components/StickyFooter";
import { v4 as uuidv4 } from "uuid";
import { AuditTrail, CommonConfirmDialog, Conversation } from "routes/components";
import { HeaderMain } from "routes/components/HeaderMain";
import { AvForm } from "availity-reactstrap-validation";
import BankAccountService from "services/BankAccountService/BankAccountService";
import { useSelector } from "react-redux";
import {
    debounce, formatDateString, formatDateTimeUpdated, isNullOrUndefinedOrEmpty
} from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import EntitiesService from "services/EntitiesService";
import ConversationService from "services/ConversationService/ConversationService";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import classNames from "classnames";
import BANK_ACCOUNT_ROUTES_PATH from "../routes";
import BankAccountForm from "./BankAccountForm";
import { BANK_ACCOUNT_STATUS, initialValues, PAGE_STAGE } from "../helper";
import Countries from "/public/assets/Countries.jsx";

export default function BankAccountDetail() {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const showToast = useToast();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userPermission } = permissionReducer;
    const authReducer = useSelector((state) => state.authReducer);
    const { userDetails } = authReducer;

    const [pageState, setPageState] = useState(PAGE_STAGE.CREATE);
    const [formData, setFormData] = useState(initialValues);
    const [isUpdate, setIsUpdate] = useState(false);
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

    const [bankAccountStates, setBankAccountStates] = useState({
        loading: false,
        companyUuid: "",
        activeInternalTab: 1,
        activeExternalTab: 1,
        showAddCatalogue: false,
        showAddContact: false,
        showAddForecast: false,
        catalogueItems: [],
        forecastItems: [],
        contactItems: [],
        suppliers: [],
        uoms: [],
        currencies: [],
        taxRecords: [],
        addresses: [],
        responseUOMs: [],
        glAccounts: [],
        typeOfRequisitions: [],
        natureOfRequisitions: [
            { label: "Project", value: true },
            { label: "Non-Project", value: false }
        ],
        projects: [],
        procurementTypes: [
            { label: "Goods", value: "GOODS" },
            { label: "Service", value: "SERVICE" }
        ],
        approvalRoutes: [],
        rowDataProject: [],
        rowDataTrade: [],
        rowDataItem: [],
        rowDataInternalConversation: [],
        rowDataExternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataItemReq: [],
        rowDataAuditTrail: [],
        subTotal: 0,
        tax: 0,
        total: 0,
        selectedCatalogueItems: [],
        selectedForecastItems: [],
        selectedContactItems: [],
        externalConversationLines: [],
        internalConversationLines: [],
        attachments: [],
        listBank: [],
        listBankData: [],
        showErrorReasonReject: false,
        displayRejectReasonDialog: false,
        reasonReject: ""
    });

    const sendCommentConversation = async (comment, isInternal) => {
        if (isInternal) {
            const internalConversationLines = [...bankAccountStates.internalConversationLines];
            const { rowDataInternalConversation } = bankAccountStates;
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
            setBankAccountStates((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = bankAccountStates;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...bankAccountStates.externalConversationLines];
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
        setBankAccountStates((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation: newRowData,
            externalConversationLines
        }));
    };
    const addNewRowAttachment = (isInternal) => {
        if (isInternal) {
            const { rowDataInternalAttachment } = bankAccountStates;
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
            setBankAccountStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = bankAccountStates;
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
        setBankAccountStates((prevStates) => ({
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
                setBankAccountStates((prevStates) => ({
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
            setBankAccountStates((prevStates) => ({
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
            setBankAccountStates((prevStates) => ({
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
        setBankAccountStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };
    const onCellEditingStopped = (params, isInternal) => {
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = bankAccountStates;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setBankAccountStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = bankAccountStates;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setBankAccountStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };
    const mappingCreateBodyParams = (data) => {
        const listInternal = bankAccountStates.rowDataInternalAttachment.map((item) => ({
            guid: item.guid,
            fileLabel: item.fileLabel || item.attachment,
            fileDescription: item.fileDescription,
            uploadBy: userDetails.name,
            externalDocument: false
        }));
        const listExternal = bankAccountStates.rowDataExternalAttachment.map((item) => ({
            guid: item.guid,
            fileLabel: item.fileLabel || item.attachment,
            fileDescription: item.fileDescription,
            uploadBy: userDetails.name,
            externalDocument: true
        }));
        const listDocument = listInternal.concat(listExternal);
        const listDocDto = listDocument.filter((item) => bankAccountStates.attachments
            .filter((value) => value.guid === item.guid).length === 0);
        const body = {
            ...data,
            bankAccountDocumentMetadata: listDocDto
        };
        return body;
    };

    const getDetailBankAccount = async (currentCompanyUUID, bankAccountUuid) => {
        const responseCatalogue = await BankAccountService
            .getBankAccountDetails(currentCompanyUUID, bankAccountUuid);
        if (responseCatalogue.data.status === "OK") {
            const resData = responseCatalogue.data.data;
            if (resData.approver && resData.status === BANK_ACCOUNT_STATUS.PENDING_APPROVAL) {
                setPageState(PAGE_STAGE.APPROVE);
            }
            const formatData = {
                ...resData
            };
            setFormData(formatData);
            const attachments = resData.bankAccountDocumentMetadata.map((item) => ({
                ...item,
                uploadedOn: formatDateString(
                    formatDateTimeUpdated(item.uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                )
            }));

            const rowDataExternalConversation = [
                ...bankAccountStates.rowDataExternalConversation];
            try {
                const resConversation = await ConversationService
                    .getDetailExternalConversation(
                        currentCompanyUUID, bankAccountUuid
                    );
                if (resConversation.data.status === "OK") {
                    resConversation?.data?.data?.conversations
                        .forEach((item) => {
                            rowDataExternalConversation.push({
                                userName: item.sender,
                                userRole: item.designation,
                                userUuid: item.userUuid,
                                dateTime: formatDateString(new Date(item.createdAt),
                                    CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                comment: item.text,
                                externalConversation: true
                            });
                        });
                }
            } catch (error) {
                console.log("error", error);
            }
            const rowDataInternalConversation = [
                ...bankAccountStates.rowDataInternalConversation];
            try {
                const relatedAccountUuid = resData.relatedAccountUuid || [];
                if (Array.isArray(relatedAccountUuid)) {
                    const originInternalConversations = await Promise.all(relatedAccountUuid.map((uuid) => ConversationService.getDetailInternalConversation(
                        currentCompanyUUID, uuid
                    )));
                    // eslint-disable-next-line array-callback-return
                    originInternalConversations.map((responose) => {
                        if (responose.data.status === "OK") {
                            responose?.data?.data?.conversations.forEach((item) => {
                                rowDataInternalConversation.push({
                                    userName: item.sender,
                                    userRole: item.designation,
                                    userUuid: item.userUuid,
                                    dateTime: formatDateString(new Date(item.date), CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                    comment: item.text,
                                    externalConversation: true
                                });
                            });
                        }
                    });
                }
            } catch (error) {
                console.log("error", error);
            }

            setBankAccountStates((prevStates) => ({
                ...prevStates,
                rowDataAuditTrail: resData.bankAccountAuditTrail.map((item) => ({
                    userName: item.userName,
                    userRole: item.userRole,
                    dateTime: formatDateString(
                        formatDateTimeUpdated(item.dateTime, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                    ),
                    action: item.action
                })),
                rowDataInternalAttachment: attachments.filter(
                    (attachment) => attachment.externalDocument === false
                ),
                rowDataExternalAttachment: attachments.filter(
                    (attachment) => attachment.externalDocument === true
                ),
                rowDataExternalConversation,
                rowDataInternalConversation,
                isInit: true,
                attachments
            }));
        } else {
            showToast("error", responseCatalogue.data.message);
        }
    };

    const handleCreateOrUpdate = async () => {
        try {
            const createBankAccountBody = mappingCreateBodyParams(formData);

            if (pageState === PAGE_STAGE.CREATE) {
                const response = await BankAccountService
                    .postCreateBankAccount(bankAccountStates.companyUuid, createBankAccountBody);
                if (response.data.status === "OK") {
                    try {
                        if (bankAccountStates.externalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: response.data.data,
                                supplierUuid: userDetails.uuid,
                                conversations: bankAccountStates.externalConversationLines
                            };
                            ConversationService
                                .createExternalConversation(
                                    bankAccountStates.companyUuid, conversationBody
                                );
                        }
                        if (bankAccountStates.internalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: response.data.data,
                                supplierUuid: userDetails.uuid,
                                conversations: bankAccountStates.internalConversationLines
                            };
                            ConversationService
                                .createInternalConversation(
                                    bankAccountStates.companyUuid, conversationBody
                                );
                        }
                    } catch (error) {}
                    setPristine();
                    history.push(BANK_ACCOUNT_ROUTES_PATH.BANK_ACCOUNT_LIST);
                    showToast("success", response.data.message);
                } else {
                    showToast("error", response.data.message);
                }
            } else if (isUpdate) {
                const response = await BankAccountService.postUpdateBankAccount(bankAccountStates.companyUuid, formData);
                if (response.data.status === "OK") {
                    setPristine();
                    history.push(BANK_ACCOUNT_ROUTES_PATH.BANK_ACCOUNT_LIST);
                    showToast("success", response.data.message);
                } else {
                    showToast("error", response.data.message);
                }
            }
        } catch (error) {
            showToast("error", error.response.data.message);
        }
    };

    const approvedBankAccount = async () => {
        const BABody = mappingCreateBodyParams(formData);
        const bodyApprove = {
            uuid: BABody.uuid,
            newlyAddedbankAccountDocumentMetadata: BABody.bankAccountDocumentMetadata
        };
        const response = await BankAccountService
            .postApproveBankAccount(bankAccountStates.companyUuid, bodyApprove);
        if (response.data.status === "OK") {
            try {
                if (bankAccountStates.externalConversationLines.length > 0) {
                    const conversationBody = {
                        referenceId: BABody.uuid,
                        supplierUuid: userDetails.uuid,
                        conversations: bankAccountStates.externalConversationLines
                    };
                    ConversationService
                        .createExternalConversation(
                            bankAccountStates.companyUuid, conversationBody
                        );
                }
                if (bankAccountStates.internalConversationLines.length > 0) {
                    const conversationBody = {
                        referenceId: BABody.uuid,
                        supplierUuid: userDetails.uuid,
                        conversations: bankAccountStates.internalConversationLines
                    };
                    ConversationService
                        .createInternalConversation(
                            bankAccountStates.companyUuid, conversationBody
                        );
                }
            } catch (error) {}
            setPristine();
            history.push(BANK_ACCOUNT_ROUTES_PATH.BANK_ACCOUNT_LIST);
            showToast("success", response.data.message);
        } else {
            showToast("error", response.data.message);
        }
    };

    const rejectBankAccount = async () => {
        setBankAccountStates((prevStates) => ({
            ...prevStates,
            showErrorReasonReject: true
        }));
        if (bankAccountStates.reasonReject) {
            setBankAccountStates((prevStates) => ({
                ...prevStates,
                showErrorReasonReject: false
            }));
            const BABody = mappingCreateBodyParams(formData);
            const bodyReject = {
                uuid: BABody.uuid,
                newlyAddedbankAccountDocumentMetadata: BABody.bankAccountDocumentMetadata
            };
            const response = await BankAccountService
                .postRejectBankAccount(bankAccountStates.companyUuid, bodyReject);
            if (response.data.status === "OK") {
                try {
                    const conversationLines = [...bankAccountStates.internalConversationLines];
                    conversationLines.push({ text: bankAccountStates.reasonReject });
                    if (bankAccountStates.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: BABody.uuid,
                            supplierUuid: userDetails.uuid,
                            conversations: bankAccountStates.externalConversationLines
                        };
                        ConversationService
                            .createExternalConversation(
                                bankAccountStates.companyUuid, conversationBody
                            );
                    }
                    if (conversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: BABody.uuid,
                            supplierUuid: userDetails.uuid,
                            conversations: conversationLines
                        };
                        ConversationService
                            .createInternalConversation(
                                bankAccountStates.companyUuid, conversationBody
                            );
                    }
                } catch (error) {}
                setPristine();
                history.push(BANK_ACCOUNT_ROUTES_PATH.BANK_ACCOUNT_LIST);
                showToast("success", response.data.message);
            } else {
                showToast("error", response.data.message);
            }
        }
    };

    const handleValidSubmit = () => {
        handleCreateOrUpdate();
    };

    const handleInvalidSubmit = () => {
        showToast("error", "Validation error, please check your input");
    };

    const handleChangeValue = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleChangeCountry = (event) => {
        const listBankAccount = [...bankAccountStates.listBankData];
        const country = Countries.countries.find((item) => item.name === event.target.value);
        setBankAccountStates((prevStates) => ({
            ...prevStates,
            listBank: listBankAccount.filter((item) => (item.country === country.code))
        }));
        setFormData({ ...formData, country: event.target.value });
    };

    const initData = async (currentCompanyUUID) => {
        try {
            const resListBank = await BankAccountService.getListBankName(currentCompanyUUID);
            setBankAccountStates((prevStates) => ({
                ...prevStates,
                listBank: resListBank.data.data,
                listBankData: resListBank.data.data
            }));
        } catch (error) {
            console.log("error", error);
        }
    };

    useEffect(() => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (!isNullOrUndefinedOrEmpty(currentCompanyUUID)) {
            setBankAccountStates((prevStates) => ({
                ...prevStates,
                companyUuid: currentCompanyUUID
            }));
            const query = new URLSearchParams(location.search);
            const uuid = query.get("uuid");
            initData(currentCompanyUUID);
            if (uuid) {
                setPageState(PAGE_STAGE.DETAIL);
                getDetailBankAccount(currentCompanyUUID, uuid);
            } else {
                setBankAccountStates((prevStates) => ({
                    ...prevStates,
                    isInit: true
                }));
            }
        }
    }, [userPermission]);

    useEffect(() => {
        if (bankAccountStates.isInit) {
            setDirty();
        }
    }, [formData]);

    return (
        <AvForm onValidSubmit={debounce(handleValidSubmit)} onInvalidSubmit={debounce(handleInvalidSubmit)}>
            <Container fluid>
                <Row className="mb-4">
                    <Col md={12} lg={12}>
                        {pageState === PAGE_STAGE.CREATE && (
                            <HeaderMain
                                title={t("Add New Bank Account")}
                                className="mb-3 mb-lg-3"
                            />
                        )}
                        {pageState === PAGE_STAGE.APPROVE && (
                            <HeaderMain
                                title={t("Bank Account Details")}
                                className="mb-3 mb-lg-3"
                            />
                        )}
                        {pageState === PAGE_STAGE.DETAIL && (
                            <HeaderMain
                                title={t("Bank Account Details")}
                                className="mb-3 mb-lg-3"
                            />
                        )}
                        <Row>
                            <Col xs={12}>
                                <BankAccountForm
                                    formData={formData}
                                    pageState={pageState}
                                    onChange={handleChangeValue}
                                    handleChangeCountry={handleChangeCountry}
                                    listBank={bankAccountStates.listBank}
                                    isUpdate={isUpdate}
                                />
                            </Col>
                        </Row>

                        <HeaderSecondary
                            title={t("Conversations")}
                            className="mb-2"
                        />
                        <Row className="mb-2">
                            <Col xs={12}>
                                {/* Internal Conversations */}
                                <Conversation
                                    title={t("InternalConversations")}
                                    activeTab={bankAccountStates.activeInternalTab}
                                    setActiveTab={(idx) => {
                                        setBankAccountStates((prevStates) => ({
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
                                        bankAccountStates.rowDataInternalConversation
                                    }
                                    rowDataAttachment={
                                        bankAccountStates.rowDataInternalAttachment
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
                                    disabled={pageState === PAGE_STAGE.DETAIL}
                                />
                            </Col>
                        </Row>
                        {/* Comment External Conversation */}
                        {/* <Row className="mb-4">
                            <Col xs={12}>
                                <Conversation
                                    title={t("ExternalConversations")}
                                    activeTab={bankAccountStates.activeExternalTab}
                                    setActiveTab={(idx) => {
                                        setBankAccountStates((prevStates) => ({
                                            ...prevStates,
                                            activeExternalTab: idx
                                        }));
                                    }}
                                    sendConversation={
                                        (comment) => sendCommentConversation(comment, false)
                                    }
                                    addNewRowAttachment={() => addNewRowAttachment(false)}
                                    rowDataConversation={
                                        bankAccountStates.rowDataExternalConversation
                                    }
                                    rowDataAttachment={
                                        bankAccountStates.rowDataExternalAttachment
                                    }
                                    onDeleteAttachment={
                                        (uuid, rowData) => onDeleteAttachment(
                                            uuid, rowData, false
                                        )
                                    }
                                    onAddAttachment={
                                        (e, uuid, rowData) => onAddAttachment(
                                            e, uuid, rowData, false
                                        )
                                    }
                                    onCellEditingStopped={
                                        (params) => onCellEditingStopped(params, false)
                                    }
                                    defaultExpanded
                                    borderTopColor="#A9A2C1"
                                    disabled={pageState === PAGE_STAGE.DETAIL}
                                />
                            </Col>
                        </Row> */}

                        <HeaderSecondary
                            title={t("AuditTrail")}
                            className="mb-2"
                        />
                        <Row className="mb-5">
                            <Col xs={12}>
                                {/* Audit Trail */}
                                <AuditTrail
                                    rowData={bankAccountStates.rowDataAuditTrail}
                                    onGridReady={(params) => {
                                        params.api.sizeColumnsToFit();
                                    }}
                                    paginationPageSize={10}
                                    gridHeight={350}
                                    defaultExpanded
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <StickyFooter>
                    <Row className="mx-0 px-3 justify-content-between">
                        <Button
                            color="secondary"
                            onClick={() => history.push(
                                BANK_ACCOUNT_ROUTES_PATH.BANK_ACCOUNT_LIST
                            )}
                        >
                            {t("Back")}
                        </Button>

                        {pageState === PAGE_STAGE.CREATE && (
                            <Row className="mx-0">
                                <Button
                                    color="primary"
                                    type="submit"
                                    label={t("Create")}
                                >
                                    {t("Create")}
                                </Button>
                            </Row>
                        )}
                        {isUpdate && (
                            <Row className="mx-0">
                                <Button
                                    color="primary"
                                    type="submit"
                                    label={t("Create")}
                                >
                                    {t("Save")}
                                </Button>
                            </Row>
                        )}
                        {!isUpdate && formData.status && formData.requestor && [PAGE_STAGE.APPROVED, PAGE_STAGE.REJECTED].includes(formData.status) && (
                            <Button color="facebook" className="mb-2 px-3 mr-2" onClick={() => setIsUpdate(true)}>
                                {t("Edit")}
                                <i className="ml-1 fa fa-pencil" />
                            </Button>
                        )}
                        {pageState === PAGE_STAGE.APPROVE && (
                            <Row className="mx-0">
                                <Button
                                    color="danger"
                                    type="button"
                                    className="mr-3"
                                    label={t("Reject")}
                                    onClick={() => {
                                        setBankAccountStates((prevStates) => ({
                                            ...prevStates,
                                            displayRejectReasonDialog: true
                                        }));
                                    }}
                                >
                                    {t("Reject")}
                                </Button>
                                <Button
                                    color="primary"
                                    type="button"
                                    label={t("Approve")}
                                    onClick={approvedBankAccount}
                                >
                                    {t("Approve")}
                                </Button>
                            </Row>
                        )}
                    </Row>
                </StickyFooter>
                {Prompt}
                <CommonConfirmDialog
                    isShow={bankAccountStates.displayRejectReasonDialog}
                    onHide={() => setBankAccountStates((prevStates) => ({
                        ...prevStates,
                        displayRejectReasonDialog: false
                    }))}
                    title={t("Reason")}
                    positiveProps={
                        {
                            onPositiveAction: () => {
                                rejectBankAccount(bankAccountStates.reasonReject);
                            },
                            contentPositive: t("Reject"),
                            colorPositive: "danger"
                        }
                    }
                    negativeProps={
                        {
                            onNegativeAction: () => setBankAccountStates((prevStates) => ({
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
                                "is-invalid": bankAccountStates.showErrorReasonReject && !bankAccountStates.reasonReject
                            })
                        }
                        placeholder={t("Please enter reason..")}
                        value={bankAccountStates.reasonReject}
                        onChange={(e) => {
                            const { value } = e.target;
                            setBankAccountStates((prevStates) => ({
                                ...prevStates,
                                reasonReject: value
                            }));
                        }}
                    />
                    {
                        bankAccountStates.showErrorReasonReject
                        && !bankAccountStates.reasonReject
                        && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                    }
                </CommonConfirmDialog>
            </Container>
        </AvForm>
    );
}
