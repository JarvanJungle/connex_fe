/* eslint-disable max-len */
import React, { useState, useEffect, useRef } from "react";
import useToast from "routes/hooks/useToast";
import { usePermission } from "routes/hooks";
import StickyFooter from "components/StickyFooter";
import {
    Container, Row, Col, Button, Input
} from "components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
    BudgetDetails, Conversation, AddItemRequest, Overview
} from "routes/components";
import { v4 as uuidv4 } from "uuid";
import ManageProjectService from "services/ManageProjectService";
import CurrenciesService from "services/CurrenciesService";
import ExtVendorService from "services/ExtVendorService";
import AddressDataService from "services/AddressService";
import UOMDataService from "services/UOMService";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import GLDataService from "services/GLService";
import EntitiesService from "services/EntitiesService";
import TaxRecordDataService from "services/TaxRecordService";
import ProjectForecastService from "services/ProjectForecastService";
import PurchaseRequestService from "services/PurchaseRequestService/PurchaseRequestService";
import ConversationService from "services/ConversationService/ConversationService";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { useSelector } from "react-redux";
import _ from "lodash";
import CUSTOM_CONSTANTS, { FEATURE } from "helper/constantsDefined";
import {
    formatDisplayDecimal, convertToLocalTime,
    formatDateTime, convertDate2String,
    getCurrentCompanyUUIDByStore,
    itemAttachmentSchema,
    roundNumberWithUpAndDown
} from "helper/utilities";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { useLocation } from "react-router-dom";
import ActionModal from "routes/components/ActionModal";
import { CommonConfirmDialog } from "routes/components";
import classNames from "classnames";
import { HeaderMain } from "routes/components/HeaderMain";
import PR_ROUTES from "../route";
import {
    InitialSettingsComponent,
    SupplierInforComponent,
    GeneralInforComponent,
    RequestTermsComponent
} from "./components";
import convertActionAuditTrail from "../helper/utilities";

