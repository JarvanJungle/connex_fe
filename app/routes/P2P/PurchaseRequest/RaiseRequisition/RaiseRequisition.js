/* eslint-disable max-len */
import React, {
    useState, useEffect, useRef, useMemo
} from "react";
import useToast from "routes/hooks/useToast";
import useAttachment from "routes/hooks/useAttachment";
import useConversation from "routes/hooks/useConversation";
import { useApprovalConfig, useBudgetDetails, usePermission } from "routes/hooks";
import StickyFooter from "components/StickyFooter";
import {
    Container, Row, Col, Button, ButtonToolbar
} from "components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Formik, Form } from "formik";
import {
    AuditTrail, BudgetDetails, Conversation, AddItemDialog, AddItemRequest
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
import ManageProjectTradeService from "services/ManageProjectTradeService";
import ProjectService from "services/ProjectService/ProjectService";
import PurchaseRequestService from "services/PurchaseRequestService/PurchaseRequestService";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { useSelector } from "react-redux";
import _ from "lodash";
import CUSTOM_CONSTANTS, { FEATURE } from "helper/constantsDefined";
import {
    formatDisplayDecimal,
    convertToLocalTime,
    formatDateString,
    clearNumber,
    convertDate2String,
    getCurrentCompanyUUIDByStore,
    sortArrayByName,
    isNullOrUndefinedOrEmpty,
    roundNumberWithUpAndDown
} from "helper/utilities";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import CategoryService from "services/CategoryService/CategoryService";
import DWRInitialSettings from "routes/Pages/Requisitions/Requisitions/DWR/components/DWRInitialSettings";
import DWRGeneralInformation from "routes/Pages/Requisitions/Requisitions/DWR/components/DWRGeneralInformation";
import VendorInformation from "routes/Pages/Requisitions/Requisitions/DWR/components/VendorInformation";
import WorkSpace from "routes/DeveloperModule/DWR/components/WorkSpace";
import SummaryDetailsComponent from "routes/Pages/Requisitions/Requisitions/DWR/components/SummaryDetailsComponent";
import DeveloperWorkRequestService from "services/DeveloperWorkRequestService/DeveloperWorkRequestService";
import moment from "moment";
import UserService from "services/UserService";
import { HeaderMain } from "routes/components/HeaderMain";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import DEVELOPER_WR_MODULE_ROUTE from "services/DeveloperWorkRequestService/urls";
import { date } from "faker";
import DocumentPrefixService from "services/DocumentPrefixService/DocumentPrefixService";
import SupplierService from "services/SupplierService";
import {
    InitialSettingsComponent,
    RaiseRequisitionComponent,
    GeneralInforComponent,
    RequestTermsComponent
} from "./components";
import {
    CatalogueItemColDefs,
    ForecastItemColDefs,
    ContractItemColDefs,
    CatalogueItemPRColDefs,
    ForecastItemPRColDefs
} from "../ColumnDefs";
import {
    itemSchema,
    prItemSchema,
    dwrItemSchema
} from "../validations/itemSchema";
import PR_ROUTES from "../route";

const RaiseRequisition = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const [projectCode, setProjectCode] = useState();
    const [
        rowDataProject, rowDataTrade, ,
        getBudgetDetailsByProjectCode
    ] = useBudgetDetails();
    const { userDetails } = authReducer;
    const { userPermission } = permissionReducer;
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
        rowDataItemReq: [],
        rowDataDWRItem: [],
        subTotal: 0,
        tax: 0,
        total: 0,
        selectedCatalogueItems: [],
        selectedForecastItems: [],
        selectedContactItems: [],
        users: [],
        listCatalogueBySupplier: [],
        enablePrefix: false,
        listAllSuppliers: [],
        priceTypes: [
            { priceType: "FOC" },
            { priceType: "INCLUDED" },
            { priceType: "TO_ADVISE" },
            { priceType: "AS_PER_CONTRACT" }
        ]
    });
    const [itemDelete, setItemDelete] = useState({
        uuid: "",
        rowData: []
    });
    const [validationSchema, setValidationSchema] = useState(null);
    const usersWR = useRef([]);

    const [showAddCataloguePR, setShowAddCataloguePR] = useState(false);
    const [selectedCatalogueItemsPR, setSelectedCatalogueItemsPR] = useState([]);
    const [showAddForecastPR, setShowAddForecastPR] = useState(false);
    const [selectedForecastItemsPR, setSelectedForecastItemsPR] = useState([]);
    const [forecastItemsPR, setForecastItemsPR] = useState([]);
    const [forecastItemsOrigin] = useState([]);
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
    const [internalAttachments, externalAttachments, attachmentActions] = useAttachment({
        setDirtyFunc: setDirty,
        defaultValue: []
    });
    const [internalConversations, externalConversations, conversationActions] = useConversation();
    const approvalConfig = useApprovalConfig(FEATURE.PR);

    const handleRolePermission = usePermission(FEATURE.PR);

    const initialValues = {
        approvalConfig: false,
        requisitionType: "",
        workRequisitionTitle: "",
        contractType: "",
        bqContingencySum: "",
        retentionPercentage: "",
        retentionCappedPercentage: "",
        project: false,
        projectCode: "",
        vendorUuid: "",
        dwrDate: formatDateString(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
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
        tradeCode: "",
        saveAsDraft: false,
        enablePrefix: false
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
                } else if (Number(item.unitPrice < 0)) {
                    showToast("error", t("ItemUnitPriceMustBeNotNegative"));
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

    const onSavePressHandler = async (values, saveAsDraft) => {
        setPristine();
        if (!raisePRStates.isWorkRequest) {
            try {
                const {
                    total,
                    rowDataItemReq,
                    companyUuid,
                    projects
                } = raisePRStates;
                const body = {};
                body.project = values.project;
                body.currencyCode = values.currencyCode;
                body.address = raisePRStates.addresses.find((item) => item.uuid === values.deliveryAddress)
                body.deliveryDate = formatDateString(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
                body.totalAmount = Number(clearNumber(formatDisplayDecimal(total, 2)));
                if (body.project === true) {
                    const project = projects.find((item) => item.projectCode === values.projectCode);
                    body.projectUuid = project?.uuid;
                }
                body.prTitle = values.prTitle;
                body.prNumber = values.prNumber;
                body.procurementType = values.procurementType;
                if (values.approvalRouteUuid) body.approvalRouteUuid = values.approvalRouteUuid;
                body.note = values.note;
                body.rfqProcess = false;
                body.rfqTreshold = 0;
                body.saveAsDraft = saveAsDraft;

                const attachments = await attachmentActions.getNewAttachments();
                if (!Array.isArray(attachments)) throw new Error(attachments);

                body.purchaseReqDocumentMetadata = attachments;
                body.purchaseReqConversation = [];

                const itemRequests = rowDataItemReq.map(
                    ({
                        uuid,
                        accountNumber,
                        address,
                        requestedDeliveryDate,
                        sourceCurrency,
                        taxCode,
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
                        tradeCode,
                        ...rest
                    }) => {
                        const item = ({
                            ...rest,
                            accountNumber: accountNumber?.accountNumber ?? accountNumber,
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
                            sourceCurrency: sourceCurrency?.currencyCode ?? sourceCurrency,
                            taxCode: taxCode?.taxCode ?? taxCode,
                            uom: uom?.uomCode ?? uom,
                            // eslint-disable-next-line no-nested-ternary
                            supplierUuid: supplierUuid
                                ? typeof (supplierUuid) === "object"
                                    ? supplierUuid.uuid || supplierUuid.supplierUuid
                                    : JSON.parse(supplierUuid).supplierUuid || JSON.parse(supplierUuid).uuid
                                : "",
                            exchangeRate: Number(exchangeRate || 0),
                            itemQuantity: Number(itemQuantity || 0),
                            itemCategory: itemCategory?.categoryName
                                ? itemCategory.categoryName : raisePRStates.listCategory[0]?.categoryName,
                            priceType: typeof (priceType) === "object" ? (priceType?.priceType ?? "") : (priceType ?? ""),
                            projectForecastTradeCode: tradeCode
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
                console.log("aaaa");
                const response = await PurchaseRequestService.createPurchaseRequisition(companyUuid, body);
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
                                itemCategory: item.itemCategory,
                                categoryDto: raisePRStates.listCategory
                                    .filter((cat) => cat.categoryName === item.itemCategory)[0]
                            };
                            await CatalogueService.postCreateCatalogue(bodyCategory);
                        }
                    });

                    // post conversations
                    const { data } = response.data; // PR's uuid
                    try {
                        conversationActions.postConversation(data, companyUuid);
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
        } else {
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
                retentionCappedPercentage,
                architects,
                quantitySurveyors,
                vendorUuid,
                contactName,
                contactEmail,
                contactNumber,
                contactUuid,
                includeVariation,
                vendorCompanyUuid
            } = values;
            const {
                projects,
                companyUuid,
                currencies,
                rowDataDWRItem
            } = raisePRStates;

            try {
                const items = [];
                rowDataDWRItem.forEach((data) => {
                    const evaluators = (data.selectedEvaluator || []).map((item) => ({
                        name: item.name,
                        uuid: item.uuid,
                        email: item.email
                    }));
                    const item = {
                        groupNumber: data.groupName,
                        workCode: data.workCode || "",
                        description: data.description || "",
                        uom: data?.uom?.uomName ?? data?.uom ?? "",
                        retention: data.retention || false,
                        retentionPercentage: Number(data.retentionPercentage) || null,
                        weightage: data.weightage || null,
                        quantity: data.haveChildren ? null : Number(data.quantity),
                        unitPrice: data.haveChildren ? null : Number(data.unitPrice),
                        remarks: data.remarks,
                        parentGroup: data.parentGroup || null,
                        evaluators
                    };
                    items.push(item);
                });

                // return;
                const tempAchitects = [];
                const tempMainQS = [];
                if (architects) {
                    architects.forEach((item) => {
                        const architect = raisePRStates.users.find((user) => user.uuid === item.value);
                        if (architect) {
                            tempAchitects.push({
                                name: architect.name,
                                uuid: architect.uuid
                                // email: architect.email
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
                                uuid: surveyor.uuid
                                // email: surveyor.email
                            });
                        }
                    });
                }

                const projectObj = projects.find((item) => item.projectCode === values.projectCode) || {};
                const currencyObj = currencies.find((item) => item.currencyCode === values.currencyCode) || {};

                let documents = await attachmentActions.getNewAttachments();
                if (!Array.isArray(documents)) throw new Error(documents);
                documents = documents.map(({
                    guid, fileLabel, fileDescription, externalDocument
                }) => ({
                    guid,
                    fileLabel,
                    fileDescription,
                    externalDocument
                }));

                const body = {
                    isDraft: saveAsDraft,
                    workReferenceNumber,
                    workRequisitionTitle,
                    approvalRouteUuid,
                    dwrDate: moment(dwrDate).format(CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
                    workSpace: {
                        project,
                        projectCode: project ? projectCode : null,
                        projectUuid: project ? projectObj.uuid : null,
                        tradeCode: tradeCode || null,
                        tradeTitle: tradeTitle || null,
                        tradeUuid: tradeUuid || null,

                        currencyUuid: currencyObj.uuid || null,
                        currencyCode: currencyObj.currencyCode || null,
                        currencyName: currencyObj.currencyName || null,
                        contractType,
                        originalContractSum: Number(originalContractSum),
                        bqContingencySum: Number(bqContingencySum),
                        remeasuredContractSum: Number(remeasuredContractSum),
                        includeVariation,
                        retentionPercentage: Number(retentionPercentage),
                        retentionCappedPercentage: Number(retentionCappedPercentage),
                        retentionAmountCappedAt: Number(retentionAmountCappedAt),
                        items,
                        architects: tempAchitects,
                        mainQS: tempMainQS
                    },

                    supplierCompanyUuid: vendorCompanyUuid,
                    supplierUuid: vendorUuid,
                    supplierContact: {
                        contactName,
                        contactEmail,
                        contactNumber,
                        contactUuid
                    },

                    dwrDocumentMetadataList: documents.length ? documents : null
                };

                if (!rowDataDWRItem.length) {
                    showToast("error", t("PleaseAddItemInWorkSpace"));
                    return;
                }

                if (checkInvalidItem(rowDataDWRItem, items)) return;

                if (!tempAchitects.length) {
                    showToast("error", t("PleaseSelectArchitect"));
                    return;
                }
                if (!tempMainQS.length) {
                    showToast("error", t("PleaseSelectMainQuantitySurveyor"));
                    return;
                }

                const response = await DeveloperWorkRequestService.createRequisition(raisePRStates.companyUuid, body);
                // post conversation
                const { data } = response.data; // DWR's uuid
                try {
                    conversationActions.postConversation(data, companyUuid);
                } catch (error) {}

                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push({
                        pathname: DEVELOPER_WR_MODULE_ROUTE.LIST_DW_REQUESTS
                    });
                }, 1000);
            } catch (error) {
                console.log(error);
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };

    const getTypeOfRequisitions = (features) => {
        const typeOfRequisitions = [];
        features.forEach((item) => {
            if (["PR", "WR", "VR", "BC", "dwr"].indexOf(item.featureCode) > -1) {
                typeOfRequisitions.push({
                    label: item.feature.featureName,
                    value: item.featureName
                });
            }
        });
        return typeOfRequisitions;
    };

    const prefixStatus = async (currentCompanyUUID, setFieldValue) => {
        let enablePrefix = false;
        const response = await DocumentPrefixService.getAllPrefixes(currentCompanyUUID);
        if (response.data.status === "OK") {
            const { data } = response.data;
            data.buyerPortalList.forEach((item) => {
                if (item.functionName === "Purchase Requisition" && item.type === "Manual") {
                    enablePrefix = true;
                }
            });
        } else {
            throw new Error(response.data.message);
        }
        setFieldValue("enablePrefix", enablePrefix);
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            enablePrefix
        }));
    };

    const initData = async (companyUuid, setFieldValue) => {
        try {
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
            setFieldValue("currencyCode", currencies?.find((currency) => currency.defaultCurrency).currencyCode);

            let responseSuppliers = await ExtVendorService.getExternalVendors(
                companyUuid
            );

            responseSuppliers = responseSuppliers.data?.data?.filter((item) => item.seller);
            const suppliers = responseSuppliers.sort(
                (a, b) => {
                    if (a.companyCode < b.companyCode) return -1;
                    if (a.companyCode > b.companyCode) return 1;
                    return 0;
                }
            ).map((item) => ({
                ...item, companyLabel: `${item.companyCode} (${item.companyName})`
            }));

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

            let responseUOMs = await UOMDataService.getUOMRecords(
                companyUuid
            );
            responseUOMs = responseUOMs.data?.data.filter((item) => item.active === true);

            const responseGLAccounts = await GLDataService.getGLs(
                companyUuid
            );
            const glAccounts = responseGLAccounts.data.data.filter((item) => item.active === true);

            const responseTaxRecords = await TaxRecordDataService.getTaxRecords(
                companyUuid
            );
            const taxRecords = responseTaxRecords.data.data.filter(
                (taxRecord) => taxRecord.active === true
            );

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
            const permissionUser = userPermission[permissionReducer.featureBasedOn];
            let typeOfRequisitions = [];
            // let featurePR;
            let filtered = [];
            if (permissionUser) {
                typeOfRequisitions = getTypeOfRequisitions(permissionUser.features);
                const ids = typeOfRequisitions.map((value) => value.label);
                filtered = typeOfRequisitions
                    .filter(({ label }, index) => !ids.includes(label, index + 1));
                // featurePR = permissionUser.features.find((feature) => feature.featureCode === FEATURE.PR);
                // console.log("initData ~ featurePR", featurePR);
            }

            const responseProjectTrades = await ManageProjectTradeService.getListProjectTrade({
                companyUuid
            });

            setRaisePRStates((prevStates) => ({
                ...prevStates,
                typeOfRequisitions: filtered,
                companyUuid,
                projects,
                currencies,
                suppliers,
                approvalRoutes,
                addresses,
                uoms: responseUOMs,
                glAccounts,
                taxRecords,
                prCreator: handleRolePermission ? handleRolePermission?.write : false,
                projectTrades: responseProjectTrades?.data?.data,
                listCategory
            }));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const addItemReqManual = (values) => {
        setDirty();
        const { rowDataItemReq, addresses } = raisePRStates;
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
            address: address ?? addresses[0] ?? "",
            requestedDeliveryDate: values.deliveryDate
                ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
            accountNumber: "",
            note: "",
            projectForecastTradeCode: "",
            manualItem: true,
            isManual: true,
            itemCategory: raisePRStates.listCategory[0]?.categoryName ?? ""
        });
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataItemReq: newRowData
        }));
    };

    // delete Request Item
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
            let newForecastItems = [...forecastItemsPR];
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
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataItemReq: newRowData
            }));
            setForecastItemsPR(newForecastItems);
        }
    }, [itemDelete.uuid]);

    const onEditRowAddItemReq = async (params) => {
        setDirty();
        const { data, colDef, newValue } = params;
        const { field } = colDef;
        const { rowDataItemReq } = raisePRStates;
        const newRowData = [...rowDataItemReq];
        if (field === "supplierUuid") {
            const newValueSuppliers = newValue ? JSON.parse(newValue) : {};
            if (newValue) {
                let exchangeRate = 0;
                raisePRStates.currencies.forEach((item) => {
                    if (item.currencyCode === newValueSuppliers?.currency) {
                        exchangeRate = item.exchangeRate;
                    }
                });
                const res = await SupplierService
                    .retrieveSuppliersDetails(raisePRStates.companyUuid, newValueSuppliers.supplierUuid ? newValueSuppliers.supplierUuid : newValueSuppliers.uuid);
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
                        newRowData[index].taxCode = supplierDetail.tax ? raisePRStates.taxRecords.filter((tax) => (tax.taxCode === supplierDetail.tax.taxCode))[0] : "";
                        newRowData[index].taxRate = supplierDetail.tax ? supplierDetail.tax.taxRate : "";
                        newRowData[index].inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(data.itemQuantity * data.itemUnitPrice);
                        newRowData[index].inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(newRowData[index].inSourceCurrencyBeforeTax * data.exchangeRate);
                        newRowData[index].taxAmountInDocumentCurrency = roundNumberWithUpAndDown((newRowData[index].taxRate * newRowData[index].inDocumentCurrencyBeforeTax) / 100);
                        newRowData[index].inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency);
                    }
                });
            }
        } else if (field === "taxCode") {
            rowDataItemReq.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].taxRate = newValue?.taxRate ?? 0;
                    newRowData[index].inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(data.itemQuantity * data.itemUnitPrice);
                    newRowData[index].inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(newRowData[index].inSourceCurrencyBeforeTax * data.exchangeRate);
                    newRowData[index].taxAmountInDocumentCurrency = roundNumberWithUpAndDown((newRowData[index].taxRate * newRowData[index].inDocumentCurrencyBeforeTax) / 100);
                    newRowData[index].inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency);
                }
            });
        } else if (field === "sourceCurrency") {
            const { sourceCurrency } = data;
            const exchangeRate = sourceCurrency?.exchangeRate ?? 1;

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
                    newRowData[index].inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(data.itemQuantity * data.itemUnitPrice);
                    newRowData[index].inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(newRowData[index].inSourceCurrencyBeforeTax * data.exchangeRate);
                    newRowData[index].taxAmountInDocumentCurrency = roundNumberWithUpAndDown((newRowData[index].taxRate * newRowData[index].inDocumentCurrencyBeforeTax) / 100);
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
                    newRowData[index].inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(data.itemQuantity * data.itemUnitPrice);
                    newRowData[index].inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(newRowData[index].inSourceCurrencyBeforeTax * data.exchangeRate);
                    newRowData[index].taxAmountInDocumentCurrency = roundNumberWithUpAndDown((newRowData[index].taxRate * newRowData[index].inDocumentCurrencyBeforeTax) / 100);
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
                        newRowData[index].inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(data.itemQuantity * data.itemUnitPrice);
                        newRowData[index].inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(newRowData[index].inSourceCurrencyBeforeTax * data.exchangeRate);
                        newRowData[index].taxAmountInDocumentCurrency = roundNumberWithUpAndDown((newRowData[index].taxRate * newRowData[index].inDocumentCurrencyBeforeTax) / 100);
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
        // const tax = roundNumberWithUpAndDown(rowDataItemReq.reduce((a, b) => a + (b.taxAmountInDocumentCurrency), 0));
        const total = roundNumberWithUpAndDown(subTotal + tax);

        params.api.setRowData(newRowData);
        setRaisePRStates((prevStates) => ({
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
        setFieldValue("projectCode", value);

        try {
            const response = await ProjectService.getProjectDetails(value);
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const { projectAddressDto, uuid } = data;
                setFieldValue("projectUuid", uuid);
                setFieldValue("deliveryAddress", projectAddressDto?.uuid ?? "");
                setFieldValue("currencyCode", data?.currency ?? "");
                setProjectCode(value);
                await getBudgetDetailsByProjectCode(raisePRStates.companyUuid, value);
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
        } catch (error) {
            console.log("onChangeProject", error);
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onChangeProjectTrade = (e, setFieldValue) => {
        const { value } = e.target;
        const projectTradeObj = raisePRStates?.projectTrades?.find((item) => item.tradeCode === value) || {};
        setFieldValue("tradeCode", value);
        setFieldValue("tradeTitle", projectTradeObj.tradeTitle);
        setFieldValue("tradeUuid", projectTradeObj.tradeCodeUuid);
    };

    const onChangeApprovalRoute = async (e, setFieldValue) => {
        setDirty();
        const { value } = e.target;
        setFieldValue("approvalRouteUuid", value);
    };

    const getSpecialCatalogue = async (companyUuid, code, listCatalogue) => {
        const responseSpecialCatalogue = await CatalogueService.getSpecialCatalogue(companyUuid, code, listCatalogue);
        const specialCatalogue = responseSpecialCatalogue.data.data;
        return specialCatalogue;
    };

    const onAddNewItemForecastPR = (values) => {
        setDirty();
        const {
            rowDataItemReq, addresses
        } = raisePRStates;
        let address;
        if (values.deliveryAddress) {
            address = addresses.find((item) => item.uuid === values.deliveryAddress);
        }
        const newRowData = [...rowDataItemReq];
        setShowAddForecastPR(false);
        selectedForecastItemsPR.forEach((node) => {
            const { data } = node;

            const sourceCurrency = raisePRStates.currencies.find(
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
                uom: raisePRStates.uoms.find(
                    (item) => item.uomCode.toLowerCase() === data.uomCode.toLowerCase()
                ),
                itemQuantity: data.itemQuantity,
                sourceCurrency,
                editableCurrency: !sourceCurrency,
                itemUnitPrice: data.unitPrice,
                editableUnitPrice: !Number(data.unitPrice),
                exchangeRate,
                editableExchangeRate: !Number(exchangeRate),
                taxCode: raisePRStates.taxRecords.find(
                    (item) => item.taxCode.toLowerCase() === data.taxCode?.toLowerCase()
                ),
                taxRate: data.taxRate,
                supplierName: data.supplierName || "",
                supplierUuid: data.supplierCode
                    ? raisePRStates.suppliers.find(
                        (item) => item.companyCode === data.supplierCode
                    ) : "",
                note: "",
                address: address || addresses[0],
                requestedDeliveryDate: values.deliveryDate
                    ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                    : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
                accountNumber: raisePRStates.glAccounts.find(
                    (item) => item.accountNumber === data.glAccountNumber
                ),
                itemCategory: {
                    categoryName: data.itemCategory
                },
                projectForecastTradeCode: data.tradeCode
            };

            itemRequest.inSourceCurrencyBeforeTax = roundNumberWithUpAndDown(data.itemQuantity * data.itemUnitPrice);
            itemRequest.inDocumentCurrencyBeforeTax = roundNumberWithUpAndDown(itemRequest.inSourceCurrencyBeforeTax * data.exchangeRate);
            itemRequest.taxAmountInDocumentCurrency = roundNumberWithUpAndDown((itemRequest.taxRate * itemRequest.inDocumentCurrencyBeforeTax) / 100);
            itemRequest.inDocumentCurrencyAfterTax = roundNumberWithUpAndDown(itemRequest.inDocumentCurrencyBeforeTax + itemRequest.taxAmountInDocumentCurrency);
            newRowData.push(itemRequest);
        });
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataItemReq: newRowData
        }));
        setSelectedForecastItemsPR([]);

        const listCatalogue = newRowData.map((item) => item.itemCode);
        getSpecialCatalogue(raisePRStates.companyUuid, projectCode, listCatalogue).then((specialCatalogue) => {
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                listAllSuppliers: specialCatalogue
            }));
        });
    };

    const onAddNewItemForecast = () => {
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

    const onAddNewItemCataloguePR = (values) => {
        setDirty();
        const { rowDataItemReq, addresses } = raisePRStates;
        let address;
        if (values.deliveryAddress) {
            address = addresses.find((item) => item.uuid === values.deliveryAddress);
        }
        const newRowData = [...rowDataItemReq];
        setShowAddCataloguePR(false);
        selectedCatalogueItemsPR.forEach((node) => {
            const { data } = node;
            const sourceCurrency = raisePRStates.currencies.find(
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
                uom: raisePRStates.uoms.find(
                    (item) => item.uomCode.toLowerCase() === data.uomCode.toLowerCase()
                ),
                itemQuantity: data.itemQuantity,
                sourceCurrency,
                editableCurrency: !sourceCurrency,
                itemUnitPrice: data.unitPrice,
                editableUnitPrice: !Number(data.unitPrice),
                exchangeRate,
                editableExchangeRate: !Number(exchangeRate),
                taxCode: raisePRStates.taxRecords.find(
                    (item) => item.taxCode.toLowerCase() === data.taxCode?.toLowerCase()
                ),
                taxRate: data.taxRate,
                supplierName: data.supplierName || "",
                supplierUuid: data.supplierCode
                    ? raisePRStates.suppliers.find(
                        (item) => item.companyCode === data.supplierCode
                    ) : "",
                note: "",
                address: address || addresses[0],
                requestedDeliveryDate: values.deliveryDate
                    ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                    : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
                accountNumber: raisePRStates.glAccounts.find(
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

        const listCatalogue = newRowData.map((item) => item.itemCode);
        getSpecialCatalogue(raisePRStates.companyUuid, projectCode, listCatalogue).then((specialCatalogue) => {
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
            let tradeMap = new Map();
            specialCatalogue?.forEach((e) => {
                tradeMap.set(e.itemCode, e.tradeCode);
            });
            newRowData?.forEach((e) => {
                e.tradeCode = tradeMap.get(e.itemCode);
            });
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataItemReq: newRowData,
                listAllSuppliers: specialCatalogue
            }));
        });
    };

    const onAddNewItemCatalogue = () => {
        setDirty();
        const { selectedCatalogueItems, rowDataDWRItem } = raisePRStates;
        const rootItems = rowDataDWRItem.filter((x) => x.groupNumber && x.groupNumber.length === 1);
        const newRowData = [...rowDataDWRItem];

        setRaisePRStates((prevStates) => ({
            ...prevStates,
            showAddCatalogue: false
        }));

        selectedCatalogueItems.forEach((element, i) => {
            const { data = {} } = element;

            newRowData.push({
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
            rowDataDWRItem: newRowData,
            selectedCatalogueItems: []
        }));
    };

    const onChangeNature = (e, setFieldValue) => {
        setDirty();
        let users = [];
        if (e.target.value === "true") {
            setFieldValue("project", true);
        } else {
            setFieldValue("project", false);
            users = usersWR.current;
        }

        const { forecastItems } = raisePRStates;
        let newForecastItems = [...forecastItems];
        if (newForecastItems.length > 0) {
            newForecastItems = newForecastItems.map(
                (item) => ({ ...item, isSelected: false })
            );
        }
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            users,
            rowDataItemReq: [],
            total: 0,
            subTotal: 0,
            tax: 0,
            forecastItems: newForecastItems
        }));
    };

    const onChangeRequisitionType = async (e, setFieldValue) => {
        const { value } = e.target;
        setFieldValue("requisitionType", value);
        let approvalRoutes = [];
        let newListUser = [];
        try {
            const { companyUuid } = raisePRStates;
            let responseApprovalRoutes;
            if (value === "Developer Work Request") {
                setValidationSchema(dwrItemSchema);
                responseApprovalRoutes = await ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                    companyUuid, "DWR"
                );

                const listUserResponse = await UserService.getCompanyUsers(companyUuid);
                newListUser = listUserResponse.data.data;
                sortArrayByName(newListUser, "name");
                usersWR.current = newListUser;
            } else {
                setValidationSchema(prItemSchema);
                responseApprovalRoutes = await ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                    companyUuid, FEATURE.PR
                );
            }

            responseApprovalRoutes = responseApprovalRoutes.data.data.filter((item) => item.active === true);
            approvalRoutes = responseApprovalRoutes.sort(
                (a, b) => {
                    if (a.approvalName < b.approvalName) return -1;
                    if (a.approvalName > b.approvalName) return 1;
                    return 0;
                }
            );
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }

        setRaisePRStates((prevStates) => ({
            ...prevStates,
            approvalRoutes,
            isWorkRequest: value === "Developer Work Request",
            users: newListUser.length ? newListUser : raisePRStates?.users
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
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataDWRItem: [...rowDataDWRItem, item]
        }));
    };

    const onChangeDWRList = (data) => {
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataDWRItem: data
        }));
    };

    const getRootChildren = (rowData = [], itemParent = {}) => {
        const children = [];
        const groupNumber = itemParent.groupNumber.at(-1);
        rowData.forEach((element) => {
            if (element.groupNumber.at(0) === itemParent.groupNumber.at(0)
                && element.groupNumber.at(-2) === groupNumber
                && element.groupNumber.at(-1) !== groupNumber) {
                children.push(element);
            }
        });
        return children;
    };

    const addDWRChildItem = (parentNode, rowData) => {
        const { groupNumber } = parentNode;
        const currentLevelStr = groupNumber.at(-1);
        const childrenItems = getRootChildren(rowData, parentNode);

        let newGroupNumberItem = `${currentLevelStr}.1`;
        if (childrenItems.length) {
            const lastChild = childrenItems[childrenItems.length - 1];
            const groupNumberLastChild = lastChild.groupNumber.at(-1);
            const tempArray = groupNumberLastChild?.split(".") || [];
            const number = Number(tempArray[tempArray.length - 1]);
            newGroupNumberItem = `${currentLevelStr}.${number + 1}`;
        }
        // update data parent item when have child item
        const array = rowData.map((item) => {
            if (item.uuid === parentNode.uuid) {
                return {
                    ...item,
                    uom: null,
                    quantity: null,
                    unitPrice: null,
                    weightage: null,
                    haveChildren: true

                };
            } return item;
        });
        const item = {
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
            groupNumber: [...groupNumber, newGroupNumberItem],
            groupName: newGroupNumberItem,
            parentGroup: currentLevelStr,
            evaluators: null,
            haveChildren: false
        };
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataDWRItem: [...array, item]
        }));
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
    const deleteDWRItem = (uuid, rowData) => {
        const filteredData = rowData.filter((item) => (item.uuid || item.itemUuid) !== uuid);
        const deletedItem = rowData.find((item) => item.uuid === uuid);

        if (deletedItem.haveChildren) {
            const children = getChildItemWorkSpace(rowData, deletedItem);
            const idsChildren = children.map((item) => item.uuid);

            const newRowData = [];
            filteredData.forEach((item) => {
                if (!idsChildren.includes(item.uuid)) {
                    newRowData.push(item);
                }
            });
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataDWRItem: newRowData
            }));
        } else {
            const itemParent = getItemParentWorkSpace(rowData, deletedItem);
            let newRowData = [...filteredData];
            if (itemParent) {
                newRowData = filteredData.map((item) => {
                    if (item.uuid === itemParent.uuid && !checkSiblingsItemWorkSpace(rowData, deletedItem)) {
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
        const { colDef } = params;
        switch (colDef.field) {
        case "unitPrice":
        case "quantity":
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataDWRItem: rowData
            }));
            break;
        case "retention":
            break;
        default:
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataDWRItem: rowData
            }));
            break;
        }
    };

    const onSummaryCellChanged = (params, rowData) => {
        console.log("onSummaryCellChanged", rowData);
        const { colDef, data } = params;
        let array = [...raisePRStates.rowDataDWRItem];
        const evaluated = data.evaluator;

        const dataObj = array.find((item) => item.uuid === data.uuid) || {};
        let selectedEvaluator = dataObj.selectedEvaluator || [];

        switch (colDef.field) {
        case "evaluator":
            selectedEvaluator = _.union(selectedEvaluator, [evaluated], "uuid");

            array = array.map((item) => {
                if (item.uuid === data.uuid) {
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
            break;
        case "retentionPercentage": {
            const newData = array.map((item) => {
                if (item.uuid === date.uuid) {
                    return {
                        ...item,
                        retentionPercentage: Number(data.retentionPercentage)
                    };
                }
                return item;
            });
            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataDWRItem: newData
            }));
            break;
        }
        default:
            break;
        }
    };

    const onDeleteItemSelectedEvaluator = (params, itemDeleted, rowDataDWRItemState) => {
        const { data, rowIndex } = params;
        const { selectedEvaluator } = data;
        const newSelectedEvaluator = selectedEvaluator.filter((item) => item.uuid !== itemDeleted.uuid);

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
        getDataFunc: (query) => getDataFunc({ ...query, project: projectCode })
    }), [projectCode]);

    const backendServerConfigCatalogue = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (query) => getDataFunc(query)
    }), []);

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
                    errors, values, touched, handleChange, setFieldValue, dirty, handleSubmit
                }) => {
                    useEffect(() => {
                        if (approvalConfig) setFieldValue("approvalConfig", approvalConfig);
                    }, [approvalConfig]);

                    useEffect(() => {
                        if (
                            !_.isEmpty(userDetails)
                            && !_.isEmpty(permissionReducer)
                        ) {
                            setFieldValue("requester", userDetails.name);
                            setFieldValue("submittedDate", convertToLocalTime(new Date()));
                            if (getCurrentCompanyUUIDByStore(permissionReducer)) {
                                setValidationSchema(prItemSchema);
                                const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
                                prefixStatus(companyUuid, setFieldValue);
                                initData(companyUuid, setFieldValue);
                            }
                        }
                    }, [userDetails, permissionReducer]);

                    useEffect(() => {
                        // TODO: I just comment older logic, need to update later
                        if (values.supplierCode.length > 0) {
                            // const { catalogueItems } = raisePRStates;
                            const supplierCodes = values.supplierCode.map((item) => item.companyCode);
                            // const listCatalogueBySupplier = catalogueItems.filter((item) => !item.supplierCode
                            //     || supplierCodes.includes(item.supplierCode));
                            const listForecastBySupplier = forecastItemsOrigin.filter((item) => !item.supplierCode
                                || supplierCodes.includes(item.supplierCode));
                            // setRaisePRStates((prevStates) => ({
                            //     ...prevStates,
                            //     listCatalogueBySupplier
                            // }));
                            // setListCataloguePRBySupplier(listCatalogueBySupplier);
                            setForecastItemsPR(listForecastBySupplier);
                        } else {
                            // setRaisePRStates((prevStates) => ({
                            //     ...prevStates,
                            //     listCatalogueBySupplier: raisePRStates.catalogueItems
                            // }));
                            // setListCataloguePRBySupplier(raisePRStates.catalogueItems);
                            setForecastItemsPR(forecastItemsOrigin);
                        }
                    }, [values.supplierCode]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* Raise Requisition */}
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
                                                onChangeRequisitionType={onChangeRequisitionType}
                                                onChangeProjectTrade={(e) => onChangeProjectTrade(e, setFieldValue)}
                                                internalAttachments={internalAttachments}
                                                externalAttachments={externalAttachments}
                                                internalConversations={internalConversations}
                                                externalConversations={externalConversations}
                                                rowDataItemReq={raisePRStates.rowDataItemReq}
                                            />
                                            {/* Initial Settings */}
                                            {
                                                raisePRStates.isWorkRequest
                                                    ? (
                                                        <DWRInitialSettings
                                                            t={t}
                                                            values={values}
                                                            errors={errors}
                                                            touched={touched}
                                                            handleChange={handleChange}
                                                            setFieldValue={setFieldValue}
                                                            currencies={raisePRStates.currencies}
                                                        />
                                                    )
                                                    : (
                                                        <InitialSettingsComponent
                                                            t={t}
                                                            values={values}
                                                            errors={errors}
                                                            touched={touched}
                                                            handleChange={handleChange}
                                                            setFieldValue={setFieldValue}
                                                            suppliers={raisePRStates.suppliers}
                                                            currencies={raisePRStates.currencies}
                                                            enablePrefix={raisePRStates.enablePrefix}
                                                        />
                                                    )
                                            }
                                            {
                                                raisePRStates.isWorkRequest
                                                && (
                                                    <VendorInformation
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
                                            }
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* General Information */}
                                            {
                                                raisePRStates.isWorkRequest
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
                                                        <GeneralInforComponent
                                                            t={t}
                                                            values={values}
                                                            errors={errors}
                                                            touched={touched}
                                                            handleChange={handleChange}
                                                            setFieldValue={setFieldValue}
                                                            procurementTypes={raisePRStates.procurementTypes}
                                                            approvalRoutes={raisePRStates.approvalRoutes}
                                                            onChangeApprovalRoute={(e) => onChangeApprovalRoute(e, setFieldValue)}
                                                        />
                                                    )
                                            }
                                            {/* Request Terms */}
                                            {
                                                raisePRStates.isWorkRequest
                                                    ? (
                                                        <SummaryDetailsComponent
                                                            t={t}
                                                            values={values}
                                                            errors={errors}
                                                            touched={touched}
                                                            handleChange={handleChange}
                                                            setFieldValue={setFieldValue}
                                                            dwrItems={raisePRStates.rowDataDWRItem}
                                                            onChangeList={onChangeDWRList}
                                                        />
                                                    )
                                                    : (
                                                        <RequestTermsComponent
                                                            t={t}
                                                            values={values}
                                                            errors={errors}
                                                            touched={touched}
                                                            handleChange={handleChange}
                                                            setFieldValue={setFieldValue}
                                                            addresses={raisePRStates.addresses}
                                                        />
                                                    )
                                            }

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
                                                    rowDataProject={rowDataProject}
                                                    rowDataTrade={rowDataTrade}
                                                    rowDataItem={raisePRStates.rowDataItem}
                                                />
                                            </Col>
                                        </Row>
                                    </>
                                )
                            }

                            {
                                raisePRStates.isWorkRequest && (
                                    <>
                                        <HeaderSecondary
                                            title={t("WorkSpace")}
                                            className="mb-2"
                                        />
                                        <Row className="mb-4">
                                            <Col xs={12}>
                                                {/* Budget Details */}
                                                {
                                                    permissionReducer?.currentCompany?.companyUuid
                                                    && (
                                                        <WorkSpace
                                                            t={t}
                                                            values={values}
                                                            errors={errors}
                                                            touched={touched}
                                                            handleChange={handleChange}
                                                            setFieldValue={setFieldValue}
                                                            users={raisePRStates.users}
                                                            rowDataDWRItem={raisePRStates.rowDataDWRItem}
                                                            onAddItemManual={addDWRItemManual}
                                                            onAddChildItem={addDWRChildItem}
                                                            onDeleteItem={deleteDWRItem}
                                                            onChangeList={onChangeDWRList}
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
                                    </>
                                )
                            }
                            {
                                !raisePRStates.isWorkRequest && (
                                    <>
                                        <ButtonToolbar className="justify-content-end mb-2">
                                            <Button
                                                color="primary"
                                                onClick={() => {
                                                    if (values.project) setShowAddCataloguePR(true);
                                                    else setShowAddForecastPR(true);
                                                }}
                                                className="mr-1"
                                            >
                                                <span className="mr-1">+</span>
                                                <span>{t("AddCatalogue")}</span>
                                            </Button>
                                            <Button
                                                color="primary"
                                                onClick={() => addItemReqManual(values)}
                                                className="mr-1"
                                            >
                                                <span className="mr-1">+</span>
                                                <span>{t("AddManual")}</span>
                                            </Button>
                                        </ButtonToolbar>
                                        <Row className="mb-2">
                                            <Col xs={12}>
                                                <AddItemRequest
                                                    rowDataItemReq={raisePRStates.rowDataItemReq}
                                                    onDeleteItem={(uuid, rowData) => onDeleteItemReq(uuid, rowData)}
                                                    suppliers={values.supplierCode.length > 0
                                                        ? values.supplierCode
                                                        : raisePRStates.suppliers}
                                                    uoms={raisePRStates.uoms}
                                                    currencies={raisePRStates.currencies}
                                                    addresses={raisePRStates.addresses}
                                                    glAccounts={raisePRStates.glAccounts}
                                                    taxRecords={raisePRStates.taxRecords}
                                                    listCategory={raisePRStates.listCategory}
                                                    onCellValueChanged={(params) => onEditRowAddItemReq(params)}
                                                    gridHeight={350}
                                                    isProject={values.project}
                                                    convertPPR2PR
                                                    listAllSuppliers={raisePRStates.listAllSuppliers}
                                                    priceTypes={raisePRStates.priceTypes}
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
                                                    <div>{formatDisplayDecimal(raisePRStates.subTotal, 2) || "0.00"}</div>
                                                    <div>{formatDisplayDecimal(raisePRStates.tax, 2) || "0.00"}</div>
                                                    <div>{formatDisplayDecimal(raisePRStates.total, 2) || "0.00"}</div>
                                                </div>
                                            </Row>
                                        </Row>
                                    </>
                                )
                            }
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
                                        sendConversation={(comment) => conversationActions.sendCommentConversation(comment, true)}
                                        addNewRowAttachment={() => attachmentActions.addNewRowAttachment(true)}
                                        rowDataConversation={internalConversations}
                                        rowDataAttachment={internalAttachments}
                                        onDeleteAttachment={(uuid, rowData) => attachmentActions.onDeleteAttachment(uuid, rowData, true)}
                                        onAddAttachment={(e, uuid, rowData) => attachmentActions.onAddAttachment(e, uuid, rowData, true)}
                                        onCellEditingStopped={(params) => attachmentActions.onCellEditingStopped(params, true)}
                                        defaultExpanded
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
                                        sendConversation={(comment) => conversationActions.sendCommentConversation(comment, false)}
                                        addNewRowAttachment={() => attachmentActions.addNewRowAttachment(false)}
                                        rowDataConversation={externalConversations}
                                        rowDataAttachment={externalAttachments}
                                        onDeleteAttachment={(uuid, rowData) => attachmentActions.onDeleteAttachment(uuid, rowData, false)}
                                        onAddAttachment={(e, uuid, rowData) => attachmentActions.onAddAttachment(e, uuid, rowData, false)}
                                        onCellEditingStopped={(params) => attachmentActions.onCellEditingStopped(params, false)}
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
                                    {/* Audit Trail */}
                                    <AuditTrail
                                        rowData={[]}
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
                                    {
                                        raisePRStates.prCreator || raisePRStates.isWorkRequest
                                            ? (
                                                <Row className="mx-0">
                                                    <Button
                                                        color="secondary"
                                                        className="mr-3"
                                                        type="button"
                                                        onClick={
                                                            () => {
                                                                handleSubmit();
                                                                if (!dirty
                                                                    || (dirty && Object.keys(errors).length)) {
                                                                    showToast("error", "Validation error, please check your input.");
                                                                    return;
                                                                }

                                                                onSavePressHandler(values, true);
                                                            }
                                                        }
                                                    >
                                                        {t("SaveAsDraft")}
                                                    </Button>
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

                                                                onSavePressHandler(values, false);
                                                            }
                                                        }
                                                    >
                                                        {t("Submit")}
                                                    </Button>
                                                </Row>
                                            ) : (
                                                <></>
                                            )
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
                                onPositiveAction={() => onAddNewItemCatalogue()}
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
                                pageSize={10}
                                selected={raisePRStates.rowDataDWRItem}
                                backendPagination
                                backendServerConfig={backendServerConfigCatalogue}
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
                                onPositiveAction={() => onAddNewItemForecast()}
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

                            {/* Dialog for PR */}
                            {/* Add Catalogue Dialog */}
                            <AddItemDialog
                                isShow={showAddCataloguePR}
                                onHide={() => {
                                    setShowAddCataloguePR(false);
                                    setSelectedCatalogueItemsPR([]);
                                }}
                                title={t("AddCatalogue")}
                                onPositiveAction={() => onAddNewItemCataloguePR(values)}
                                onNegativeAction={() => {
                                    setShowAddCataloguePR(false);
                                    setSelectedCatalogueItemsPR([]);
                                }}
                                columnDefs={CatalogueItemPRColDefs}
                                rowDataItem={[]}
                                onSelectionChanged={(params) => {
                                    setSelectedCatalogueItemsPR(params.api.getSelectedNodes());
                                }}
                                pageSize={10}
                                selected={raisePRStates.rowDataItemReq}
                                backendPagination
                                backendServerConfig={backendServerConfigCatalogue}
                            />
                            {/* Add Forecast And Catalogue Dialog */}
                            <AddItemDialog
                                isShow={showAddForecastPR}
                                onHide={() => {
                                    setShowAddForecastPR(false);
                                    setSelectedForecastItemsPR([]);
                                }}
                                title={t("AddCatalogue")}
                                onPositiveAction={() => onAddNewItemForecastPR(values)}
                                onNegativeAction={() => {
                                    setShowAddForecastPR(false);
                                    setSelectedForecastItemsPR([]);
                                }}
                                columnDefs={ForecastItemPRColDefs}
                                rowDataItem={[]}
                                onSelectionChanged={(params) => {
                                    setSelectedForecastItemsPR(params.api.getSelectedNodes());
                                }}
                                pageSize={10}
                                selected={raisePRStates.rowDataItemReq}
                                backendPagination
                                backendServerConfig={backendServerConfigForecast}
                            />
                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
        </Container>
    );
};

export default RaiseRequisition;
