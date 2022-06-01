/* eslint-disable max-len */
import React, { useState, useEffect } from "react";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import {
    Container, Row, Col, Button, Input
} from "components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Formik, Form } from "formik";
import { AuditTrail, Conversation, CommonConfirmDialog } from "routes/components";
import { v4 as uuidv4 } from "uuid";
import PurchaseRequestService from "services/PurchaseRequestService/PurchaseRequestService";
import PreRequisitionService from "services/PreRequisitionService";
import ConversationService from "services/ConversationService/ConversationService";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { useSelector } from "react-redux";
import _ from "lodash";
import CUSTOM_CONSTANTS, { FEATURE } from "helper/constantsDefined";
import {
    convertToLocalTime, formatDateString,
    formatDateTime, getCurrentCompanyUUIDByStore
} from "helper/utilities";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { useLocation } from "react-router-dom";
import { HeaderMain } from "routes/components/HeaderMain";
import classNames from "classnames";
import { PPR_AUDIT_TRAIL_ROLE, PPR_AUDIT_TRAIL_ROLE_CONVERT, PPR_STATUS } from "helper/purchasePreRequisitionConstants";
import {
    AddingOfItemsComponent, GeneralInformationComponent, InitialSettingsComponent, RequestTermsComponent
} from "routes/PreRequisitions/components";
import URL_CONFIG from "services/urlConfig";
import { usePermission } from "routes/hooks";
import PR_ROUTES from "../route";

