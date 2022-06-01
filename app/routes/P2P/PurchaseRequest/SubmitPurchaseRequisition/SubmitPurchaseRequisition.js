/* eslint-disable max-len */
import React, { useState, useEffect, useRef, useMemo } from "react";
import useToast from "routes/hooks/useToast";
import { usePermission, useApprovalConfig } from "routes/hooks";
import StickyFooter from "components/StickyFooter";
import {
    Container, Row, Col, Button, ButtonToolbar
} from "components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
    BudgetDetails, Conversation, AddItemRequest, AddItemDialog, Overview
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
import EntitiesService from "services/EntitiesService";
import TaxRecordDataService from "services/TaxRecordService";
import ProjectService from "services/ProjectService/ProjectService";
import ProjectForecastService from "services/ProjectForecastService";
import PurchaseRequestService from "services/PurchaseRequestService/PurchaseRequestService";
import ConversationService from "services/ConversationService/ConversationService";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { useSelector } from "react-redux";
import _ from "lodash";
import CUSTOM_CONSTANTS, { FEATURE } from "helper/constantsDefined";
import {
    formatDisplayDecimal, convertToLocalTime,
    formatDateString, formatDateTime,
    clearNumber, convertDate2String,
    getCurrentCompanyUUIDByStore,
    itemAttachmentSchema,
    isNullOrUndefinedOrEmpty,
    roundNumberWithUpAndDown,
    parseNumber
} from "helper/utilities";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { useLocation } from "react-router-dom";
import ActionModal from "routes/components/ActionModal";
import CategoryService from "services/CategoryService/CategoryService";
import { HeaderMain } from "routes/components/HeaderMain";
import SupplierService from "services/SupplierService";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import {
    InitialSettingsComponent,
    SupplierInforComponent,
    GeneralInforComponent,
    RequestTermsComponent
} from "../EditPurchaseRequisitionDetails/components";
import {
    CatalogueItemPRColDefs,
    ForecastItemPRColDefs
} from "../ColumnDefs";
import { itemSchema } from "../validations/itemSchema";
import PR_ROUTES from "../route";
import convertActionAuditTrail from "../helper/utilities";
import UserService from "services/UserService";

