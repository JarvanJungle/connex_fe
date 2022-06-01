/* eslint-disable max-len */
import React, { useState, useEffect } from "react";
import useToast from "routes/hooks/useToast";
import { usePermission } from "routes/hooks";
import StickyFooter from "components/StickyFooter";
import {
    Container, Row, Col, Button
} from "components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
    Conversation, AddItemRequest, Overview
} from "routes/components";
import { v4 as uuidv4 } from "uuid";
import CatalogueService from "services/CatalogueService";
import ManageProjectService from "services/ManageProjectService";
import CurrenciesService from "services/CurrenciesService";
import ExtVendorService from "services/ExtVendorService";
import AddressDataService from "services/AddressService";
import UOMDataService from "services/UOMService";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import GLDataService from "services/GLService";
import TaxRecordDataService from "services/TaxRecordService";
import PurchaseRequestService from "services/PurchaseRequestService/PurchaseRequestService";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { useSelector } from "react-redux";
import _ from "lodash";
import CUSTOM_CONSTANTS, { FEATURE } from "helper/constantsDefined";
import {
    formatDisplayDecimal, formatDateTime,
    convertToLocalTime, getCurrentCompanyUUIDByStore,
    convertDate2String,
    roundNumberWithUpAndDown
} from "helper/utilities";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { useLocation } from "react-router-dom";
import PrePurchaseOrderService from "services/PrePurchaseOrderService/PrePurchaseOrderService";
import { HeaderMain } from "routes/components/HeaderMain";
import ConversationService from "services/ConversationService/ConversationService";
import PRE_PURCHASE_ORDER_ROUTES from "../route";
import {
    GeneralInformation,
    InitialSetting,
    RequestTerms,
    ConvertPR2POTable,
    SupplierInfor
} from "./components";

