/* eslint-disable max-len */
import React, { useState, useEffect, useMemo } from "react";
import useToast from "routes/hooks/useToast";
import {
    usePermission, useCustomState, useAuditTrail,
    useAttachment, useConversation
} from "routes/hooks";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
    Container, Row, Col, Button
} from "components";
import { Formik, Form } from "formik";
import { Conversation, Overview } from "routes/components";
import { HeaderMain } from "routes/components/HeaderMain";
import StickyFooter from "components/StickyFooter";
import PurchaseRequestService from "services/PurchaseRequestService/PurchaseRequestService";
import PreRequisitionService from "services/PreRequisitionService";
import PurchaseOrderService from "services/PurchaseOrderService/PurchaseOrderService";
import ConversationService from "services/ConversationService/ConversationService";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import _ from "lodash";
import CUSTOM_CONSTANTS, { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import {
    formatDateTime, convertToLocalTime,
    getCurrentCompanyUUIDByStore, roundNumberWithUpAndDown
} from "helper/utilities";
import PURCHASE_ORDER_ROUTES from "../route";
import {
    GeneralInformation,
    InitialSetting,
    RequestTerms,
    ConvertToPOTable,
    SupplierInfor
} from "./components";
import { BreakdownOfItemsRequested, Requisition } from "../components";

const ConvertToPO = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const permission = usePermission(FEATURE.PO);
    const [convertFrom, setConvertFrom] = useState("");
    const [companyUuid, setCompanyUuid] = useState("");
    const [purchaseUuid, setPurchaseUuid] = useState("");
    const [purchaseDetails, setPurchaseDetails] = useCustomState({});
    const [rowDataOverview, setRowDataOverview] = useState([]);
    const [rowDataItems, setRowDataItems] = useState([]);
    const [internalAttachments, externalAttachments, attachmentActions] = useAttachment({
        defaultValue: []
    });
    const [internalConversations, externalConversations, conversationActions] = useConversation();
    const [auditTrails, setAuditTrails] = useAuditTrail([]);
    const [totalInDocumentCurrency, setTotalInDocumentCurrency] = useState({});
    const [purchaseDetailsStates, setPurchaseDetailsStates] = useState({
        loading: true,
        activeInternalTab: 1,
        activeExternalTab: 1,
        activeAuditTrailTab: 1
    });
    const poCreator = useMemo(() => permission?.read && permission?.write, [permission]);

    const initialValues = {
        project: false,
        projectCode: "",
        prNumber: "",
        status: "",
        currencyCode: "",
        currency: "",
        supplierCode: [],
        title: "",
        procurementType: "",
        approvalRouteUuid: "",
        approvalSequence: "",
        nextApprover: "",
        requester: "",
        submittedDate: "",
        deliveryAddress: "",
        deliveryDate: "",
        note: "",
        typeOfRequisition: "Purchase",
        natureOfRequisition: "Non-Project"
    };
    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        cellRendererParams: { suppressCount: true },
        valueFormatter: (params) => params.data.type
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const uuid = query.get("uuid");
        setPurchaseUuid(uuid);
        setConvertFrom(
            location.pathname.includes(PURCHASE_ORDER_ROUTES.CONVERT_PPR_TO_PO)
                ? FEATURE.PPR
                : FEATURE.PR
        );
    }, []);

    const initData = async (currentCompanyUuid) => {
        try {
            const responses = await Promise.allSettled([
                convertFrom === FEATURE.PR && PurchaseRequestService.getDetailsPurchaseRequisition(
                    currentCompanyUuid, purchaseUuid
                ),
                convertFrom === FEATURE.PPR && PreRequisitionService.getPPRDetails(currentCompanyUuid, purchaseUuid)
            ]);
            const [responsePRDetails, responsePPRDetails] = responses;

            setPurchaseDetails(
                convertFrom === FEATURE.PR ? responsePRDetails : responsePPRDetails,
                {
                    isResponse: true,
                    dataType: "object"
                }
            );
            setCompanyUuid(currentCompanyUuid);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onConvertPressHandler = async (params, data, rowData) => {
        try {
            const { context } = params;
            const { supplierUuid } = data;
            let response;
            if (context?.convertFrom === FEATURE.PR) {
                response = await PurchaseOrderService.convertPR2PO(data?.companyUuid, data?.purchaseUuid, supplierUuid);
            }
            if (context?.convertFrom === FEATURE.PPR) {
                response = await PurchaseOrderService.convertPPR2PO(data?.companyUuid, data?.purchaseUuid, supplierUuid);
            }
            if (response.data.status === RESPONSE_STATUS.OK) {
                const newRowData = [...rowData];
                newRowData.forEach((item, index) => {
                    if (item.supplierUuid === data.supplierUuid) {
                        newRowData[index].isConvert = true;
                        newRowData[index].poUuid = response.data.data;
                    }
                });
                params.api.setRowData(newRowData);
                showToast("success", response.data.message);
            } else {
                showToast("error", response.data.message);
                const newRowData = [...rowData];
                newRowData.forEach((item, index) => {
                    if (item.uuid === data.uuid) {
                        newRowData[index].isConvert = true;
                        newRowData[index].poUuid = response.data.data;
                    }
                });
                params.api.setRowData(newRowData);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const navigateToPODetails = (data) => {
        const { poUuid } = data;
        if (poUuid) {
            history.push(`${PURCHASE_ORDER_ROUTES.PO_DETAILS}?uuid=${poUuid}`);
        }
    };

    const checkSupplierConverted = (supplierUuid, purchaseOrderConverted) => {
        if (!purchaseOrderConverted) return null;
        return purchaseOrderConverted.find((item) => item.supplierUuid === supplierUuid);
    };

    const convertActionAuditTrail = (action) => {
        switch (action) {
        case "CONVERTED_TO_PPO":
            return "Converted to PPO";
        case "CONVERTED_TO_PO":
            return "Converted to PO";
        case "APPROVED":
            return "Approved Purchase Requisition";
        case "Saved as draft":
            return "Saved Purchase Requisition As Draft";
        default:
            return action.replaceAll("_", " ");
        }
    };

    const getConversations = async (pprUuid, prUuid) => {
        try {
            const responses = await Promise.allSettled([
                pprUuid && ConversationService.getDetailInternalConversation(companyUuid, pprUuid),
                pprUuid && ConversationService.getDetailExternalConversation(companyUuid, pprUuid),
                prUuid && ConversationService.getDetailInternalConversation(companyUuid, prUuid),
                prUuid && ConversationService.getDetailExternalConversation(companyUuid, prUuid)
            ]);
            const [
                responseInternalConversationsPPR,
                responseExternalConversationsPPR,
                responseInternalConversationsPR,
                responseExternalConversationsPR
            ] = responses;

            // internal conversation
            await conversationActions.setConversations(
                [
                    responseInternalConversationsPPR,
                    responseInternalConversationsPR
                ],
                true,
                true
            );
            // external conversation
            conversationActions.setConversations(
                [
                    responseExternalConversationsPPR,
                    responseExternalConversationsPR
                ],
                true,
                false
            );
        } catch (error) {
            showToast("error", error.message);
        }
    };

    const getRowDataOverview = async () => {
        const overview = [];
        try {
            const resOverview = await PurchaseRequestService
                .getDetailsPurchaseRequisitionOverview(companyUuid, purchaseUuid);
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
                setRowDataOverview(overview);
            }
        } catch (error) {
            console.log("error", error);
        }
    };

    const setPRForm = (setFieldValue) => {
        const allowConvert = permission?.read && permission?.write;
        const { purchaseReqItem, purchaseOrderConverted } = purchaseDetails;
        const { purchaseReqAuditTrailDto, purchaseReqDocumentMetadata } = purchaseDetails;
        const deliveryAddress = purchaseReqItem[0]?.address?.addressLabel || "";
        const deliveryDate = formatDateTime(purchaseReqItem[0]?.requestedDeliveryDate || "", CUSTOM_CONSTANTS.YYYYMMDD);
        const currencyCode = `${purchaseDetails.currencyName} (+${purchaseDetails.currencyCode})`;
        const currency = purchaseDetails.currencyCode;
        const procurementType = purchaseDetails.procurementType?.toLowerCase() === "goods" ? "Goods" : "Service";
        const submittedDate = convertToLocalTime(purchaseDetails.submittedDate);
        const status = location?.state?.status.replaceAll("_", " ");
        const natureOfRequisition = purchaseDetails.project ? "Project" : "Non-Project";
        setFieldValue("project", purchaseDetails.project);
        setFieldValue("natureOfRequisition", natureOfRequisition);
        setFieldValue("prNumber", purchaseDetails.prNumber);
        setFieldValue("pprNumber", purchaseDetails.pprNumber || "");
        setFieldValue("pprUuid", purchaseDetails.pprUuid || "");
        setFieldValue("status", status);
        setFieldValue("currencyCode", currencyCode);
        setFieldValue("currency", currency);
        setFieldValue("title", purchaseDetails.prTitle);
        setFieldValue("procurementType", procurementType);
        setFieldValue("approvalRouteUuid", purchaseDetails.approvalRouteName || "");
        setFieldValue("approvalSequence", purchaseDetails.approvalRouteSequence || "");
        setFieldValue("nextApprover", purchaseDetails.nextApprover || "");
        setFieldValue("requester", purchaseDetails.requestorName || "");
        setFieldValue("submittedDate", submittedDate);
        setFieldValue("deliveryAddress", deliveryAddress);
        setFieldValue("deliveryDate", deliveryDate);
        setFieldValue("note", purchaseDetails.note || "");
        setFieldValue("projectCode", purchaseDetails.projectCode || "");

        const rowDataItemReq = purchaseReqItem.map((item) => {
            const newItem = ({
                ...item,
                supplierUuid: item?.supplierName,
                requestedDeliveryDate: formatDateTime(item?.requestedDeliveryDate, CUSTOM_CONSTANTS.YYYYMMDD),
                address: item?.address?.addressLabel,
                inSourceCurrencyBeforeTax: roundNumberWithUpAndDown((item?.itemQuantity * item?.itemUnitPrice) || 0),
                inDocumentCurrencyBeforeTax: roundNumberWithUpAndDown((item?.itemQuantity * item?.itemUnitPrice * item?.exchangeRate) || 0)
            });
            newItem.taxAmountInDocumentCurrency = roundNumberWithUpAndDown((item?.taxRate * newItem.inDocumentCurrencyBeforeTax) / 100);
            newItem.inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(newItem.inDocumentCurrencyBeforeTax + newItem.taxAmountInDocumentCurrency);
            return newItem;
        });

        const listSupplier = [];
        purchaseReqItem.forEach((element) => {
            const { supplierUuid, supplierName } = element;
            if (supplierUuid && !listSupplier.find((item) => item.supplierUuid === supplierUuid)) {
                if (checkSupplierConverted(supplierUuid, purchaseOrderConverted)) {
                    const supplier = checkSupplierConverted(supplierUuid, purchaseOrderConverted);
                    listSupplier.push({
                        supplierUuid,
                        supplierName,
                        isConvert: true,
                        poUuid: supplier.uuid,
                        allowConvert,
                        companyUuid,
                        purchaseUuid
                    });
                } else {
                    listSupplier.push({
                        supplierUuid,
                        supplierName,
                        allowConvert,
                        companyUuid,
                        purchaseUuid
                    });
                }
            }
        });
        setFieldValue("supplierCode", listSupplier);

        const subTotal = roundNumberWithUpAndDown(rowDataItemReq.reduce((a, b) => a + (b.inDocumentCurrencyBeforeTax), 0));
        const diffTax = rowDataItemReq.some((item) => item.taxRate !== rowDataItemReq[0]?.taxRate);
        let tax;
        if (diffTax) {
            tax = roundNumberWithUpAndDown(rowDataItemReq.reduce((a, b) => a + (b.taxAmountInDocumentCurrency), 0));
        } else {
            tax = roundNumberWithUpAndDown((subTotal * rowDataItemReq[0]?.taxRate) / 100);
        }
        // const tax = roundNumberWithUpAndDown(rowDataItemReq.reduce((a, b) => a + (b.taxAmountInDocumentCurrency), 0));
        const total = roundNumberWithUpAndDown(subTotal + tax);

        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            loading: false
        }));
        setTotalInDocumentCurrency({ subTotal, tax, total });
        setRowDataItems(rowDataItemReq);
        setAuditTrails(purchaseReqAuditTrailDto ?? [], convertActionAuditTrail); // audit trails
        attachmentActions.setAttachments(purchaseReqDocumentMetadata ?? [], true, true); // internal attachments
        attachmentActions.setAttachments(purchaseReqDocumentMetadata ?? [], true, false); // external attachments
        try {
            getConversations(purchaseDetails?.pprUuid ?? "", purchaseUuid);
        } catch (err) {
            console.log(err);
        }
        getRowDataOverview();
    };

    const setPPRForm = (setFieldValue) => {
        const allowConvert = permission?.read && permission?.write;
        const { pprItemDtoList, purchaseOrderConverted } = purchaseDetails;
        const { auditTrailDtoList, documentDtoList } = purchaseDetails;
        const deliveryAddress = pprItemDtoList[0]?.deliveryAddress?.addressLabel || "";
        const deliveryDate = formatDateTime(pprItemDtoList[0]?.requestDeliveryDate || "", CUSTOM_CONSTANTS.YYYYMMDD);
        const currencyCode = `${purchaseDetails.currencyName} (+${purchaseDetails.currencyCode})`;
        const currency = purchaseDetails.currencyCode;
        const procurementType = purchaseDetails.procurementType?.toLowerCase() === "goods" ? "Goods" : "Service";
        const submittedDate = convertToLocalTime(purchaseDetails.submittedOn);
        const status = purchaseDetails.status?.replaceAll("_", " ") || "";
        const natureOfRequisition = purchaseDetails.project ? "Project" : "Non-Project";
        setFieldValue("project", purchaseDetails.project);
        setFieldValue("natureOfRequisition", natureOfRequisition);
        setFieldValue("pprNumber", purchaseDetails.pprNumber || "");
        setFieldValue("pprUuid", purchaseDetails.pprUuid || "");
        setFieldValue("status", status);
        setFieldValue("currencyCode", currencyCode);
        setFieldValue("currency", currency);
        setFieldValue("title", purchaseDetails.pprTitle || "");
        setFieldValue("procurementType", procurementType);
        setFieldValue("approvalRouteUuid", purchaseDetails.approvalCode || "");
        setFieldValue("approvalSequence", purchaseDetails.approvalSequence || "");
        setFieldValue("nextApprover", purchaseDetails.nextApprover || "");
        setFieldValue("requester", purchaseDetails.requesterName || "");
        setFieldValue("submittedDate", submittedDate);
        setFieldValue("deliveryAddress", deliveryAddress);
        setFieldValue("deliveryDate", deliveryDate);
        setFieldValue("note", purchaseDetails.note || "");
        setFieldValue("projectCode", purchaseDetails.projectCode || "");

        const rowDataItemReq = pprItemDtoList.map((item) => ({
            ...item,
            supplierUuid: item?.supplierName,
            requestedDeliveryDate: formatDateTime(item?.requestDeliveryDate, CUSTOM_CONSTANTS.YYYYMMDD),
            address: item?.deliveryAddress?.addressLabel,
            uom: item?.uomCode,
            itemQuantity: item?.quantity
        }));

        const listSupplier = [];
        pprItemDtoList.forEach((element) => {
            const { supplierUuid, supplierName } = element;
            if (supplierUuid && !listSupplier.find((item) => item.supplierUuid === supplierUuid)) {
                if (checkSupplierConverted(supplierUuid, purchaseOrderConverted)) {
                    const supplier = checkSupplierConverted(supplierUuid, purchaseOrderConverted);
                    listSupplier.push({
                        supplierUuid,
                        supplierName,
                        isConvert: true,
                        poUuid: supplier.uuid,
                        allowConvert,
                        companyUuid,
                        purchaseUuid
                    });
                } else {
                    listSupplier.push({
                        supplierUuid,
                        supplierName,
                        allowConvert,
                        companyUuid,
                        purchaseUuid
                    });
                }
            }
        });
        setFieldValue("supplierCode", listSupplier);

        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            loading: false
        }));
        setRowDataItems(rowDataItemReq);
        setAuditTrails(auditTrailDtoList ?? []); // audit trails
        attachmentActions.setAttachments(documentDtoList ?? [], true, true); // internal attachments
        attachmentActions.setAttachments(documentDtoList ?? [], true, false); // external attachments
        try {
            getConversations(purchaseUuid, purchaseDetails?.prUuid ?? "");
        } catch (error) {
            console.log(error);
        }
        getRowDataOverview();
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={
                            convertFrom === FEATURE.PR
                                ? t("PurchaseRequisitionToConvertDetails")
                                : t("PrePurchaseRequisitionToConvertDetails")
                        }
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
                    errors, values, touched, setFieldValue
                }) => {
                    useEffect(() => {
                        if (
                            !_.isEmpty(userDetails)
                            && !_.isEmpty(permissionReducer)
                            && purchaseUuid
                            && convertFrom
                        ) {
                            const currentCompanyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
                            if (currentCompanyUuid) initData(currentCompanyUuid);
                        }
                    }, [userDetails, permissionReducer, purchaseUuid, convertFrom]);

                    useEffect(() => {
                        if (
                            !_.isEmpty(purchaseDetails)
                            && Object.values(permission).includes(true)
                            && companyUuid
                        ) {
                            if (convertFrom === FEATURE.PR) setPRForm(setFieldValue);
                            if (convertFrom === FEATURE.PPR) setPPRForm(setFieldValue);
                        }
                    }, [purchaseDetails, permission, companyUuid]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {convertFrom === FEATURE.PPR && <Requisition t={t} values={values} />}
                                            <InitialSetting t={t} values={values} convertFrom={convertFrom} />
                                            <SupplierInfor t={t} values={values} />
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            <GeneralInformation t={t} errors={errors} touched={touched} />
                                            <RequestTerms t={t} values={values} errors={errors} touched={touched} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <HeaderSecondary title={t("ConvertToPurchaseOrders")} className="mb-2" />
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <ConvertToPOTable
                                        suppliers={values.supplierCode}
                                        gridHeight={250}
                                        onConvertPressHandler={(params, data, rowData) => onConvertPressHandler(params, data, rowData)}
                                        navigateToPODetails={(data) => navigateToPODetails(data)}
                                        disabled={!poCreator}
                                        convertFrom={convertFrom}
                                    />
                                </Col>
                            </Row>

                            <BreakdownOfItemsRequested
                                rowData={rowDataItems}
                                totalInDocumentCurrency={totalInDocumentCurrency}
                                isProject={values.project}
                                convertFrom={convertFrom}
                                values={values}
                            />

                            <HeaderSecondary title={t("Conversations")} className="mb-2" />
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
                                        sendConversation={() => { }}
                                        addNewRowAttachment={() => { }}
                                        rowDataConversation={internalConversations}
                                        rowDataAttachment={internalAttachments}
                                        onDeleteAttachment={() => { }}
                                        onAddAttachment={() => { }}
                                        onCellEditingStopped={() => { }}
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
                                        sendConversation={() => { }}
                                        addNewRowAttachment={() => { }}
                                        rowDataConversation={externalConversations}
                                        rowDataAttachment={externalAttachments}
                                        onDeleteAttachment={() => { }}
                                        onAddAttachment={() => { }}
                                        onCellEditingStopped={() => { }}
                                        defaultExpanded
                                        borderTopColor="#A9A2C1"
                                        disabled
                                    />
                                </Col>
                            </Row>

                            <HeaderSecondary title={t("AuditTrail")} className="mb-2" />
                            <Row className="mb-5">
                                <Col xs={12}>
                                    {/* Audit Trail */}
                                    <Overview
                                        rowData={rowDataOverview}
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
                                        activeTab={purchaseDetailsStates.activeAuditTrailTab}
                                        setActiveTab={(idx) => {
                                            setPurchaseDetailsStates((prevStates) => ({
                                                ...prevStates,
                                                activeAuditTrailTab: idx
                                            }));
                                        }}
                                        companyUuid={purchaseDetailsStates.companyUuid}
                                    />
                                </Col>
                            </Row>

                            {/* Footer */}
                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-start">
                                    <Button color="secondary" onClick={() => history.goBack()}>
                                        {t("Back")}
                                    </Button>
                                </Row>
                            </StickyFooter>
                        </Form>
                    );
                }}
            </Formik>
        </Container>
    );
};

export default ConvertToPO;