const ConvertPrePurchaseRequisition = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const [purchaseDetailsStates, setPurchaseDetailsStates] = useState({
        loading: true,
        showReasonSendBack: false,
        reasonSendBack: "",
        showErrorReasonSendBack: false,
        pprDetails: null,
        pprUuid: "",
        companyUuid: "",
        activeInternalTab: 1,
        activeExternalTab: 1,
        typeOfRequisitions: [],
        natureOfRequisitions: [
            { label: "Project", value: true },
            { label: "Non-Project", value: false }
        ],
        procurementTypes: [
            { label: "Goods", value: "Goods" },
            { label: "Service", value: "Service" }
        ],
        rowDataInternalConversation: [],
        rowDataExternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataItemReq: [],
        rowDataAuditTrail: []
    });

    const initialValues = {
        project: false,
        projectCode: "",
        pprNumber: "",
        currencyCode: "",
        currencyName: "",
        isSupplier: false,
        supplierCode: [],
        rfqProcess: false,
        rfqTreshold: 0,
        prTitle: "",
        procurementType: "",
        approvalRoute: "",
        approvalCode: "",
        approvalSequence: "",
        nextApprover: "",
        requester: "",
        submittedDate: "",
        deliveryAddress: "",
        deliveryDate: "",
        note: "",
        saveAsDraft: false,
        isEdit: false,
        addingItemFromList: []
    };

    const permission = usePermission(FEATURE.PR);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const pprUuid = query.get("uuid");
        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            pprUuid
        }));
    }, []);

    const getPPRDetails = async (companyUuid) => {
        try {
            const { pprUuid } = purchaseDetailsStates;
            const response = await PreRequisitionService.getPPRDetails(companyUuid, pprUuid);
            if (response.data.status === RESPONSE_STATUS.OK) {
                setPurchaseDetailsStates((prevStates) => ({
                    ...prevStates,
                    loading: false,
                    companyUuid,
                    pprDetails: response?.data?.data ?? {}
                }));
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onConvertPressHandler = async () => {
        try {
            const { companyUuid, pprUuid } = purchaseDetailsStates;

            const response = await PurchaseRequestService.convertPPR2PR(companyUuid, pprUuid);
            if (response.data.status === RESPONSE_STATUS.OK) {
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(PR_ROUTES.PURCHASE_REQUISITION_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const convertAuditTrailRole = (value) => {
        switch (value) {
        case PPR_AUDIT_TRAIL_ROLE.SAVED_AS_DRAFT:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.SAVED_AS_DRAFT;
        }
        case PPR_AUDIT_TRAIL_ROLE.SUBMITTED:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.SUBMITTED;
        }
        case PPR_AUDIT_TRAIL_ROLE.RECALL:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.RECALL;
        }
        case PPR_AUDIT_TRAIL_ROLE.CANCEL:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.CANCEL;
        }
        case PPR_AUDIT_TRAIL_ROLE.SEND_BACK:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.SEND_BACK;
        }
        case PPR_AUDIT_TRAIL_ROLE.REJECT:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.REJECT;
        }
        case PPR_AUDIT_TRAIL_ROLE.APPROVED:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.APPROVED;
        }
        case PPR_AUDIT_TRAIL_ROLE.EDIT:
        {
            return PPR_AUDIT_TRAIL_ROLE_CONVERT.EDIT;
        }
        default: return value;
        }
    };

    const onSendBackPressHandler = async (reason) => {
        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            showErrorReasonSendBack: true
        }));

        if (purchaseDetailsStates.reasonSendBack) {
            setPurchaseDetailsStates((prevStates) => ({
                ...prevStates,
                showReasonSendBack: false
            }));
            try {
                const {
                    companyUuid,
                    pprUuid
                } = purchaseDetailsStates;

                const body = { text: purchaseDetailsStates.reasonSendBack };

                const response = await PurchaseRequestService.sendBackPPR(companyUuid, pprUuid, body);
                if (response.data.status === RESPONSE_STATUS.OK) {
                    try {
                        const conversationsLinesExt = [];
                        conversationsLinesExt.push({ text: reason });
                        if (conversationsLinesExt.length > 0) {
                            const conversationBody = {
                                referenceId: pprUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: conversationsLinesExt
                            };
                            ConversationService
                                .createInternalConversation(companyUuid, conversationBody);
                        }
                    } catch (error) {}
                    showToast("success", response.data.message);
                    setTimeout(() => {
                        history.push(URL_CONFIG.PPR_ROUTING.PURCHASE_PRE_REQUISITIONS_LIST);
                    }, 1000);
                } else {
                    showToast("error", response.data.message);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };
    const getDataConversation = async () => {
        const resExternalConversation = await ConversationService
            .getDetailExternalConversation(
                purchaseDetailsStates.companyUuid, purchaseDetailsStates.pprUuid
            );
        const rowDataExternalConversation = [
            ...purchaseDetailsStates.rowDataExternalConversation];
        if (resExternalConversation.data.status === "OK") {
            resExternalConversation?.data?.data?.conversations
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
        const resInternalConversation = await ConversationService
            .getDetailInternalConversation(
                purchaseDetailsStates.companyUuid, purchaseDetailsStates.pprUuid
            );
        const rowDataInternalConversation = [
            ...purchaseDetailsStates.rowDataInternalConversation];
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
        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation,
            rowDataInternalConversation
        }));
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("PreRequisitionDetails")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>

            <Formik
                initialValues={initialValues}
                validationSchema={null}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue
                }) => {
                    useEffect(() => {
                        if (
                            !_.isEmpty(userDetails)
                            && !_.isEmpty(permissionReducer)
                            && purchaseDetailsStates.pprUuid
                        ) {
                            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
                            if (companyUuid) getPPRDetails(companyUuid);
                        }
                    }, [userDetails, permissionReducer, purchaseDetailsStates.pprUuid]);

                    useEffect(() => {
                        if (purchaseDetailsStates.pprDetails) {
                            const { pprDetails } = purchaseDetailsStates;
                            const { pprItemDtoList } = pprDetails;
                            setFieldValue("project", pprDetails.project);
                            setFieldValue("isEdit", false);
                            setFieldValue("projectCode", pprDetails.projectCode);
                            setFieldValue("pprNumber", pprDetails.pprNumber);
                            setFieldValue("currencyCode", pprDetails.currencyCode);
                            setFieldValue("currencyName", pprDetails.currencyName);
                            setFieldValue("pprTitle", pprDetails.pprTitle);
                            setFieldValue("procurementType",
                                pprDetails.procurementType.toLowerCase() === "goods" ? "Goods" : "Service");
                            setFieldValue("approvalCode", pprDetails.approvalCode || "");
                            setFieldValue("approvalRoute", pprDetails.approvalCodeUuid || "");
                            setFieldValue("approvalSequence", pprDetails.approvalSequence || "");
                            setFieldValue("requester", pprDetails.requesterName || "");
                            setFieldValue("submittedDate", convertToLocalTime(pprDetails.submittedOn));
                            if (pprItemDtoList.length > 0) {
                                setFieldValue("deliveryAddress", pprItemDtoList[0]?.deliveryAddress.addressLabel);
                                setFieldValue("deliveryDate",
                                    formatDateTime(pprItemDtoList[0].requestDeliveryDate, CUSTOM_CONSTANTS.YYYYMMDD));
                            }
                            setFieldValue("note", pprDetails.note || "");
                            getDataConversation();

                            const rowDataItemReq = pprItemDtoList.map(
                                ({
                                    deliveryAddress,
                                    sourceCurrency,
                                    uomCode,
                                    requestDeliveryDate,
                                    manualEntry,
                                    itemType,
                                    itemMaterial,
                                    itemCategory,
                                    supplierName,
                                    ...res
                                }) => {
                                    const itemReq = {
                                        ...res,
                                        uuid: uuidv4(),
                                        deliveryAddress,
                                        uom: uomCode,
                                        uomCode,
                                        requestDeliveryDate: formatDateTime(requestDeliveryDate, CUSTOM_CONSTANTS.YYYYMMDD),
                                        manualItem: manualEntry,
                                        itemCategory,
                                        supplierName,
                                        supplier: supplierName
                                    };

                                    return itemReq;
                                }
                            );

                            const rowDataAuditTrail = pprDetails.auditTrailDtoList.map(
                                ({
                                    action, role, date, ...rest
                                }) => ({
                                    userRole: role,
                                    dateTime: convertToLocalTime(date),
                                    action: convertAuditTrailRole(action),
                                    ...rest
                                })
                            );

                            let rowDataInternalAttachment = pprDetails.documentDtoList.filter(
                                (attachment) => attachment.externalDocument === false
                            );

                            rowDataInternalAttachment = rowDataInternalAttachment.map(
                                ({
                                    description,
                                    fileName,
                                    uploadBy,
                                    uploadOn,
                                    ...rest
                                }) => ({
                                    ...rest,
                                    fileDescription: description,
                                    fileLabel: fileName,
                                    uploadedOn: convertToLocalTime(uploadOn),
                                    uploadedBy: uploadBy
                                })
                            );

                            let rowDataExternalAttachment = pprDetails.documentDtoList.filter(
                                (attachment) => attachment.externalDocument === true
                            );

                            rowDataExternalAttachment = rowDataExternalAttachment.map(
                                ({
                                    description,
                                    fileName,
                                    uploadBy,
                                    uploadOn,
                                    ...rest
                                }) => ({
                                    ...rest,
                                    fileDescription: description,
                                    fileLabel: fileName,
                                    uploadedOn: convertToLocalTime(uploadOn),
                                    uploadedBy: uploadBy
                                })
                            );
                            setFieldValue("addingItemFromList", rowDataItemReq);
                            setPurchaseDetailsStates((prevStates) => ({
                                ...prevStates,
                                rowDataInternalAttachment,
                                rowDataExternalAttachment,
                                rowDataAuditTrail,
                                rowDataItemReq
                            }));
                        }
                    }, [purchaseDetailsStates.pprDetails]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* Initial Settings */}
                                            <InitialSettingsComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                currencies={[]}
                                                projects={[]}
                                                pprStatus={PPR_STATUS.CONVERTED_TO_PR}
                                                handleRole={permission}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* General Information */}
                                            <GeneralInformationComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                procurementTypes={purchaseDetailsStates.procurementTypes}
                                                approvalRoutes={[]}
                                                onChangeApprovalRoute={() => {}}
                                                isConvert
                                                handleRole={permission}
                                            />
                                            {/* Request Terms */}
                                            <RequestTermsComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                addresses={[]}
                                                handleRole={permission}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("AddingOfItems")}
                                className="mb-2"
                            />
                            <Row className="mb-4">
                                <Col xs={12}>
                                    <AddingOfItemsComponent
                                        t={t}
                                        rowData={purchaseDetailsStates.rowDataItemReq}
                                        values={values}
                                        setFieldValue={setFieldValue}
                                        listAddress={[]}
                                        listCategory={[]}
                                        uomList={[]}
                                        isEdit={false}
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
                                        activeTab={purchaseDetailsStates.activeInternalTab}
                                        setActiveTab={(idx) => {
                                            setPurchaseDetailsStates((prevStates) => ({
                                                ...prevStates,
                                                activeInternalTab: idx
                                            }));
                                        }}
                                        sendConversation={() => {}}
                                        addNewRowAttachment={() => {}}
                                        rowDataConversation={purchaseDetailsStates.rowDataInternalConversation}
                                        rowDataAttachment={purchaseDetailsStates.rowDataInternalAttachment}
                                        onDeleteAttachment={() => {}}
                                        onAddAttachment={() => {}}
                                        onCellEditingStopped={() => {}}
                                        defaultExpanded
                                        disabled
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col xs={12}>
                                    {/* External Conversations */}
                                    <Conversation
                                        title={t("ExternalConversations")}
                                        activeTab={purchaseDetailsStates.activeExternalTab}
                                        setActiveTab={(idx) => {
                                            setPurchaseDetailsStates((prevStates) => ({
                                                ...prevStates,
                                                activeExternalTab: idx
                                            }));
                                        }}
                                        sendConversation={() => {}}
                                        addNewRowAttachment={() => {}}
                                        rowDataConversation={purchaseDetailsStates.rowDataExternalConversation}
                                        rowDataAttachment={purchaseDetailsStates.rowDataExternalAttachment}
                                        onDeleteAttachment={() => {}}
                                        onAddAttachment={() => {}}
                                        onCellEditingStopped={() => {}}
                                        defaultExpanded
                                        borderTopColor="#A9A2C1"
                                        disabled
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
                                    <AuditTrail
                                        rowData={purchaseDetailsStates.rowDataAuditTrail}
                                        onGridReady={(params) => {
                                            params.api.sizeColumnsToFit();
                                        }}
                                        paginationPageSize={10}
                                        gridHeight={350}
                                        defaultExpanded
                                    />
                                </Col>
                            </Row>

                            {/* Footer */}
                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-between">
                                    <Button
                                        color="secondary"
                                        onClick={() => history.goBack()}
                                    >
                                        {t("Back")}
                                    </Button>
                                    <Row className="mx-0">
                                        {permission?.read && permission?.write && (
                                            <>
                                                <Button
                                                    color="warning"
                                                    type="submit"
                                                    onClick={() => setPurchaseDetailsStates((prevStates) => ({
                                                        ...prevStates,
                                                        showReasonSendBack: true
                                                    }))}
                                                    className="mr-2"
                                                >
                                                    {t("SendBack")}
                                                </Button>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    onClick={() => onConvertPressHandler()}
                                                >
                                                    {t("ConvertToRequest")}
                                                </Button>
                                            </>
                                        )}
                                    </Row>
                                </Row>
                            </StickyFooter>
                            <CommonConfirmDialog
                                isShow={purchaseDetailsStates.showReasonSendBack}
                                onHide={() => setPurchaseDetailsStates((prevStates) => ({
                                    ...prevStates,
                                    showReasonSendBack: false
                                }))}
                                title={t("Reason")}
                                positiveProps={
                                    {
                                        onPositiveAction: () => onSendBackPressHandler(purchaseDetailsStates.reasonSendBack),
                                        contentPositive: t("SendBack"),
                                        colorPositive: "warning"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => setPurchaseDetailsStates((prevStates) => ({
                                            ...prevStates,
                                            showReasonSendBack: false
                                        })),
                                        contentNegative: t("Back"),
                                        colorNegative: "primary"
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
                                            "is-invalid": purchaseDetailsStates.showErrorReasonSendBack && !purchaseDetailsStates.reasonSendBack
                                        })
                                    }
                                    placeholder={t("EnterReason")}
                                    value={purchaseDetailsStates.reasonSendBack}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setPurchaseDetailsStates((prevStates) => ({
                                            ...prevStates,
                                            reasonSendBack: value
                                        }));
                                    }}
                                />
                                {
                                    purchaseDetailsStates.showErrorReasonSendBack && !purchaseDetailsStates.reasonSendBack
                                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                                }
                            </CommonConfirmDialog>
                        </Form>
                    );
                }}
            </Formik>
        </Container>
    );
};

export default ConvertPrePurchaseRequisition;