const ConvertPR2PO = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const permission = usePermission(FEATURE.PPO);
    const [purchaseDetailsStates, setPurchaseDetailsStates] = useState({
        loading: true,
        isEdit: false,
        purchaseDetails: null,
        purchaseUuid: "",
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
        glAccounts: [],
        natureOfRequisitions: [
            { label: "Project", value: true },
            { label: "Non-Project", value: false }
        ],
        projects: [],
        procurementTypes: [
            { label: "Goods", value: "Goods" },
            { label: "Service", value: "Service" }
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
        viewPPORole: false,
        activeAuditTrailTab: 1,
        rowDataOverview: []
    });

    const initialValues = {
        project: false,
        projectCode: "",
        prNumber: "",
        prStatus: "",
        currencyCode: "",
        isSupplier: false,
        supplierCode: [],
        rfqProcess: false,
        rfqTreshold: 0,
        prTitle: "",
        procurementType: "",
        approvalRouteUuid: "",
        approvalSequence: "",
        nextApprover: "",
        requester: "",
        submittedDate: "",
        deliveryAddress: "",
        deliveryDate: "",
        note: "",
        saveAsDraft: false
    };
    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        cellRendererParams: { suppressCount: true },
        valueFormatter: (params) => params.data.type
    };

    const validationSchema = Yup.object().shape({
        projectCode: Yup.string()
            .test(
                "projectRequired",
                t("PleaseSelectValidProject"),
                (value, testContext) => {
                    const { parent } = testContext;
                    return ((value && parent.project) || (!value && !parent.project));
                }
            ),
        prTitle: Yup.string()
            .required(t("PleaseEnterValidPRTitle")),
        procurementType: Yup.string()
            .required(t("PleaseSelectValidProcurementType")),
        approvalRouteUuid: Yup.string()
            .required(t("PleaseSelectValidApprovalRoute")),
        deliveryAddress: Yup.string()
            .required(t("PleaseSelectValidDeliveryAddress")),
        deliveryDate: Yup.string()
            .required(t("PleaseSelectValidDeliveryDate")),
        currencyCode: Yup.string()
            .required(t("PleaseSelectValidCurrency")),
        supplierCode: Yup.array()
            .required(t("PleaseSelectValidSupplier"))
    });

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const purchaseUuid = query.get("uuid");
        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            purchaseUuid
        }));
    }, []);

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

    const initData = async (companyUuid) => {
        try {
            const { purchaseUuid } = purchaseDetailsStates;
            const responseCatalogueItems = await CatalogueService.getCatalogues(
                companyUuid
            );

            const responseProjects = await ManageProjectService.getCompanyProjectList(
                companyUuid
            );
            const projects = responseProjects.data.data.filter(
                (project) => project.projectStatus === "FORECASTED"
            );

            const responseCurrencies = await CurrenciesService.getCurrencies(
                companyUuid
            );

            const currencies = responseCurrencies.data.data.filter(
                (currency) => currency.active === true
            );

            const responseSuppliers = await ExtVendorService.getExternalVendors(
                companyUuid
            );

            const responseApprovalRoutes = await ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                companyUuid, "PR"
            );

            const responseAddresses = await AddressDataService.getCompanyAddresses(
                companyUuid
            );

            const addresses = responseAddresses.data.data.filter(
                (address) => address.active === true
            );

            const responseUOMs = await UOMDataService.getUOMRecords(
                companyUuid
            );

            const responseGLAccounts = await GLDataService.getGLs(
                companyUuid
            );

            const responseTaxRecords = await TaxRecordDataService.getTaxRecords(
                companyUuid
            );
            const taxRecords = responseTaxRecords.data.data.filter(
                (taxRecord) => taxRecord.active === true
            );

            const responsePurchaseDetails = await PurchaseRequestService.getDetailsPurchaseRequisition(
                companyUuid, purchaseUuid
            );

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
                }
            } catch (error) {
                console.log("error", error);
            }

            // get internal/external conversation list
            let rowDataExternalConversation = [];
            let rowDataInternalConversation = [];
            const { pprUuid } = responsePurchaseDetails.data.data;
            if (pprUuid) {
                const responses = await Promise.allSettled([
                    ConversationService.getDetailInternalConversation(companyUuid, pprUuid),
                    ConversationService.getDetailExternalConversation(companyUuid, pprUuid)
                ]);
                const [
                    responseInternalConversationsPPR,
                    responseExternalConversationsPPR
                ] = responses;

                rowDataExternalConversation = getDataConversation(
                    responseExternalConversationsPPR,
                    false
                );
                rowDataInternalConversation = getDataConversation(responseInternalConversationsPPR);
            }
            const responses = await Promise.allSettled([
                ConversationService.getDetailInternalConversation(companyUuid, purchaseUuid),
                ConversationService.getDetailExternalConversation(companyUuid, purchaseUuid)
            ]);
            const [
                responseInternalConversationsPR,
                responseExternalConversationsPR
            ] = responses;
            rowDataExternalConversation = rowDataExternalConversation.concat(
                getDataConversation(
                    responseExternalConversationsPR,
                    false
                )
            );
            rowDataInternalConversation = rowDataInternalConversation.concat(
                getDataConversation(responseInternalConversationsPR)
            );

            setPurchaseDetailsStates((prevStates) => ({
                ...prevStates,
                companyUuid,
                catalogueItems: responseCatalogueItems.data ? responseCatalogueItems.data.data : [],
                projects,
                currencies,
                suppliers: responseSuppliers.data.data,
                approvalRoutes: responseApprovalRoutes.data.data,
                addresses,
                uoms: responseUOMs.data.data,
                glAccounts: responseGLAccounts.data.data,
                taxRecords,
                purchaseDetails: responsePurchaseDetails.data.data,
                rowDataOverview: overview,
                rowDataExternalConversation,
                rowDataInternalConversation
            }));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onConvertPressHandler = async (params, data, rowData) => {
        try {
            const { companyUuid, purchaseDetails } = purchaseDetailsStates;
            const { uuid } = purchaseDetails;
            const response = await PrePurchaseOrderService.convertPR2PPO(companyUuid, uuid, data.uuid);
            if (response.data.status === RESPONSE_STATUS.OK) {
                const newRowData = [...rowData];
                newRowData.forEach((item, index) => {
                    if (item.uuid === data.uuid) {
                        newRowData[index].isConvert = true;
                        newRowData[index].ppoUuid = response.data.data;
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
                        newRowData[index].ppoUuid = response.data.data;
                    }
                });
                params.api.setRowData(newRowData);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const navigateToPPODetails = (data) => {
        const { ppoUuid } = data;
        if (ppoUuid) {
            history.push(`${PRE_PURCHASE_ORDER_ROUTES.PPO_DETAILS}?uuid=${ppoUuid}`);
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

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("PurchaseRequisitionToConvertDetails")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue
                }) => {
                    useEffect(() => {
                        if (
                            !_.isEmpty(userDetails)
                            && !_.isEmpty(permissionReducer)
                            && purchaseDetailsStates.purchaseUuid
                        ) {
                            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
                            if (companyUuid) initData(companyUuid);
                        }
                    }, [userDetails, permissionReducer, purchaseDetailsStates.purchaseUuid]);

                    useEffect(() => {
                        if (purchaseDetailsStates.purchaseDetails
                            && (permission?.read || permission?.write || permission?.approve)
                        ) {
                            const allowConvert = permission?.read && permission?.write;
                            const {
                                purchaseDetails,
                                addresses,
                                glAccounts,
                                currencies,
                                suppliers,
                                taxRecords,
                                uoms
                            } = purchaseDetailsStates;
                            const { purchaseReqItem, purchaseOrderConverted } = purchaseDetails;
                            setFieldValue("project", purchaseDetails.project);
                            setFieldValue("prNumber", purchaseDetails.prNumber);
                            setFieldValue("pprNumber", purchaseDetails.pprNumber || "");
                            setFieldValue("pprUuid", purchaseDetails.pprUuid || "");
                            setFieldValue("prStatus", location?.state?.status.replaceAll("_", " "));
                            setFieldValue("currencyCode", purchaseDetails.currencyCode);
                            setFieldValue("prTitle", purchaseDetails.prTitle);
                            setFieldValue("procurementType",
                                purchaseDetails.procurementType.toLowerCase() === "goods" ? "Goods" : "Service");
                            setFieldValue("approvalRouteUuid", purchaseDetails.approvalRouteUuid || "");
                            setFieldValue("approvalSequence", purchaseDetails.approvalRouteSequence || "");
                            setFieldValue("nextApprover", purchaseDetails.nextApprover || "");
                            setFieldValue("requester", purchaseDetails.requestorName || "");
                            setFieldValue("submittedDate", convertToLocalTime(purchaseDetails.submittedDate));
                            if (purchaseReqItem.length) {
                                setFieldValue("deliveryAddress", addresses.find(
                                    (item) => item.addressFirstLine === purchaseReqItem[0].address.addressFirstLine
                                        && item.addressLabel === purchaseReqItem[0].address.addressLabel
                                        && item.addressSecondLine === purchaseReqItem[0].address.addressSecondLine
                                        && item.city === purchaseReqItem[0].address.city
                                        && item.country === purchaseReqItem[0].address.country
                                        && item.postalCode === purchaseReqItem[0].address.postalCode
                                        && item.state === purchaseReqItem[0].address.state
                                )?.uuid);
                                setFieldValue("deliveryDate",
                                    formatDateTime(purchaseReqItem[0].requestedDeliveryDate, CUSTOM_CONSTANTS.YYYYMMDD));
                            }
                            setFieldValue("note", purchaseDetails.note || "");

                            if (purchaseDetails.project) {
                                setFieldValue("projectCode", purchaseDetails.projectCode);
                            }

                            const rowDataItemReq = purchaseReqItem.map(
                                ({
                                    address,
                                    accountNumber,
                                    sourceCurrency,
                                    supplierUuid,
                                    taxCode,
                                    uom,
                                    requestedDeliveryDate,
                                    ...res
                                }) => {
                                    const itemReq = {
                                        ...res,
                                        address: addresses.find(
                                            (item) => item.addressFirstLine === address.addressFirstLine
                                                && item.addressLabel === address.addressLabel
                                                && item.addressSecondLine === address.addressSecondLine
                                                && item.city === address.city
                                                && item.country === address.country
                                                && item.postalCode === address.postalCode
                                                && item.state === address.state
                                        ),
                                        accountNumber: glAccounts.find(
                                            (item) => item.accountNumber === accountNumber
                                        ),
                                        sourceCurrency: currencies.find(
                                            (item) => item.currencyCode === sourceCurrency
                                        ),
                                        supplierUuid: suppliers.find(
                                            (item) => item.uuid === supplierUuid
                                        ),
                                        taxCode: taxRecords.find(
                                            (item) => item.taxCode.toLowerCase() === taxCode?.toLowerCase()
                                        ),
                                        uom: uoms.find(
                                            (item) => item.uomCode.toLowerCase() === uom?.toLowerCase()
                                        ),
                                        requestedDeliveryDate: formatDateTime(requestedDeliveryDate, CUSTOM_CONSTANTS.YYYYMMDD),
                                        uuid: uuidv4()
                                    };

                                    itemReq.inSourceCurrencyBeforeTax = roundNumberWithUpAndDown((itemReq.itemQuantity || 0) * (itemReq.itemUnitPrice || 0));
                                    itemReq.inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(itemReq.inSourceCurrencyBeforeTax * (itemReq.exchangeRate || 0));
                                    itemReq.taxAmountInDocumentCurrency = roundNumberWithUpAndDown(((itemReq.taxRate || 0) * itemReq.inDocumentCurrencyBeforeTax) / 100);
                                    itemReq.inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(itemReq.inDocumentCurrencyBeforeTax + itemReq.taxAmountInDocumentCurrency);

                                    return itemReq;
                                }
                            );

                            const listSupplier = [];
                            rowDataItemReq.forEach((element) => {
                                const { supplierUuid } = element;
                                const { uuid } = supplierUuid;
                                if (supplierUuid && !listSupplier.find((item) => item.uuid === uuid)) {
                                    if (checkSupplierConverted(uuid, purchaseOrderConverted)) {
                                        const supplier = checkSupplierConverted(uuid, purchaseOrderConverted);
                                        listSupplier.push({
                                            ...supplierUuid,
                                            isConvert: true,
                                            ppoUuid: supplier.uuid,
                                            allowConvert
                                        });
                                    } else {
                                        listSupplier.push({
                                            ...supplierUuid,
                                            allowConvert
                                        });
                                    }
                                }
                            });
                            setFieldValue("supplierCode", listSupplier);

                            const subTotal = roundNumberWithUpAndDown(rowDataItemReq.reduce((a, b) => a + (b.inDocumentCurrencyBeforeTax), 0));
                            const tax = roundNumberWithUpAndDown(rowDataItemReq.reduce((a, b) => a + (b.taxAmountInDocumentCurrency), 0));
                            const total = roundNumberWithUpAndDown(subTotal + tax);

                            const rowDataAuditTrail = purchaseDetails.purchaseReqAuditTrailDto
                                .map(
                                    ({ action, dateTime, ...item }) => ({
                                        ...item,
                                        date: convertToLocalTime(dateTime),
                                        role: item.userRole,
                                        action: convertActionAuditTrail(action)
                                    })
                                );

                            const rowDataInternalAttachment = purchaseDetails.purchaseReqDocumentMetadata.filter(
                                (attachment) => attachment.externalDocument === false
                            ).map(({ uploadedOn, ...rest }) => ({
                                ...rest,
                                uploadedOn: convertToLocalTime(uploadedOn)
                            }));

                            const rowDataExternalAttachment = purchaseDetails.purchaseReqDocumentMetadata.filter(
                                (attachment) => attachment.externalDocument === true
                            ).map(({ uploadedOn, ...rest }) => ({
                                ...rest,
                                uploadedOn: convertToLocalTime(uploadedOn)
                            }));

                            setPurchaseDetailsStates((prevStates) => ({
                                ...prevStates,
                                loading: false,
                                rowDataInternalAttachment,
                                rowDataExternalAttachment,
                                rowDataItemReq,
                                rowDataAuditTrail,
                                subTotal,
                                tax,
                                total
                            }));
                        }
                    }, [purchaseDetailsStates.purchaseDetails, permission]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* Initial Setting */}
                                            <InitialSetting
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                currencies={purchaseDetailsStates.currencies}
                                                projects={purchaseDetailsStates.projects}
                                                disabled
                                                onChangeProject={() => { }}
                                            />
                                            <SupplierInfor
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                suppliers={purchaseDetailsStates.suppliers}
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
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                procurementTypes={purchaseDetailsStates.procurementTypes}
                                                approvalRoutes={purchaseDetailsStates.approvalRoutes}
                                                onChangeApprovalRoute={() => {}}
                                                disabled
                                            />
                                            {/* Request Terms */}
                                            <RequestTerms
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                addresses={purchaseDetailsStates.addresses}
                                                disabled
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("ConvertToPrePurchaseOrders")}
                                className="mb-2"
                            />
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <ConvertPR2POTable
                                        suppliers={values.supplierCode}
                                        gridHeight={250}
                                        convertPR2PPO={(params, data, rowData) => onConvertPressHandler(params, data, rowData)}
                                        navigateToPPODetails={(data) => navigateToPPODetails(data)}
                                        disabled={
                                            (permission?.read && !permission?.write && !permission?.approve)
                                            || (permission?.read && !permission?.write && permission?.approve)
                                        }
                                    />
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("BreakdownOfItemsRequested")}
                                className="mb-2"
                            />
                            <Row className="mb-2">
                                <Col xs={12}>
                                    <AddItemRequest
                                        rowDataItemReq={purchaseDetailsStates.rowDataItemReq}
                                        onDeleteItem={() => {}}
                                        suppliers={values.supplierCode.length > 0
                                            ? values.supplierCode
                                            : purchaseDetailsStates.suppliers}
                                        uoms={purchaseDetailsStates.uoms}
                                        currencies={purchaseDetailsStates.currencies}
                                        addresses={purchaseDetailsStates.addresses}
                                        glAccounts={purchaseDetailsStates.glAccounts}
                                        taxRecords={purchaseDetailsStates.taxRecords}
                                        onCellValueChanged={() => {}}
                                        gridHeight={350}
                                        disabled
                                    />
                                </Col>
                            </Row>
                            <Row className="mx-0 align-items-end flex-column mb-4 text-secondary" style={{ fontSize: "1rem" }}>
                                <div style={{ textDecoration: "underline" }}>
                                    {t("InDocumentCurrency")}
                                </div>
                                <Row className="justify-content-end" style={{ width: "380px", textAlign: "right" }}>
                                    <Col xs={6}>
                                        <div>{`${t("SubTotal")}:`}</div>
                                        <div>{`${t("Tax")}:`}</div>
                                        <div>{`${t("Total(include GST)")}:`}</div>
                                    </Col>
                                    <Col xs={3}>
                                        <div>{values.currencyCode}</div>
                                        <div>{values.currencyCode}</div>
                                        <div>{values.currencyCode}</div>
                                    </Col>
                                    <Col xs={3}>
                                        <div>{formatDisplayDecimal(purchaseDetailsStates.subTotal, 2) || "0.00"}</div>
                                        <div>{formatDisplayDecimal(purchaseDetailsStates.tax, 2) || "0.00"}</div>
                                        <div>{formatDisplayDecimal(purchaseDetailsStates.total, 2) || "0.00"}</div>
                                    </Col>
                                </Row>
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
                                    <Overview
                                        rowData={purchaseDetailsStates.rowDataOverview}
                                        rowDataAuditTrail={purchaseDetailsStates.rowDataAuditTrail}
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
                                    <Button
                                        color="secondary"
                                        onClick={() => history.goBack()}
                                    >
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

export default ConvertPR2PO;