const PurchaseRequisitionDetails = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const refActionModalCancel = useRef(null);
    const refActionModalRecall = useRef(null);
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const permission = usePermission(FEATURE.PR);
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
        typeOfRequisitions: [],
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
        internalConversationLines: [],
        externalConversationLines: [],
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
        showErrorReasonSendBack: false,
        showReasonSendBack: false,
        reasonSendBack: "",
        showErrorReasonReject: false,
        showReasonReject: false,
        reasonReject: "",
        approverRole: false,
        activeAuditTrailTab: 1,
        rowDataOverview: []
    });

    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        cellRendererParams: { suppressCount: true },
        valueFormatter: (params) => params.data.type
    };

    const [itemDelete, setItemDelete] = useState({
        uuid: "",
        rowData: []
    });

    const initialValues = {
        project: false,
        projectCode: "",
        prNumber: "",
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
            const responseCatalogueItems = [];

            const responseProjects = await ManageProjectService.getCompanyProjectList(
                companyUuid
            );

            const projects = responseProjects.data.data.filter(
                (project) => project.projectStatus === "FORECASTED"
                    || project.projectStatus === "Project Closed"
                    || project.projectStatus.toLowerCase() === "closed"
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
                companyUuid, FEATURE.PR
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

            const overview = [];
            try {
                const resOverview = await PurchaseRequestService
                    .getDetailsPurchaseRequisitionOverview(companyUuid, purchaseUuid);
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

            setPurchaseDetailsStates((prevStates) => ({
                ...prevStates,
                loading: false,
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
                rowDataExternalConversation,
                rowDataInternalConversation,
                rowDataOverview: overview
            }));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const sendCommentConversation = async (comment, isInternal) => {
        try {
            if (isInternal) {
                const internalConversationLines = [...purchaseDetailsStates.internalConversationLines];
                const { rowDataInternalConversation } = purchaseDetailsStates;
                const newRowData = [...rowDataInternalConversation];
                newRowData.push({
                    userName: userDetails.name,
                    userRole: userDetails.designation,
                    userUuid: userDetails.uuid,
                    dateTime: new Date(),
                    comment,
                    externalConversation: false
                });
                internalConversationLines.push({
                    text: comment
                });
                setPurchaseDetailsStates((prevStates) => ({
                    ...prevStates,
                    rowDataInternalConversation: newRowData,
                    internalConversationLines
                }));
                return;
            }

            const externalConversationLines = [...purchaseDetailsStates.externalConversationLines];
            const { rowDataExternalConversation } = purchaseDetailsStates;
            const newRowData = [...rowDataExternalConversation];
            newRowData.push({
                userName: userDetails.name,
                userRole: userDetails.designation,
                userUuid: userDetails.uuid,
                dateTime: new Date(),
                comment,
                externalConversation: true
            });
            externalConversationLines.push({
                text: comment
            });
            setPurchaseDetailsStates((prevStates) => ({
                ...prevStates,
                rowDataExternalConversation: newRowData,
                externalConversationLines
            }));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const addNewRowAttachment = (isInternal) => {
        if (isInternal) {
            const { rowDataInternalAttachment } = purchaseDetailsStates;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.push({
                guid: "",
                fileLabel: "",
                fileDescription: "",
                uploadedOn: new Date(),
                uploadedBy: userDetails.name,
                uploaderUuid: userDetails.uuid,
                externalDocument: false,
                uuid: uuidv4(),
                isNew: true
            });
            setPurchaseDetailsStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = purchaseDetailsStates;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.push({
            guid: "",
            fileLabel: "",
            fileDescription: "",
            uploadedOn: new Date(),
            uploadedBy: userDetails.name,
            uploaderUuid: userDetails.uuid,
            externalDocument: true,
            uuid: uuidv4(),
            isNew: true
        });
        setPurchaseDetailsStates((prevStates) => ({
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
                setPurchaseDetailsStates((prevStates) => ({
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
            setPurchaseDetailsStates((prevStates) => ({
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
            setPurchaseDetailsStates((prevStates) => ({
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
        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onCellEditingStopped = (params, isInternal) => {
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = purchaseDetailsStates;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setPurchaseDetailsStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = purchaseDetailsStates;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onDeleteItemReq = (uuid, rowData) => {
        setItemDelete((prevStates) => ({
            ...prevStates,
            uuid,
            rowData
        }));
    };

    useEffect(() => {
        if (itemDelete.uuid) {
            const { uuid, rowData } = itemDelete;
            const { catalogueItems, forecastItems } = purchaseDetailsStates;
            const data = rowData.find((row) => row.uuid === uuid);
            let newCatalogueItems = [...catalogueItems];
            if (newCatalogueItems.length > 0) {
                newCatalogueItems = newCatalogueItems.map(
                    (item) => {
                        if (data.itemCode === item.catalogueItemCode) return { ...item, isSelected: false };
                        return item;
                    }
                );
            }
            let newForecastItems = [...forecastItems];
            if (newForecastItems.length > 0) {
                newForecastItems = newForecastItems.map(
                    (item) => {
                        if (data.itemCode === item.itemCode) return { ...item, isSelected: false };
                        return item;
                    }
                );
            }
            const newRowData = rowData.filter((row) => row.uuid !== uuid);
            setPurchaseDetailsStates((prevStates) => ({
                ...prevStates,
                rowDataItemReq: newRowData,
                catalogueItems: newCatalogueItems,
                forecastItems: newForecastItems
            }));
        }
    }, [itemDelete.uuid]);

    const onEditRowAddItemReq = (params) => {
        const { data, colDef, newValue } = params;
        const { field } = colDef;
        const { rowDataItemReq } = purchaseDetailsStates;
        const newRowData = [...rowDataItemReq];
        if (field === "supplierUuid") {
            rowDataItemReq.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].supplierName = newValue.companyName;
                    newRowData[index].inSourceCurrencyBeforeTax = roundNumberWithUpAndDown((data.itemQuantity || 0) * (data.itemUnitPrice || 0));
                    newRowData[index].inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(newRowData[index].inSourceCurrencyBeforeTax * (data.exchangeRate || 0));
                    newRowData[index].taxAmountInDocumentCurrency = roundNumberWithUpAndDown(((newRowData[index].taxRate || 0) * newRowData[index].inDocumentCurrencyBeforeTax) / 100);
                    newRowData[index].inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency);
                }
            });
        } else if (field === "taxCode") {
            rowDataItemReq.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].taxRate = newValue.taxRate || 0;
                    newRowData[index].inSourceCurrencyBeforeTax = roundNumberWithUpAndDown((data.itemQuantity || 0) * (data.itemUnitPrice || 0));
                    newRowData[index].inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(newRowData[index].inSourceCurrencyBeforeTax * (data.exchangeRate || 0));
                    newRowData[index].taxAmountInDocumentCurrency = roundNumberWithUpAndDown(((newRowData[index].taxRate || 0) * newRowData[index].inDocumentCurrencyBeforeTax) / 100);
                    newRowData[index].inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency);
                }
            });
        } else {
            rowDataItemReq.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].inSourceCurrencyBeforeTax = roundNumberWithUpAndDown((data.itemQuantity || 0) * (data.itemUnitPrice || 0));
                    newRowData[index].inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(newRowData[index].inSourceCurrencyBeforeTax * (data.exchangeRate || 0));
                    newRowData[index].taxAmountInDocumentCurrency = roundNumberWithUpAndDown(((newRowData[index].taxRate || 0) * newRowData[index].inDocumentCurrencyBeforeTax) / 100);
                    newRowData[index].inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency);
                }
            });
        }

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

        params.api.setRowData(newRowData);
        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            rowDataItemReq: newRowData,
            subTotal,
            tax,
            total
        }));
    };

    const onChangeApprovalRoute = async (e, setFieldValue) => {
        const { value } = e.target;
        const { companyUuid } = purchaseDetailsStates;
        setFieldValue("approvalRouteUuid", value);
        try {
            const response = await ApprovalMatrixManagementService.getApprovalMatrixByApprovalUuid(companyUuid, value);
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const { approvalRange } = data;
                let approvalSequence = "";
                approvalRange.forEach((approval, index) => {
                    const { approvalGroups } = approval;
                    if (index === 0) {
                        approvalSequence = approvalGroups[0]?.group.groupName;
                    } else {
                        approvalSequence += ` > ${approvalGroups[0]?.group.groupName}`;
                    }
                });
                setFieldValue("approvalSequence", approvalSequence);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onCancelPressHandler = async () => {
        try {
            const {
                companyUuid,
                purchaseUuid,
                rowDataInternalConversation,
                rowDataExternalConversation
            } = purchaseDetailsStates;
            const body = {
                uuid: purchaseUuid,
                addedPurchaseReqConversation: []
            };
            let addedConversation = rowDataInternalConversation.concat(rowDataExternalConversation);
            addedConversation = addedConversation.filter(
                (conversation) => conversation.isNew === true
            );
            const addedPurchaseReqConversation = addedConversation.map(
                ({ uuid, isNew, ...rest }) => rest
            );
            body.addedPurchaseReqConversation = addedPurchaseReqConversation;

            const response = await PurchaseRequestService.cancelPurchaseRequisition(
                companyUuid, body
            );

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

    const onRecallPressHandler = async () => {
        try {
            const {
                companyUuid,
                purchaseUuid,
                rowDataInternalConversation,
                rowDataExternalConversation
            } = purchaseDetailsStates;
            const body = {
                uuid: purchaseUuid,
                addedPurchaseReqConversation: []
            };
            let addedConversation = rowDataInternalConversation.concat(rowDataExternalConversation);
            addedConversation = addedConversation.filter(
                (conversation) => conversation.isNew === true
            );
            const addedPurchaseReqConversation = addedConversation.map(
                ({ uuid, isNew, ...rest }) => rest
            );
            body.addedPurchaseReqConversation = addedPurchaseReqConversation;

            const response = await PurchaseRequestService.recallPurchaseRequisition(
                companyUuid, body
            );

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

    const calcBudgetDetails = async (projectCode) => {
        const { companyUuid } = purchaseDetailsStates;
        const responseForecastDetail = await ProjectForecastService.getProjectForecastDetail(companyUuid, projectCode);
        const rowDataProject = [];
        const rowDataTrade = [];
        let rowDataItem = [];
        if (responseForecastDetail.data.status === RESPONSE_STATUS.OK) {
            const { data } = responseForecastDetail.data;
            const {
                overallBudget,
                projectTitle,
                currency,
                projectForecastTradeDetailsDtoList
            } = data;

            projectForecastTradeDetailsDtoList.forEach((tradeItem) => {
                const listItems = [];
                const {
                    projectForecastItemList, tradeCode, tradeTitle, tradeDescription
                } = tradeItem;
                projectForecastItemList.forEach((element) => {
                    const item = {};
                    item.code = element.itemCode;
                    item.name = element.itemName;
                    item.totalBudgeted = 0;
                    item.totalForecasted = Number(element.itemUnitPrice) * Number(element.itemQuantity) * Number(element.exchangeRate);
                    item.totalContracted = element.totalContracted;
                    item.totalContractedSpend = element.totalContractedSpend;
                    item.pendingApproveInvoicesContract = element.contractPendingApprovalInvoices;
                    item.approveInvoicesContract = element.contractApprovalInvoices;
                    item.pendingBillingContract = element.contractPendingBilling;
                    item.contractedSpendBalance = item.totalContracted - item.totalContractedSpend;
                    item.totalNonContractedSpend = element.totalNonContractedSpend;
                    item.pendingApproveInvoicesNonContract = element.nonContractPendingApprovalInvoices;
                    item.approveInvoicesNonContract = element.nonContractApprovalInvoices;
                    item.pendingBillingNonContract = element.nonContractPendingBilling;
                    item.totalSpend = item.totalContractedSpend + item.totalNonContractedSpend;
                    item.quantity = element.itemQuantity;
                    item.unitPrice = element.itemUnitPrice;
                    item.uom = element.uom;
                    item.tax = "";
                    item.exchangeRate = element.exchangeRate;
                    item.notes = element.note || "";
                    item.currency = element.sourceCurrency;

                    listItems.push(item);
                });
                rowDataItem = rowDataItem.concat(listItems);

                const trade = {};
                trade.code = tradeCode;
                trade.name = tradeTitle;
                trade.tradeDescription = tradeDescription;
                trade.currency = rowDataItem[0]?.currency;
                trade.totalBudgeted = 0;
                trade.totalForecasted = 0;
                trade.totalContracted = 0;
                trade.totalContractedSpend = 0;
                trade.pendingApproveInvoicesContract = 0;
                trade.approveInvoicesContract = 0;
                trade.pendingBillingContract = 0;
                trade.contractedSpendBalance = 0;
                trade.totalNonContractedSpend = 0;
                trade.pendingApproveInvoicesNonContract = 0;
                trade.approveInvoicesNonContract = 0;
                trade.pendingBillingNonContract = 0;
                trade.totalSpend = 0;
                trade.children = listItems;
                listItems.forEach((element) => {
                    trade.totalBudgeted += element.totalBudgeted;
                    trade.totalForecasted += element.totalForecasted;
                    trade.totalContracted += element.totalContracted;
                    trade.totalContractedSpend += element.totalContractedSpend;
                    trade.pendingApproveInvoicesContract += element.pendingApproveInvoicesContract;
                    trade.approveInvoicesContract += element.approveInvoicesContract;
                    trade.pendingBillingContract += element.pendingBillingContract;
                    trade.contractedSpendBalance += element.contractedSpendBalance;
                    trade.totalNonContractedSpend += element.totalNonContractedSpend;
                    trade.pendingApproveInvoicesNonContract += element.pendingApproveInvoicesNonContract;
                    trade.approveInvoicesNonContract += element.approveInvoicesNonContract;
                    trade.pendingBillingNonContract += element.pendingBillingNonContract;
                    trade.totalSpend += element.totalSpend;
                });

                rowDataTrade.push(trade);
            });

            const project = {};
            project.code = projectCode;
            project.name = projectTitle;
            project.currency = currency;
            project.totalBudgeted = overallBudget;
            project.totalForecasted = 0;
            project.totalContracted = 0;
            project.totalContractedSpend = 0;
            project.pendingApproveInvoicesContract = 0;
            project.approveInvoicesContract = 0;
            project.pendingBillingContract = 0;
            project.contractedSpendBalance = 0;
            project.totalNonContractedSpend = 0;
            project.pendingApproveInvoicesNonContract = 0;
            project.approveInvoicesNonContract = 0;
            project.pendingBillingNonContract = 0;
            project.totalSpend = 0;
            rowDataTrade.forEach((element) => {
                project.totalForecasted += element.totalForecasted;
                project.totalContracted += element.totalContracted;
                project.totalContractedSpend += element.totalContractedSpend;
                project.pendingApproveInvoicesContract += element.pendingApproveInvoicesContract;
                project.approveInvoicesContract += element.approveInvoicesContract;
                project.pendingBillingContract += element.pendingBillingContract;
                project.contractedSpendBalance += element.contractedSpendBalance;
                project.totalNonContractedSpend += element.totalNonContractedSpend;
                project.pendingApproveInvoicesNonContract += element.pendingApproveInvoicesNonContract;
                project.approveInvoicesNonContract += element.approveInvoicesNonContract;
                project.pendingBillingNonContract += element.pendingBillingNonContract;
                project.totalSpend += element.totalSpend;
            });

            rowDataProject.push(project);
        }

        return {
            rowDataProject,
            rowDataTrade,
            rowDataItem
        };
    };

    const onSendBackPressHandler = async () => {
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
                    purchaseUuid,
                    rowDataInternalConversation,
                    rowDataExternalConversation,
                    rowDataInternalAttachment,
                    rowDataExternalAttachment
                } = purchaseDetailsStates;
                const body = {
                    uuid: purchaseUuid,
                    addedPurchaseReqConversation: [],
                    newlyAddedPurchaseReqDocuments: []
                };

                let addedAttachment = rowDataInternalAttachment.concat(rowDataExternalAttachment);
                addedAttachment = addedAttachment.filter(
                    (conversation) => conversation.isNew === true
                );

                await itemAttachmentSchema.validate(addedAttachment);

                const newlyAddedPurchaseReqDocuments = addedAttachment.map(
                    ({
                        uuid, isNew, fileLabel, attachment, uploadedOn, ...rest
                    }) => ({
                        ...rest,
                        fileLabel: fileLabel || attachment,
                        uploadedOn: convertToLocalTime(uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                    })
                );
                body.newlyAddedPurchaseReqDocuments = newlyAddedPurchaseReqDocuments;

                let addedConversation = rowDataInternalConversation.concat(rowDataExternalConversation);
                addedConversation = addedConversation.filter(
                    (conversation) => conversation.isNew === true
                );
                const addedPurchaseReqConversation = addedConversation.map(
                    ({ uuid, isNew, ...rest }) => rest
                );
                addedPurchaseReqConversation.push({
                    userName: userDetails.name,
                    userRole: userDetails.designation,
                    userUuid: userDetails.uuid,
                    dateTime: convertToLocalTime(new Date(), CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
                    comment: purchaseDetailsStates.reasonSendBack,
                    externalConversation: false
                });
                body.addedPurchaseReqConversation = addedPurchaseReqConversation;

                const response = await PurchaseRequestService.sendBackPurchaseRequisition(
                    companyUuid, body
                );

                if (response.data.status === RESPONSE_STATUS.OK) {
                    try {
                        const reasonSendBackConversation = {
                            referenceId: purchaseUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: [{ text: purchaseDetailsStates.reasonSendBack }]
                        };
                        ConversationService
                            .createInternalConversation(companyUuid, reasonSendBackConversation);
                        if (purchaseDetailsStates.externalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: purchaseUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: purchaseDetailsStates.externalConversationLines
                            };
                            ConversationService
                                .createExternalConversation(companyUuid, conversationBody);
                        }
                        if (purchaseDetailsStates.internalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: purchaseUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: purchaseDetailsStates.internalConversationLines
                            };
                            ConversationService
                                .createInternalConversation(companyUuid, conversationBody);
                        }
                    } catch (error) {}

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
        }
    };

    const onRejectPressHandler = async () => {
        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            showErrorReasonReject: true
        }));

        if (purchaseDetailsStates.reasonReject) {
            setPurchaseDetailsStates((prevStates) => ({
                ...prevStates,
                showReasonReject: false
            }));
            try {
                const {
                    companyUuid,
                    purchaseUuid,
                    rowDataInternalConversation,
                    rowDataExternalConversation,
                    rowDataInternalAttachment,
                    rowDataExternalAttachment
                } = purchaseDetailsStates;
                const body = {
                    uuid: purchaseUuid,
                    addedPurchaseReqConversation: [],
                    newlyAddedPurchaseReqDocuments: []
                };

                let addedAttachment = rowDataInternalAttachment.concat(rowDataExternalAttachment);
                addedAttachment = addedAttachment.filter(
                    (conversation) => conversation.isNew === true
                );

                await itemAttachmentSchema.validate(addedAttachment);

                const newlyAddedPurchaseReqDocuments = addedAttachment.map(
                    ({
                        uuid, isNew, fileLabel, attachment, uploadedOn, ...rest
                    }) => ({
                        ...rest,
                        fileLabel: fileLabel || attachment,
                        uploadedOn: convertToLocalTime(uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                    })
                );
                body.newlyAddedPurchaseReqDocuments = newlyAddedPurchaseReqDocuments;

                let addedConversation = rowDataInternalConversation.concat(rowDataExternalConversation);
                addedConversation = addedConversation.filter(
                    (conversation) => conversation.isNew === true
                );
                const addedPurchaseReqConversation = addedConversation.map(
                    ({
                        uuid, isNew, dateTime, ...rest
                    }) => ({
                        ...rest,
                        dateTime: convertToLocalTime(dateTime, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                    })
                );
                addedPurchaseReqConversation.push({
                    userName: userDetails.name,
                    userRole: userDetails.designation,
                    userUuid: userDetails.uuid,
                    dateTime: convertToLocalTime(new Date(), CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
                    comment: purchaseDetailsStates.reasonReject,
                    externalConversation: false
                });
                body.addedPurchaseReqConversation = addedPurchaseReqConversation;

                const response = await PurchaseRequestService.rejectPurchaseRequisition(
                    companyUuid, body
                );

                if (response.data.status === RESPONSE_STATUS.OK) {
                    try {
                        const reasonRejectConversation = {
                            referenceId: purchaseUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: [{ text: purchaseDetailsStates.reasonReject }]
                        };
                        ConversationService
                            .createInternalConversation(companyUuid, reasonRejectConversation);
    
                        if (purchaseDetailsStates.externalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: purchaseUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: purchaseDetailsStates.externalConversationLines
                            };
                            ConversationService
                                .createExternalConversation(companyUuid, conversationBody);
                        }
                        if (purchaseDetailsStates.internalConversationLines.length > 0) {
                            const conversationBody = {
                                referenceId: purchaseUuid,
                                supplierUuid: userDetails.uuid,
                                conversations: purchaseDetailsStates.internalConversationLines
                            };
                            ConversationService
                                .createInternalConversation(companyUuid, conversationBody);
                        }
                    } catch (error) {}

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
        }
    };

    const onApprovePressHandler = async () => {
        try {
            const {
                companyUuid,
                purchaseUuid,
                rowDataInternalConversation,
                rowDataExternalConversation,
                rowDataInternalAttachment,
                rowDataExternalAttachment
            } = purchaseDetailsStates;
            const body = {
                uuid: purchaseUuid,
                addedPurchaseReqConversation: [],
                newlyAddedPurchaseReqDocuments: []
            };

            let addedAttachment = rowDataInternalAttachment.concat(rowDataExternalAttachment);
            addedAttachment = addedAttachment.filter(
                (conversation) => conversation.isNew === true
            );

            await itemAttachmentSchema.validate(addedAttachment);

            const newlyAddedPurchaseReqDocuments = addedAttachment.map(
                ({
                    uuid, isNew, fileLabel, attachment, uploadedOn, ...rest
                }) => ({
                    ...rest,
                    fileLabel: fileLabel || attachment,
                    uploadedOn: convertToLocalTime(uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                })
            );
            body.newlyAddedPurchaseReqDocuments = newlyAddedPurchaseReqDocuments;

            let addedConversation = rowDataInternalConversation.concat(rowDataExternalConversation);
            addedConversation = addedConversation.filter(
                (conversation) => conversation.isNew === true
            );
            const addedPurchaseReqConversation = addedConversation.map(
                ({ uuid, isNew, ...rest }) => rest
            );
            body.addedPurchaseReqConversation = addedPurchaseReqConversation;

            const response = await PurchaseRequestService.approvePurchaseRequisition(
                companyUuid, body
            );

            if (response.data.status === RESPONSE_STATUS.OK) {
                try {
                    if (purchaseDetailsStates.externalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: purchaseUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: purchaseDetailsStates.externalConversationLines
                        };
                        ConversationService
                            .createExternalConversation(companyUuid, conversationBody);
                    }
                    if (purchaseDetailsStates.internalConversationLines.length > 0) {
                        const conversationBody = {
                            referenceId: purchaseUuid,
                            supplierUuid: userDetails.uuid,
                            conversations: purchaseDetailsStates.internalConversationLines
                        };
                        ConversationService
                            .createInternalConversation(companyUuid, conversationBody);
                    }
                } catch (error) {}

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

    const renderActionButton = () => {
        if (!location.pathname.includes("view-pr-details")) {
            if (permission?.read && !permission?.write && !permission?.approve) {
                return (<></>);
            }
            if (!purchaseDetailsStates.approverRole) {
                if (!purchaseDetailsStates.purchaseDetails?.firstApproved) {
                    return (
                        <Row className="mx-0">
                            <Button
                                color="danger"
                                className="mr-3"
                                type="submit"
                                onClick={() => refActionModalCancel.current.toggleModal()}
                                disabled={purchaseDetailsStates.loading
                                    || (!purchaseDetailsStates.purchaseDetails?.approverRole
                                        && !purchaseDetailsStates.purchaseDetails?.firstApproved
                                        && !purchaseDetailsStates.purchaseDetails?.prCreator)}
                            >
                                {t("Cancel")}
                            </Button>
                            <Button
                                color="warning"
                                type="submit"
                                onClick={() => refActionModalRecall.current.toggleModal()}
                                disabled={purchaseDetailsStates.loading
                                    || (!purchaseDetailsStates.purchaseDetails?.approverRole
                                        && !purchaseDetailsStates.purchaseDetails?.firstApproved
                                        && !purchaseDetailsStates.purchaseDetails?.prCreator)}
                            >
                                {t("Recall")}
                            </Button>
                        </Row>
                    );
                }
                return (<></>);
            }
            if (!purchaseDetailsStates.hasApproved) {
                return (
                    <Row className="mx-0">
                        <Button
                            color="danger"
                            className="mr-3"
                            type="submit"
                            onClick={() => setPurchaseDetailsStates((prevStates) => ({
                                ...prevStates,
                                showReasonReject: true
                            }))}
                            disabled={purchaseDetailsStates.loading
                                || (!purchaseDetailsStates.purchaseDetails?.approverRole
                                    && !purchaseDetailsStates.purchaseDetails?.firstApproved
                                    && !purchaseDetailsStates.purchaseDetails?.prCreator)}
                        >
                            {t("Reject")}
                        </Button>
                        <Button
                            color="warning"
                            type="submit"
                            className="mr-3"
                            onClick={() => setPurchaseDetailsStates((prevStates) => ({
                                ...prevStates,
                                showReasonSendBack: true
                            }))}
                            disabled={purchaseDetailsStates.loading
                                || (!purchaseDetailsStates.purchaseDetails?.approverRole
                                    && !purchaseDetailsStates.purchaseDetails?.firstApproved
                                    && !purchaseDetailsStates.purchaseDetails?.prCreator)}
                        >
                            {t("SendBack")}
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            onClick={() => onApprovePressHandler()}
                            disabled={purchaseDetailsStates.loading
                                || (!purchaseDetailsStates.purchaseDetails?.approverRole
                                    && !purchaseDetailsStates.purchaseDetails?.firstApproved
                                    && !purchaseDetailsStates.purchaseDetails?.prCreator)}
                        >
                            {t("Approve")}
                        </Button>
                    </Row>
                );
            }
            return (
                <Row className="mx-0">
                    <></>
                </Row>
            );
        }
        return (<></>);
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("PurchaseRequestDetails")}
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
                    }, [userDetails, purchaseDetailsStates.purchaseUuid, permissionReducer]);

                    useEffect(() => {
                        if (
                            purchaseDetailsStates.purchaseDetails
                            && (permission?.read || permission?.write || permission?.approve)
                        ) {
                            const isEdit = permission?.approve && permission?.read
                                && purchaseDetailsStates.purchaseDetails?.approverRole
                                && !location.pathname.includes("view-pr-details");
                            setPurchaseDetailsStates((prevStates) => ({
                                ...prevStates,
                                isEdit
                            }));
                        }
                    }, [permission, purchaseDetailsStates.purchaseDetails]);

                    useEffect(() => {
                        if (purchaseDetailsStates.purchaseDetails) {
                            const {
                                purchaseDetails,
                                addresses,
                                glAccounts,
                                currencies,
                                suppliers,
                                taxRecords,
                                uoms
                            } = purchaseDetailsStates;
                            const { purchaseReqItem, approverRole } = purchaseDetails;
                            setFieldValue("project", purchaseDetails.project);
                            setFieldValue("prNumber", purchaseDetails.prNumber);
                            setFieldValue("pprNumber", purchaseDetails.pprNumber || "");
                            setFieldValue("pprUuid", purchaseDetails.pprUuid || "");
                            setFieldValue("currencyCode", purchaseDetails.currencyCode);
                            setFieldValue("prTitle", purchaseDetails.prTitle);
                            setFieldValue("procurementType",
                                purchaseDetails.procurementType.toLowerCase() === "goods" ? "Goods" : "Service");
                            setFieldValue("approvalRouteUuid", purchaseDetails.approvalRouteUuid || "");
                            setFieldValue("approvalSequence", purchaseDetails.approvalRouteSequence || "");
                            setFieldValue("nextApprover", purchaseDetails.nextApprover || "");
                            setFieldValue("requester", purchaseDetails.requestorName || "");
                            setFieldValue("submittedDate", convertToLocalTime(purchaseDetails.submittedDate, CUSTOM_CONSTANTS.DDMMYYYHHmmss));
                            setFieldValue("deliveryAddress", purchaseDetails.deliveryAddress)
                            setFieldValue("deliveryDate",
                                formatDateTime(purchaseDetails.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD));
                            setFieldValue("note", purchaseDetails.note || "");
                            if (purchaseDetails.project) {
                                setFieldValue("projectCode", purchaseDetails.projectCode);
                                calcBudgetDetails(purchaseDetails.projectCode).then((data) => {
                                    const {
                                        rowDataProject,
                                        rowDataTrade,
                                        rowDataItem
                                    } = data;
                                    setPurchaseDetailsStates((prevStates) => ({
                                        ...prevStates,
                                        rowDataProject,
                                        rowDataTrade,
                                        rowDataItem
                                    }));
                                });
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
                                if (supplierUuid) {
                                    const { uuid } = supplierUuid;
                                    if (!listSupplier.find((item) => item.uuid === uuid)) {
                                        listSupplier.push(supplierUuid);
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
                                rowDataInternalAttachment,
                                rowDataExternalAttachment,
                                rowDataItemReq,
                                rowDataAuditTrail,
                                subTotal,
                                tax,
                                total,
                                approverRole,
                                firstApproved: purchaseDetails.firstApproved,
                                hasApproved: purchaseDetails.hasApproved
                            }));
                        }
                    }, [purchaseDetailsStates.purchaseDetails]);

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
                                                currencies={purchaseDetailsStates.currencies}
                                                projects={purchaseDetailsStates.projects}
                                            />
                                            {/* Supplier Information */}
                                            <SupplierInforComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                suppliers={purchaseDetailsStates.suppliers}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* General Information */}
                                            <GeneralInforComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                procurementTypes={purchaseDetailsStates.procurementTypes}
                                                approvalRoutes={purchaseDetailsStates.approvalRoutes}
                                                onChangeApprovalRoute={(e) => onChangeApprovalRoute(e, setFieldValue)}
                                            />
                                            {/* Request Terms */}
                                            <RequestTermsComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                addresses={purchaseDetailsStates.addresses}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            {
                                values.project
                                && (
                                    <>
                                        <HeaderSecondary
                                            title={t("BudgetDetails")}
                                            className="mb-2"
                                        />
                                        <Row className="mb-4">
                                            <Col xs={12}>
                                                {/* Budget Details */}
                                                <BudgetDetails
                                                    rowDataProject={purchaseDetailsStates.rowDataProject}
                                                    rowDataTrade={purchaseDetailsStates.rowDataTrade}
                                                    rowDataItem={purchaseDetailsStates.rowDataItem}
                                                />
                                            </Col>
                                        </Row>
                                    </>
                                )
                            }

                            <Row className="mb-2">
                                <Col xs={12}>
                                    <AddItemRequest
                                        rowDataItemReq={purchaseDetailsStates.rowDataItemReq}
                                        onDeleteItem={(uuid, rowData) => onDeleteItemReq(uuid, rowData)}
                                        suppliers={purchaseDetailsStates.suppliers}
                                        uoms={purchaseDetailsStates.uoms}
                                        currencies={purchaseDetailsStates.currencies}
                                        addresses={purchaseDetailsStates.addresses}
                                        glAccounts={purchaseDetailsStates.glAccounts}
                                        taxRecords={purchaseDetailsStates.taxRecords}
                                        onCellValueChanged={(params) => onEditRowAddItemReq(params)}
                                        gridHeight={350}
                                        disabled
                                    />
                                </Col>
                            </Row>
                            <Row className="mx-0 align-items-end flex-column mb-4 text-secondary" style={{ fontSize: "1rem" }}>
                                <div style={{ textDecoration: "underline" }}>
                                    {t("InDocumentCurrency")}
                                </div>
                                <Row className="justify-content-end mx-0" style={{ textAlign: "right" }}>
                                    <div style={{ width: "200px" }}>
                                        <div>{`${t("SubTotal")}:`}</div>
                                        <div>{`${t("Tax")}:`}</div>
                                        <div>{`${t("Total(include GST)")}:`}</div>
                                    </div>
                                    <div style={{ width: "100px" }}>
                                        <div>{values?.currencyCode}</div>
                                        <div>{values?.currencyCode}</div>
                                        <div>{values?.currencyCode}</div>
                                    </div>
                                    <div style={{ marginLeft: "40px" }}>
                                        <div>{formatDisplayDecimal(purchaseDetailsStates.subTotal, 2) || "0.00"}</div>
                                        <div>{formatDisplayDecimal(purchaseDetailsStates.tax, 2) || "0.00"}</div>
                                        <div>{formatDisplayDecimal(purchaseDetailsStates.total, 2) || "0.00"}</div>
                                    </div>
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
                                        sendConversation={(comment) => sendCommentConversation(comment, true)}
                                        addNewRowAttachment={() => addNewRowAttachment(true)}
                                        rowDataConversation={purchaseDetailsStates.rowDataInternalConversation}
                                        rowDataAttachment={purchaseDetailsStates.rowDataInternalAttachment}
                                        onDeleteAttachment={(uuid, rowData) => onDeleteAttachment(uuid, rowData, true)}
                                        onAddAttachment={(e, uuid, rowData) => onAddAttachment(e, uuid, rowData, true)}
                                        onCellEditingStopped={(params) => onCellEditingStopped(params, true)}
                                        defaultExpanded
                                        disabled={!purchaseDetailsStates.isEdit}
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
                                        sendConversation={(comment) => sendCommentConversation(comment, false)}
                                        addNewRowAttachment={() => addNewRowAttachment(false)}
                                        rowDataConversation={purchaseDetailsStates.rowDataExternalConversation}
                                        rowDataAttachment={purchaseDetailsStates.rowDataExternalAttachment}
                                        onDeleteAttachment={(uuid, rowData) => onDeleteAttachment(uuid, rowData, false)}
                                        onAddAttachment={(e, uuid, rowData) => onAddAttachment(e, uuid, rowData, false)}
                                        onCellEditingStopped={(params) => onCellEditingStopped(params, false)}
                                        defaultExpanded
                                        borderTopColor="#A9A2C1"
                                        disabled={!purchaseDetailsStates.isEdit}
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
                                <Row className="mx-0 px-3 justify-content-between">
                                    <Button
                                        color="secondary"
                                        onClick={() => history.goBack()}
                                    >
                                        {t("Back")}
                                    </Button>
                                    { renderActionButton() }
                                </Row>
                            </StickyFooter>
                        </Form>
                    );
                }}
            </Formik>
            <ActionModal
                ref={refActionModalCancel}
                title="Cancel Request"
                body="Do you wish to cancel this request?"
                button="Yes"
                color="primary"
                textCancel="No"
                colorCancel="danger"
                action={() => onCancelPressHandler()}
            />
            <ActionModal
                ref={refActionModalRecall}
                title="Recall Request"
                body="Do you wish to recall this request?"
                button="Yes"
                color="primary"
                textCancel="No"
                colorCancel="danger"
                action={() => onRecallPressHandler()}
            />
            <CommonConfirmDialog
                footerBetween={false}
                isShow={purchaseDetailsStates.showReasonSendBack}
                onHide={() => setPurchaseDetailsStates((prevStates) => ({
                    ...prevStates,
                    showReasonSendBack: false
                }))}
                title={t("Reason")}
                positiveProps={
                    {
                        onPositiveAction: () => onSendBackPressHandler(),
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
                            "is-invalid": purchaseDetailsStates.showErrorReasonSendBack && !purchaseDetailsStates.reasonSendBack
                        })
                    }
                    placeholder={t("PleaseEnterReason")}
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
            <CommonConfirmDialog
                footerBetween={false}
                isShow={purchaseDetailsStates.showReasonReject}
                onHide={() => setPurchaseDetailsStates((prevStates) => ({
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
                        onNegativeAction: () => setPurchaseDetailsStates((prevStates) => ({
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
                    name="sendBackReason"
                    className={
                        classNames("form-control", {
                            "is-invalid": purchaseDetailsStates.showErrorReasonReject && !purchaseDetailsStates.reasonReject
                        })
                    }
                    placeholder={t("PleaseEnterReason")}
                    value={purchaseDetailsStates.reasonReject}
                    onChange={(e) => {
                        const { value } = e.target;
                        setPurchaseDetailsStates((prevStates) => ({
                            ...prevStates,
                            reasonReject: value
                        }));
                    }}
                />
                {
                    purchaseDetailsStates.showErrorReasonReject && !purchaseDetailsStates.reasonReject
                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                }
            </CommonConfirmDialog>
        </Container>
    );
};

export default PurchaseRequisitionDetails;
