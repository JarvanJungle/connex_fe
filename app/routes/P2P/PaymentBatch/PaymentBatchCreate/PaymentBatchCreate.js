import {
    Button, Col, Container, Row
} from "components";
import { Formik, Form } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS } from "helper/constantsDefined";
import { convertToLocalTime, getCurrentCompanyUUIDByStore } from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { Conversation, AuditTrail } from "routes/components";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import { useHistory, useLocation } from "react-router";
import EntitiesService from "services/EntitiesService";
import ExtVendorService from "services/ExtVendorService";
import { v4 as uuidv4 } from "uuid";
import { HeaderMain } from "routes/components/HeaderMain";
import ConversationService from "services/ConversationService/ConversationService";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import CurrenciesService from "services/CurrenciesService";
import PaymentBatchService from "services/PaymentBatchService/PaymentBatchService";
import BankAccountService from "services/BankAccountService/BankAccountService";
import FeaturesMatrixService from "services/FeaturesMatrixService/FeaturesMatrixService";
import UserService from "services/UserService";
import PAYMENT_BATCH_ROUTES from "../route";
import Countries from "/public/assets/Countries.jsx";

import {
    GeneralInformation,
    TransferStatus,
    PaymentDetails,
    Payments
} from "../components";
import {
    PAYMENT_BATCH_CONSTANTS,
    PAYMENT_METHODS,
    paymentBatchValidationSchema,
    paymentItemsSchema
} from "../helper";
import { PAYMENT_FE_STATUS } from "routes/P2P/Payment/helper";

