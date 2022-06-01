/* eslint-disable max-len */
import React, { useState, useEffect, useRef } from "react";
import useToast from "routes/hooks/useToast";
import StickyFooter from "components/StickyFooter";
import {
    Container, Row, Col, Button, Input, ButtonToolbar
} from "components";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import {
    Formik, Form
} from "formik";
import * as Yup from "yup";
import {
    AuditTrail, BudgetDetails, Conversation, AddItemDialog, CommonConfirmDialog, AddItemRequest
} from "routes/components";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import CatalogueService from "services/CatalogueService";
import ManageProjectService from "services/ManageProjectService";
import CurrenciesService from "services/CurrenciesService";
import ExtVendorService from "services/ExtVendorService";
import AddressDataService from "services/AddressService";
import UOMDataService from "services/UOMService";
import ManageProjectTradeService from "services/ManageProjectTradeService";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import GLDataService from "services/GLService";
import EntitiesService from "services/EntitiesService";
import TaxRecordDataService from "services/TaxRecordService";
import ProjectService from "services/ProjectService/ProjectService";
import ProjectForecastService from "services/ProjectForecastService";
import FeaturesMatrixService from "services/FeaturesMatrixService/FeaturesMatrixService";
import PurchaseRequestService from "services/PurchaseRequestService/PurchaseRequestService";
import ConversationService from "services/ConversationService/ConversationService";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { useSelector } from "react-redux";
import _ from "lodash";
import ActionModal from "routes/components/ActionModal";

import CUSTOM_CONSTANTS, { DWR_ACTIONS, DWR_STATUSES } from "helper/constantsDefined";
import {
    formatDisplayDecimal, convertToLocalTime, formatDateString, clearNumber, convertDate2String, sortArrayByName, sortArrayByNameFloat, getCurrentCompanyUUIDByStore, toFixedWithoutRounded
} from "helper/utilities";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import CategoryService from "services/CategoryService/CategoryService";
import DWRInitialSettings from "routes/Pages/Requisitions/Requisitions/DWR/components/DWRInitialSettings";

import WorkSpace from "routes/Pages/Requisitions/Requisitions/DWR/components/WorkSpace";
import DeveloperWorkRequestService from "services/DeveloperWorkRequestService/DeveloperWorkRequestService";
import DEVELOPER_WR_MODULE_ROUTE from "services/DeveloperWorkRequestService/urls";
import moment from "moment";
import UserService from "services/UserService";
import { HeaderMain } from "routes/components/HeaderMain";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import { CatalogueItemColDefs, ForecastItemColDefs, ContractItemColDefs } from "routes/P2P/PurchaseRequest/ColumnDefs";
import SummaryDetailsComponent from "routes/Pages/Requisitions/Requisitions/DWR/components/SummaryDetailsComponent";
import DWRGeneralInformationView from "routes/Pages/Requisitions/Requisitions/DWR/components/DeveloperWorkRequestDetails/DWRGeneralInformation";
import DWRGeneralInformation from "routes/Pages/Requisitions/Requisitions/DWR/components/DWRGeneralInformation";
import RaiseRequisitionComponentView from "routes/Pages/Requisitions/Requisitions/DWR/components/DeveloperWorkRequestDetails/RaiseRequisitionComponent";
import VendorInformationComponentView from "routes/Pages/Requisitions/Requisitions/DWR/components/DeveloperWorkRequestDetails/VendorInformationComponent";
import GroupButtonByStatus from "routes/Pages/Requisitions/Requisitions/DWR/components/DeveloperWorkRequestDetails/GroupButtonByStatus";
import { DWR_AUDIT_TRAIL_ROLE, DWR_AUDIT_TRAIL_ROLE_CONVERT } from "helper/purchasePreRequisitionConstants";
import PURCHASE_ORDER_ROUTES from "routes/P2P/PurchaseOrder/route";
import {
    InitialSettingsComponent,
    RaiseRequisitionComponent,
    GeneralInforComponent,
    RequestTermsComponent
} from "routes/P2P/PurchaseRequest/RaiseRequisition/components";
import {
    dwrItemSchema
} from "routes/P2P/PurchaseRequest/validations/itemSchema";

import VendorInformationComponent from "routes/Pages/Requisitions/Requisitions/DWR/components/VendorInformation";

