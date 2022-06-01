import {
    Button, Col, Container, Row, Input
} from "components";
import { Formik, Form } from "formik";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS } from "helper/constantsDefined";
import { convertToLocalTime, convertDate2String, getCurrentCompanyUUIDByStore } from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { Conversation, Overview, CommonConfirmDialog } from "routes/components";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import { useHistory, useLocation } from "react-router";
import ExtVendorService from "services/ExtVendorService";
import { HeaderMain } from "routes/components/HeaderMain";
import ConversationService from "services/ConversationService/ConversationService";
import CurrenciesService from "services/CurrenciesService";
import PaymentBatchService from "services/PaymentBatchService/PaymentBatchService";
import classNames from "classnames";
import { PAYMENT_FE_STATUS } from "routes/P2P/Payment/helper";
import {
    GeneralInformation,
    TransferStatus,
    PaymentDetails,
    Payments
} from "../components";
import { PAYMENT_BATCH_CONSTANTS } from "../helper";
import PAYMENT_BATCH_ROUTES from "../route";


const PaymentBatchCreate = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const showToast = useToast();

    const [currencies, setCurrencies] = useState([]);
    const [companyUuid, setCompanyUuid] = useState("");
    const [paymentBatchDetails, setPaymentBatchDetails] = useState(null);
    const [listPaymentDetails, setListPaymentDetails] = useState([]);
    const [rowDataPayments, setRowDataPayments] = useState([]);
    const [totalPaymentAmount, setTotalPaymentAmount] = useState(0);
    const [listBankAccount, setListBankAccount] = useState([]);
    const [rowDataInternalConversation, setRowDataInternalConversation] = useState([]);
    const [rowDataInternalAttachment, setRowDataInternalAttachment] = useState([]);
    const [activeInternalTab, setActiveInternalTab] = useState(1);
    const [rowDataAuditTrails, setRowDataAuditTrails] = useState([]);

    const [reason, setReason] = useState("");
    const [showReason, setShowReason] = useState(false);
    const [showErrorReason, setShowErrorReason] = useState(false);
    const [actionConfirmDialog, setActionConfirmDialog] = useState("");
    const [overviewState, setOverviewState] = useState({
        rowDataOverview: [],
        activeAuditTrailTab: 1
    });

    const initialValues = {
        paymentBatchNo: "",
        referenceNumber: "",
        currency: "",
        createdBy: "",
        paymentStatus: "",
        transferStatus: "",
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
        chequeNumber: "",
        releaseDateTransfer: "",
        executionDate: "",
        productType: "",
        emailsNotification: [],
        emailsNotificationText: "",
        chargeBearer: "",
        bankReply: "",
        bankTransactionAcknowledgements: []
    };

    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        cellRendererParams: { suppressCount: true },
        valueFormatter: (params) => params.data.type
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

    const getDataConversation = (responseData) => {
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
                                item.date,
                                CUSTOM_CONSTANTS.DDMMYYYHHmmss
                            ),
                            comment: item.text,
                            externalConversation: false
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

    const initData = async (currentCompanyUuid, paymentUuid) => {
        try {
            const responses = await Promise.allSettled([
                CurrenciesService.getCurrencies(currentCompanyUuid),
                PaymentBatchService.getDetailsPaymentBatch(currentCompanyUuid, paymentUuid),
                ConversationService.getDetailInternalConversation(currentCompanyUuid, paymentUuid)
            ]);
            const [
                responseCurrencies,
                responseDetailsPaymentBatch,
                responseInternalConversations
            ] = responses;

            setCurrencies(getDataResponse(responseCurrencies).filter(
                (currency) => currency.active === true
            ).sort(
                (a, b) => {
                    if (a.currencyName < b.currencyName) return -1;
                    if (a.currencyName > b.currencyName) return 1;
                    return 0;
                }
            ));
            // setListBankAccount(getDataResponse(responseBankAccounts).filter(
            //     (item) => item.status === "APPROVED"
            // ));
            const overview = [];
            try {
                const resOverview = await PaymentBatchService
                    .getPaymentBatchOverview(currentCompanyUuid, paymentUuid);
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
            setOverviewState((prevStates) => ({
                ...prevStates,
                rowDataOverview: overview
            }));
            setRowDataInternalConversation(getDataConversation(responseInternalConversations));
            setPaymentBatchDetails(getDataResponse(responseDetailsPaymentBatch, "object"));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        if (!_.isEmpty(permissionReducer)
            && !_.isEmpty(userDetails)) {
            const query = new URLSearchParams(location.search);
            const paymentUuid = query.get("uuid");
            const currentCompanyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            if (currentCompanyUuid) {
                setCompanyUuid(currentCompanyUuid);
                initData(currentCompanyUuid, paymentUuid);
            }
        }
    }, [permissionReducer, userDetails]);

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
        const listPayment = Promise.all(listPaymentDetails.map(async (item) => {
            const {
                paymentUuid, receiveBankAccount, details
            } = item;
            const {
                beneficiary, paymentNumber, currencyCode, invoices, paymentAmount
            } = details;
            const bankAccounts = await getListBankAccountBySupplierUuid(
                beneficiary.supplierUuid
            );
            const bankAccount = bankAccounts.find(
                (element) => element.uuid === receiveBankAccount.uuid
            );
            const totalRow = {
                paymentUuid,
                vendorName: beneficiary?.companyName,
                vendorCode: beneficiary?.supplierCode,
                currency: currencyCode,
                totalAmount: 0,
                bankAccount,
                bankAccounts,
                children: []
            };
            totalRow.totalAmount = paymentAmount;
            totalRow.children = invoices.map((element) => ({
                ...element,
                paymentNo: paymentNumber,
                paymentUuid,
                bankName: bankAccount?.bankName,
                bankAccountNo: bankAccount?.bankAccountNo,
                accountHolderName: bankAccount?.accountHolderName,
                branch: bankAccount?.branch,
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

    const onRejectPressHandler = async () => {
        setShowReason(false);
        setShowErrorReason(true);
        if (!reason) return;
        try {
            const query = new URLSearchParams(location.search);
            const paymentUuid = query.get("uuid");
            const response = await PaymentBatchService.rejectPaymentBatch(companyUuid, paymentUuid);
            if (response.data.status === RESPONSE_STATUS.OK) {
                try {
                    const conversationLines = [];
                    conversationLines.push({ text: reason });
                    if (conversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: paymentUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: conversationLines
                        };
                        ConversationService
                            .createInternalConversation(
                                companyUuid, conversationBody
                            );
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

    const mergeSupplierPayments = (listPayment) => {
        const paymentsMap = new Map();
        listPayment.forEach((payment) => {
            let paymentRow = paymentsMap.get(payment.vendorCode);
            if (!paymentRow) {
                paymentRow = payment;
            } else {
                paymentRow.totalAmount += payment.totalAmount;
                paymentRow.children = paymentRow.children.concat(payment.children);
            }
            paymentsMap.set(payment.vendorCode, paymentRow);
        });
        return [...paymentsMap.values()];
    };

    return (
        <Container fluid>
            <Formik
                initialValues={initialValues}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, setFieldValue, handleChange
                }) => {
                    useEffect(() => {
                        if (paymentBatchDetails) {
                            setFieldValue("paymentBatchNo", paymentBatchDetails.number || "");
                            setFieldValue("chequeNumber", paymentBatchDetails.chequeNumber || "");
                            setFieldValue("referenceNumber", paymentBatchDetails.referenceNumber || "");
                            setFieldValue("currency", paymentBatchDetails.currency || "");
                            setFieldValue("createdBy", paymentBatchDetails.createdBy || "");
                            setFieldValue("paymentStatus", paymentBatchDetails.status || "");
                            setFieldValue("transferStatus", paymentBatchDetails.transferStatus || "");
                            // setFieldValue("bankReply", paymentBatchDetails.bankReply || "");
                            setFieldValue("paymentReleaseDate", convertToLocalTime(paymentBatchDetails.releaseDate || "", CUSTOM_CONSTANTS.YYYYMMDD));
                            setFieldValue("executionDate", convertToLocalTime(paymentBatchDetails.executedDate || "", CUSTOM_CONSTANTS.YYYYMMDD));
                            setFieldValue("paymentMethod", paymentBatchDetails.paymentMethod || "");
                            setFieldValue("remarks", paymentBatchDetails.remarks || "");
                            setFieldValue("productType", paymentBatchDetails?.bankProductType || "");
                            setFieldValue("chargeBearer", paymentBatchDetails?.chargeBearer || "");
                            const emailNotificationList = paymentBatchDetails?.emailNotificationList || [];
                            setFieldValue("emailsNotification", emailNotificationList);
                            setFieldValue("emailsNotificationText", emailNotificationList?.join(", "));
                            setFieldValue("bankTransactionAcknowledgements", paymentBatchDetails?.bankTransactionAcknowledgements || []);
                            const bankTrans = paymentBatchDetails?.bankTransactionAcknowledgements || [];
                            const bankReply = bankTrans.map((item) => JSON.stringify(item))?.join(", ");
                            setFieldValue("bankReply", bankReply);
                            const {
                                sourceBankAccount,
                                paymentBatchItemsDetails,
                                documents,
                                auditTrails,
                                totalAmount
                            } = paymentBatchDetails;
                            if (sourceBankAccount) {
                                setFieldValue("sourceBankAccount", sourceBankAccount.uuid || "");
                                setFieldValue("bankName", sourceBankAccount.bankName || "");
                                setFieldValue("bankAccountNo", sourceBankAccount.bankAccountNo || "");
                                setFieldValue("accountHolder", sourceBankAccount.accountHolder || "");
                                setFieldValue("branch", sourceBankAccount.branch || "");
                                setFieldValue("swiftCode", sourceBankAccount.swiftCode || "");
                                setFieldValue("bankLabel", sourceBankAccount.bankLabel || "");
                            }

                            const internalAttachments = documents?.map(
                                ({ uploadedByName, uploadedOn, ...rest }) => ({
                                    ...rest,
                                    uploadedBy: uploadedByName,
                                    uploadedOn: convertToLocalTime(
                                        uploadedOn,
                                        CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    ),
                                    isHaveFileName: true
                                })
                            ) ?? [];

                            const auditTrailList = auditTrails?.map(
                                ({ dateTime, action, ...rest }) => ({
                                    ...rest,
                                    dateTime: convertToLocalTime(
                                        dateTime, CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                    ),
                                    action: action === "CREATED" ? "Created Payment Batch" : action
                                })
                            ) ?? [];

                            setTotalPaymentAmount(totalAmount || 0);
                            setRowDataAuditTrails(auditTrailList);
                            setRowDataInternalAttachment(internalAttachments);
                            setListPaymentDetails(paymentBatchItemsDetails ?? []);
                        }
                    }, [paymentBatchDetails]);

                    useEffect(() => {
                        if (listPaymentDetails.length > 0) {
                            getRowDataPayments().then((listPayment) => {
                                setRowDataPayments(mergeSupplierPayments(listPayment));
                            });
                        }
                    }, [listPaymentDetails]);

                    return (
                        <Form>
                            <HeaderMain
                                title={t("PaymentBatchDetails")}
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
                                        disabled
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
                                        disabled
                                        values={values}
                                        touched={touched}
                                        errors={errors}
                                        bankAccounts={listBankAccount}
                                        emails={[]}
                                        paymentMethods={[]}
                                        handleChange={handleChange}
                                        setFieldValue={setFieldValue}
                                        companyUuid={companyUuid}
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
                                        onCellValueChanged={() => { }}
                                        disabled
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
                                        sendConversation={() => { }}
                                        addNewRowAttachment={() => { }}
                                        rowDataConversation={rowDataInternalConversation}
                                        rowDataAttachment={rowDataInternalAttachment}
                                        onDeleteAttachment={() => { }}
                                        onAddAttachment={() => { }}
                                        onCellEditingStopped={() => { }}
                                        defaultExpanded
                                        disabled
                                    />
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("AuditTrail")}
                                className="mb-2"
                            />
                            {/* <Row className="mb-5">
                                <Col xs={12}>
                                    <AuditTrail
                                        rowData={rowDataAuditTrails}
                                        onGridReady={(params) => {
                                            params.api.sizeColumnsToFit();
                                        }}
                                        paginationPageSize={10}
                                        gridHeight={350}
                                        defaultExpanded
                                    />
                                </Col>
                            </Row> */}
                            <Row className="mb-5">
                                <Col xs={12}>
                                    <Overview
                                        rowData={overviewState.rowDataOverview}
                                        rowDataAuditTrail={rowDataAuditTrails}
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
                                        activeTab={overviewState.activeAuditTrailTab}
                                        setActiveTab={(idx) => {
                                            setOverviewState((prevStates) => ({
                                                ...prevStates,
                                                activeAuditTrailTab: idx
                                            }));
                                        }}
                                        companyUuid={companyUuid}
                                        isBuyer
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
                                        {values.transferStatus === PAYMENT_FE_STATUS.TIMEOUT && (
                                            <Button
                                                color="danger"
                                                type="button"
                                                className="mr-2"
                                                onClick={() => {
                                                    setShowReason(true);
                                                    setActionConfirmDialog("Reject");
                                                }}
                                            >
                                                {t("Reject")}
                                            </Button>
                                        )}
                                    </Row>
                                </Row>
                            </StickyFooter>
                            <CommonConfirmDialog
                                footerBetween={false}
                                isShow={showReason}
                                onHide={() => setShowReason(false)}
                                title={t("Reason")}
                                positiveProps={
                                    {
                                        onPositiveAction: () => {
                                            if (actionConfirmDialog === "Reject") {
                                                return onRejectPressHandler();
                                            }
                                            return null;
                                        },
                                        contentPositive: t(`${actionConfirmDialog}`),
                                        colorPositive: ["SendBack", "Recall"].includes(actionConfirmDialog) ? "warning" : "danger"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => { setShowReason(false); setReason(""); },
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
                        </Form>
                    );
                }}
            </Formik>
        </Container>
    );
};

export default PaymentBatchCreate;