const PaymentBatchCreate = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const showToast = useToast();

    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

    const [currencies, setCurrencies] = useState([]);
    const [companyUuid, setCompanyUuid] = useState("");
    const [listPaymentDetails, setListPaymentDetails] = useState([]);
    const [rowDataPayments, setRowDataPayments] = useState([]);
    const [payments, setPayments] = useState([]);
    const [emailList, setEmailList] = useState([]);
    const [totalPaymentAmount, setTotalPaymentAmount] = useState(0);
    const [listBankAccount, setListBankAccount] = useState([]);
    const [rowDataInternalConversation, setRowDataInternalConversation] = useState([]);
    const [rowDataInternalAttachment, setRowDataInternalAttachment] = useState([]);
    const [internalConversationLines, setInternalConversationLines] = useState([]);
    const [activeInternalTab, setActiveInternalTab] = useState(1);
    const [companyAuthorities, setCompanyAuthorities] = useState([]);
    const chargeBearers = [
        { label: "BorneByCreditor", value: "CRED" },
        { label: "BorneByDebtor", value: "DEBT" },
        { label: "Shared", value: "SHAR" }
    ];

    const hasH2HPaymentFeature = useMemo(() => companyAuthorities?.some((e) => e?.featureCode === "HPAYM"), [companyAuthorities]);
    const hasManualPaymentFeature = useMemo(() => companyAuthorities?.some((e) => e?.featureCode === "MPAYM"), [companyAuthorities]);

    const paymentMethods = useMemo(
        () => [
            ...(hasManualPaymentFeature ? PAYMENT_METHODS.MANUAL : []),
            ...(hasH2HPaymentFeature ? PAYMENT_METHODS.H2H : [])
        ],
        [hasH2HPaymentFeature, hasManualPaymentFeature]
    );

    const initialValues = {
        paymentBatchNo: "",
        referenceNumber: "",
        currency: "",
        createdBy: "",
        paymentStatus: "",
        transferStatus: "",
        bankReply: "",
        paymentReleaseDate: "",
        paymentMethod: PAYMENT_BATCH_CONSTANTS.CASH,
        remarks: "",
        payments: [],
        sourceBankAccount: "",
        bankName: "",
        bankAccountNo: "",
        accountHolder: "",
        branch: "",
        swiftCode: "",
        country: "",
        bankLabel: "",
        chequeNumber: "",
        releaseDateTransfer: "",
        executionDate: "",
        productType: "",
        emailsNotification: [],
        chargeBearer: ""
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

    const initData = async (currentCompanyUuid) => {
        try {
            const responses = await Promise.allSettled([
                CurrenciesService.getCurrencies(currentCompanyUuid),
                BankAccountService.getAllBankAccount(currentCompanyUuid),
                FeaturesMatrixService.getCompanyAuthorities(UserService.getCurrentCompanyUuid())
            ]);
            const [
                responseCurrencies,
                responseBankAccounts,
                responseAuthorities
            ] = responses;

            const companyUsersRes = await UserService.getCompanyUsers(currentCompanyUuid);
            if (companyUsersRes.data.status === RESPONSE_STATUS.OK) {
                let companyUserList = companyUsersRes.data.data;
                companyUserList = companyUserList.map((user) => ({
                    label: user.email,
                    value: user.uuid
                }));
                setEmailList(companyUserList);
            } else {
                throw new Error(companyUsersRes.data.message);
            }
            setCurrencies(getDataResponse(responseCurrencies).filter(
                (currency) => currency.active === true
            ).sort(
                (a, b) => {
                    if (a.currencyName < b.currencyName) return -1;
                    if (a.currencyName > b.currencyName) return 1;
                    return 0;
                }
            ));
            setCompanyAuthorities(getDataResponse(responseAuthorities));
            setListBankAccount(getDataResponse(responseBankAccounts).filter(
                (item) => item.status === "APPROVED"
            ));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onMarkAsPaidPressHandler = async (values) => {
        setPristine();
        try {
            const body = {
                referenceNumber: values.referenceNumber,
                currency: values.currency,
                paymentMethod: values.paymentMethod,
                releaseDate: convertToLocalTime(
                    values.paymentReleaseDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                executionDate: convertToLocalTime(
                    values.executionDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                ),
                productType: values.productType,
                emailsNotification: values.emailsNotification,
                chargeBearer: values.chargeBearer,
                remarks: values.remarks,

                payments: [],
                documents: []
            };
            if (body.paymentMethod === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION) {
                if (body.productType !== "TT") {
                    delete body.chargeBearer;
                }
                delete body.releaseDate;
                if (body.emailsNotification.length === 0) {
                    throw new Error("Please enter at least one valid Notification Email!");
                }
            } else {
                delete body.executionDate;
                delete body.chargeBearer;
                delete body.emailsNotification;
                delete body.productType;
            }

            body.payments = payments.reduce((flat, item) => (
                flat.concat(item.children ? item.children.map(childPayment => ({
                    key: childPayment.paymentUuid,
                    paymentUuid: childPayment.paymentUuid,
                    receiveBankAccount: {
                        uuid: item?.bankAccount?.uuid,
                        bankName: item?.bankAccount?.bankName,
                        bankAccountNo: item?.bankAccount?.bankAccountNo,
                        accountHolder: item?.bankAccount?.accountHolderName,
                        branch: item?.bankAccount?.branch,
                        swiftCode: item?.bankAccount?.swiftCode,
                        bankLabel: item?.bankAccount?.bankLabel,
                        countryCode: Countries.countries.find((country) => country.name === item?.bankAccount?.country)?.code
                    }
                })) : [])
            ), []);
            body.payments = [...new Map(body.payments.map(item => [item['key'], item])).values()];

            if (body.paymentMethod === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION
                || body.paymentMethod === PAYMENT_BATCH_CONSTANTS.MANUAL) {
                await paymentItemsSchema.validate(body.payments);
            }

            let documentList = rowDataInternalAttachment;
            documentList = documentList.map(
                ({
                    externalDocument, uploadedBy, uploaderUuid, uploadedOn, uuid, isNew, ...rest
                }) => ({
                    ...rest
                })
            );
            documentList.forEach((item) => {
                if (!item.guid) {
                    throw new Error("Please attach a file!");
                }
            });

            body.documents = documentList;

            if (values.paymentMethod === PAYMENT_BATCH_CONSTANTS.CHEQUE) {
                body.chequeNumber = values.chequeNumber;
            }

            if (values.paymentMethod === PAYMENT_BATCH_CONSTANTS.MANUAL
                || values.paymentMethod === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION
            ) {
                body.sourceBankAccount = {
                    uuid: values.sourceBankAccount,
                    bankName: values.bankName,
                    bankAccountNo: values.bankAccountNo,
                    accountHolder: values.accountHolder,
                    branch: values.branch,
                    swiftCode: values.swiftCode,
                    bankLabel: values.bankLabel,
                    countryCode: Countries.countries.find((country) => country.name === values.country)?.code
                };
            }
            const response = await PaymentBatchService.createPaymentBatch(companyUuid, body);
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                try {
                    if (internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: data,
                            supplierUuid: userDetails.uuid,
                            conversations: internalConversationLines
                        };
                        ConversationService
                            .createInternalConversation(companyUuid, conversationBody);
                    }
                } catch (error) {}
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(PAYMENT_BATCH_ROUTES.PAYMENT_BATCH_LIST);
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
            const { state } = location;
            const currentCompanyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            if (currentCompanyUuid) {
                setCompanyUuid(currentCompanyUuid);
                setListPaymentDetails(state);
                initData(currentCompanyUuid);
            }
        }
    }, [permissionReducer, userDetails]);

    const sendCommentConversation = async (comment, isInternal) => {
        setDirty();
        if (isInternal) {
            const newInternalConversationLines = [...internalConversationLines];
            const newRowData = [...rowDataInternalConversation];
            newRowData.push({
                userName: userDetails.name,
                userRole: userDetails.designation,
                userUuid: userDetails.uuid,
                dateTime: new Date(),
                comment,
                externalConversation: false
            });
            newInternalConversationLines.push({
                text: comment
            });
            setInternalConversationLines(newInternalConversationLines);
            setRowDataInternalConversation(newRowData);
        }
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
            setRowDataInternalAttachment(newRowData);
        }
    };

    const onCellEditingStopped = (params, isInternal) => {
        setDirty();
        const { data } = params;
        if (isInternal) {
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setRowDataInternalAttachment(newRowData);
        }
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
                setRowDataInternalAttachment(newRowData);
            }
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
            setRowDataInternalAttachment(newRowData);
        }
    };

    const getListBankAccountBySupplierUuid = async (supplierUuid) => {
        let bankAccounts = [];
        try {
            const response = await ExtVendorService.getExternalVendorDetails(
                companyUuid, supplierUuid
            );
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { supplierBankAccountList } = response && response.data && response.data.data;
                bankAccounts = supplierBankAccountList;
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
        return bankAccounts || [];
    };

    const getRowDataPayments = () => new Promise((resolve) => {
        const listSupplierCode = [...(new Set(listPaymentDetails.map((e) => e?.beneficiary?.supplierCode)))];

        const listPayment = Promise.all(listSupplierCode.map(async (supplierCode) => {
            const {
                beneficiary, uuid, currencyCode
            } = listPaymentDetails.find((e) => e?.beneficiary?.supplierCode === supplierCode);
            const invoices = listPaymentDetails
                .filter((e) => e?.beneficiary?.supplierCode === supplierCode)
                .map((e) => e?.invoices?.map((invoice) => ({
                    ...invoice,
                    paymentNo: e?.paymentNumber,
                    paymentUuid: e?.uuid
                })) ?? [])
                .flat();
            console.debug(invoices);

            const bankAccounts = await getListBankAccountBySupplierUuid(
                beneficiary.supplierUuid
            );
            const bankAccountDefaults = bankAccounts.filter(
                (element) => element.defaultAccount
            );
            const bankAccountDefault = bankAccountDefaults.length > 0 ? bankAccountDefaults[0] : "";
            const totalRow = {
                paymentUuid: uuid,
                vendorName: beneficiary?.companyName,
                vendorCode: beneficiary?.supplierCode,
                currency: currencyCode,
                totalAmount: invoices.reduce((sum, element) => sum + element.amountToPay, 0),
                bankAccount: bankAccountDefault,
                bankAccounts,
                children: []
            };
            totalRow.children = invoices.map((element) => ({
                ...element,
                bankName: bankAccountDefault?.bankName ?? "",
                bankAccountNo: bankAccountDefault?.bankAccountNo ?? "",
                accountHolderName: bankAccountDefault?.accountHolderName ?? "",
                branch: bankAccountDefault?.branch ?? "",
                currency: element.currencyCode,
                vendorName: element.supplierDto.companyName,
                totalAmount: element.totalAmount,
                processingPaymentAmt: element.processPaymentAmt,
                outstandingAmount: element.pendingPaymentAmount
            }));
            return totalRow;
        }));
        resolve(listPayment);
    });

    const onCellValueChanged = (params, rowData) => {
        setDirty();
        const { data, newValue } = params;
        const newRowData = rowData.map((item) => {
            if (item.paymentUuid === data.paymentUuid) {
                const { children } = item;
                const newChildren = children.map((element) => ({
                    ...element,
                    bankName: newValue.bankName,
                    bankAccountNo: newValue.bankAccountNo,
                    accountHolderName: newValue.accountHolderName,
                    branch: newValue.branch
                }));
                return {
                    ...item,
                    bankAccount: newValue,
                    children: newChildren
                };
            }
            return item;
        });
        setPayments(newRowData);
        params.api.applyTransaction({ update: newRowData });
    };

    return (
        <Container fluid>
            <Formik
                initialValues={initialValues}
                validationSchema={paymentBatchValidationSchema}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, setFieldValue, dirty, handleChange, handleSubmit
                }) => {
                    useEffect(() => {
                        if (listPaymentDetails?.length > 0) {
                            const { currencyCode, createdByName } = listPaymentDetails[0];
                            setFieldValue("currency", currencyCode || "");
                            setFieldValue("paymentStatus", PAYMENT_BATCH_CONSTANTS.UNPAID);
                            setFieldValue("createdBy", createdByName || "");
                            getRowDataPayments().then((listPayment) => {
                                setRowDataPayments(listPayment);
                                setPayments(listPayment);
                                const totalAmount = listPayment.reduce(
                                    ((sum, item) => sum + item.children.reduce(
                                        (total, element) => total + element.amountToPay, 0
                                    )),
                                    0
                                );
                                setTotalPaymentAmount(totalAmount);
                            });
                        }
                    }, [listPaymentDetails]);

                    useEffect(() => {
                        if (values.referenceNumber
                            || values.sourceBankAccount
                            || values.releaseDate
                            || values.remarks
                            || values.executionDate
                        ) {
                            setDirty();
                        }
                    }, [values]);

                    return (
                        <Form>
                            <HeaderMain
                                title={t("CreatePaymentBatch")}
                                className="mb-3 mb-lg-3"
                            />

                            <Row className="mb-4">
                                <Col xs={6}>
                                    <GeneralInformation
                                        t={t}
                                        values={values}
                                        touched={touched}
                                        errors={errors}
                                        currencies={currencies}
                                        disabled={false}
                                    />
                                    {
                                        (values.paymentMethod
                                            === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION)
                                        && (
                                            <TransferStatus
                                                t={t}
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                            />
                                        )
                                    }
                                </Col>
                                <Col xs={6}>
                                    <PaymentDetails
                                        t={t}
                                        disabled={false}
                                        values={values}
                                        touched={touched}
                                        errors={errors}
                                        bankAccounts={listBankAccount}
                                        emails={emailList}
                                        paymentMethods={paymentMethods}
                                        handleChange={handleChange}
                                        setFieldValue={setFieldValue}
                                        companyUuid={companyUuid}
                                        chargeBearers={chargeBearers}
                                    />
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("Payments")}
                                className="mb-2"
                            />

                            <Row className="mb-4">
                                <Col xs={12}>
                                    <Payments
                                        borderTopColor="#fff"
                                        defaultExpanded
                                        gridHeight={450}
                                        rowDataItem={rowDataPayments}
                                        totalPaymentAmount={totalPaymentAmount}
                                        onCellValueChanged={(params) => onCellValueChanged(
                                            params, payments
                                        )}
                                        values={values}
                                    />
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("Conversations")}
                                className="mb-2"
                            />

                            <Row className="mb-4">
                                <Col xs={12}>
                                    <Conversation
                                        title={t("InternalConversations")}
                                        activeTab={activeInternalTab}
                                        setActiveTab={(idx) => setActiveInternalTab(idx)}
                                        sendConversation={
                                            (comment) => sendCommentConversation(
                                                comment, true
                                            )
                                        }
                                        addNewRowAttachment={() => addNewRowAttachment(
                                            true
                                        )}
                                        rowDataConversation={
                                            rowDataInternalConversation
                                        }
                                        rowDataAttachment={
                                            rowDataInternalAttachment
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

                            <HeaderSecondary
                                title={t("AuditTrail")}
                                className="mb-2"
                            />
                            <Row className="mb-5">
                                <Col xs={12}>
                                    <AuditTrail
                                        rowData={[]}
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

                                                    onMarkAsPaidPressHandler(values);
                                                }
                                            }
                                        >
                                            {values.paymentMethod === PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION ? t("Submit") : t("MarkAsPaid")}
                                        </Button>
                                    </Row>
                                </Row>
                            </StickyFooter>
                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
        </Container>
    );
};

export default PaymentBatchCreate;
