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
    convertDate2String, convertToLocalTime,
    getCurrentCompanyUUIDByStore, itemAttachmentSchema
} from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { Conversation, AuditTrail } from "routes/components";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import { useHistory } from "react-router";
import CreditNoteService from "services/CreditNoteService/CreditNoteService";
import EntitiesService from "services/EntitiesService";
import { v4 as uuidv4 } from "uuid";
import { HeaderMain } from "routes/components/HeaderMain";
import ConversationService from "services/ConversationService/ConversationService";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import ExtVendorService from "services/ExtVendorService";
import UOMDataService from "services/UOMService";
import TaxRecordDataService from "services/TaxRecordService";
import CurrenciesService from "services/CurrenciesService";
import GLDataService from "services/GLService";
import DocumentPrefixService from "services/DocumentPrefixService/DocumentPrefixService";
import CREDIT_NOTE_ROUTES from "../route";
import {
    onCellValueChanged,
    addItemManual,
    onDeleteItem,
    itemCreatedSupplierSchema,
    itemCreatedBuyerSchema,
    validationBuyerSchema,
    validationSupplierSchema
} from "../helper";
import {
    SupplierInformation,
    CreditNoteInformation,
    AddedItemCN,
    CNPreviewModal
} from "../components";

const CreateCN = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { isBuyer } = permissionReducer;
    const showToast = useToast();
    const requestFormRef = useRef(null);

    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

    const [cnStates, setCNStates] = useState({
        loading: true,
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
        enablePrefix: false
    });
    const previewModalRef = useRef(null);
    const [suppliers, setSuppliers] = useState([]);
    const [uoms, setUOMs] = useState([]);
    const [taxRecords, setTaxRecords] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [glAccounts, setGLAccounts] = useState([]);
    const [cnAmountTotal, setCNAmountTotal] = useState({
        subTotal: 0,
        tax: 0,
        total: 0
    });
    const [validationSchema, setValidationSchema] = useState(null);

    const initialValues = {
        creditNoteNumber: "",
        creditNoteDate: convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
        invoiceUuid: "",
        invoiceNumber: "",
        invoiceDate: "",
        remarks: "",
        referenceToInvoice: true,
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
        enablePrefix: false,
        projectTitle: "",
        defaultTax: null,
        currencyCode: ""
    };

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

    const prefixStatus = async (currentCompanyUUID) => {
        let enablePrefix = false;
        const response = await DocumentPrefixService.getAllPrefixes(currentCompanyUUID);
        if (response.data.status === "OK") {
            const { data } = response.data;
            data.supplierPortalList.forEach((item) => {
                if (item.functionName === "Credit Note" && item.type === "Manual") {
                    enablePrefix = true;
                }
            });
        } else {
            throw new Error(response.data.message);
        }
        requestFormRef?.current?.setFieldValue("enablePrefix", enablePrefix);
        setCNStates((prevStates) => ({
            ...prevStates,
            enablePrefix
        }));
    };

    const initData = async (companyUuid) => {
        try {
            prefixStatus(companyUuid);
            const responses = await Promise.allSettled([
                ExtVendorService.getExternalVendors(companyUuid),
                UOMDataService.getUOMRecords(companyUuid),
                TaxRecordDataService.getTaxRecords(companyUuid),
                CurrenciesService.getCurrencies(companyUuid),
                isBuyer
                    ? GLDataService.getGLs(companyUuid)
                    : Promise.resolve(null)
            ]);
            const [
                responseSuppliers,
                responseUOMs,
                responseTaxRecords,
                responseCurrencies,
                responseGLAccounts
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
            setTaxRecords(getDataResponse(responseTaxRecords)
                .sort((a, b) => {
                    if (a.taxCode < b.taxCode) return -1;
                    if (a.taxCode > b.taxCode) return 1;
                    return 0;
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
            setGLAccounts(getDataResponse(responseGLAccounts));
            setCNStates((prevStates) => ({
                ...prevStates,
                companyUuid,
                loading: false
            }));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onIssuePressHandler = async (values) => {
        setPristine();
        try {
            const { companyUuid, rowDataInternalAttachment, rowDataExternalAttachment } = cnStates;
            if (values.itemList.length === 0) {
                showToast("error", t("PleaseAddValidItemCreditNote"));
                return;
            }
            const currency = typeof values.itemList[0]?.currencyCode === "string"
                ? values.itemList[0].currencyCode
                : values.itemList[0].currencyCode?.currencyCode;
            const body = {
                creditNoteDate: convertToLocalTime(
                    values.creditNoteDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                creditNoteNumber: values.creditNoteNumber,
                remarks: values.remarks,
                companyUuid,
                itemList: [],
                documentList: []
            };
            if (!cnStates.enablePrefix) {
                delete body.creditNoteNumber;
            }
            const itemList = values.itemList.map(({
                uuid,
                manualItem,
                currencyCode,
                taxCode,
                uomCode,
                glAccount,
                costCode,
                departmentCode,
                netPrice,
                ...rest
            }) => ({
                taxCode: typeof taxCode === "string" ? taxCode : taxCode?.taxCode,
                uomCode: typeof uomCode === "string" ? uomCode : uomCode?.uomCode,
                glAccountNumber: glAccount?.accountNumber ?? glAccount,
                costCode: costCode?.code ?? costCode,
                departmentCode: departmentCode?.code ?? departmentCode,
                glAccountUuid: glAccount?.uuid,
                ...rest
            }));
            body.itemList = itemList;
            if (isBuyer) {
                await itemCreatedBuyerSchema.validate(body.itemList);
            } else {
                await itemCreatedSupplierSchema.validate(body.itemList);
            }

            let documentList = rowDataInternalAttachment
                .concat(rowDataExternalAttachment);

            await itemAttachmentSchema.validate(documentList);

            documentList = documentList.map(
                ({
                    fileLabel, attachment, uploadedOn, uuid, isNew, ...rest
                }) => ({
                    ...rest,
                    fileLabel: fileLabel || attachment,
                    uploadedOn: convertToLocalTime(uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                })
            );
            documentList.forEach((item) => {
                if (!item.guid) {
                    throw new Error("Please attach a file!");
                }
            });
            body.documentList = documentList;

            if (isBuyer) {
                body.invoiceUuid = values.invoiceUuid;
                body.supplierCode = values.supplierCode;
                body.supplierUuid = values.supplierUuid;
                body.currencyCode = currency;
                if (!body.invoiceUuid) delete body.invoiceUuid;
            }

            if (!isBuyer) {
                body.invoiceUuid = values.invoiceUuid;
                body.buyerCode = values.supplierCode;
                body.buyerUuid = values.supplierUuid;
                body.currencyCode = currency;
                if (!body.invoiceUuid) delete body.invoiceUuid;
            }

            const response = await CreditNoteService.createCN(
                companyUuid,
                isBuyer ? values.supplierUuid : values.buyerCompanyUuid,
                body,
                isBuyer
            );
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                try {
                    if (cnStates.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: cnStates.externalConversationLines
                        };
                        ConversationService
                            .createExternalConversation(companyUuid, conversationBody);
                    }
                    if (cnStates.internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
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

    useEffect(() => {
        if (!_.isEmpty(permissionReducer)
            && !_.isEmpty(userDetails)) {
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            if (companyUuid) {
                initData(companyUuid);
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
                uploadedOn: new Date(),
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
            uploadedOn: new Date(),
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

    const enablePreviewInvoice = (values) => {
        if (!values.supplierCode) return false;
        if (!values.itemList.length) return false;
        let enable = true;
        values.itemList.forEach((item) => {
            if (!Number(item.itemQuantity)
                || !Number(item.unitPrice)
                // || !item.taxCode
            ) {
                enable = false;
            }
        });
        return enable;
    };

    return (
        <Container fluid>
            <Formik
                innerRef={requestFormRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, setFieldValue, dirty, handleSubmit
                }) => {
                    useEffect(() => {
                        if (typeof isBuyer !== "boolean") return;
                        if (isBuyer) {
                            setValidationSchema(validationBuyerSchema);
                        } else {
                            setValidationSchema(validationSupplierSchema);
                        }
                    }, [isBuyer]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col md={12} lg={12}>
                                    <HeaderMain
                                        title={t("CreateCreditNote")}
                                        className="mb-3 mb-lg-3"
                                    />

                                    <Row>
                                        <Col md={6} lg={6}>
                                            <SupplierInformation
                                                t={t}
                                                disabled={false}
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
                                                taxRecords={taxRecords}
                                            />
                                        </Col>
                                        <Col md={6} lg={6}>
                                            <CreditNoteInformation
                                                t={t}
                                                disabled={false}
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
                                                currencies={currencies}
                                                enablePrefix={cnStates.enablePrefix}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("Add Items")}
                                className="mb-2"
                            />

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
                                                    setCNAmountTotal,
                                                    isBuyer
                                                );
                                            }
                                        }
                                        cnAmountTotal={cnAmountTotal}
                                        disabled={false}
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
                                            (comment) => sendCommentConversation(comment, false)
                                        }
                                        addNewRowAttachment={() => addNewRowAttachment(false)}
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
                                            disabled={!enablePreviewInvoice(values)}
                                        >
                                            {t("PreviewCreditNote")}
                                        </Button>
                                        <Button
                                            color="primary"
                                            type="button"
                                            disabled={cnStates.loading}
                                            onClick={
                                                () => {
                                                    handleSubmit();
                                                    if (!dirty || (dirty && Object.keys(errors).length)) {
                                                        showToast("error", "Validation error, please check your input.");
                                                        return;
                                                    }

                                                    onIssuePressHandler(values);
                                                }
                                            }
                                        >
                                            {t("Issue")}
                                        </Button>
                                    </Row>
                                </Row>
                            </StickyFooter>

                            <CNPreviewModal
                                ref={previewModalRef}
                                isBuyer={isBuyer}
                                data={values}
                                companyUuid={cnStates.companyUuid}
                                cnAmountTotal={cnAmountTotal}
                            />

                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
        </Container>
    );
};
export default CreateCN;