const SubmitPurchaseRequisition = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const refActionModalCancel = useRef(null);
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const permission = usePermission(FEATURE.PR);
    const [purchaseDetailsStates, setPurchaseDetailsStates] = useState({
        loading: true,
        isEdit: true,
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
        listCategory: [],
        isPPR: false,
        listAllSuppliers: [],
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
        externalConversationLines: [],
        internalConversationLines: [],
        rowDataInternalConversation: [],
        rowDataExternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataItemReq: [],
        rowDataAuditTrail: [],
        subTotal: 0,
        tax: 0,
        total: 0,
        activeAuditTrailTab: 1,
        rowDataOverview: [],
        priceTypes: [
            { priceType: "FOC" },
            { priceType: "INCLUDED" },
            { priceType: "TO_ADVISE" },
            { priceType: "AS_PER_CONTRACT" }
        ]
    });
    const approvalConfig = useApprovalConfig(FEATURE.PR);

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

    const [showAddCatalogue, setShowAddCatalogue] = useState(false);
    const [selectedCatalogueItems, setSelectedCatalogueItems] = useState([]);
    const [showAddForecast, setShowAddForecast] = useState(false);
    const [selectedForecastItems, setSelectedForecastItems] = useState([]);
    const [listCatalogueBySupplier, setListCatalogueBySupplier] = useState([]);
    const [forecastItems, setForecastItems] = useState([]);
    const [forecastItemsOrigin, setForecastItemsOrigin] = useState([]);

    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

    const initialValues = {
        approvalConfig: false,
        project: false,
        projectCode: "",
        pprNumber: "",
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
            .when("approvalConfig", {
                is: true,
                then: Yup.string().required(t("PleaseSelectValidApprovalRoute"))
            }),
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

    const onSubmitPressHandler = async (values, saveAsDraft) => {
        setPristine();
        try {
            const {
                total,
                rowDataInternalConversation,
                rowDataExternalConversation,
                rowDataInternalAttachment,
                rowDataExternalAttachment,
                rowDataItemReq,
                companyUuid,
                purchaseUuid
            } = purchaseDetailsStates;
            const body = {};
            body.uuid = purchaseUuid;
            body.project = true;
            body.currencyCode = values.currencyCode;
            body.totalAmount = total;
            if (body.project === true) {
                purchaseDetailsStates.projects.forEach((item) => {
                    if (item.projectCode === values.projectCode) {
                        body.projectUuid = item.uuid;
                    }
                });
            }
            body.prTitle = values.prTitle;
            body.procurementType = values.procurementType;
            if (values.approvalRouteUuid) body.approvalRouteUuid = values.approvalRouteUuid;
            body.note = values.note;
            body.rfqProcess = false;
            body.rfqTreshold = 0;
            body.saveAsDraft = saveAsDraft;

            let addedConversation = rowDataInternalConversation.concat(rowDataExternalConversation);
            addedConversation = addedConversation.filter(
                (conversation) => conversation.isNew === true
            );

            await itemAttachmentSchema.validate(addedConversation);

            const addedPurchaseReqConversation = addedConversation.map(
                ({ uuid, isNew, ...rest }) => rest
            );
            body.addedPurchaseReqConversation = addedPurchaseReqConversation;

            const addedDocument = rowDataInternalAttachment.concat(rowDataExternalAttachment);
            const newlyAddedPurchaseReqDocuments = addedDocument.map(
                ({
                    uploadedTime, isNew, uploadedOn, fileLabel, attachment, uuid, ...rest
                }) => ({
                    ...rest,
                    fileLabel: fileLabel || attachment,
                    uploadedOn: uploadedTime || convertToLocalTime(uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                })
            );
            body.purchaseReqDocumentMetadata = newlyAddedPurchaseReqDocuments
                .filter((item) => (item.fileDescription || item.attachment || item.fileLabel || item.guid)
                    && !item.fileName);

            const itemRequests = rowDataItemReq.map(
                ({
                    uuid,
                    accountNumber,
                    address,
                    requestedDeliveryDate,
                    sourceCurrency,
                    taxCode,
                    taxRate,
                    uom,
                    supplierUuid,
                    exchangeRate,
                    itemQuantity,
                    inDocumentCurrencyAfterTax,
                    inDocumentCurrencyBeforeTax,
                    inSourceCurrencyBeforeTax,
                    taxAmountInDocumentCurrency,
                    itemCategory,
                    priceType,
                    ...rest
                }) => {
                    const item = ({
                        ...rest,
                        accountNumber: typeof (accountNumber) === "object" ? accountNumber?.accountNumber : accountNumber,
                        address: {
                            addressLabel: address?.addressLabel,
                            addressFirstLine: address?.addressFirstLine,
                            addressSecondLine: address?.addressSecondLine,
                            city: address?.city,
                            state: address?.state,
                            country: address?.country,
                            postalCode: address?.postalCode
                        },
                        requestedDeliveryDate: formatDateString(requestedDeliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
                        sourceCurrency: typeof (sourceCurrency) === "object" ? sourceCurrency?.currencyCode : sourceCurrency,
                        taxCode: typeof (taxCode) === "object" ? taxCode?.taxCode : taxCode,
                        taxRate: Number(taxRate),
                        uom: typeof (uom) === "object" ? uom?.uomCode : uom,
                        supplierUuid: supplierUuid
                            ? typeof (supplierUuid) === "object"
                                ? supplierUuid.uuid || supplierUuid.supplierUuid
                                : JSON.parse(supplierUuid).supplierUuid || JSON.parse(supplierUuid).uuid
                            : "",
                        itemCategory: itemCategory?.categoryName || itemCategory || purchaseDetailsStates.listCategory[0]?.categoryName,
                        exchangeRate: Number(exchangeRate || 0),
                        itemQuantity: Number(itemQuantity || 0),
                        priceType: typeof (priceType) === "object" ? (priceType?.priceType ?? "") : (priceType ?? "")
                    });

                    if (!item.address.addressLabel) delete item.address;
                    if (!item.requestedDeliveryDate) delete item.requestedDeliveryDate;
                    if (!item.sourceCurrency) delete item.sourceCurrency;
                    if (!item.taxCode) delete item.taxCode;
                    if (!item.uom) delete item.uom;
                    if (!item.supplierUuid) delete item.supplierUuid;
                    if (!item.accountNumber) delete item.accountNumber;

                    return item;
                }
            );
            await itemSchema.validate(itemRequests);

            body.purchaseReqItem = itemRequests;

            const response = await PurchaseRequestService.editDraftPurchaseRequisition(companyUuid, body);
            if (response.data.status === RESPONSE_STATUS.OK) {
                body.purchaseReqItem.forEach(async (item) => {
                    if (item.isManual) {
                        const bodyCategory = {
                            catalogueItemName: item.itemName,
                            catalogueItemCode: item.itemCode,
                            companyUuid,
                            uomCode: item.uom,
                            description: item.itemDescription,
                            unitPrice: item.itemUnitPrice ? Number(clearNumber(item.itemUnitPrice)) : 0,
                            isManual: true,
                            currencyCode: item.sourceCurrency,
                            itemSize: item.itemSize,
                            itemModel: item.itemModel,
                            itemBrand: item.itemBrand,
                            supplierName: item.supplierName,
                            supplierUuid: item.supplierUuid,
                            taxCode: item.taxCode,
                            taxRate: item.taxRate,
                            tradeCode: item.projectForecastTradeCode,
                            supplierCode: item.supplierCode,
                            glAccountNumber: item.accountNumber,
                            itemCategory: item?.itemCategory,
                            categoryDto: purchaseDetailsStates.listCategory
                                .filter((cat) => cat?.categoryName === item?.itemCategory)[0]
                        };
                        await CatalogueService.postCreateCatalogue(bodyCategory);
                    }
                });
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
            console.log("onSubmit", error);
            showToast("error", error.response ? error.response.data.message : error.message);
        }
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
            const catalogueItems = responseCatalogueItems.data.data.filter(
                (item) => item.manual === false && item.active === true
            );

            const responseProjects = await ManageProjectService.getCompanyProjectList(
                companyUuid
            );
            const projects = responseProjects.data.data.filter(
                (project) => project.projectStatus === "FORECASTED"
            ).sort(
                (a, b) => {
                    if (a.projectTitle < b.projectTitle) return -1;
                    if (a.projectTitle > b.projectTitle) return 1;
                    return 0;
                }
            );

            const responseCurrencies = await CurrenciesService.getCurrencies(
                companyUuid
            );
            const currencies = responseCurrencies.data.data.filter(
                (currency) => currency.active === true
            ).sort(
                (a, b) => {
                    if (a.currencyName < b.currencyName) return -1;
                    if (a.currencyName > b.currencyName) return 1;
                    return 0;
                }
            );

            const responseSuppliers = await ExtVendorService.getExternalVendors(
                companyUuid
            );
            const suppliers = responseSuppliers.data.data.sort(
                (a, b) => {
                    if (a.companyCode < b.companyCode) return -1;
                    if (a.companyCode > b.companyCode) return 1;
                    return 0;
                }
            );

            let responseApprovalRoutes = await ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                companyUuid, FEATURE.PR
            );
            responseApprovalRoutes = responseApprovalRoutes.data.data.filter((item) => item.active === true);
            const approvalRoutes = responseApprovalRoutes.sort(
                (a, b) => {
                    if (a.approvalName < b.approvalName) return -1;
                    if (a.approvalName > b.approvalName) return 1;
                    return 0;
                }
            );

            const responseAddresses = await AddressDataService.getCompanyAddresses(
                companyUuid
            );
            const addresses = responseAddresses.data.data.filter(
                (address) => address.active === true
            ).sort(
                (a, b) => {
                    if (a.addressLabel < b.addressLabel) return -1;
                    if (a.addressLabel > b.addressLabel) return 1;
                    return 0;
                }
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
            const purchaseDetails = responsePurchaseDetails.data.data;

            const listCategoryResponse = await CategoryService
                .getListCategory(companyUuid);
            const listCategory = listCategoryResponse.data.data.filter(
                (address) => address.active === true
            );
            listCategory.sort((a, b) => {
                const nameA = a.categoryName.toUpperCase(); // ignore upper and lowercase
                const nameB = b.categoryName.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                // names must be equal
                return 0;
            });

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
                if (resOverview.data.status === RESPONSE_STATUS.OK) {
                    const getAllItemsPerChildren = (item, parent) => {
                        const newItem = item;
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
                                (i) => getAllItemsPerChildren(i, item)
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
                companyUuid,
                catalogueItems,
                projects,
                currencies,
                suppliers,
                approvalRoutes,
                addresses,
                uoms: responseUOMs.data.data,
                glAccounts: responseGLAccounts.data.data,
                taxRecords,
                purchaseDetails,
                listCategory,
                isPPR: !!purchaseDetails.pprNumber,
                rowDataExternalConversation,
                rowDataInternalConversation,
                rowDataOverview: overview
            }));
            setListCatalogueBySupplier(catalogueItems);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const sendCommentConversation = async (comment, isInternal) => {
        setDirty();
        if (isInternal) {
            const internalConversationLines = [...purchaseDetailsStates.internalConversationLines];
            const { rowDataInternalConversation } = purchaseDetailsStates;
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
            setPurchaseDetailsStates((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = purchaseDetailsStates;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...purchaseDetailsStates.externalConversationLines];
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
        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation: newRowData,
            externalConversationLines
        }));
    };

    const addNewRowAttachment = (isInternal) => {
        setDirty();
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
        setDirty();
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

    const addItemReqManual = (values) => {
        setDirty();
        const { rowDataItemReq, addresses } = purchaseDetailsStates;
        let address;
        if (values.deliveryAddress) {
            address = addresses.find((item) => item.uuid === values.deliveryAddress);
        }
        const newRowData = [...rowDataItemReq];
        newRowData.push({
            uuid: uuidv4(),
            itemCode: "",
            itemName: "",
            itemDescription: "",
            itemModel: "",
            itemSize: "",
            itemBrand: "",
            supplierName: "",
            supplierUuid: "",
            sourceCurrency: "",
            uom: "",
            itemUnitPrice: 0,
            itemQuantity: 0,
            taxCode: "",
            taxRate: 0,
            exchangeRate: 1,
            address: address || addresses[0],
            requestedDeliveryDate: values.deliveryDate
                ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
            accountNumber: "",
            note: "",
            projectForecastTradeCode: "",
            manualItem: true,
            isManual: true,
            itemCategory: purchaseDetailsStates.listCategory[0]?.categoryName
        });
        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            rowDataItemReq: newRowData
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
            const data = rowData.find((row) => row.uuid === uuid);
            let newCatalogueItems = [...listCatalogueBySupplier];
            if (newCatalogueItems.length > 0) {
                const dataSupplierCode = data?.supplierUuid?.companyCode ?? "";
                const dataSourceCurrency = data?.sourceCurrency?.currencyCode ?? "";
                const dataCatalogueItemCode = data?.itemCode ?? "";
                newCatalogueItems = newCatalogueItems.map(
                    (item) => {
                        const catalogueItemCode = item?.catalogueItemCode ?? "";
                        const currencyCode = item?.currencyCode ?? "";
                        const supplierCode = item?.supplierCode ?? "";
                        if (catalogueItemCode === dataCatalogueItemCode
                            && currencyCode === dataSourceCurrency
                            && supplierCode === dataSupplierCode
                        ) {
                            return { ...item, isSelected: false };
                        }
                        return item;
                    }
                );
            }
            let newForecastItems = [...forecastItems];
            if (newForecastItems.length > 0) {
                const dataSupplierCode = data?.supplierUuid?.companyCode ?? "";
                const dataSourceCurrency = data?.sourceCurrency?.currencyCode ?? "";
                const dataCatalogueItemCode = data?.itemCode ?? "";
                newForecastItems = newForecastItems.map(
                    (item) => {
                        const catalogueItemCode = item?.catalogueItemCode ?? "";
                        const currencyCode = item?.currencyCode ?? "";
                        const supplierCode = item?.supplierCode ?? "";
                        if (catalogueItemCode === dataCatalogueItemCode
                            && currencyCode === dataSourceCurrency
                            && supplierCode === dataSupplierCode
                        ) {
                            return { ...item, isSelected: false };
                        }
                        return item;
                    }
                );
            }
            const newRowData = rowData.filter((row) => row.uuid !== uuid);
            setPurchaseDetailsStates((prevStates) => ({
                ...prevStates,
                rowDataItemReq: newRowData
            }));
            setListCatalogueBySupplier(newCatalogueItems);
            setForecastItems(newForecastItems);
        }
    }, [itemDelete.uuid]);

    const onEditRowAddItemReq = async (params) => {
        setDirty();
        const { data, colDef, newValue } = params;
        const { field } = colDef;
        const { rowDataItemReq } = purchaseDetailsStates;
        const newRowData = [...rowDataItemReq];
        if (field === "supplierUuid") {
            // if (purchaseDetailsStates.isPPR) {
            const newValueSuppliers = newValue ? JSON.parse(newValue) : {};
            if (newValue) {
                let exchangeRate = 0;
                purchaseDetailsStates.currencies.forEach((item) => {
                    if (item.currencyCode === newValueSuppliers?.currency) {
                        exchangeRate = item.exchangeRate;
                    }
                });
                const res = await SupplierService
                    .retrieveSuppliersDetails(purchaseDetailsStates.companyUuid, newValueSuppliers.supplierUuid ? newValueSuppliers.supplierUuid : newValueSuppliers.uuid);
                const supplierDetail = res.data.data;
                rowDataItemReq.forEach((rowData, index) => {
                    if (rowData.uuid === data.uuid) {
                        newRowData[index] = data;
                        newRowData[index].supplierName = newValueSuppliers.supplierName ? newValueSuppliers.supplierName : newValueSuppliers.companyName;
                        newRowData[index].sourceCurrency = newValueSuppliers.currency ? newValueSuppliers.currency : "";
                        newRowData[index].exchangeRate = exchangeRate;
                        newRowData[index].accountNumber = newValueSuppliers.glAccount ? newValueSuppliers.glAccount : "";
                        newRowData[index].itemUnitPrice = newValueSuppliers.unitPrice ? newValueSuppliers.unitPrice : "";
                        newRowData[index].uom = newValueSuppliers.uom ? newValueSuppliers.uom : "";
                        newRowData[index].taxCode = supplierDetail.tax ? purchaseDetailsStates.taxRecords.filter((tax) => (tax.taxCode === supplierDetail.tax.taxCode))[0] : "";
                        newRowData[index].taxRate = supplierDetail.tax ? supplierDetail.tax.taxRate : "";
                        newRowData[index].inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(data.itemQuantity * data.itemUnitPrice);
                        newRowData[index].inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(newRowData[index].inSourceCurrencyBeforeTax * data.exchangeRate);
                        newRowData[index].taxAmountInDocumentCurrency = roundNumberWithUpAndDown((newRowData[index].taxRate * newRowData[index].inDocumentCurrencyBeforeTax) / 100);
                        newRowData[index].inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency);
                    }
                });
            }
            // } else {
            //     rowDataItemReq.forEach((rowData, index) => {
            //         if (rowData.uuid === data.uuid) {
            //             newRowData[index] = data;
            //             newRowData[index].supplierName = newValue.companyName;
            //             newRowData[index].inSourceCurrencyBeforeTax = (data.itemQuantity || 0) * (data.itemUnitPrice || 0);
            //             newRowData[index].inDocumentCurrencyBeforeTax = newRowData[index].inSourceCurrencyBeforeTax * (data.exchangeRate || 0);
            //             newRowData[index].taxAmountInDocumentCurrency = ((newRowData[index].taxRate || 0) * newRowData[index].inDocumentCurrencyBeforeTax) / 100;
            //             newRowData[index].inDocumentCurrencyAfterTax = newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency;
            //         }
            //     });
            // }
        } else if (field === "taxCode") {
            rowDataItemReq.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].taxRate = newValue?.taxRate || 0;
                    newRowData[index].inSourceCurrencyBeforeTax = roundNumberWithUpAndDown((data.itemQuantity || 0) * (data.itemUnitPrice || 0));
                    newRowData[index].inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(newRowData[index].inSourceCurrencyBeforeTax * (data.exchangeRate || 0));
                    newRowData[index].taxAmountInDocumentCurrency = roundNumberWithUpAndDown(((newRowData[index].taxRate || 0) * newRowData[index].inDocumentCurrencyBeforeTax) / 100);
                    newRowData[index].inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency);
                }
            });
        } else if (field === "sourceCurrency") {
            const { sourceCurrency } = data;
            const { exchangeRate } = sourceCurrency;

            rowDataItemReq.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].exchangeRate = exchangeRate;
                    newRowData[index].inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(data.itemQuantity * data.itemUnitPrice);
                    newRowData[index].inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(newRowData[index].inSourceCurrencyBeforeTax * data.exchangeRate);
                    newRowData[index].taxAmountInDocumentCurrency = roundNumberWithUpAndDown((newRowData[index].taxRate * newRowData[index].inDocumentCurrencyBeforeTax) / 100);
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

        if (field === "itemUnitPrice") {
            rowDataItemReq.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].firstTime = true;
                    newRowData[index].priceType = null;
                    newRowData[index].inSourceCurrencyBeforeTax = roundNumberWithUpAndDown((data.itemQuantity || 0) * (data.itemUnitPrice || 0));
                    newRowData[index].inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(newRowData[index].inSourceCurrencyBeforeTax * (data.exchangeRate || 0));
                    newRowData[index].taxAmountInDocumentCurrency = roundNumberWithUpAndDown(((newRowData[index].taxRate || 0) * newRowData[index].inDocumentCurrencyBeforeTax) / 100);
                    newRowData[index].inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency);
                }
            });
        }
        if (field === "priceType") {
            rowDataItemReq.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    if (!isNullOrUndefinedOrEmpty(rowData?.priceType?.priceType)) {
                        newRowData[index].itemUnitPrice = 0;
                        newRowData[index].inSourceCurrencyBeforeTax = roundNumberWithUpAndDown((data.itemQuantity || 0) * (data.itemUnitPrice || 0));
                        newRowData[index].inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(newRowData[index].inSourceCurrencyBeforeTax * (data.exchangeRate || 0));
                        newRowData[index].taxAmountInDocumentCurrency = roundNumberWithUpAndDown(((newRowData[index].taxRate || 0) * newRowData[index].inDocumentCurrencyBeforeTax) / 100);
                        newRowData[index].inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency);
                    }
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

    const onChangeProject = async (e, setFieldValue) => {
        setDirty();
        const { value } = e.target;
        const { companyUuid } = purchaseDetailsStates;
        setFieldValue("projectCode", value);

        try {
            const response = await ProjectService.getProjectDetails(value);
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const { projectAddressDto } = data;
                setFieldValue("deliveryAddress", projectAddressDto.uuid);
                setFieldValue("currencyCode", data.currency);
            } else {
                showToast("error", response.data.message);
            }

            const responseForecastDetail = await ProjectForecastService.getProjectForecastDetail(companyUuid, value);
            if (responseForecastDetail.data.status === RESPONSE_STATUS.OK) {
                const { data } = responseForecastDetail.data;
                const {
                    overallBudget,
                    projectCode,
                    projectTitle,
                    currency,
                    projectForecastTradeDetailsDtoList
                } = data;
                const listForecastItem = [];
                const rowDataProject = [];
                const rowDataTrade = [];
                let rowDataItem = [];

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

                        // list forecast
                        const forecastItem = {};
                        forecastItem.itemCategory = element.categoryName;
                        forecastItem.catalogueItemCode = element.itemCode;
                        forecastItem.catalogueItemName = element.itemName;
                        forecastItem.description = element.itemDescription;
                        forecastItem.itemModel = element.itemModel;
                        forecastItem.itemSize = element.itemSize;
                        forecastItem.itemBrand = element.itemBrand;
                        forecastItem.projectForecastTradeCode = tradeCode;
                        forecastItem.uomCode = element.uom;
                        forecastItem.forecastedQty = element.itemQuantity;
                        forecastItem.currencyCode = element.sourceCurrency;
                        forecastItem.forecastedPrice = element.itemUnitPrice;
                        forecastItem.exchangeRate = element.exchangeRate;
                        forecastItem.forecasted = true;
                        forecastItem.uomForecasted = element.uom;
                        listForecastItem.push(forecastItem);
                    });
                    rowDataItem = rowDataItem.concat(listItems);

                    const trade = {};
                    trade.code = tradeCode;
                    trade.name = tradeTitle;
                    trade.tradeDescription = tradeDescription;
                    trade.currency = rowDataItem[0]?.currency ?? currency ?? "";
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

                const newListForecastItem = listCatalogueBySupplier;
                newListForecastItem.forEach((item, index) => {
                    const itemForecast = listForecastItem.find(
                        (forecast) => forecast.catalogueItemCode === item.catalogueItemCode
                    );
                    if (itemForecast) {
                        newListForecastItem[index].projectForecastTradeCode = itemForecast.projectForecastTradeCode;
                        newListForecastItem[index].exchangeRate = itemForecast.exchangeRate;
                        newListForecastItem[index].forecasted = true;
                        newListForecastItem[index].forecastedPrice = itemForecast.forecastedPrice;
                        newListForecastItem[index].forecastedQty = itemForecast.forecastedQty;
                        newListForecastItem[index].uomForecasted = itemForecast.uomForecasted;
                    }
                });
                setForecastItems(newListForecastItem);
                setForecastItemsOrigin(newListForecastItem);
                setPurchaseDetailsStates((prevStates) => ({
                    ...prevStates,
                    rowDataProject,
                    rowDataTrade,
                    rowDataItem
                }));
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onChangeApprovalRoute = async (e, setFieldValue) => {
        setDirty();
        const { value } = e.target;
        setFieldValue("approvalRouteUuid", value);
    };

    const calcBudgetDetails = async (projectCode, listCatalogue) => {
        const { companyUuid } = purchaseDetailsStates;
        let responseSpecialCatalogue;
        let responseForecastDetail;
        try {
            responseSpecialCatalogue = await CatalogueService.getSpecialCatalogue(companyUuid, projectCode, listCatalogue);
        } catch (error) {
            console.log(error);
        }
        try {
            responseForecastDetail = await ProjectForecastService.getProjectForecastDetail(companyUuid, projectCode);
        } catch (error) {
            console.log(error);
        }

        const specialCatalogue = responseSpecialCatalogue?.data?.data || [];
        const rowDataProject = [];
        const rowDataTrade = [];
        let rowDataItem = [];
        const listForecastItem = [];
        if (responseForecastDetail?.data?.status === RESPONSE_STATUS.OK) {
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
                    item.tradeCode = tradeCode;

                    listItems.push(item);

                    const forecastItem = {};
                    forecastItem.itemCategory = element.categoryName;
                    forecastItem.catalogueItemCode = element.itemCode;
                    forecastItem.catalogueItemName = element.itemName;
                    forecastItem.description = element.itemDescription;
                    forecastItem.itemModel = element.itemModel;
                    forecastItem.itemSize = element.itemSize;
                    forecastItem.itemBrand = element.itemBrand;
                    forecastItem.projectForecastTradeCode = tradeCode;
                    forecastItem.uomCode = element.uom;
                    forecastItem.forecastedQty = element.itemQuantity;
                    forecastItem.currencyCode = element.sourceCurrency;
                    forecastItem.forecastedPrice = element.itemUnitPrice;
                    forecastItem.exchangeRate = element.exchangeRate;
                    forecastItem.forecasted = true;
                    listForecastItem.push(forecastItem);
                });
                rowDataItem = rowDataItem.concat(listItems);

                const trade = {};
                trade.code = tradeCode;
                trade.name = tradeTitle;
                trade.tradeDescription = tradeDescription;
                trade.currency = rowDataItem[0]?.currency ?? currency ?? "";
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
            rowDataItem,
            listForecastItem,
            specialCatalogue
        };
    };

    const getSpecialCatalogue = async (companyUuid, projectCode, listCatalogue) => {
        const responseSpecialCatalogue = await CatalogueService.getSpecialCatalogue(companyUuid, projectCode, listCatalogue);
        const specialCatalogue = responseSpecialCatalogue.data.data;
        return specialCatalogue;
    };

    const onAddNewItemForecast = (values) => {
        setDirty();
        const {
            rowDataItemReq, addresses
        } = purchaseDetailsStates;
        const newForecastItems = [...forecastItems];
        let address;
        if (values.deliveryAddress) {
            address = addresses.find((item) => item.uuid === values.deliveryAddress);
        }
        const newRowData = [...rowDataItemReq];
        setShowAddForecast(false);
        selectedForecastItems.forEach((node) => {
            const { data } = node;
            newForecastItems.forEach(
                (item, index) => {
                    if (item.catalogueItemCode === data.catalogueItemCode
                        && item.supplierCode === data.supplierCode
                        && item.currencyCode === data.currencyCode
                    ) {
                        newForecastItems[index].isSelected = true;
                    }
                }
            );

            const sourceCurrency = purchaseDetailsStates.currencies.find(
                (item) => item.currencyCode.toLowerCase() === data.currencyCode.toLowerCase()
            );

            let exchangeRate = 0;
            if (sourceCurrency) {
                exchangeRate = sourceCurrency.exchangeRate;
            }
            const itemRequest = {
                uuid: uuidv4(),
                itemCode: data.catalogueItemCode,
                itemName: data.catalogueItemName,
                itemDescription: data.description,
                itemModel: data.itemModel || "",
                itemSize: data.itemSize || "",
                itemBrand: data.itemBrand || "",
                uom: purchaseDetailsStates.uoms.find(
                    (item) => item.uomCode.toLowerCase() === data.uomCode.toLowerCase()
                ),
                itemQuantity: data.itemQuantity,
                sourceCurrency,
                editableCurrency: !sourceCurrency,
                itemUnitPrice: data.unitPrice,
                editableUnitPrice: !Number(data.unitPrice),
                exchangeRate,
                editableExchangeRate: !Number(exchangeRate),
                taxCode: purchaseDetailsStates.taxRecords.find(
                    (item) => item.taxCode.toLowerCase() === data.taxCode?.toLowerCase()
                ),
                taxRate: data.taxRate,
                supplierName: data.supplierName || "",
                supplierUuid: data.supplierCode
                    ? purchaseDetailsStates.suppliers.find(
                        (item) => item.companyCode === data.supplierCode
                    ) : "",
                note: "",
                address: address || addresses[0],
                requestedDeliveryDate: values.deliveryDate
                    ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                    : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
                accountNumber: purchaseDetailsStates.glAccounts.find(
                    (item) => item.accountNumber === data.glAccountNumber
                ),
                itemCategory: {
                    categoryName: data.itemCategory
                },
                projectForecastTradeCode: data.tradeCode,
                uomForecast: data.uomForecasted,
                unitPriceForecasted: data.forecastedPrice
            };

            itemRequest.inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(data.itemQuantity * data.itemUnitPrice);
            itemRequest.inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(itemRequest.inSourceCurrencyBeforeTax * data.exchangeRate);
            itemRequest.taxAmountInDocumentCurrency = roundNumberWithUpAndDown((itemRequest.taxRate * itemRequest.inDocumentCurrencyBeforeTax) / 100);
            itemRequest.inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(itemRequest.inDocumentCurrencyBeforeTax + itemRequest.taxAmountInDocumentCurrency);
            newRowData.push(itemRequest);
        });
        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            rowDataItemReq: newRowData
        }));
        setSelectedForecastItems([]);
        setForecastItems(newForecastItems);

        // if (purchaseDetailsStates.isPPR) {
        const listCatalogue = newRowData.map((item) => item.itemCode);
        getSpecialCatalogue(purchaseDetailsStates.companyUuid, "", listCatalogue).then((specialCatalogue) => {
            setPurchaseDetailsStates((prevStates) => ({
                ...prevStates,
                listAllSuppliers: specialCatalogue
            }));
        });
        // }
    };

    const onAddNewItemCatalogue = (values) => {
        setDirty();
        const { rowDataItemReq, addresses } = purchaseDetailsStates;
        const newCatalogueItems = [...listCatalogueBySupplier];
        let address;
        if (values.deliveryAddress) {
            address = addresses.find((item) => item.uuid === values.deliveryAddress);
        }
        const newRowData = [...rowDataItemReq];
        setShowAddCatalogue(false);
        selectedCatalogueItems.forEach((node) => {
            const { data } = node;
            newCatalogueItems.forEach(
                (item, index) => {
                    if (item.catalogueItemCode === data.catalogueItemCode
                        && item.supplierCode === data.supplierCode
                        && item.currencyCode === data.currencyCode
                    ) {
                        newCatalogueItems[index].isSelected = true;
                    }
                }
            );
            const sourceCurrency = purchaseDetailsStates.currencies.find(
                (item) => item.currencyCode.toLowerCase() === data.currencyCode.toLowerCase()
            );

            let exchangeRate = 0;
            if (sourceCurrency) {
                exchangeRate = sourceCurrency.exchangeRate;
            }

            const itemRequest = {
                uuid: uuidv4(),
                itemCode: data.catalogueItemCode,
                itemName: data.catalogueItemName,
                itemDescription: data.description,
                itemModel: data.itemModel || "",
                itemSize: data.itemSize || "",
                itemBrand: data.itemBrand || "",
                uom: purchaseDetailsStates.uoms.find(
                    (item) => item.uomCode.toLowerCase() === data.uomCode.toLowerCase()
                ),
                itemQuantity: data.itemQuantity,
                sourceCurrency,
                editableCurrency: !sourceCurrency,
                itemUnitPrice: data.unitPrice,
                editableUnitPrice: !Number(data.unitPrice),
                exchangeRate,
                editableExchangeRate: !Number(exchangeRate),
                taxCode: purchaseDetailsStates.taxRecords.find(
                    (item) => item.taxCode.toLowerCase() === data.taxCode?.toLowerCase()
                ),
                taxRate: data.taxRate,
                supplierName: data.supplierName || "",
                supplierUuid: data.supplierCode
                    ? purchaseDetailsStates.suppliers.find(
                        (item) => item.companyCode === data.supplierCode
                    ) : "",
                note: "",
                address: address || addresses[0],
                requestedDeliveryDate: values.deliveryDate
                    ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                    : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
                accountNumber: purchaseDetailsStates.glAccounts.find(
                    (item) => item.accountNumber === data.glAccountNumber
                ),
                itemCategory: {
                    categoryName: data.itemCategory
                }
            };

            itemRequest.inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(data.itemQuantity * data.itemUnitPrice);
            itemRequest.inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(itemRequest.inSourceCurrencyBeforeTax * data.exchangeRate);
            itemRequest.taxAmountInDocumentCurrency = roundNumberWithUpAndDown((itemRequest.taxRate * itemRequest.inDocumentCurrencyBeforeTax) / 100);
            itemRequest.inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(itemRequest.inDocumentCurrencyBeforeTax + itemRequest.taxAmountInDocumentCurrency);
            newRowData.push(itemRequest);
        });
        setPurchaseDetailsStates((prevStates) => ({
            ...prevStates,
            rowDataItemReq: newRowData
        }));
        setSelectedCatalogueItems([]);
        setSelectedCatalogueItems(newCatalogueItems);

        // if (purchaseDetailsStates.isPPR) {
        const listCatalogue = newRowData.map((item) => item.itemCode);
        getSpecialCatalogue(purchaseDetailsStates.companyUuid, "", listCatalogue).then((specialCatalogue) => {
            newRowData.forEach((item) => {
                specialCatalogue.forEach((cat) => {
                    if (item.supplierUuid) {
                        if (item.itemCode === cat.itemCode) {
                            cat.suppliers.forEach((sup) => {
                                if (item.supplierUuid.uuid === sup.supplierUuid) {
                                    item.supplierUuid = {
                                        ...sup,
                                        uuid: sup.supplierUuid,
                                        companyCode: sup.unitPrice ? `${sup.supplierName} - ${sup.currency || ""} ${sup.unitPrice || ""}/${sup.uom || ""}` : sup.supplierName,
                                        companyName: sup.supplierName
                                    };
                                }
                            });
                        }
                    }
                });
            });
            setPurchaseDetailsStates((prevStates) => ({
                ...prevStates,
                listAllSuppliers: specialCatalogue
            }));
        });
        // }
    };

    const onCancelPressHandler = async () => {
        setPristine();
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

            await itemAttachmentSchema.validate(addedConversation);

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

    const getAttachmentList = (isExternal) => {
        const attachments = purchaseDetailsStates.purchaseDetails.purchaseReqDocumentMetadata.filter(
            (attachment) => attachment.externalDocument === isExternal
        );
        return attachments.map(({ uploadOn, uploadedOn, ...rest }) => ({
            ...rest,
            uploadedTime: uploadOn || uploadedOn,
            uploadedOn: convertToLocalTime(uploadOn || uploadedOn)
        }));
    };

    const getDataFunc = async (query) => {
        try {
            const response = await CatalogueService.getCataloguesV2(
                UserService.getCurrentCompanyUuid(), query
            );
            return response?.data?.data;
        } catch (error) {
            showToast(
                "error",
                error.response
                    ? `getDataFunc: ${error.response.data.message}`
                    : `getDataFunc: ${error.message}`
            );
        }
        return [];
    };

    const backendServerConfigForecast = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (query) => getDataFunc({ ...query, project: purchaseDetailsStates.projectCode })
    }), [purchaseDetailsStates.projectCode]);

    const backendServerConfigCatalogue = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (query) => getDataFunc(query)
    }), []);

    return (
        <Container fluid>
            <HeaderMain
                title={t("PurchaseRequestDetails")}
                className="mb-2"
            />
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue, dirty, setTouched
                }) => {
                    useEffect(() => {
                        if (approvalConfig) setFieldValue("approvalConfig", approvalConfig);
                    }, [approvalConfig]);

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
                        if (
                            purchaseDetailsStates.purchaseDetails
                            && (permission?.read || permission?.write || permission?.approve)
                        ) {
                            const isEdit = permission?.write && permission?.read
                                && purchaseDetailsStates.purchaseDetails?.prCreator;

                            const {
                                purchaseDetails,
                                addresses,
                                glAccounts,
                                currencies,
                                suppliers,
                                taxRecords,
                                catalogueItems,
                                uoms,
                                purchaseUuid
                            } = purchaseDetailsStates;
                            const { purchaseReqItem } = purchaseDetails;
                            setFieldValue("purchaseUuid", purchaseUuid);
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
                            setFieldValue("submittedDate",
                                purchaseDetails.submittedDate
                                    ? convertToLocalTime(purchaseDetails.submittedDate)
                                    : "");
                            if (purchaseReqItem.length) {
                                setFieldValue("deliveryAddress", addresses.find(
                                    (item) => item.addressLabel === purchaseReqItem[0]?.address.addressLabel
                                )?.uuid ?? "");
                                setFieldValue("deliveryDate",
                                    formatDateTime(purchaseReqItem[0]?.requestedDeliveryDate, CUSTOM_CONSTANTS.YYYYMMDD));
                            }
                            setFieldValue("note", purchaseDetails.note || purchaseDetails.pprNote || "");

                            const rowDataItemReq = purchaseReqItem.map(
                                ({
                                    address,
                                    accountNumber,
                                    sourceCurrency,
                                    supplierUuid,
                                    taxCode,
                                    uom,
                                    requestedDeliveryDate,
                                    itemUnitPrice,
                                    ...res
                                }) => {
                                    const itemReq = {
                                        ...res,
                                        address: addresses.find(
                                            (item) => item.addressLabel === address.addressLabel
                                        ) ?? address,
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
                                        priceType: { priceType: res?.priceType },
                                        requestedDeliveryDate: formatDateTime(requestedDeliveryDate, CUSTOM_CONSTANTS.YYYYMMDD),
                                        itemUnitPrice: itemUnitPrice || 0,
                                        uuid: uuidv4()
                                    };

                                    itemReq.inSourceCurrencyBeforeTax = roundNumberWithUpAndDown((itemReq.itemQuantity || 0) * (itemReq.itemUnitPrice || 0));
                                    itemReq.inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(itemReq.inSourceCurrencyBeforeTax * (itemReq.exchangeRate || 0));
                                    itemReq.taxAmountInDocumentCurrency = roundNumberWithUpAndDown(((itemReq.taxRate || 0) * itemReq.inDocumentCurrencyBeforeTax) / 100);
                                    itemReq.inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(itemReq.inDocumentCurrencyBeforeTax + itemReq.taxAmountInDocumentCurrency);
                                    return itemReq;
                                }
                            );

                            const newCatalogueItems = [...catalogueItems];
                            rowDataItemReq.forEach(
                                (item) => {
                                    const { itemCode } = item;
                                    newCatalogueItems.forEach(
                                        (element, index) => {
                                            if (element.catalogueItemCode === itemCode) {
                                                newCatalogueItems[index].isSelected = true;
                                            }
                                        }
                                    );
                                }
                            );
                            const listCatalogue = rowDataItemReq.map((item) => item.itemCode);
                            if (purchaseDetails.project) {
                                setFieldValue("projectCode", purchaseDetails.projectCode);
                                calcBudgetDetails(purchaseDetails.projectCode, listCatalogue).then((data) => {
                                    const {
                                        rowDataProject,
                                        rowDataTrade,
                                        rowDataItem,
                                        listForecastItem,
                                        specialCatalogue
                                    } = data;
                                    const newForecastItems = [...newCatalogueItems];
                                    newForecastItems.forEach((item, index) => {
                                        const itemForecast = listForecastItem.find(
                                            (forecast) => forecast.catalogueItemCode === item.catalogueItemCode
                                        );
                                        if (itemForecast) {
                                            newForecastItems[index].projectForecastTradeCode = itemForecast.projectForecastTradeCode;
                                            newForecastItems[index].exchangeRate = itemForecast.exchangeRate;
                                            newForecastItems[index].forecasted = true;
                                            newForecastItems[index].forecastedPrice = itemForecast.forecastedPrice;
                                            newForecastItems[index].forecastedQty = itemForecast.forecastedQty;
                                            newForecastItems[index].uomForecasted = itemForecast.uomCode;
                                        }
                                    });
                                    // if (purchaseDetailsStates.isPPR) {
                                    const returnExchangeRate = (value) => {
                                        let exchangeRate = 0;
                                        purchaseDetailsStates.currencies.forEach((currency) => {
                                            if (currency.currencyCode === value) {
                                                exchangeRate = currency.exchangeRate;
                                            }
                                        });
                                        return exchangeRate;
                                    };
                                    rowDataItemReq.forEach((item) => {
                                        rowDataItem.forEach((value) => {
                                            if (item.itemCode === value.code) {
                                                item.uomForecast = value.uom;
                                                item.unitPriceForecasted = value.unitPrice;
                                                item.projectForecastTradeCode = value.tradeCode;
                                                item.sourceCurrency = value.currency;
                                                item.exchangeRate = returnExchangeRate(value.currency);
                                            }
                                        });
                                    });
                                    // }

                                    rowDataItemReq.forEach(
                                        (item) => {
                                            specialCatalogue.forEach((cat) => {
                                                if (cat.itemCode === item.itemCode) {
                                                    cat.suppliers.forEach((sup) => {
                                                        if (sup.supplierUuid === item?.supplierUuid?.uuid) {
                                                            item.supplierUuid = {
                                                                ...sup,
                                                                companyCode: sup.unitPrice ? `${sup.supplierName} - ${sup.currency || ""} ${formatDisplayDecimal(Number(sup.unitPrice), 2) || ""}/${sup.uom || ""}` : sup.supplierName
                                                            };
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    );
                                    setPurchaseDetailsStates((prevStates) => ({
                                        ...prevStates,
                                        rowDataProject,
                                        rowDataTrade,
                                        rowDataItem,
                                        listAllSuppliers: specialCatalogue,
                                        rowDataItemReq
                                    }));
                                    setForecastItems(newForecastItems);
                                    setForecastItemsOrigin(newForecastItems.map((item) => ({ ...item, isSelected: false })));
                                });
                            } else {
                                const isPRViewer = permission?.read && !permission?.write && !permission?.approve;
                                if (!isPRViewer) {
                                    getSpecialCatalogue(purchaseDetailsStates.companyUuid, "", listCatalogue).then((specialCatalogue) => {
                                        rowDataItemReq.forEach(
                                            (item) => {
                                                specialCatalogue.forEach((cat) => {
                                                    if (cat.itemCode === item.itemCode) {
                                                        cat.suppliers.forEach((sup) => {
                                                            if (sup.supplierUuid === item?.supplierUuid?.uuid) {
                                                                item.supplierUuid = {
                                                                    ...sup,
                                                                    companyCode: sup.unitPrice ? `${sup.supplierName} - ${sup.currency || ""} ${formatDisplayDecimal(Number(sup.unitPrice), 2) || ""}/${sup.uom || ""}` : sup.supplierName
                                                                };
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        );
                                        setPurchaseDetailsStates((prevStates) => ({
                                            ...prevStates,
                                            listAllSuppliers: specialCatalogue,
                                            rowDataItemReq
                                        }));
                                    }).catch((error) => {
                                        setPurchaseDetailsStates((prevStates) => ({
                                            ...prevStates,
                                            rowDataItemReq
                                        }));
                                        showToast("error", error.response ? error.response.data.message : error.message);
                                    });
                                } else {
                                    setPurchaseDetailsStates((prevStates) => ({
                                        ...prevStates,
                                        rowDataItemReq
                                    }));
                                }
                            }

                            const listSupplier = [];
                            rowDataItemReq.forEach((element) => {
                                const { supplierUuid } = element;
                                if (supplierUuid) {
                                    const { uuid } = supplierUuid;
                                    if (supplierUuid && !listSupplier.find((item) => item.uuid === uuid)) {
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
                            const total = roundNumberWithUpAndDown(subTotal + tax);

                            const rowDataAuditTrail = purchaseDetails.purchaseReqAuditTrailDto
                                .map(
                                    ({ action, dateTime, ...item }) => ({
                                        ...item,
                                        date: convertToLocalTime(dateTime),
                                        action: convertActionAuditTrail(action),
                                        role: item.userRole
                                    })
                                );

                            setPurchaseDetailsStates((prevStates) => ({
                                ...prevStates,
                                loading: false,
                                rowDataInternalAttachment: getAttachmentList(false),
                                rowDataExternalAttachment: getAttachmentList(true),
                                rowDataAuditTrail,
                                subTotal,
                                tax,
                                total,
                                catalogueItems: newCatalogueItems,
                                isEdit
                            }));
                        }
                    }, [permission, purchaseDetailsStates.purchaseDetails]);

                    useEffect(() => {
                        if (values.purchaseUuid) {
                            setTouched({
                                ...touched,
                                supplierCode: true,
                                approvalRouteUuid: !!values.approvalRouteUuid,
                                currencyCode: true,
                                deliveryAddress: true,
                                deliveryDate: true,
                                prTitle: true,
                                procurementType: true
                            });
                        }
                    }, [values]);

                    useEffect(() => {
                        if (values.supplierCode.length > 0) {
                            const { catalogueItems } = purchaseDetailsStates;
                            const supplierCodes = values.supplierCode.map((item) => item.companyCode);
                            const listCatalogue = catalogueItems.filter((item) => !item.supplierCode
                                || supplierCodes.includes(item.supplierCode));
                            const listForecastBySupplier = forecastItemsOrigin.filter((item) => !item.supplierCode
                                || supplierCodes.includes(item.supplierCode));
                            setListCatalogueBySupplier(listCatalogue);
                            setForecastItems(listForecastBySupplier);
                        } else {
                            setListCatalogueBySupplier(purchaseDetailsStates.catalogueItems);
                            setForecastItems(forecastItemsOrigin);
                        }
                    }, [values.supplierCode]);

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
                                                currencies={purchaseDetailsStates.currencies}
                                                projects={purchaseDetailsStates.projects}
                                                onChangeProject={(e) => onChangeProject(e, setFieldValue)}
                                                disabled
                                                isConvertPPR
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
                                                disabled={!purchaseDetailsStates.isEdit}
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
                                                disabled={!purchaseDetailsStates.isEdit}
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
                                                disabled={!purchaseDetailsStates.isEdit}
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

                            <ButtonToolbar className="justify-content-end mb-2">
                                <Button
                                    color="primary"
                                    onClick={() => {
                                        if (!values.project) setShowAddCatalogue(true);
                                        else setShowAddForecast(true);
                                    }}
                                    className="mr-1"
                                    disabled={!purchaseDetailsStates.isEdit}
                                >
                                    <span className="mr-1">+</span>
                                    <span>{t("AddCatalogue")}</span>
                                </Button>
                                <Button
                                    color="primary"
                                    onClick={() => addItemReqManual(values)}
                                    className="mr-1"
                                    disabled={!purchaseDetailsStates.isEdit}
                                >
                                    <span className="mr-1">+</span>
                                    <span>{t("AddManual")}</span>
                                </Button>
                            </ButtonToolbar>

                            <Row className="mb-2">
                                <Col xs={12}>
                                    <AddItemRequest
                                        rowDataItemReq={purchaseDetailsStates.rowDataItemReq}
                                        onDeleteItem={(uuid, rowData) => onDeleteItemReq(uuid, rowData)}
                                        suppliers={values.supplierCode.length > 0
                                            ? values.supplierCode
                                            : purchaseDetailsStates.suppliers}
                                        uoms={purchaseDetailsStates.uoms}
                                        currencies={purchaseDetailsStates.currencies}
                                        addresses={purchaseDetailsStates.addresses}
                                        glAccounts={purchaseDetailsStates.glAccounts}
                                        taxRecords={purchaseDetailsStates.taxRecords}
                                        onCellValueChanged={(params) => onEditRowAddItemReq(params)}
                                        gridHeight={350}
                                        disabled={!purchaseDetailsStates.isEdit}
                                        isProject={values.project}
                                        // convertPPR2PR={purchaseDetailsStates.isPPR}
                                        convertPPR2PR
                                        listAllSuppliers={purchaseDetailsStates.listAllSuppliers}
                                        listCategory={purchaseDetailsStates.listCategory}
                                        priceTypes={purchaseDetailsStates.priceTypes}
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
                                    {permission?.write && permission?.read && (
                                        <Row className="mx-0">
                                            <Button
                                                color="danger"
                                                className="mr-3"
                                                type="submit"
                                                onClick={() => refActionModalCancel.current.toggleModal()}
                                                disabled={purchaseDetailsStates.loading}
                                            >
                                                {t("Cancel")}
                                            </Button>
                                            <Row className="mx-0">
                                                <Button
                                                    color="secondary"
                                                    className="mr-3"
                                                    type="submit"
                                                    disabled={purchaseDetailsStates.loading}
                                                    onClick={
                                                        () => {
                                                            if (!dirty
                                                                    || (dirty && Object.keys(errors).length)) {
                                                                showToast("error", "Validation error, please check your input.");
                                                                return;
                                                            }

                                                            onSubmitPressHandler(values, true);
                                                        }
                                                    }
                                                >
                                                    {t("SaveAsDraft")}
                                                </Button>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    onClick={
                                                        () => {
                                                            if (!dirty
                                                                    || (dirty && Object.keys(errors).length)) {
                                                                showToast("error", "Validation error, please check your input.");
                                                                return;
                                                            }

                                                            onSubmitPressHandler(values, false);
                                                        }
                                                    }
                                                    disabled={purchaseDetailsStates.loading}
                                                >
                                                    {t("Submit")}
                                                </Button>
                                            </Row>
                                        </Row>
                                    )}
                                    {!permission?.write && (<></>)}
                                </Row>
                            </StickyFooter>

                            {/* Add Catalogue Dialog */}
                            <AddItemDialog
                                isShow={showAddCatalogue}
                                onHide={() => {
                                    setShowAddCatalogue(false);
                                    setSelectedCatalogueItems([]);
                                }}
                                title={t("AddCatalogue")}
                                onPositiveAction={() => onAddNewItemCatalogue(values)}
                                onNegativeAction={() => {
                                    setShowAddCatalogue(false);
                                    setSelectedCatalogueItems([]);
                                }}
                                columnDefs={CatalogueItemPRColDefs}
                                rowDataItem={[]}
                                onSelectionChanged={(params) => {
                                    setSelectedCatalogueItems(params.api.getSelectedNodes());
                                }}
                                pageSize={10}
                                selected={purchaseDetailsStates.rowDataItemReq}
                                backendPagination
                                backendServerConfig={backendServerConfigCatalogue}
                            />
                            {/* Add Forecast Dialog */}
                            <AddItemDialog
                                isShow={showAddForecast}
                                onHide={() => {
                                    setShowAddForecast(false);
                                    setSelectedForecastItems([]);
                                }}
                                title={t("AddCatalogue")}
                                onPositiveAction={() => onAddNewItemForecast(values)}
                                onNegativeAction={() => {
                                    setShowAddForecast(false);
                                    setSelectedForecastItems([]);
                                }}
                                columnDefs={ForecastItemPRColDefs}
                                rowDataItem={[]}
                                onSelectionChanged={(params) => {
                                    setSelectedForecastItems(params.api.getSelectedNodes());
                                }}
                                pageSize={10}
                                selected={purchaseDetailsStates.rowDataItemReq}
                                backendPagination
                                backendServerConfig={backendServerConfigForecast}
                            />
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
            {Prompt}
        </Container>
    );
};

export default SubmitPurchaseRequisition;