const DeveloperWorkRequestDetails = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const initialDialogConfig = {
        isShow: false,
        title: "",
        isTextArea: false,
        textAreaPlaceholder: t("Please enter reason.."),
        contentPositive: t("Confirm"),
        colorPositive: "primary",
        contentNegative: t("Close"),
        colorNegative: "secondary",
        titleRequired: false,
        validateForm: false,
        onPositiveAction: () => null
    };
    const reasonInputRef = useRef(null);
    const usersWR = useRef([]);
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { userPermission } = permissionReducer;
    const [isBuyer, setIsBuyer] = useState(permissionReducer.isBuyer || false);
    const query = new URLSearchParams(location.search);
    const dwrUuid = query.get("uuid");
    const isInit = useRef("");
    const [workingRequestDetailState, setWorkingRequestDetailState] = useState();
    const [displaDialogConfig, setDisplayDialogConfig] = useState(initialDialogConfig);
    const refActionModal = useRef(null);

    const deleteNodesUuidRef = useRef([]);
    const createNodes = useRef([]);
    const editNodeList = useRef([]);
    const initNodeList = useRef([]);

    const [raisePRStates, setRaisePRStates] = useState({
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
        glAccounts: [],
        typeOfRequisitions: [],
        listCategory: [],
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
        rowDataDWRItem: [],
        subTotal: 0,
        tax: 0,
        total: 0,
        selectedCatalogueItems: [],
        selectedForecastItems: [],
        selectedContactItems: [],
        users: [],
        listCatalogueBySupplier: [],
        removeDocumentUuids: []
    });

    const [itemDelete, setItemDelete] = useState({
        uuid: "",
        rowData: []
    });

    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

    const initialValues = {
        requisitionType: "Developer Work Request",
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
        requester: "",
        submittedDate: "",
        deliveryAddress: "",
        deliveryDate: "",
        note: "",
        saveAsDraft: false
    };

    const validationSchema = dwrItemSchema;

    const getUuid = (item = {}) => item.uuid || item.itemUuid;
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

    const getQuantitySurveyors = () => {
        const consultants = workingRequestDetailState.workSpace?.consultants || [];
        return consultants.filter((item) => item.role === "MAIN_QS");
    };
    const getArchitects = () => {
        const consultants = workingRequestDetailState.workSpace?.consultants || [];
        return consultants.filter((item) => item.role === "ARCHITECT");
    };

    const calcBudgetDetails = async (projectCode) => {
        if (raisePRStates.companyUuid) {
            const responseForecastDetail = await ProjectForecastService.getProjectForecastDetail(raisePRStates.companyUuid, projectCode).catch((err) => {
                console.log(err);
            });
            const rowDataProject = [];
            const rowDataTrade = [];
            let rowDataItem = [];
            const forecastItems = [];
            const data = responseForecastDetail?.data?.data;
            if (data) {
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
                        item.totalForecasted = Number(element.itemUnitPrice)
                        * Number(element.itemQuantity) * Number(element.exchangeRate);
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

                        const forecastItem = {};
                        forecastItem.itemCode = element.itemCode;
                        forecastItem.itemName = element.itemName;
                        forecastItem.itemDescription = element.itemDescription;
                        forecastItem.itemModel = element.itemModel;
                        forecastItem.itemSize = element.itemSize;
                        forecastItem.itemBrand = element.itemBrand;
                        forecastItem.projectForecastTradeCode = tradeCode;
                        forecastItem.uom = element.uom;
                        forecastItem.itemQuantity = element.itemQuantity;
                        forecastItem.sourceCurrency = element.sourceCurrency;
                        forecastItem.itemUnitPrice = element.itemUnitPrice;
                        forecastItem.exchangeRate = element.exchangeRate;
                        forecastItems.push(forecastItem);
                    });
                    rowDataItem = rowDataItem.concat(listItems);

                    const trade = {};
                    trade.code = tradeCode;
                    trade.name = tradeTitle;
                    trade.tradeDescription = tradeDescription;
                    trade.currency = currency;
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
                        trade.pendingApproveInvoicesNonContract
                            += element.pendingApproveInvoicesNonContract;
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
                return {
                    rowDataProject,
                    rowDataTrade,
                    rowDataItem,
                    forecastItems
                };
            }
        }
        return null;
    };
    const convertAuditTrailRole = (value) => {
        switch (value) {
        case DWR_AUDIT_TRAIL_ROLE.SAVED_AS_DRAFT:
        {
            return DWR_AUDIT_TRAIL_ROLE_CONVERT.SAVED_AS_DRAFT;
        }
        case DWR_AUDIT_TRAIL_ROLE.SUBMITTED:
        {
            return DWR_AUDIT_TRAIL_ROLE_CONVERT.SUBMITTED;
        }
        case DWR_AUDIT_TRAIL_ROLE.RECALL:
        {
            return DWR_AUDIT_TRAIL_ROLE_CONVERT.RECALL;
        }
        case DWR_AUDIT_TRAIL_ROLE.CANCEL:
        {
            return DWR_AUDIT_TRAIL_ROLE_CONVERT.CANCEL;
        }
        case DWR_AUDIT_TRAIL_ROLE.SEND_BACK:
        {
            return DWR_AUDIT_TRAIL_ROLE_CONVERT.SEND_BACK;
        }
        case DWR_AUDIT_TRAIL_ROLE.REJECT:
        {
            return DWR_AUDIT_TRAIL_ROLE_CONVERT.REJECT;
        }
        case DWR_AUDIT_TRAIL_ROLE.APPROVED:
        {
            return DWR_AUDIT_TRAIL_ROLE_CONVERT.APPROVED;
        }
        case DWR_AUDIT_TRAIL_ROLE.EDIT:
        {
            return DWR_AUDIT_TRAIL_ROLE_CONVERT.EDIT;
        }
        default: return value.replace(/_/g, " ");
        }
    };
    const sendReasonConverstation = async (companyUuid, reason) => {
        try {
            const conversationLines = [];
            conversationLines.push({ text: reason });
            const conversationBody = {
                referenceId: dwrUuid,
                supplierUuid: userDetails.uuid,
                conversations: conversationLines
            };
            await ConversationService.createExternalConversation(companyUuid, conversationBody);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const checkInvalidItem = (rowDataDWRItem, newItems) => {
        let isInvalid = false;
        for (let index = 0; index < rowDataDWRItem.length; index++) {
            const item = rowDataDWRItem[index];
            const newData = newItems[index];
            if (!item.haveChildren) {
                if (Number(item.quantity) <= 0) {
                    showToast("error", t("QuantityMustBeGreaterThanZero"));
                    isInvalid = true;
                } else if (Number(item.unitPrice <= 0)) {
                    showToast("error", t("ItemUnitPriceMustBeGreaterThanZero"));
                    isInvalid = true;
                } else if (!item.description) {
                    showToast("error", t("PleaseEnterValidDescription"));
                    isInvalid = true;
                } else if (!item.uom) {
                    showToast("error", t("PleaseSelectValidUOM"));
                    isInvalid = true;
                }
            } else if (!item.description) {
                showToast("error", t("PleaseEnterValidDescription"));
                isInvalid = true;
            }
            if (newData.groupNumber.length === 1 && !newData.evaluators?.length) {
                showToast("error", t("PleaseSelectValidEvaluator"));
                isInvalid = true;
            }
            if (isInvalid) {
                break;
            }
        }
        return isInvalid;
    };

    const handleOnSubmit = async (values, companyUuid, action) => {
        if (!raisePRStates.rowDataDWRItem.length) {
            showToast("error", t("PleaseAddItemInWorkSpace"));
            return;
        }
        try {
            const {
                workReferenceNumber,
                workRequisitionTitle,
                approvalRouteUuid,
                dwrDate,
                project,
                projectCode,
                tradeCode,
                tradeTitle,
                tradeUuid,
                contractType,
                originalContractSum,
                bqContingencySum,
                remeasuredContractSum,
                retentionPercentage,
                retentionAmountCappedAt,
                architects,
                quantitySurveyors,
                vendorCode,
                vendorName,
                vendorUuid,
                contactName,
                contactEmail,
                contactNumber,
                contactUuid,
                countryCode,
                companyRegistrationNo,
                includeVariation,
                vendorCompanyUuid
            } = values;
            const {
                internalConversationLines,
                externalConversationLines,
                rowDataInternalAttachment,
                rowDataExternalAttachment,
                projects,
                // companyUuid,
                currencies,
                rowDataDWRItem
            } = raisePRStates;

            const wholeList = [];
            const checkList = [];
            rowDataDWRItem.forEach((data) => {
                const evaluators = (data.selectedEvaluator || []).map((item) => ({
                    name: item.name,
                    uuid: item.uuid,
                    email: item.email || "test@email.com"
                }));
                const tempGroupNumber = data.groupNumber.at(-1);
                const index = data.groupNumber.indexOf(tempGroupNumber);
                let tempParentGroup = null;
                if (index !== -1) {
                    tempParentGroup = data.groupNumber[index - 1];
                }
                const item = {
                    groupNumber: tempGroupNumber,
                    workCode: data.workCode || "",
                    description: data.description || "",
                    uom: data.uom ? data.uom.uomName : "",
                    retention: true,
                    retentionPercentage: Number(data.retentionPercentage) || null,
                    weightage: data.totalAmount / Number(originalContractSum),
                    quantity: data.haveChildren ? null : Number(data.quantity),
                    unitPrice: data.haveChildren ? null : Number(data.unitPrice),
                    remarks: data.remarks,
                    parentGroup: tempParentGroup,
                    evaluators
                };
                checkList.push({ haveChildren: data.haveChildren });
                wholeList.push(item);
            });
            // validate items
            if (!architects.length) {
                showToast("error", t("PleaseSelectArchitect"));
                return;
            }
            if (!quantitySurveyors.length) {
                showToast("error", t("PleaseSelectMainQuantitySurveyor"));
                return;
            }
            if (checkInvalidItem(rowDataDWRItem, wholeList)) return;
            // if (wholeList.find((item) => {
            //     if (item.quantity || item.quantity === 0) {
            //         return item.quantity <= 0;
            //     }
            //     return false;
            // })) {
            //     showToast("error", "Quantity must be greater than 0");
            //     setDisplayDialogConfig(initialDialogConfig);
            //     return;
            // }
            // if (wholeList.find((item, index) => !checkList[index].haveChildren && (!item.quantity || !item.uom || !item.unitPrice || !item.description))) {
            //     showToast("error", "Description, UOM, Quantity, and Unit Price are required field");
            //     setDisplayDialogConfig(initialDialogConfig);
            //     return;
            // }
            // end items
            console.log("wholeList", wholeList);

            const tempAchitects = [];
            const tempMainQS = [];

            const quantitySurveyorsFromDetails = getQuantitySurveyors();
            const architectsFromDetails = getArchitects();
            const removeConsultantsUuid = [];
            if (architects) {
                architects.forEach((item) => {
                    const architect = raisePRStates.users.find((user) => user.uuid === item.value);
                    if (architect) {
                        tempAchitects.push({
                            name: architect.name,
                            uuid: architect.uuid,
                            email: architect.email
                        });
                    }
                });
            }
            if (quantitySurveyors) {
                quantitySurveyors.forEach((item) => {
                    const surveyor = raisePRStates.users.find((user) => user.uuid === item.value);
                    if (surveyor) {
                        tempMainQS.push({
                            name: surveyor.name,
                            uuid: surveyor.uuid,
                            email: surveyor.email
                        });
                    }
                });
            }
            if (quantitySurveyorsFromDetails) {
                quantitySurveyorsFromDetails.forEach((item) => {
                    if (!quantitySurveyors.find((_suveyor) => _suveyor.uuid === item.uuid)) removeConsultantsUuid.push(item.uuid);
                });
            }
            if (architectsFromDetails) {
                architectsFromDetails.forEach((item) => {
                    if (!architects.find((_suveyor) => _suveyor.uuid === item.uuid)) removeConsultantsUuid.push(item.uuid);
                });
            }

            const projectObj = projects.find((item) => item.projectCode === values.projectCode) || {};
            const currencyObj = currencies.find((item) => item.currencyCode === values.currencyCode) || {};

            const documents = [...rowDataInternalAttachment, ...rowDataExternalAttachment].map(({
                guid, fileLabel, fileDescription, externalDocument
            }) => ({
                guid,
                fileLabel,
                fileDescription,
                externalDocument
            }));

            const body = {
                workReferenceNumber,
                workRequisitionTitle,
                approvalRouteUuid,
                dwrDate: moment(dwrDate).format(CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
                editWorkSpaceDto: {
                    project,
                    projectCode: project ? projectCode : null,
                    projectUuid: project ? projectObj.uuid : null,
                    tradeCode,
                    tradeTitle,
                    tradeUuid,

                    currencyUuid: currencyObj.uuid || null,
                    currencyCode: currencyObj.currencyCode || null,
                    currencyName: currencyObj.currencyName || null,
                    contractType,
                    originalContractSum: Number(originalContractSum),
                    bqContingencySum: Number(bqContingencySum),
                    remeasuredContractSum: Number(remeasuredContractSum),
                    includeVariation: includeVariation || false,
                    retentionPercentage: Number(retentionPercentage),
                    retentionCappedPercentage: Number(retentionPercentage),
                    retentionAmountCappedAt: Number(retentionAmountCappedAt),
                    wholeList: [],
                    editNodeList: editNodeList.current,
                    createNodes: createNodes.current,
                    deleteNodeUuid: deleteNodesUuidRef.current,
                    addArchitects: tempAchitects,
                    addMainQS: tempMainQS,

                    removeConsultantsUuid,
                    removeDocumentUuids: raisePRStates.removeDocumentUuids

                },
                supplierCompanyUuid: vendorCompanyUuid,
                supplierUuid: vendorUuid,
                supplierContact: {
                    contactName,
                    contactEmail,
                    contactNumber,
                    contactUuid
                },
                // newSupplierInformation: {
                //     vendorCode,
                //     vendorName,
                //     vendorUuid,
                //     contactName,
                //     contactEmail,
                //     contactNumber,
                //     countryCode,
                //     companyUuid: vendorCompanyUuid,
                //     companyRegistrationNo
                // },

                addDocuments: documents.length ? documents : null
            };

            console.log("body", JSON.stringify(body));

            setDisplayDialogConfig(initialDialogConfig);
            const response = await DeveloperWorkRequestService.updateRequisition(companyUuid, dwrUuid, action, body);
            const { data } = response.data;

            if (externalConversationLines.length > 0) {
                const conversationBody = {
                    referenceId: data,
                    supplierUuid: userDetails.uuid,
                    conversations: raisePRStates.externalConversationLines
                };
                await ConversationService
                    .createExternalConversation(companyUuid, conversationBody);
            }
            if (internalConversationLines.length > 0) {
                const conversationBody = {
                    referenceId: data,
                    supplierUuid: userDetails.uuid,
                    conversations: raisePRStates.internalConversationLines
                };
                await ConversationService
                    .createInternalConversation(companyUuid, conversationBody);
            }
            showToast("success", response.data.message);
            setTimeout(() => {
                history.push({
                    pathname: DEVELOPER_WR_MODULE_ROUTE.LIST_DW_REQUESTS
                    // search: `?uuid=${dwrUuid}`
                });
            }, 1000);
        } catch (error) {
            // console
            console.log(error);
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const handleOnApprove = async (companyUuid) => {
        try {
            const response = await DeveloperWorkRequestService.updateRequisition(companyUuid, dwrUuid, DWR_ACTIONS.APPROVE);
            setDisplayDialogConfig(initialDialogConfig);
            showToast("success", response.data?.message);
            setTimeout(() => {
                history.push({
                    pathname: DEVELOPER_WR_MODULE_ROUTE.LIST_DW_REQUESTS
                    // search: `?uuid=${dwrUuid}`
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            setDisplayDialogConfig(initialDialogConfig);
        }
    };
    const handleOnConvertWO = async (companyUuid) => {
        try {
            const response = await DeveloperWorkRequestService.updateRequisition(companyUuid, dwrUuid, DWR_ACTIONS.CONVERT_TO_DVWO);
            setDisplayDialogConfig(initialDialogConfig);
            showToast("success", response.data?.message);
            setTimeout(() => {
                history.push({
                    pathname: DEVELOPER_WR_MODULE_ROUTE.LIST_DW_REQUESTS
                    // search: `?uuid=${dwrUuid}`
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            setDisplayDialogConfig(initialDialogConfig);
        }
    };
    const handleOnReject = async (companyUuid, reason) => {
        try {
            const response = await DeveloperWorkRequestService.updateRequisition(companyUuid, dwrUuid, DWR_ACTIONS.REJECT);
            await sendReasonConverstation(companyUuid, reason);
            setDisplayDialogConfig(initialDialogConfig);
            showToast("success", response.data?.message);
            setTimeout(async () => {
                history.push({
                    pathname: DEVELOPER_WR_MODULE_ROUTE.LIST_DW_REQUESTS
                    // search: `?uuid=${dwrUuid}`
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            setDisplayDialogConfig(initialDialogConfig);
        }
    };
    const handleOnSendBack = async (companyUuid, reason) => {
        try {
            const response = await DeveloperWorkRequestService.updateRequisition(companyUuid, dwrUuid, DWR_ACTIONS.SEND_BACK);
            await sendReasonConverstation(companyUuid, reason);
            setDisplayDialogConfig(initialDialogConfig);
            showToast("success", response.data?.message);
            setTimeout(async () => {
                history.push({
                    pathname: DEVELOPER_WR_MODULE_ROUTE.LIST_DW_REQUESTS
                    // search: `?uuid=${dwrUuid}`
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            setDisplayDialogConfig(initialDialogConfig);
        }
    };
    const handleOnRecall = async (companyUuid, reason) => {
        try {
            const response = await DeveloperWorkRequestService.updateRequisition(companyUuid, dwrUuid, DWR_ACTIONS.RECALL);
            await sendReasonConverstation(companyUuid, reason);
            setDisplayDialogConfig(initialDialogConfig);
            showToast("success", response.data?.message);
            setTimeout(async () => {
                history.push({
                    pathname: DEVELOPER_WR_MODULE_ROUTE.LIST_DW_REQUESTS
                    // search: `?uuid=${dwrUuid}`
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            setDisplayDialogConfig(initialDialogConfig);
        }
    };
    const handleOnCancel = async (companyUuid, reason) => {
        try {
            const response = await DeveloperWorkRequestService.updateRequisition(companyUuid, dwrUuid, DWR_ACTIONS.CANCEL);
            // await sendReasonConverstation(companyUuid, reason);
            // setDisplayDialogConfig(initialDialogConfig);
            showToast("success", response.data?.message);
            setTimeout(() => {
                history.push({
                    pathname: DEVELOPER_WR_MODULE_ROUTE.LIST_DW_REQUESTS
                    // search: `?uuid=${dwrUuid}`
                });
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };
    const onSavePressHandler = async (values, action) => {
        setPristine();
        const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
        if (companyUuid) {
            let dialogContent = { ...initialDialogConfig, isShow: true };
            switch (action) {
            case DWR_ACTIONS.APPROVE:
                dialogContent = { ...initialDialogConfig, isShow: false };
                handleOnApprove(companyUuid);
                // dialogContent = {
                //     ...dialogContent,
                //     ...{
                //         title: "Are you sure you want to approve this work requisition request?",
                //         onPositiveAction: () => handleOnApprove(companyUuid),
                //         contentPositive: t("Approve"),
                //         colorPositive: "primary"
                //     }
                // };
                break;
            case DWR_ACTIONS.CONVERT_TO_DVWO:
                dialogContent = { ...initialDialogConfig, isShow: false };
                handleOnConvertWO(companyUuid);
                // dialogContent = {
                //     ...dialogContent,
                //     ...{
                //         title: "Are you sure you want to convert this work requisition request?",
                //         onPositiveAction: () => handleOnConvertWO(companyUuid)
                //     }
                // };
                break;
            case DWR_ACTIONS.REJECT:
                dialogContent = {
                    ...dialogContent,
                    ...{
                        title: t("Reason"),
                        isTextArea: true,
                        onPositiveAction: () => {
                            setDisplayDialogConfig({ ...dialogContent, ...{ validateForm: true } });
                            if (reasonInputRef.current.value) {
                                handleOnReject(companyUuid, reasonInputRef.current.value);
                            }
                        },
                        contentPositive: t("Reject"),
                        colorPositive: "danger",
                        titleRequired: true
                    }
                };
                break;
            case DWR_ACTIONS.SEND_BACK:
                dialogContent = {
                    ...dialogContent,
                    ...{
                        title: t("Reason"),
                        isTextArea: true,
                        onPositiveAction: () => {
                            setDisplayDialogConfig({ ...dialogContent, ...{ validateForm: true } });
                            if (reasonInputRef.current.value) {
                                handleOnSendBack(companyUuid, reasonInputRef.current.value);
                            }
                        },
                        contentPositive: t("SendBack"),
                        colorPositive: "warning",
                        titleRequired: true
                    }
                };
                break;
            case DWR_ACTIONS.RECALL:
                dialogContent = {
                    ...dialogContent,
                    ...{
                        title: t("Reason"),
                        isTextArea: true,
                        onPositiveAction: () => {
                            setDisplayDialogConfig({ ...dialogContent, ...{ validateForm: true } });
                            if (reasonInputRef.current.value) {
                                handleOnRecall(companyUuid, reasonInputRef.current.value);
                            }
                        },
                        contentPositive: t("Recall"),
                        colorPositive: "danger",
                        titleRequired: true
                    }
                };
                break;
            case DWR_ACTIONS.CANCEL:
                refActionModal?.current?.toggleModal();
                dialogContent = {
                    ...dialogContent,
                    ...{
                        type: "actionmodal",
                        title: t("CancelRequest"),
                        isTextArea: true,
                        body: "Do you wish to cancel this request?",
                        onPositiveAction: () => {
                            setDisplayDialogConfig({ ...dialogContent, ...{ validateForm: true } });
                            // if (reasonInputRef?.current?.value) {
                            handleOnCancel(companyUuid);
                            // }
                        },
                        contentPositive: t("Cancel"),
                        colorPositive: "danger",
                        titleRequired: true
                    }
                };
                break;
            case DWR_ACTIONS.SUBMIT:
                dialogContent = { ...initialDialogConfig, isShow: false };
                handleOnSubmit(values, companyUuid, DWR_ACTIONS.SUBMIT);
                // dialogContent = {
                //     ...dialogContent,
                //     ...{
                //         title: "Are you sure you want to submit this work requisition request?",
                //         onPositiveAction: () => handleOnSubmit(values, companyUuid),
                //         contentPositive: t("Submit"),
                //         colorPositive: "primary"
                //     }
                // };
                break;
            case DWR_ACTIONS.SAVE_AS_DRAFT:
                dialogContent = {
                    ...dialogContent,
                    ...{
                        title: "Are you sure you want to save as draft this work requisition request?",
                        onPositiveAction: () => handleOnSubmit(values, companyUuid, DWR_ACTIONS.SAVE_AS_DRAFT),
                        contentPositive: t("Save"),
                        colorPositive: "primary"
                    }
                };
                break;
            default:
                break;
            }
            setDisplayDialogConfig(dialogContent);
        }
    };

    const getTotalItemsAmount = (rowData) => {
        let total = 0;
        if (rowData && rowData.length > 0) {
            rowData.forEach((item) => {
                const { quantity, unitPrice, totalAmount } = item;
                if (item.groupNumber.length === 1) total += totalAmount;
            });
        }
        return total;
    };

    const getTypeOfRequisitions = (permissions) => {
        const typeOfRequisitions = [];
        permissions.forEach((permission) => {
            if (["PR", "WR", "VR", "BC", "dwr"].indexOf(permission.featureCode) > -1) {
                typeOfRequisitions.push({
                    label: permission.feature.featureName,
                    value: permission.featureName
                });
            }
        });
        return typeOfRequisitions;
    };

    const loadWorkRequestDetail = async (setValues) => {
        if (workingRequestDetailState) {
            const workSpace = workingRequestDetailState.workSpace || {};
            const vendorInformation = isBuyer ? workingRequestDetailState.supplierInformation : workingRequestDetailState.buyerInformation;

            const quantitySurveyors = getQuantitySurveyors();
            const architects = getArchitects();

            const rowDataInternalAttachment = (workingRequestDetailState.dwrDocumentMetadataList || []).filter((item) => item.externalDocument === false);
            const rowDataExternalAttachment = (workingRequestDetailState.dwrDocumentMetadataList || []).filter((item) => item.externalDocument === true);

            const rowDataAuditTrail = workingRequestDetailState.dwrAuditTrail.map(
                ({
                    action, role, date, ...rest
                }) => ({
                    userRole: role,
                    dateTime: convertToLocalTime(date),
                    action: convertAuditTrailRole(action),
                    ...rest
                })
            );
            const initStataPR = {
                rowDataInternalAttachment,
                rowDataExternalAttachment,
                rowDataAuditTrail
            };
            if (workSpace.projectCode) {
                const dataCal = await calcBudgetDetails(workSpace.projectCode);
                if (dataCal) {
                    const {
                        rowDataProject,
                        rowDataTrade,
                        rowDataItem,
                        forecastItems
                    } = dataCal;
                    initStataPR.rowDataProject = rowDataProject;
                    initStataPR.rowDataTrade = rowDataTrade;
                    initStataPR.rowDataItem = rowDataItem;
                    initStataPR.forecastItems = forecastItems;
                }
            }
            // ================= get conversations ============================
            const responses = await Promise.allSettled([
                ConversationService.getDetailExternalConversation(raisePRStates.companyUuid, dwrUuid),
                ConversationService.getDetailInternalConversation(raisePRStates.companyUuid, dwrUuid)
            ]);

            const [responseDetailInternalConversation, responseDetailExternalConversation] = responses;
            const resExternalConversation = getDataResponse(responseDetailInternalConversation, "object");
            const resInternalConversation = getDataResponse(responseDetailExternalConversation, "object");

            const rowDataExternalConversation = [...raisePRStates.rowDataExternalConversation];

            if (resExternalConversation && Object.keys(resExternalConversation).length) {
                const { conversations } = resExternalConversation;
                conversations.forEach((item) => {
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
            const rowDataInternalConversation = [...raisePRStates.rowDataInternalConversation];
            if (resInternalConversation && Object.keys(resInternalConversation).length) {
                const { conversations } = resInternalConversation;
                conversations.forEach((item) => {
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
            //= ============ end get conversations================
            // inti for PENDING_SUBMISSION
            let approvalRoutes = [...raisePRStates.approvalRoutes];
            if (workingRequestDetailState.dwrStatus === DWR_STATUSES.PENDING_SUBMISSION) {
                approvalRoutes = approvalRoutes.filter((item) => item.active);
            }
            let newUsers = [...raisePRStates.users];
            if (workSpace.project && workSpace.projectCode) {
                try {
                    const response = await ProjectService.getProjectDetails(workSpace.projectCode);
                    if (response.data.status === RESPONSE_STATUS.OK) {
                        const { data } = response.data;
                        // const { projectAddressDto } = data;
                        // setFieldValue("deliveryAddress", projectAddressDto.uuid);
                        newUsers = data.projectUserDtoList.map((item) => ({
                            name: item.userName,
                            uuid: item.userUuid,
                            email: "test@gmail.com"
                        }));
                        sortArrayByName(newUsers, "name");
                    } else {
                        showToast("error", response.data.message);
                    }
                } catch (error) {
                    showToast("error", error.message);
                }
            }
            setRaisePRStates((prevState) => ({
                ...prevState,
                ...initStataPR,
                rowDataExternalConversation,
                rowDataInternalConversation,
                approvalRoutes,
                users: newUsers
            }));
            //
            const initValues = {
                ...initialValues,
                project: workSpace.project || false,
                projectCode: workSpace.projectCode,
                tradeTitle: workSpace.tradeTitle,
                tradeCode: workSpace.tradeCode,
                currencyCode: workSpace.currencyCode || "",
                contractType: workSpace.contractType,

                workReferenceNumber: workingRequestDetailState.workReferenceNumber,
                workRequisitionTitle: workingRequestDetailState.workRequisitionTitle,
                approvalRouteUuid: workingRequestDetailState.approvalRouteUuid,
                approvalSequence: workingRequestDetailState.approvalRouteSequence,
                dwrDate: moment(workingRequestDetailState.dwrDate).format(CUSTOM_CONSTANTS.YYYYMMDD),
                remarks: workingRequestDetailState.remarks,

                wrNumber: workingRequestDetailState.dwrNumber,
                status: workingRequestDetailState.dwrStatus?.replace(/_/g, " "),

                originalContractSum: toFixedWithoutRounded(workSpace.originalContractSum || 0, 2),
                bqContingencySum: toFixedWithoutRounded(workSpace.bqContingencySum || 0, 2),
                remeasuredContractSum: toFixedWithoutRounded(workSpace.remeasuredContractSum || 0, 2),
                includeVariation: workSpace.includeVariation || false,
                retentionPercentage: toFixedWithoutRounded(workSpace.retentionPercentage || 0, 2),
                retentionCappedPercentage: toFixedWithoutRounded(workSpace.retentionCappedPercentage || 0, 2),
                retentionAmountCappedAt: toFixedWithoutRounded(workSpace.retentionAmountCappedAt || 0, 2),

                companyRegistrationNo: vendorInformation.companyRegistrationNo,
                companyUuid: vendorInformation.companyUuid,
                contactEmail: vendorInformation.contactEmail,
                contactName: vendorInformation.contactName,
                contactNumber: `${vendorInformation?.countryCode?.includes("+") ? (vendorInformation?.countryCode || "") : `${vendorInformation?.countryCode || ""}`} ${vendorInformation?.contactNumber || ""}`,
                countryName: vendorInformation.countryName,
                countryCode: vendorInformation.countryCode,
                vendorCode: vendorInformation.vendorCode,
                vendorName: vendorInformation.vendorName,
                vendorUuid: vendorInformation.vendorUuid,
                quantitySurveyors,
                architects
            };
            setValues(initValues);
        }
    };

    const fetchWorkRequestDetail = async () => {
        const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
        if (!workingRequestDetailState) {
            const { data: { data: workingRequestDetail } } = await DeveloperWorkRequestService.getRequisitionDetails(
                companyUuid, dwrUuid
            );
            setWorkingRequestDetailState(workingRequestDetail);
        }
        const { rowDataDWRItem } = raisePRStates;
        if (!rowDataDWRItem.length) {
            let listParentItemsWorkSpace = [];
            listParentItemsWorkSpace = await DeveloperWorkRequestService.getListChildWorkSpace(isBuyer, companyUuid, dwrUuid, 0);
            listParentItemsWorkSpace = sortArrayByNameFloat(listParentItemsWorkSpace?.data?.data, "groupNumber");
            listParentItemsWorkSpace = listParentItemsWorkSpace.map((item) => {
                if (item.quantity && item.unitPrice) {
                    item.haveChildren = false;
                } else {
                    item.haveChildren = true;
                }
                item.selectedEvaluator = item.evaluators;
                return { ...item, groupNumber: [item.groupNumber] };
            });
            initNodeList.current = listParentItemsWorkSpace;
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataDWRItem: listParentItemsWorkSpace
            }));
        }
    };
    const initData = async () => {
        try {
            const companyUuid = permissionReducer.currentCompany?.companyUuid;
            if (companyUuid) {
                const responses = await Promise.allSettled([
                    CatalogueService.getCatalogues(companyUuid),
                    ManageProjectService.getCompanyProjectList(companyUuid),
                    CurrenciesService.getCurrencies(companyUuid),
                    ExtVendorService.getExternalVendors(companyUuid),
                    ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(companyUuid, "DWR"),
                    AddressDataService.getCompanyAddresses(companyUuid),
                    UOMDataService.getUOMRecords(companyUuid),
                    GLDataService.getGLs(companyUuid),
                    TaxRecordDataService.getTaxRecords(companyUuid),
                    CategoryService.getListCategory(companyUuid),
                    UserService.getCompanyUsers(companyUuid),
                    ManageProjectTradeService.getListProjectTrade({ companyUuid })
                ]);

                const [
                    responseCatalogueItems,
                    responseProjects,
                    responseCurrencies,
                    responseSuppliers,
                    responseApprovalRoutes,
                    responseAddresses,
                    responseUOMs,
                    responseGLAccounts,
                    responseTaxRecords,
                    responseListCategory,
                    responseCompanyUsers,
                    responseListProjectTrade
                ] = responses;

                const catalogueItems = getDataResponse(responseCatalogueItems).filter(
                    (item) => item.isActive === true
                );

                const projects = getDataResponse(responseProjects).filter(
                    (project) => project.projectStatus === "FORECASTED"
                ).sort(
                    (a, b) => {
                        if (a.projectTitle < b.projectTitle) return -1;
                        if (a.projectTitle > b.projectTitle) return 1;
                        return 0;
                    }
                );
                const currencies = getDataResponse(responseCurrencies).filter(
                    (currency) => currency.active === true
                ).sort(
                    (a, b) => {
                        if (a.currencyName < b.currencyName) return -1;
                        if (a.currencyName > b.currencyName) return 1;
                        return 0;
                    }
                );
                const suppliers = getDataResponse(responseSuppliers).sort(
                    (a, b) => {
                        if (a.companyCode < b.companyCode) return -1;
                        if (a.companyCode > b.companyCode) return 1;
                        return 0;
                    }
                ).filter((item) => item.seller);

                const approvalRoutes = getDataResponse(responseApprovalRoutes).sort(
                    (a, b) => {
                        if (a.approvalName < b.approvalName) return -1;
                        if (a.approvalName > b.approvalName) return 1;
                        return 0;
                    }
                );
                const addresses = getDataResponse(responseAddresses).filter(
                    (address) => address.active === true
                ).sort(
                    (a, b) => {
                        if (a.addressLabel < b.addressLabel) return -1;
                        if (a.addressLabel > b.addressLabel) return 1;
                        return 0;
                    }
                );
                const taxRecords = getDataResponse(responseTaxRecords).filter(
                    (taxRecord) => taxRecord.active === true
                );
                const listCategory = getDataResponse(responseListCategory).filter(
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
                const permission = userPermission[permissionReducer.featureBasedOn];
                let typeOfRequisitions = [];
                let featurePR;
                if (permission) {
                    typeOfRequisitions = getTypeOfRequisitions(permission.features);
                    featurePR = permission.features.find((feature) => feature.featureCode === "PR");
                }
                const listUser = getDataResponse(responseCompanyUsers);
                // const newListUser = [];
                // await Promise.all(listUser.map((item) => FeaturesMatrixService.getUserAuthorities(companyUuid, item.uuid))).then((result) => {
                //     if (result && result?.length) {
                //         result.forEach((item, index) => {
                //             const { data } = item.data;
                //             data.forEach((element) => {
                //                 if (element.featureCode === "dwr" && element.actions.read && element.actions.write) {
                //                     newListUser.push(listUser[index]);
                //                 }
                //             });
                //         });
                //     }
                // });
                sortArrayByName(listUser, "name");
                usersWR.current = listUser;
                const projectTrades = getDataResponse(responseListProjectTrade);
                setRaisePRStates((prevStates) => ({
                    ...prevStates,
                    typeOfRequisitions,
                    companyUuid,
                    catalogueItems,
                    projects,
                    currencies,
                    suppliers,
                    approvalRoutes,
                    addresses,
                    uoms: getDataResponse(responseUOMs),
                    glAccounts: getDataResponse(responseGLAccounts),
                    taxRecords,
                    prCreator: featurePR ? featurePR.actions.write : false,
                    listCategory,
                    users: listUser,
                    listCatalogueBySupplier: catalogueItems,
                    projectTrades
                }));
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const sendCommentConversation = async (comment, isInternal) => {
        if (isInternal) {
            const internalConversationLines = [...raisePRStates.internalConversationLines];
            const { rowDataInternalConversation } = raisePRStates;
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
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = raisePRStates;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...raisePRStates.externalConversationLines];
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
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation: newRowData,
            externalConversationLines
        }));
    };

    const addNewRowAttachment = (isInternal) => {
        setDirty();
        if (isInternal) {
            const { rowDataInternalAttachment } = raisePRStates;
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
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = raisePRStates;
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
        setRaisePRStates((prevStates) => ({
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

    const onAddAttachment = (event, uuid, rowData, isInternal) => {
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
                            attachment: result.fileLabel,
                            fileLabel: result.fileLabel
                        };
                    }
                });
                setRaisePRStates((prevStates) => ({
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
                        attachment: result.fileLabel,
                        fileLabel: result.fileLabel
                    };
                }
            });
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataExternalAttachment: newRowData
            }));
        }).catch((error) => {
            showToast("error", error.response ? error.response.data.message : error.message);
        });
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

    const onDeleteAttachment = (uuid, rowData, isInternal) => {
        const newRowData = rowData.filter((row) => row.uuid !== uuid);
        const rowDeleted = rowData.find((row) => row.uuid === uuid);
        const removeDocumentUuids = !raisePRStates.removeDocumentUuids.includes(rowDeleted.guid) && raisePRStates.removeDocumentUuids.push(rowDeleted.guid);
        if (isInternal) {
            if (rowDeleted && rowDeleted.guid) {
                handelDeleteFile(rowDeleted.guid);
            }
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData,
                removeDocumentUuids
            }));
            return;
        }
        if (rowDeleted && rowDeleted.guid) {
            handelDeleteFile(rowDeleted.guid);
        }
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData,
            removeDocumentUuids
        }));
    };

    const onCellEditingStopped = (params, isInternal) => {
        setDirty();
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = raisePRStates;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = raisePRStates;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onChangeApprovalRoute = async (e, setFieldValue) => {
        setDirty();
        const { value } = e.target;
        setFieldValue("approvalRouteUuid", value);
    };

    const onAddNewItemForecast = (values) => {
        setDirty();
        const { rowDataDWRItem, forecastItems } = raisePRStates;
        const rootItems = rowDataDWRItem.filter((x) => x.groupNumber && x.groupNumber.length === 1);
        const newForecastItems = [...forecastItems];
        const newRowData = [...rowDataDWRItem];
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            showAddForecast: false
        }));
        raisePRStates.selectedForecastItems.forEach((node, i) => {
            const { data } = node;
            newForecastItems.forEach(
                (item, index) => {
                    if (item.itemCode === data.itemCode
                        && item.sourceCurrency === data.sourceCurrency
                    ) {
                        newForecastItems[index].isSelected = true;
                    }
                }
            );
            const itemRequest = {
                uuid: uuidv4(),
                workCode: data.itemCode,
                description: data.itemName,
                weightage: null,
                uom: data.uom,
                retention: null,
                retentionPercentage: null,
                quantity: null,
                unitPrice: data.itemUnitPrice,
                totalAmount: null,
                evaluators: null,
                groupNumber: [`${rootItems.length + (i + 1)}`],
                groupName: `${rootItems.length + (i + 1)}`,
                parentGroup: null,
                remarks: ""
            };
            newRowData.push(itemRequest);
        });
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataDWRItem: newRowData,
            selectedForecastItems: [],
            forecastItems: newForecastItems
        }));
    };

    const onAddNewItemCatalogue = (values) => {
        setDirty();
        console.log("raisePRStates.selectedCatalogueItem====", raisePRStates.selectedCatalogueItems);
        const { selectedCatalogueItems, listCatalogueBySupplier } = raisePRStates;
        const newCatalogueItems = [...listCatalogueBySupplier];
        const rowDataDWRItem = [...raisePRStates.rowDataDWRItem];
        const rootItems = rowDataDWRItem.filter((x) => x.groupNumber && x.groupNumber.length === 1);
        selectedCatalogueItems.forEach((element, i) => {
            const { data = {} } = element;
            newCatalogueItems.forEach(
                (item, index) => {
                    if (getUuid(item) === getUuid(data)) {
                        newCatalogueItems[index].isSelected = true;
                    }
                }
            );
            rowDataDWRItem.push({
                uuid: uuidv4(),
                workCode: data.catalogueItemCode,
                description: data.catalogueItemName,
                weightage: null,
                uom: data.uomCode,
                retention: null,
                retentionPercentage: null,
                quantity: null,
                unitPrice: data.unitPrice,
                totalAmount: null,
                evaluators: null,
                groupNumber: [`${rootItems.length + (i + 1)}`],
                groupName: `${rootItems.length + (i + 1)}`,
                parentGroup: null,
                remarks: ""
            });
        });
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataDWRItem,
            listCatalogueBySupplier: newCatalogueItems,
            showAddCatalogue: false
        }));
    };

    const onChangeDWRList = (data) => {
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataDWRItem: data
        }));
    };
    const addDWRItemManual = () => {
        const { rowDataDWRItem } = raisePRStates;
        let item = null;
        const rootItems = rowDataDWRItem.filter((x) => x.groupNumber && x.groupNumber.length === 1);
        item = {
            uuid: uuidv4(),
            workCode: "",
            remarks: "",
            description: "",
            weightage: null,
            uom: null,
            retention: null,
            retentionPercentage: null,
            quantity: null,
            unitPrice: null,
            totalAmount: null,
            evaluators: null,
            groupNumber: [`${rootItems.length + 1}`],
            groupName: `${rootItems.length + 1}`,
            parentGroup: null
        };
        createNodes.current.push(item);

        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataDWRItem: [...rowDataDWRItem, item]
        }));
    };

    const addDWRChildItem = async (parentNode, rowData) => {
        try {
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);

            const { data } = await DeveloperWorkRequestService.getListChildWorkSpace(permissionReducer.isBuyer, companyUuid, dwrUuid, parentNode.itemUuid);
            let itemChild = sortArrayByNameFloat(data?.data, "groupNumber");
            itemChild = itemChild.map((item) => {
                if (item.quantity && item.unitPrice) {
                    item.haveChildren = false;
                } else {
                    item.haveChildren = true;
                }
                return { ...item, groupNumber: [...parentNode.groupNumber, item.groupNumber] };
            });

            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataDWRItem: [...rowData, ...itemChild]
            }));
        } catch (error) {
            console.log(error);
            showToast("error", error?.response?.data?.message);
        }
    };
    // handle tree table flow
    const getChildItemWorkSpace = (rowData = [], itemParent = {}) => {
        const children = [];
        const groupNumber = itemParent.groupNumber.at(-1);
        rowData.forEach((element) => {
            if (element.groupNumber.includes(groupNumber) && !(element.groupNumber.at(-1) === groupNumber)) {
                children.push(element);
            }
        });
        return children;
    };

    const getItemParentWorkSpace = (rowData, itemAction) => {
        const itemParent = rowData.find((item) => item.groupNumber?.at(-1) === itemAction.groupNumber?.at(-2));
        return itemParent;
    };

    const checkSiblingsItemWorkSpace = (rowData = [], item = {}) => {
        let flag = false;
        const indexRootGroupNumber = 0;
        const groupNumber = item.groupNumber.at(-1);

        for (let index = 0; index < rowData.length; index++) {
            if (
                item.groupNumber.length === rowData[index].groupNumber.length
                && item.groupNumber.at(-1) !== groupNumber
                && item.groupNumber[indexRootGroupNumber] === rowData[index].groupNumber[indexRootGroupNumber]
            ) {
                flag = true;
                break;
            }
        }
        return flag;
    };
    // end handle tree table flow

    // handle total amount table
    const getSiblingsItemWorkSpace = (rowData = [], item = {}) => {
        const siblings = [];
        const groupNumber = item.groupNumber.at(-1);
        const indexRootGroupNumber = 0;

        rowData.forEach((element) => {
            if (
                item.groupNumber.length === element.groupNumber.length
                && element.groupNumber.at(-1) !== groupNumber
                && item.groupNumber[indexRootGroupNumber] === element.groupNumber[indexRootGroupNumber]
            ) {
                siblings.push(element);
            }
        });

        return siblings;
    };
    // end total amount table
    const deleteDWRItem = (uuid, rowData) => {
        const filteredData = rowData.filter((item) => getUuid(item) !== uuid);
        const deletedItem = rowData.find((item) => getUuid(item) === uuid);
        //= ========================
        const uuidsDeleted = deleteNodesUuidRef.current;
        const nodesCreated = createNodes.current;
        const initNodes = initNodeList.current;

        if (uuidsDeleted.indexOf(deletedItem.uuid || deletedItem.itemUuid) === -1
         && initNodes.filter((item) => item.itemUuid === (deletedItem.uuid || deletedItem.itemUuid)).length) {
            uuidsDeleted.push(deletedItem.uuid || deletedItem.itemUuid);
            deleteNodesUuidRef.current = uuidsDeleted;
        }
        if (nodesCreated.filter((item) => item.uuid === (deletedItem.uuid || deletedItem.itemUuid))) {
            createNodes.current = nodesCreated.filter((item) => item.uuid !== (deletedItem.uuid || deletedItem.itemUuid));
        }
        console.log("deleteNodesUuidRef.current", deleteNodesUuidRef.current);
        console.log("createNodes.current", createNodes.current);
        //= =======================
        if (deletedItem && deletedItem.haveChildren) {
            const children = getChildItemWorkSpace(rowData, deletedItem);
            const idsChildren = children.map((item) => getUuid(item));

            const newRowData = [];
            filteredData.map((item) => {
                if (!idsChildren.includes(getUuid(item))) {
                    newRowData.push(item);
                }
                return item;
            });
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataDWRItem: newRowData
            }));
        } else if (deletedItem) {
            const itemParent = getItemParentWorkSpace(rowData, deletedItem);
            let newRowData = [...filteredData];
            if (itemParent) {
                newRowData = filteredData.map((item) => {
                    if (getUuid(item) === getUuid(itemParent) && !checkSiblingsItemWorkSpace(rowData, deletedItem)) {
                        const temp = {
                            ...item,
                            haveChildren: false
                        };
                        return temp;
                    }
                    return item;
                });
            }
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataDWRItem: newRowData
            }));
        }
    };

    const onDWRItemChanged = (params, rowData) => {
        const { data } = params;
        console.log("data", data);

        if (initNodeList.current.filter((item) => data.itemUuid === (item.itemUuid || item.uuid)).length) {
            const index = editNodeList.current.findIndex((item) => data.itemUuid === (item.itemUuid || item.uuid));

            if (index !== -1) {
                editNodeList.current[index] = data;
            } else {
                editNodeList.current.push(data);
            }
            console.log("editNodeList.current", editNodeList.current);
        } else {
            const index = createNodes.current.findIndex((item) => (data.itemUuid || item.uuid) === (item.itemUuid || item.uuid));
            if (index !== -1) {
                createNodes.current[index] = data;
            }
        }

        console.log("initNodeList.current", initNodeList.current);
        console.log("createNodes.current", createNodes.current);

        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataDWRItem: rowData
        }));
    };

    const onDeleteItemSelectedEvaluator = (params, itemDeleted, rowDataDWRItemState) => {
        const { data, rowIndex } = params;
        const { selectedEvaluator } = data;
        const newSelectedEvaluator = selectedEvaluator.filter((item) => getUuid(item) !== getUuid(itemDeleted));
        const newArray = rowDataDWRItemState.map((element, i) => {
            if (rowIndex === i) {
                return {
                    ...element,
                    selectedEvaluator: newSelectedEvaluator
                };
            }
            return element;
        });

        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataDWRItem: newArray
        }));
    };
    const checkChangeNode = (data) => {
        console.log("initNodeList", initNodeList);
        console.log("datatest", data);
        if (initNodeList.current.filter((item) => (data.itemUuid || data.uuid) === (item.itemUuid || item.uuid)).length) {
            const index = editNodeList.current.findIndex((item) => (data.itemUuid || data.uuid) === (item.itemUuid || item.uuid));

            if (index !== -1) {
                editNodeList.current[index] = data;
            } else {
                editNodeList.current.push(data);
            }
            console.log("editNodeList.current", editNodeList.current);
        } else {
            const index = createNodes.current.findIndex((item) => (data.itemUuid || item.uuid) === (item.itemUuid || item.uuid));
            if (index !== -1) {
                createNodes.current[index] = data;
            }
        }
    };
    const formatEvaulators = (array) => {
        const evaluators = array.map((item) => ({
            name: item.name,
            uuid: item.uuid,
            email: item.email || "test@email.com"
        }));
        return evaluators;
    };
    const onSummaryCellChanged = (params, rowData) => {
        const { rowIndex, colDef, data } = params;
        let array = [...raisePRStates.rowDataDWRItem];
        const evaluated = data.evaluator;
        const dataObj = array.find((item) => getUuid(item) === getUuid(data)) || {};
        let selectedEvaluator = dataObj.selectedEvaluator || [];
        console.log("data", data);

        switch (colDef.field) {
        case "evaluator":
            selectedEvaluator = _.union(selectedEvaluator, [evaluated], "uuid");
            array = array.map((item) => {
                if (getUuid(item) === getUuid(data)) {
                    return {
                        ...item,
                        selectedEvaluator
                    };
                } return item;
            });

            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataDWRItem: [...array]
            }));
            const tempGroupNumber = data.groupNumber.at(-1);
            const index = data.groupNumber.indexOf(tempGroupNumber);
            let tempParentGroup = null;
            if (index !== -1) {
                tempParentGroup = data.groupNumber[index - 1];
            }
            checkChangeNode({
                uuid: data.itemUuid,
                groupNumber: tempGroupNumber,
                workCode: data.workCode,
                description: data.description,
                uom: data.uom || null,
                retention: data.retention,
                retentionPercentage: data.retentionPercentage,
                weightage: data.weightage,
                quantity: data.quantity,
                unitPrice: data.unitPrice || null,
                remarks: data.remarks,
                parentGroup: tempParentGroup,
                evaluators: formatEvaulators(selectedEvaluator)
            });
            break;
        case "retentionPercentage":
            const newData = array.map((item) => {
                if (getUuid(item) === getUuid(data)) {
                    return {
                        ...item,
                        retentionPercentage: Number(data.retentionPercentage)
                    };
                } return item;
            });
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataDWRItem: newData
            }));
            break;
        default:
            break;
        }
    };

    const onChangeProject = async (e, setFieldValue) => {
        setDirty();
        const { value } = e.target;
        setFieldValue("projectCode", value);
        if (value) {
            try {
                const response = await ProjectService.getProjectDetails(value);
                if (response.data.status === RESPONSE_STATUS.OK) {
                    const { data } = response.data;
                    const { projectAddressDto } = data;
                    setFieldValue("deliveryAddress", projectAddressDto.uuid);
                    // setFieldValue("currencyCode", data.currency);
                    const newUsers = data.projectUserDtoList.map((item) => ({
                        name: item.userName,
                        uuid: item.userUuid
                    }));
                    sortArrayByName(newUsers, "name");
                    setRaisePRStates((prevStates) => ({
                        ...prevStates,
                        users: newUsers
                    }));
                } else {
                    showToast("error", response.data.message);
                }
                calcBudgetDetails(value);
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        } else {
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                users: usersWR.current
            }));
        }
    };
    const onChangeNature = (e, setFieldValue) => {
        setDirty();
        const isProject = e.target.value === "true";
        setFieldValue("project", isProject);
        if (!isProject) setFieldValue("projectCode", null);
        const { catalogueItems, forecastItems } = raisePRStates;
        let newCatalogueItems = [...catalogueItems];
        if (newCatalogueItems.length > 0) {
            newCatalogueItems = newCatalogueItems.map(
                (item) => ({ ...item, isSelected: false })
            );
        }
        let newForecastItems = [...forecastItems];
        if (newForecastItems.length > 0) {
            newForecastItems = newForecastItems.map(
                (item) => ({ ...item, isSelected: false })
            );
        }
        let users = [...raisePRStates.users];
        if (!isProject) users = usersWR.current;
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataItemReq: [],
            total: 0,
            subTotal: 0,
            tax: 0,
            catalogueItems: newCatalogueItems,
            forecastItems: newForecastItems,
            users
        }));
    };

    const onChangeProjectTrade = (e, setFieldValue) => {
        const { value } = e.target;
        const projectTradeObj = raisePRStates?.projectTrades?.find((item) => item.tradeCode === value) || {};
        setFieldValue("tradeCode", value);
        setFieldValue("tradeTitle", projectTradeObj.tradeTitle);
        setFieldValue("tradeUuid", projectTradeObj.tradeCodeUuid);
    };

    useEffect(() => {
        if (itemDelete.uuid) {
            const { uuid, rowData } = itemDelete;
            const { catalogueItems, forecastItems } = raisePRStates;
            const data = rowData.find((row) => row.uuid === uuid);
            let newCatalogueItems = [...catalogueItems];
            if (newCatalogueItems.length > 0) {
                const supplierCode = data?.supplierUuid?.companyCode;
                const sourceCurrency = data?.sourceCurrency?.currencyCode;
                const catalogueItemCode = data?.itemCode;
                newCatalogueItems = newCatalogueItems.map(
                    (item) => {
                        if (item.catalogueItemCode === catalogueItemCode
                            && item.currencyCode === sourceCurrency
                            && item.supplierCode === supplierCode
                        ) {
                            return { ...item, isSelected: false };
                        }
                        return item;
                    }
                );
            }
            let newForecastItems = [...forecastItems];
            if (newForecastItems.length > 0) {
                const sourceCurrency = data?.sourceCurrency.currencyCode;
                const itemCode = data?.itemCode;
                newForecastItems = newForecastItems.map(
                    (item) => {
                        if (item.itemCode === itemCode
                            && item.sourceCurrency === sourceCurrency
                        ) {
                            return { ...item, isSelected: false };
                        }
                        return item;
                    }
                );
            }
            const newRowData = rowData.filter((row) => row.uuid !== uuid);
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataItemReq: newRowData,
                catalogueItems: newCatalogueItems,
                forecastItems: newForecastItems
            }));
        }
    }, [itemDelete.uuid]);

    useEffect(() => {
        if (!_.isEmpty(userDetails) && !_.isEmpty(userPermission)) {
            setIsBuyer(permissionReducer.isBuyer);
            initData();
        }
    }, [userDetails, userPermission]);

    useEffect(() => {
        if (raisePRStates.companyUuid && !isInit.current) {
            isInit.current = true;
            fetchWorkRequestDetail();
        }
    }, [raisePRStates]);

    return (
        <Container fluid>
            <HeaderMain
                title={t("RaiseRequisition")}
                className="mb-2"
            />
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue, dirty, setValues
                }) => {
                    useEffect(() => {
                        if (!_.isEmpty(userDetails) && !_.isEmpty(userPermission)) {
                            setFieldValue("requester", userDetails.name);
                            setFieldValue("submittedDate", convertToLocalTime(new Date()));
                        }
                    }, [userDetails, userPermission]);

                    useEffect(() => {
                        loadWorkRequestDetail(setValues);
                    }, [JSON.stringify(workingRequestDetailState)]);

                    useEffect(() => {
                        if (values.supplierCode.length > 0) {
                            const { catalogueItems } = raisePRStates;
                            const supplierCodes = values.supplierCode.map((item) => item.companyCode);
                            const listCatalogueBySupplier = catalogueItems.filter((item) => !item.supplierCode
                                || supplierCodes.includes(item.supplierCode));
                            setRaisePRStates((prevStates) => ({
                                ...prevStates,
                                listCatalogueBySupplier
                            }));
                        } else {
                            setRaisePRStates((prevStates) => ({
                                ...prevStates,
                                listCatalogueBySupplier: raisePRStates.catalogueItems
                            }));
                        }
                    }, [values.supplierCode]);
                    const editMode = workingRequestDetailState && (workingRequestDetailState.dwrStatus === DWR_STATUSES.PENDING_SUBMISSION || workingRequestDetailState.dwrStatus === DWR_STATUSES.RECALLED || workingRequestDetailState.dwrStatus === DWR_STATUSES.SENT_BACK);
                    const editModeSpec = workingRequestDetailState && workingRequestDetailState.dwrStatus === DWR_STATUSES.PENDING_SUBMISSION;
                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* Raise Requisition */}
                                            {editModeSpec
                                                ? (
                                                    <RaiseRequisitionComponent
                                                        t={t}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        setFieldValue={setFieldValue}
                                                        typeOfRequisitions={raisePRStates.typeOfRequisitions}
                                                        natureOfRequisitions={raisePRStates.natureOfRequisitions}
                                                        projects={raisePRStates.projects}
                                                        projectTrades={raisePRStates.projectTrades}
                                                        onChangeProject={(e) => onChangeProject(e, setFieldValue)}
                                                        onChangeNature={(e) => onChangeNature(e, setFieldValue)}
                                                        // onChangeRequisitionType={onChangeRequisitionType}
                                                        onChangeProjectTrade={(e) => onChangeProjectTrade(e, setFieldValue)}
                                                    />
                                                )
                                                : (
                                                    <RaiseRequisitionComponentView
                                                        t={t}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        setFieldValue={setFieldValue}
                                                        natureOfRequisitions={raisePRStates.natureOfRequisitions}
                                                        projects={raisePRStates.projects}
                                                    />
                                                )}

                                            {/* Initial Settings */}
                                            <DWRInitialSettings
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                currencies={raisePRStates.currencies}
                                                viewMode={!editModeSpec}
                                            />

                                            {editModeSpec
                                                ? (
                                                    <VendorInformationComponent
                                                        t={t}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        setFieldValue={setFieldValue}
                                                        vendors={raisePRStates.suppliers}
                                                        contacts={[]}
                                                    />
                                                )
                                                : (
                                                    <VendorInformationComponentView
                                                        t={t}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        setFieldValue={setFieldValue}
                                                        vendors={raisePRStates.suppliers}
                                                        vendorInformation={isBuyer ? (workingRequestDetailState || {}).supplierInformation : workingRequestDetailState || {}.buyerInformation}
                                                        contacts={[]}
                                                    />
                                                )}
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* General Information */}
                                            {editMode
                                                ? (
                                                    <DWRGeneralInformation
                                                        t={t}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        setFieldValue={setFieldValue}
                                                        approvalRoutes={raisePRStates.approvalRoutes}
                                                        onChangeApprovalRoute={onChangeApprovalRoute}
                                                    />
                                                )
                                                : (
                                                    <DWRGeneralInformationView
                                                        t={t}
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        setFieldValue={setFieldValue}
                                                        approvalRoutes={raisePRStates.approvalRoutes}
                                                        onChangeApprovalRoute={onChangeApprovalRoute}
                                                    />
                                                )}
                                            {/* Summary Details */}
                                            <SummaryDetailsComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                dwrItems={raisePRStates.rowDataDWRItem}
                                                viewMode={!editMode}
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
                                                    rowDataProject={raisePRStates.rowDataProject}
                                                    rowDataTrade={raisePRStates.rowDataTrade}
                                                    rowDataItem={raisePRStates.rowDataItem}
                                                />
                                            </Col>
                                        </Row>
                                    </>
                                )
                            }
                            <HeaderSecondary
                                title={t("WorkSpace")}
                                className="mb-2"
                            />
                            <Row className="mb-4">
                                <Col xs={12}>
                                    {/* WorkSpace */}
                                    {
                                        permissionReducer?.currentCompany && (
                                            <WorkSpace
                                                t={t}
                                                disabled={!editMode}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                users={raisePRStates.users}
                                                rowDataDWRItem={raisePRStates.rowDataDWRItem}
                                                onChangeList={onChangeDWRList}
                                                onAddItemManual={addDWRItemManual}
                                                onAddChildItem={addDWRChildItem}
                                                onDeleteItem={deleteDWRItem}
                                                uoms={raisePRStates.uoms}
                                                onCellValueChanged={onDWRItemChanged}
                                                onSummaryCellChanged={onSummaryCellChanged}
                                                onDeleteItemSelectedEvaluator={onDeleteItemSelectedEvaluator}
                                                openDialogAddCatalogue={
                                                    () => setRaisePRStates((prevStates) => ({
                                                        ...prevStates,
                                                        showAddCatalogue: true
                                                    }))
                                                }
                                                openDialogAddForecast={
                                                    () => setRaisePRStates((prevStates) => ({
                                                        ...prevStates,
                                                        showAddForecast: true
                                                    }))
                                                }
                                                openDialogAddContract={
                                                    () => setRaisePRStates((prevStates) => ({
                                                        ...prevStates,
                                                        showAddContact: true
                                                    }))
                                                }
                                            />
                                        )
                                    }
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
                                        activeTab={raisePRStates.activeInternalTab}
                                        setActiveTab={(idx) => {
                                            setRaisePRStates((prevStates) => ({
                                                ...prevStates,
                                                activeInternalTab: idx
                                            }));
                                        }}
                                        sendConversation={(comment) => sendCommentConversation(comment, true)}
                                        addNewRowAttachment={() => addNewRowAttachment(true)}
                                        rowDataConversation={raisePRStates.rowDataInternalConversation}
                                        rowDataAttachment={raisePRStates.rowDataInternalAttachment}
                                        onDeleteAttachment={(uuid, rowData) => onDeleteAttachment(uuid, rowData, true)}
                                        onAddAttachment={(e, uuid, rowData) => onAddAttachment(e, uuid, rowData, true)}
                                        onCellEditingStopped={(params) => onCellEditingStopped(params, true)}
                                        defaultExpanded
                                        disabled={!workingRequestDetailState || (workingRequestDetailState && (workingRequestDetailState.dwrStatus === DWR_STATUSES.CANCELLED || workingRequestDetailState.dwrStatus === DWR_STATUSES.REJECTED || workingRequestDetailState.dwrStatus === DWR_STATUSES.PENDING_APPROVAL))}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col xs={12}>
                                    {/* External Conversations */}
                                    <Conversation
                                        title={t("ExternalConversations")}
                                        activeTab={raisePRStates.activeExternalTab}
                                        setActiveTab={(idx) => {
                                            setRaisePRStates((prevStates) => ({
                                                ...prevStates,
                                                activeExternalTab: idx
                                            }));
                                        }}
                                        sendConversation={(comment) => sendCommentConversation(comment, false)}
                                        addNewRowAttachment={() => addNewRowAttachment(false)}
                                        rowDataConversation={raisePRStates.rowDataExternalConversation}
                                        rowDataAttachment={raisePRStates.rowDataExternalAttachment}
                                        onDeleteAttachment={(uuid, rowData) => onDeleteAttachment(uuid, rowData, false)}
                                        onAddAttachment={(e, uuid, rowData) => onAddAttachment(e, uuid, rowData, false)}
                                        onCellEditingStopped={(params) => onCellEditingStopped(params, false)}
                                        defaultExpanded
                                        borderTopColor="#A9A2C1"
                                        disabled={!workingRequestDetailState || (workingRequestDetailState && (workingRequestDetailState.dwrStatus === DWR_STATUSES.CANCELLED || workingRequestDetailState.dwrStatus === DWR_STATUSES.REJECTED || workingRequestDetailState.dwrStatus === DWR_STATUSES.PENDING_APPROVAL))}
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
                                        rowData={raisePRStates.rowDataAuditTrail}
                                        onGridReady={(params) => {
                                            params.api.sizeColumnsToFit();
                                        }}
                                        paginationPageSize={10}
                                        gridHeight={350}
                                        defaultExpanded
                                    />
                                </Col>
                            </Row>
                            <ActionModal
                                ref={refActionModal}
                                title={displaDialogConfig.title}
                                body={displaDialogConfig.body}
                                button="Yes"
                                color="primary"
                                textCancel="No"
                                colorCancel="danger"
                                action={() => displaDialogConfig && displaDialogConfig.onPositiveAction()}
                            />
                            {/* Recalled status */}
                            <CommonConfirmDialog
                                isShow={displaDialogConfig.isShow && displaDialogConfig.type !== "actionmodal"}
                                onHide={() => setDisplayDialogConfig(initialDialogConfig)}
                                title={displaDialogConfig.title}
                                positiveProps={
                                    {
                                        onPositiveAction: () => displaDialogConfig && displaDialogConfig.onPositiveAction(),
                                        contentPositive: displaDialogConfig.contentPositive,
                                        colorPositive: displaDialogConfig.colorPositive
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => setDisplayDialogConfig(initialDialogConfig),
                                        contentNegative: displaDialogConfig.contentNegative,
                                        colorNegative: displaDialogConfig.colorNegative
                                    }
                                }
                                size="xs"
                                titleCenter
                                titleRequired={displaDialogConfig.titleRequired}
                            >
                                {displaDialogConfig.isTextArea && (
                                    <>
                                        <Input
                                            innerRef={reasonInputRef}
                                            type="textarea"
                                            rows={5}
                                            className={
                                                classNames("form-control", {
                                                    "is-invalid": displaDialogConfig.validateForm && displaDialogConfig.titleRequired && reasonInputRef?.current?.value === ""
                                                })
                                            }
                                            placeholder={displaDialogConfig.textAreaPlaceholder}
                                            // value={"reasonState"}
                                            onChange={(e) => {
                                                const { value } = e.target;
                                                // setReasonState(value);
                                            }}
                                        />
                                        {displaDialogConfig.validateForm && displaDialogConfig.titleRequired && reasonInputRef?.current?.value === "" && <div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>}
                                    </>
                                )}

                            </CommonConfirmDialog>
                            {/* Footer */}
                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-between">
                                    <Button
                                        color="secondary"
                                        onClick={() => history.goBack()}
                                    >
                                        {t("Back")}
                                    </Button>
                                    {
                                        // raisePRStates.prCreator
                                        //     ? (
                                        <GroupButtonByStatus
                                            t={t}
                                            values={values}
                                            errors={errors}
                                            dirty={dirty}
                                            onSavePressHandler={onSavePressHandler}
                                            detailDataState={workingRequestDetailState}
                                        />
                                        // ) : (
                                        //     <></>
                                        // )
                                    }
                                </Row>
                            </StickyFooter>
                            {/* Add Catalogue Dialog */}
                            <AddItemDialog
                                isShow={raisePRStates.showAddCatalogue}
                                onHide={() => {
                                    setRaisePRStates((prevStates) => ({
                                        ...prevStates,
                                        showAddCatalogue: false,
                                        selectedCatalogueItems: []
                                    }));
                                }}
                                title={t("AddCatalogue")}
                                onPositiveAction={() => onAddNewItemCatalogue(values)}
                                onNegativeAction={() => {
                                    setRaisePRStates((prevStates) => ({
                                        ...prevStates,
                                        showAddCatalogue: false,
                                        selectedCatalogueItems: []
                                    }));
                                }}
                                columnDefs={CatalogueItemColDefs}
                                rowDataItem={raisePRStates.listCatalogueBySupplier}
                                onSelectionChanged={(params) => {
                                    setRaisePRStates((prevStates) => ({
                                        ...prevStates,
                                        selectedCatalogueItems: params.api.getSelectedNodes()
                                    }));
                                }}
                            />
                            {/* Add Forecast Dialog */}
                            <AddItemDialog
                                isShow={raisePRStates.showAddForecast}
                                onHide={() => {
                                    setRaisePRStates((prevStates) => ({
                                        ...prevStates,
                                        showAddForecast: false,
                                        selectedForecastItems: []
                                    }));
                                }}
                                title={t("AddForecast")}
                                onPositiveAction={() => onAddNewItemForecast(values)}
                                onNegativeAction={() => {
                                    setRaisePRStates((prevStates) => ({
                                        ...prevStates,
                                        showAddForecast: false,
                                        selectedForecastItems: []
                                    }));
                                }}
                                columnDefs={ForecastItemColDefs}
                                rowDataItem={raisePRStates.forecastItems}
                                onSelectionChanged={(params) => {
                                    setRaisePRStates((prevStates) => ({
                                        ...prevStates,
                                        selectedForecastItems: params.api.getSelectedNodes()
                                    }));
                                }}
                            />
                            {/* Add Contact Dialog */}
                            <AddItemDialog
                                isShow={raisePRStates.showAddContact}
                                onHide={() => {
                                    setRaisePRStates((prevStates) => ({
                                        ...prevStates,
                                        showAddContact: false,
                                        selectedContactItems: []
                                    }));
                                }}
                                title={t("AddContact")}
                                onPositiveAction={() => { }}
                                onNegativeAction={() => {
                                    setRaisePRStates((prevStates) => ({
                                        ...prevStates,
                                        showAddContact: false,
                                        selectedContactItems: []
                                    }));
                                }}
                                columnDefs={ContractItemColDefs}
                                rowDataItem={raisePRStates.contactItems}
                                onSelectionChanged={(params) => {
                                    setRaisePRStates((prevStates) => ({
                                        ...prevStates,
                                        selectedContactItems: params.api.getSelectedNodes()
                                    }));
                                }}
                            />
                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
        </Container>
    );
};

export default DeveloperWorkRequestDetails;
