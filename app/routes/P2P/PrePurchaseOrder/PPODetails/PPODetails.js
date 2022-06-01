/* eslint-disable max-len */
import React, {
    useState, useEffect, useRef, useMemo
} from "react";
import useToast from "routes/hooks/useToast";
import { usePermission } from "routes/hooks";
import StickyFooter from "components/StickyFooter";
import {
    Container, Row, Col, Button, ButtonToolbar
} from "components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
    Overview, Conversation, AddItemRequest, AddItemDialog
} from "routes/components";
import { v4 as uuidv4 } from "uuid";
import CatalogueService from "services/CatalogueService";
import CurrenciesService from "services/CurrenciesService";
import ExtVendorService from "services/ExtVendorService";
import AddressDataService from "services/AddressService";
import UOMDataService from "services/UOMService";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import GLDataService from "services/GLService";
import EntitiesService from "services/EntitiesService";
import TaxRecordDataService from "services/TaxRecordService";
import ProjectForecastService from "services/ProjectForecastService";
import PrePurchaseOrderService from "services/PrePurchaseOrderService/PrePurchaseOrderService";
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
    roundNumberWithUpAndDown
} from "helper/utilities";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { useLocation } from "react-router-dom";
import ActionModal from "routes/components/ActionModal";
import CategoryService from "services/CategoryService/CategoryService";
import { HeaderMain } from "routes/components/HeaderMain";
import UserService from "services/UserService";
import PRE_PURCHASE_ORDER_ROUTES from "../route";
import {
    InitialSetting,
    GeneralInformation,
    RequestTerms,
    SupplierInfor
} from "../components";
import { CatalogueItemColDefs, ForecastItemColDefs } from "../ColumnDefs";
import itemPOSchema from "../validation/validation";
import { getDataAuditTrail } from "../helper/utilities";

const PPODetails = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const refActionModalCancel = useRef(null);
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { userPermission } = permissionReducer;
    const [ppoDetailsStates, setPPODetailsStates] = useState({
        loading: true,
        isEdit: true,
        ppoDetails: null,
        ppoUuid: "",
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
        procurementTypes: [
            { label: "Goods", value: "Goods" },
            { label: "Service", value: "Service" }
        ],
        approvalRoutes: [],
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
        supplier: {},
        paymentTerms: "",
        activeAuditTrailTab: 1,
        rowDataOverview: [],
        listCategory: [],
        isPendingSubmission: false
    });
    const [itemDelete, setItemDelete] = useState({
        uuid: "",
        rowData: []
    });

    const permission = usePermission(FEATURE.PPO);
    const [showAddCatalogue, setShowAddCatalogue] = useState(false);
    const [selectedCatalogueItems, setSelectedCatalogueItems] = useState([]);
    const [showAddForecast, setShowAddForecast] = useState(false);
    const [selectedForecastItems, setSelectedForecastItems] = useState([]);
    const [listCatalogueBySupplier, setListCatalogueBySupplier] = useState([]);
    const [forecastItems, setForecastItems] = useState([]);
    // const [supplierUuid, setSupplierUuid] = useState(null);

    const initialValues = {
        project: false,
        projectCode: "",
        prNumber: "",
        ppoUuid: "",
        prePoStatus: "",
        currencyCode: "",
        supplier: {},
        prePoNumber: "",
        prePoTitle: "",
        procurementType: "",
        approvalRouteName: "",
        approvalRouteSequence: "",
        approvalRouteUuid: "",
        nextApprover: "",
        requestorUuid: "",
        requestorName: "",
        convertedDate: "",
        paymentTerms: "",
        address: {},
        addressUuid: "",
        remarks: ""
    };

    const validationSchema = Yup.object().shape({
        prePoTitle: Yup.string()
            .required(t("PleaseEnterValidPOTitle")),
        approvalRouteUuid: Yup.string()
            .required(t("PleaseSelectValidApprovalRoute")),
        addressUuid: Yup.string()
            .required(t("PleaseSelectValidAddress"))
    });

    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        cellRendererParams: { suppressCount: true },
        valueFormatter: (params) => params.data.type
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const ppoUuid = query.get("uuid");
        setPPODetailsStates((prevStates) => ({
            ...prevStates,
            ppoUuid
        }));
    }, []);

    const onSubmitPressHandler = async (values, saveAsDraft = false) => {
        try {
            const {
                rowDataInternalAttachment,
                rowDataExternalAttachment,
                rowDataItemReq,
                companyUuid,
                ppoUuid,
                ppoDetails
            } = ppoDetailsStates;
            const { supplierName, supplierUuid } = ppoDetails;
            const body = {};
            body.prePoTitle = values.prePoTitle;
            body.remarks = values.remarks;
            body.approvalRouteUuid = values.approvalRouteUuid;
            body.procurementType = values.procurementType;

            let prePoDocumentMetadata = rowDataInternalAttachment.concat(rowDataExternalAttachment);
            prePoDocumentMetadata = prePoDocumentMetadata.map(
                ({ uuid, ...rest }) => rest
            );

            await itemAttachmentSchema.validate(
                prePoDocumentMetadata.filter((item) => item.isNew === true)
            );

            prePoDocumentMetadata = prePoDocumentMetadata.filter(
                (item) => (item.fileDescription || item.attachment || item.fileLabel || item.guid)
                    && item.isNew === true
            ).map(({
                isNew, uploadedOn, fileLabel, attachment, uploadedTime, ...item
            }) => ({
                ...item,
                fileLabel: fileLabel || attachment,
                uploadedOn: convertToLocalTime(uploadedTime || uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
            }));
            body.prePoDocumentMetadata = prePoDocumentMetadata;

            const itemRequests = rowDataItemReq.map(
                ({
                    uuid,
                    accountNumber,
                    address,
                    requestedDeliveryDate,
                    sourceCurrency,
                    taxCode,
                    uom,
                    exchangeRate,
                    itemQuantity,
                    inDocumentCurrencyAfterTax,
                    inDocumentCurrencyBeforeTax,
                    inSourceCurrencyBeforeTax,
                    taxAmountInDocumentCurrency,
                    itemCategory,
                    ...rest
                }) => ({
                    ...rest,
                    accountNumber: accountNumber?.accountNumber,
                    address: {
                        addressLabel: address.addressLabel,
                        addressFirstLine: address.addressFirstLine,
                        addressSecondLine: address.addressSecondLine,
                        city: address.city,
                        state: address.state,
                        country: address.country,
                        postalCode: address.postalCode
                    },
                    requestedDeliveryDate: formatDateString(requestedDeliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
                    sourceCurrency: sourceCurrency?.currencyCode,
                    taxCode: taxCode?.taxCode,
                    uom: uom?.uomCode,
                    exchangeRate: Number(exchangeRate),
                    itemQuantity: Number(itemQuantity),
                    supplierName,
                    supplierUuid,
                    itemCategory: itemCategory?.categoryName || itemCategory || ppoDetailsStates.listCategory[0].categoryName
                })
            );
            await itemPOSchema.validate(itemRequests);

            body.prePoItem = itemRequests;

            let response = null;
            if (!saveAsDraft) {
                response = await PrePurchaseOrderService.submitPPO(companyUuid, ppoUuid, body);
            }
            if (saveAsDraft) {
                response = await PrePurchaseOrderService.saveAsDraftPPO(companyUuid, ppoUuid, body);
            }

            if (response?.data?.status === RESPONSE_STATUS.OK) {
                body.prePoItem.forEach(async (item) => {
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
                            categoryDto: ppoDetailsStates.listCategory
                                .filter((cat) => cat.categoryName === item.itemCategory)[0]
                        };
                        await CatalogueService.postCreateCatalogue(bodyCategory);
                    }
                });
                // conversation
                if (ppoDetailsStates.externalConversationLines.length > 0) {
                    const conversationBody = {
                        referenceId: ppoUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: ppoDetailsStates.externalConversationLines
                    };
                    await ConversationService
                        .createExternalConversation(companyUuid, conversationBody);
                }
                if (ppoDetailsStates.internalConversationLines.length > 0) {
                    const conversationBody = {
                        referenceId: ppoUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: ppoDetailsStates.internalConversationLines
                    };
                    await ConversationService
                        .createInternalConversation(companyUuid, conversationBody);
                }
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(PRE_PURCHASE_ORDER_ROUTES.PPO_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const getTypeOfRequisitions = (features) => {
        const typeOfRequisitions = [];
        features.forEach((feature) => {
            if (["PR", "WR", "VR", "BC"].indexOf(feature.featureCode) > -1) {
                typeOfRequisitions.push({
                    label: feature.feature.featureName,
                    value: feature.featureName
                });
            }
        });
        return typeOfRequisitions;
    };

    const getSupplier = async (companyUuid, supplierUuid) => {
        try {
            const response = await ExtVendorService.getExternalVendorDetails(companyUuid, supplierUuid);
            const { data } = response.data;
            const { addressesDto, supplierUserList, paymentTerm } = data;
            const contactPerson = supplierUserList.find((item) => item.default === true);
            const supplier = {};
            supplier.companyCode = data.companyCode;
            supplier.companyName = data.companyName;
            supplier.companyRegNo = data.companyRegNo;
            supplier.contactPersonEmail = contactPerson.emailAddress;
            supplier.contactPersonName = contactPerson.fullName;
            supplier.contactPersonWorkNumber = contactPerson.workNumber;
            supplier.countryCode = `+ ${contactPerson.countryCode}`;
            supplier.uuid = data.uuid;
            return {
                addressesDto,
                supplier,
                paymentTerms: paymentTerm.ptName
            };
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
        return [];
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
            const { ppoUuid } = ppoDetailsStates;
            // const responseCatalogueItems = await CatalogueService.getCatalogues(
            //     companyUuid
            // );
            // const catalogueItems = responseCatalogueItems.data.data.filter(
            //     (item) => item.manual === false && item.active === true
            // );
            const catalogueItems = [];

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

            const responseApprovalRoutes = await ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                companyUuid, "PPO"
            );

            const responseAddresses = await AddressDataService.getCompanyAddresses(
                companyUuid
            );

            const addresses = responseAddresses.data.data.filter(
                (address) => address.active === true
            ).sort(
                (a, b) => {
                    if (a.addressLabel.toUpperCase() < b.addressLabel.toUpperCase()) return -1;
                    if (a.addressLabel.toUpperCase() > b.addressLabel.toUpperCase()) return 1;
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

            const listUserFeature = userPermission[permissionReducer.featureBasedOn];
            let typeOfRequisitions = [];
            if (listUserFeature) {
                typeOfRequisitions = getTypeOfRequisitions(listUserFeature.features);
            }

            const responsePPODetails = await PrePurchaseOrderService.getPPODetails(
                companyUuid, ppoUuid
            );

            const { data } = responsePPODetails.data;

            const supplier = await getSupplier(
                companyUuid,
                data.supplier ? data.supplier.uuid : data.supplierUuid
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

            const overview = [];
            try {
                const resOverview = await PrePurchaseOrderService
                    .getPPOOverviewDetails(companyUuid, ppoUuid);
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
                showToast("error", error.response ? error.response.data.message : error.message);
            }

            // get internal/external conversation list
            let rowDataExternalConversation = [];
            let rowDataInternalConversation = [];
            const { pprUuid, prUuid, uuid } = data;
            const responses = await Promise.allSettled([
                pprUuid && ConversationService.getDetailInternalConversation(companyUuid, pprUuid),
                pprUuid && ConversationService.getDetailExternalConversation(companyUuid, pprUuid),
                prUuid && ConversationService.getDetailInternalConversation(companyUuid, prUuid),
                prUuid && ConversationService.getDetailExternalConversation(companyUuid, prUuid),
                ConversationService.getDetailInternalConversation(companyUuid, uuid),
                ConversationService.getDetailExternalConversation(companyUuid, uuid)
            ]);
            const [
                responseInternalConversationsPPR,
                responseExternalConversationsPPR,
                responseInternalConversationsPR,
                responseExternalConversationsPR,
                responseInternalConversationsPPO,
                responseExternalConversationsPPO
            ] = responses;

            rowDataExternalConversation = rowDataExternalConversation.concat(
                getDataConversation(responseExternalConversationsPPR, false),
                getDataConversation(responseExternalConversationsPR, false),
                getDataConversation(responseExternalConversationsPPO, false)
            );
            rowDataInternalConversation = rowDataInternalConversation.concat(
                getDataConversation(responseInternalConversationsPPR),
                getDataConversation(responseInternalConversationsPR),
                getDataConversation(responseInternalConversationsPPO)
            );

            setPPODetailsStates((prevStates) => ({
                ...prevStates,
                typeOfRequisitions,
                companyUuid,
                catalogueItems,
                currencies,
                approvalRoutes: responseApprovalRoutes.data.data,
                addresses,
                uoms: responseUOMs.data.data,
                glAccounts: responseGLAccounts.data.data,
                taxRecords,
                ppoDetails: responsePPODetails.data.data,
                suppliers: supplier.addressesDto,
                supplier: supplier.supplier,
                paymentTerms: supplier.paymentTerms,
                listCategory,
                rowDataOverview: overview,
                rowDataInternalConversation,
                rowDataExternalConversation,
                isPendingSubmission: data.prePoStatus === "SAVE_AS_DRAFT"
                    || data.prePoStatus === "SAVED_AS_DRAFT" || data.prePoStatus === "RECALLED"
                    || data.prePoStatus === "SENT_BACK"
            }));
            if (data?.project) {
                // If PPO is Project -> Don't change the logic
                setListCatalogueBySupplier(catalogueItems);
            } else {
                setListCatalogueBySupplier(catalogueItems?.filter((e) => !e?.supplierCode || e?.supplierCode === data?.supplier?.companyCode));
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const sendCommentConversation = async (comment, isInternal) => {
        if (isInternal) {
            const internalConversationLines = [...ppoDetailsStates.internalConversationLines];
            const { rowDataInternalConversation } = ppoDetailsStates;
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
            setPPODetailsStates((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = ppoDetailsStates;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...ppoDetailsStates.externalConversationLines];
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
        setPPODetailsStates((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation: newRowData,
            externalConversationLines
        }));
    };

    const addNewRowAttachment = (isInternal) => {
        if (isInternal) {
            const { rowDataInternalAttachment } = ppoDetailsStates;
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
            setPPODetailsStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = ppoDetailsStates;
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
        setPPODetailsStates((prevStates) => ({
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
            if (response.data.status === RESPONSE_STATUS.OK) {
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
            if (response.data.status === RESPONSE_STATUS.OK) {
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
                setPPODetailsStates((prevStates) => ({
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
            setPPODetailsStates((prevStates) => ({
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
            setPPODetailsStates((prevStates) => ({
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
        setPPODetailsStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onCellEditingStopped = (params, isInternal) => {
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = ppoDetailsStates;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setPPODetailsStates((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = ppoDetailsStates;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setPPODetailsStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const addItemReqManual = (values) => {
        const { rowDataItemReq, addresses } = ppoDetailsStates;
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
            requestedDeliveryDate: values.deliveryDate || new Date(),
            accountNumber: "",
            note: "",
            projectForecastTradeCode: "",
            manualItem: true,
            isManual: true,
            itemCategory: ppoDetailsStates.listCategory[0].categoryName
        });
        setPPODetailsStates((prevStates) => ({
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
            setPPODetailsStates((prevStates) => ({
                ...prevStates,
                rowDataItemReq: newRowData
            }));
            setListCatalogueBySupplier(newCatalogueItems);
            setForecastItems(newForecastItems);
        }
    }, [itemDelete.uuid]);

    const onEditRowAddItemReq = (params) => {
        const { data, colDef, newValue } = params;
        const { field } = colDef;
        const { rowDataItemReq } = ppoDetailsStates;
        const newRowData = [...rowDataItemReq];
        if (field === "supplierUuid") {
            rowDataItemReq.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].supplierName = newValue.companyName;
                    newRowData[index].inSourceCurrencyBeforeTax = (data.itemQuantity || 0) * (data.itemUnitPrice || 0);
                    newRowData[index].inDocumentCurrencyBeforeTax = newRowData[index].inSourceCurrencyBeforeTax * (data.exchangeRate || 0);
                    newRowData[index].taxAmountInDocumentCurrency = ((newRowData[index].taxRate || 0) * newRowData[index].inDocumentCurrencyBeforeTax) / 100;
                    newRowData[index].inDocumentCurrencyAfterTax = newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency;
                }
            });
        } else if (field === "taxCode") {
            rowDataItemReq.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].taxRate = newValue.taxRate || 0;
                    newRowData[index].inSourceCurrencyBeforeTax = (data.itemQuantity || 0) * (data.itemUnitPrice || 0);
                    newRowData[index].inDocumentCurrencyBeforeTax = newRowData[index].inSourceCurrencyBeforeTax * (data.exchangeRate || 0);
                    newRowData[index].taxAmountInDocumentCurrency = ((newRowData[index].taxRate || 0) * newRowData[index].inDocumentCurrencyBeforeTax) / 100;
                    newRowData[index].inDocumentCurrencyAfterTax = newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency;
                }
            });
        } else if (field === "sourceCurrency") {
            const { sourceCurrency } = data;
            const { exchangeRate } = sourceCurrency;

            rowDataItemReq.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].exchangeRate = exchangeRate;
                    newRowData[index].inSourceCurrencyBeforeTax = data.itemQuantity * data.itemUnitPrice;
                    newRowData[index].inDocumentCurrencyBeforeTax = newRowData[index].inSourceCurrencyBeforeTax * data.exchangeRate;
                    newRowData[index].taxAmountInDocumentCurrency = (newRowData[index].taxRate * newRowData[index].inDocumentCurrencyBeforeTax) / 100;
                    newRowData[index].inDocumentCurrencyAfterTax = newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency;
                }
            });
        } else {
            rowDataItemReq.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = data;
                    newRowData[index].inSourceCurrencyBeforeTax = (data.itemQuantity || 0) * (data.itemUnitPrice || 0);
                    newRowData[index].inDocumentCurrencyBeforeTax = newRowData[index].inSourceCurrencyBeforeTax * (data.exchangeRate || 0);
                    newRowData[index].taxAmountInDocumentCurrency = ((newRowData[index].taxRate || 0) * newRowData[index].inDocumentCurrencyBeforeTax) / 100;
                    newRowData[index].inDocumentCurrencyAfterTax = newRowData[index].inDocumentCurrencyBeforeTax + newRowData[index].taxAmountInDocumentCurrency;
                }
            });
        }

        const subTotal = rowDataItemReq.reduce((a, b) => a + b.inDocumentCurrencyBeforeTax, 0);
        const tax = rowDataItemReq.reduce((a, b) => a + b.taxAmountInDocumentCurrency, 0);
        const total = roundNumberWithUpAndDown(subTotal) + roundNumberWithUpAndDown(tax);

        params.api.setRowData(newRowData);
        setPPODetailsStates((prevStates) => ({
            ...prevStates,
            rowDataItemReq: newRowData,
            subTotal,
            tax,
            total
        }));
    };

    const onChangeApprovalRoute = (e, setFieldValue) => {
        const { value } = e.target;
        setFieldValue("approvalRouteUuid", value);
    };

    const getProjectForecastItem = async (projectCode) => {
        const { companyUuid } = ppoDetailsStates;
        const responseForecastDetail = await ProjectForecastService.getProjectForecastDetail(companyUuid, projectCode);
        const listForecastItem = [];
        if (responseForecastDetail.data.status === RESPONSE_STATUS.OK) {
            const { data } = responseForecastDetail.data;
            const {
                projectForecastTradeDetailsDtoList
            } = data;

            projectForecastTradeDetailsDtoList.forEach((tradeItem) => {
                const { projectForecastItemList, tradeCode } = tradeItem;
                projectForecastItemList.forEach((element) => {
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
            });
        }

        return {
            listForecastItem
        };
    };

    const onAddNewItemForecast = (values) => {
        const {
            rowDataItemReq, addresses
        } = ppoDetailsStates;
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

            const sourceCurrency = ppoDetailsStates.currencies.find(
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
                uom: ppoDetailsStates.uoms.find(
                    (item) => item.uomCode.toLowerCase() === data.uomCode.toLowerCase()
                ),
                itemQuantity: data.itemQuantity || 0,
                sourceCurrency,
                editableCurrency: !sourceCurrency,
                itemUnitPrice: data.unitPrice,
                editableUnitPrice: !Number(data.unitPrice),
                exchangeRate,
                editableExchangeRate: !Number(exchangeRate),
                taxCode: ppoDetailsStates.taxRecords.find(
                    (item) => item.taxCode.toLowerCase() === data.taxCode?.toLowerCase()
                ),
                taxRate: data.taxRate,
                supplierName: data.supplierName || "",
                supplierUuid: data.supplierCode
                    ? ppoDetailsStates.suppliers.find(
                        (item) => item.companyCode === data.supplierCode
                    ) : "",
                note: "",
                address: address || addresses[0],
                requestedDeliveryDate: values.deliveryDate
                    ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                    : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
                accountNumber: ppoDetailsStates.glAccounts.find(
                    (item) => item.accountNumber === data.glAccountNumber
                ),
                itemCategory: {
                    categoryName: data.itemCategory
                },
                projectForecastTradeCode: data.projectForecastTradeCode,
                uomForecast: data.forecastedPrice ? data.uomCode : "",
                unitPriceForecasted: data.forecastedPrice ? data.forecastedPrice : 0
            };

            itemRequest.inSourceCurrencyBeforeTax = data.itemQuantity * data.itemUnitPrice;
            itemRequest.inDocumentCurrencyBeforeTax = itemRequest.inSourceCurrencyBeforeTax * data.exchangeRate;
            itemRequest.taxAmountInDocumentCurrency = (itemRequest.taxRate * itemRequest.inDocumentCurrencyBeforeTax) / 100;
            itemRequest.inDocumentCurrencyAfterTax = itemRequest.inDocumentCurrencyBeforeTax + itemRequest.taxAmountInDocumentCurrency;
            newRowData.push(itemRequest);
        });
        setPPODetailsStates((prevStates) => ({
            ...prevStates,
            rowDataItemReq: newRowData
        }));
        setSelectedForecastItems([]);
        setForecastItems(newForecastItems);
    };

    const onAddNewItemCatalogue = (values) => {
        const { rowDataItemReq, addresses } = ppoDetailsStates;
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
            const sourceCurrency = ppoDetailsStates.currencies.find(
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
                uom: ppoDetailsStates.uoms.find(
                    (item) => item.uomCode.toLowerCase() === data.uomCode.toLowerCase()
                ),
                itemQuantity: data.itemQuantity || 0,
                sourceCurrency,
                editableCurrency: !sourceCurrency,
                itemUnitPrice: data.unitPrice,
                editableUnitPrice: !Number(data.unitPrice),
                exchangeRate,
                editableExchangeRate: !Number(exchangeRate),
                taxCode: ppoDetailsStates.taxRecords.find(
                    (item) => item.taxCode.toLowerCase() === data.taxCode?.toLowerCase()
                ),
                taxRate: data.taxRate,
                supplierName: data.supplierName || "",
                supplierUuid: data.supplierCode
                    ? ppoDetailsStates.suppliers.find(
                        (item) => item.companyCode === data.supplierCode
                    ) : "",
                note: "",
                address: address || addresses[0],
                requestedDeliveryDate: values.deliveryDate
                    ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                    : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
                accountNumber: ppoDetailsStates.glAccounts.find(
                    (item) => item.accountNumber === data.glAccountNumber
                ),
                itemCategory: {
                    categoryName: data.itemCategory
                }
            };

            itemRequest.inSourceCurrencyBeforeTax = data.itemQuantity * data.itemUnitPrice;
            itemRequest.inDocumentCurrencyBeforeTax = itemRequest.inSourceCurrencyBeforeTax * data.exchangeRate;
            itemRequest.taxAmountInDocumentCurrency = (itemRequest.taxRate * itemRequest.inDocumentCurrencyBeforeTax) / 100;
            itemRequest.inDocumentCurrencyAfterTax = itemRequest.inDocumentCurrencyBeforeTax + itemRequest.taxAmountInDocumentCurrency;
            newRowData.push(itemRequest);
        });
        setPPODetailsStates((prevStates) => ({
            ...prevStates,
            rowDataItemReq: newRowData
        }));
        setSelectedCatalogueItems([]);
        setSelectedCatalogueItems(newCatalogueItems);
    };

    const onCancelPressHandler = async () => {
        try {
            const {
                companyUuid,
                ppoUuid
            } = ppoDetailsStates;

            const response = await PrePurchaseOrderService.cancelPPO(
                companyUuid, ppoUuid
            );

            if (response.data.status === RESPONSE_STATUS.OK) {
                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(PRE_PURCHASE_ORDER_ROUTES.PPO_LIST);
                }, 1000);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const catalogueBEServerConfig = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (query) => CatalogueService
            .getCataloguesV2(UserService.getCurrentCompanyUuid(), {
                ...query,
                supplier: ["GENERIC", ppoDetailsStates?.supplier?.uuid].join(",")
            }).then(({ data: { data } }) => data)
    }), [ppoDetailsStates.supplier]);

    return (
        <Container fluid>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={() => { }}
                validateOnChange
            >
                {({
                    errors, values, touched, handleChange, setFieldValue, dirty, setTouched
                }) => {
                    useEffect(() => {
                        if (
                            !_.isEmpty(userDetails)
                            && !_.isEmpty(permissionReducer)
                            && ppoDetailsStates.ppoUuid
                        ) {
                            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
                            if (companyUuid) initData(companyUuid);
                        }
                    }, [userDetails, ppoDetailsStates.ppoUuid, permissionReducer]);

                    useEffect(() => {
                        if (
                            ppoDetailsStates.ppoDetails
                            && (permission?.read || permission?.write || permission?.approve)
                        ) {
                            const isEdit = permission?.write && permission?.read
                                && ppoDetailsStates.ppoDetails?.prePoCreator;
                            setPPODetailsStates((prevStates) => ({
                                ...prevStates,
                                isEdit
                            }));
                        }
                    }, [permission, ppoDetailsStates.ppoDetails]);

                    useEffect(() => {
                        if (ppoDetailsStates.ppoDetails) {
                            const {
                                ppoDetails,
                                addresses,
                                glAccounts,
                                currencies,
                                taxRecords,
                                suppliers,
                                supplier,
                                paymentTerms,
                                uoms,
                                catalogueItems,
                                isPendingSubmission
                            } = ppoDetailsStates;
                            const {
                                prePoAuditTrail, prePoDocumentMetadata, prePoItem
                            } = ppoDetails;
                            setFieldValue("project", ppoDetails.project);
                            if (ppoDetails.project) {
                                setFieldValue("projectCode", ppoDetails.projectCode);
                            }
                            setFieldValue("prNumber", ppoDetails.prNumber);
                            setFieldValue("prUuid", ppoDetails.prUuid);
                            setFieldValue("ppoUuid", ppoDetails.uuid);
                            let status = "";
                            const { prePoStatus } = ppoDetails;
                            if (prePoStatus === "SAVE_AS_DRAFT"
                                || prePoStatus === "SAVED_AS_DRAFT"
                            ) {
                                status = "PENDING SUBMISSION";
                            } else if (prePoStatus === "PENDING_APPROVAL") {
                                status = "PENDING PRE-PO APPROVAL";
                            } else if (prePoStatus === "PENDING_CONVERT_TO_PO") {
                                status = "PENDING CONVERSION TO PO";
                            } else {
                                status = prePoStatus.replaceAll("_", " ");
                            }
                            setFieldValue("prePoStatus", status);
                            setFieldValue("currencyCode", ppoDetails.currencyCode);
                            setFieldValue("supplier", ppoDetails.supplier || supplier);
                            setFieldValue("prePoNumber", ppoDetails.prePoNumber);
                            setFieldValue("prePoTitle", ppoDetails.prePoTitle, true);
                            setFieldValue("procurementType", ppoDetails.procurementType || "");
                            setFieldValue("approvalRouteName", ppoDetails.approvalRouteName || "");
                            setFieldValue("approvalRouteSequence", ppoDetails.approvalRouteSequence || "");
                            setFieldValue("approvalRouteUuid", ppoDetails.approvalRouteUuid || "", true);
                            setFieldValue("nextApprover", ppoDetails.nextApprover || "");
                            setFieldValue("requestorUuid", ppoDetails.requestorUuid || "");
                            setFieldValue("requestorName", ppoDetails.requestorName || "");
                            setFieldValue("convertedDate",
                                ppoDetails.submittedDate
                                    ? convertToLocalTime(ppoDetails.submittedDate)
                                    : ppoDetails.submittedDate || "");
                            setFieldValue("paymentTerms", ppoDetails.paymentTerms || paymentTerms);
                            if (ppoDetails.address) {
                                setFieldValue("addressUuid", suppliers.find(
                                    (item) => item.addressFirstLine === ppoDetails.address.addressFirstLine
                                        && item.addressLabel === ppoDetails.address.addressLabel
                                        && item.addressSecondLine === ppoDetails.address.addressSecondLine
                                        && item.city === ppoDetails.address.city
                                        && item.country === ppoDetails.address.country
                                        && item.postalCode === ppoDetails.address.postalCode
                                        && item.state === ppoDetails.address.state
                                )?.uuid, true);
                                setFieldValue("address", ppoDetails.address || {});
                            } else {
                                setFieldValue("addressUuid", suppliers[0].uuid, true);
                                setFieldValue("address", suppliers[0]);
                            }
                            setFieldValue("remarks", ppoDetails.remarks || "");

                            const rowDataItemReq = prePoItem.map(
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
                                        taxCode: taxRecords.find(
                                            (item) => item.taxCode.toLowerCase() === taxCode?.toLowerCase()
                                        ),
                                        uom: uoms.find(
                                            (item) => item.uomCode.toLowerCase() === uom?.toLowerCase()
                                        ),
                                        requestedDeliveryDate: formatDateTime(requestedDeliveryDate, CUSTOM_CONSTANTS.YYYYMMDD),
                                        uuid: uuidv4()
                                    };

                                    itemReq.inSourceCurrencyBeforeTax = (itemReq.itemQuantity || 0) * (itemReq.itemUnitPrice || 0);
                                    itemReq.inDocumentCurrencyBeforeTax = itemReq.inSourceCurrencyBeforeTax * (itemReq.exchangeRate || 0);
                                    itemReq.taxAmountInDocumentCurrency = ((itemReq.taxRate || 0) * itemReq.inDocumentCurrencyBeforeTax) / 100;
                                    itemReq.inDocumentCurrencyAfterTax = itemReq.inDocumentCurrencyBeforeTax + itemReq.taxAmountInDocumentCurrency;

                                    return itemReq;
                                }
                            );

                            let newCatalogueItems = [...catalogueItems];
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
                            newCatalogueItems = newCatalogueItems.filter((item) => !item?.supplierCode
                                || item?.supplierCode === supplier?.companyCode);

                            if (ppoDetails.project) {
                                setFieldValue("projectCode", ppoDetails.projectCode);
                                getProjectForecastItem(ppoDetails.projectCode).then((data) => {
                                    const {
                                        listForecastItem
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
                                        }
                                    });

                                    if (isPendingSubmission) {
                                        rowDataItemReq.forEach((item, index) => {
                                            listForecastItem.forEach((value) => {
                                                if (item.itemCode === value.catalogueItemCode) {
                                                    rowDataItemReq[index].uomForecast = value.uomCode;
                                                    rowDataItemReq[index].unitPriceForecasted = value.forecastedPrice;
                                                }
                                            });
                                        });
                                    }

                                    setForecastItems(newForecastItems);
                                });
                            }

                            const subTotal = rowDataItemReq.reduce((a, b) => a + b.inDocumentCurrencyBeforeTax, 0);
                            const tax = rowDataItemReq.reduce((a, b) => a + b.taxAmountInDocumentCurrency, 0);
                            const total = roundNumberWithUpAndDown(subTotal) + roundNumberWithUpAndDown(tax);

                            const rowDataAuditTrail = getDataAuditTrail(prePoAuditTrail);

                            const rowDataInternalAttachment = prePoDocumentMetadata.filter(
                                (attachment) => attachment.externalDocument === false
                            ).map(({ uploadedOn, ...item }) => ({
                                ...item,
                                uploadedTime: uploadedOn,
                                uploadedOn: convertToLocalTime(uploadedOn)
                            }));

                            const rowDataExternalAttachment = prePoDocumentMetadata.filter(
                                (attachment) => attachment.externalDocument === true
                            ).map(({ uploadedOn, ...item }) => ({
                                ...item,
                                uploadedTime: uploadedOn,
                                uploadedOn: convertToLocalTime(uploadedOn)
                            }));

                            setPPODetailsStates((prevStates) => ({
                                ...prevStates,
                                loading: false,
                                rowDataInternalAttachment,
                                rowDataExternalAttachment,
                                rowDataItemReq,
                                rowDataAuditTrail,
                                subTotal,
                                tax,
                                total,
                                catalogueItems: newCatalogueItems
                            }));
                        }
                    }, [ppoDetailsStates.ppoDetails]);

                    useEffect(() => {
                        if (values.ppoUuid) {
                            setTouched({
                                ...touched,
                                addressUuid: true,
                                prePoTitle: true
                            });
                        }
                    }, [values]);

                    return (
                        <Form>
                            <HeaderMain
                                title={t("PrePurchaseOrderDetails")}
                                className="mb-3 mb-lg-3"
                            />
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            <InitialSetting
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                suppliers={ppoDetailsStates.suppliers}
                                                currencies={ppoDetailsStates.currencies}
                                                disabled
                                            />
                                            <SupplierInfor
                                                t={t}
                                                values={values}
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
                                                procurementTypes={ppoDetailsStates.procurementTypes}
                                                approvalRoutes={ppoDetailsStates.approvalRoutes}
                                                onChangeApprovalRoute={(e) => onChangeApprovalRoute(e, setFieldValue)}
                                                disabled={!ppoDetailsStates.isEdit}
                                                permission={permission}
                                                prePoCreator={ppoDetailsStates.ppoDetails?.prePoCreator}
                                            />
                                            {/* Request Terms */}
                                            <RequestTerms
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                addresses={ppoDetailsStates.suppliers}
                                                disabled={!ppoDetailsStates.isEdit}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <ButtonToolbar className="justify-content-end mb-2">
                                <Button
                                    color="primary"
                                    onClick={() => {
                                        if (!values.project) setShowAddCatalogue(true);
                                        else setShowAddForecast(true);
                                    }}
                                    className="mr-1"
                                    disabled={!ppoDetailsStates.isEdit}
                                >
                                    <span className="mr-1">+</span>
                                    <span>{t("AddCatalogue")}</span>
                                </Button>
                                <Button
                                    color="primary"
                                    onClick={() => addItemReqManual(values)}
                                    className="mr-1"
                                    disabled={!ppoDetailsStates.isEdit}
                                >
                                    <span className="mr-1">+</span>
                                    <span>{t("AddManual")}</span>
                                </Button>
                            </ButtonToolbar>

                            <HeaderSecondary
                                title={t("PurchaseOrderItems")}
                                className="mb-2"
                            />
                            <Row className="mb-2">
                                <Col xs={12}>
                                    <AddItemRequest
                                        rowDataItemReq={ppoDetailsStates.rowDataItemReq}
                                        onDeleteItem={(uuid, rowData) => onDeleteItemReq(uuid, rowData)}
                                        suppliers={ppoDetailsStates.suppliers}
                                        uoms={ppoDetailsStates.uoms}
                                        currencies={ppoDetailsStates.currencies}
                                        addresses={ppoDetailsStates.addresses}
                                        glAccounts={ppoDetailsStates.glAccounts}
                                        taxRecords={ppoDetailsStates.taxRecords}
                                        onCellValueChanged={(params) => onEditRowAddItemReq(params)}
                                        gridHeight={350}
                                        disabled={!ppoDetailsStates.isEdit}
                                        isPurchaseOrderItems
                                        isProject={values.project}
                                        listCategory={ppoDetailsStates.listCategory}
                                        isPrePurchaseOrderItems
                                        isPendingSubmission={ppoDetailsStates.isPendingSubmission}
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
                                        <div>{t("SGD")}</div>
                                        <div>{t("SGD")}</div>
                                        <div>{t("SGD")}</div>
                                    </div>
                                    <div style={{ marginLeft: "40px" }}>
                                        <div>{formatDisplayDecimal(ppoDetailsStates.subTotal, 2) || "0.00"}</div>
                                        <div>{formatDisplayDecimal(ppoDetailsStates.tax, 2) || "0.00"}</div>
                                        <div>{formatDisplayDecimal(ppoDetailsStates.total, 2) || "0.00"}</div>
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
                                        activeTab={ppoDetailsStates.activeInternalTab}
                                        setActiveTab={(idx) => {
                                            setPPODetailsStates((prevStates) => ({
                                                ...prevStates,
                                                activeInternalTab: idx
                                            }));
                                        }}
                                        sendConversation={(comment) => sendCommentConversation(comment, true)}
                                        addNewRowAttachment={() => addNewRowAttachment(true)}
                                        rowDataConversation={ppoDetailsStates.rowDataInternalConversation}
                                        rowDataAttachment={ppoDetailsStates.rowDataInternalAttachment}
                                        onDeleteAttachment={(uuid, rowData) => onDeleteAttachment(uuid, rowData, true)}
                                        onAddAttachment={(e, uuid, rowData) => onAddAttachment(e, uuid, rowData, true)}
                                        onCellEditingStopped={(params) => onCellEditingStopped(params, true)}
                                        defaultExpanded
                                        disabled={!ppoDetailsStates.isEdit}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col xs={12}>
                                    {/* External Conversations */}
                                    <Conversation
                                        title={t("ExternalConversations")}
                                        activeTab={ppoDetailsStates.activeExternalTab}
                                        setActiveTab={(idx) => {
                                            setPPODetailsStates((prevStates) => ({
                                                ...prevStates,
                                                activeExternalTab: idx
                                            }));
                                        }}
                                        sendConversation={(comment) => sendCommentConversation(comment, false)}
                                        addNewRowAttachment={() => addNewRowAttachment(false)}
                                        rowDataConversation={ppoDetailsStates.rowDataExternalConversation}
                                        rowDataAttachment={ppoDetailsStates.rowDataExternalAttachment}
                                        onDeleteAttachment={(uuid, rowData) => onDeleteAttachment(uuid, rowData, false)}
                                        onAddAttachment={(e, uuid, rowData) => onAddAttachment(e, uuid, rowData, false)}
                                        onCellEditingStopped={(params) => onCellEditingStopped(params, false)}
                                        defaultExpanded
                                        borderTopColor="#A9A2C1"
                                        disabled={!ppoDetailsStates.isEdit}
                                    />
                                </Col>
                            </Row>

                            <HeaderSecondary
                                title={t("AuditTrail")}
                                className="mb-2"
                            />
                            <Row className="mb-5">
                                <Col xs={12}>
                                    {/* Audit Trail - Overview */}
                                    <Overview
                                        rowData={ppoDetailsStates.rowDataOverview}
                                        rowDataAuditTrail={ppoDetailsStates.rowDataAuditTrail}
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
                                        activeTab={ppoDetailsStates.activeAuditTrailTab}
                                        setActiveTab={(idx) => {
                                            setPPODetailsStates((prevStates) => ({
                                                ...prevStates,
                                                activeAuditTrailTab: idx
                                            }));
                                        }}
                                        companyUuid={ppoDetailsStates.companyUuid}
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
                                        ppoDetailsStates?.ppoDetails?.prePoCreator
                                            && !ppoDetailsStates?.ppoDetails?.approverRole
                                            && permission?.write
                                            && permission?.read
                                            ? (
                                                <Row className="mx-0">
                                                    {
                                                        values.prePoStatus !== "SENT BACK"
                                                        && (
                                                            <Button
                                                                color="danger"
                                                                className="mr-3"
                                                                type="submit"
                                                                onClick={() => refActionModalCancel.current.toggleModal()}
                                                                disabled={ppoDetailsStates.loading}
                                                            >
                                                                {t("Cancel")}
                                                            </Button>
                                                        )
                                                    }
                                                    {
                                                        (
                                                            values.prePoStatus === "PENDING SUBMISSION"
                                                        )
                                                        && (
                                                            <Button
                                                                color="secondary"
                                                                className="mr-3"
                                                                type="submit"
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
                                                                disabled={ppoDetailsStates.loading}
                                                            >
                                                                {t("SaveAsDraft")}
                                                            </Button>
                                                        )
                                                    }
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

                                                                onSubmitPressHandler(values);
                                                            }
                                                        }
                                                        disabled={ppoDetailsStates.loading}
                                                    >
                                                        {t("Submit")}
                                                    </Button>
                                                </Row>
                                            ) : (<></>)
                                    }

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
                                columnDefs={CatalogueItemColDefs}
                                rowDataItem={listCatalogueBySupplier}
                                onSelectionChanged={(params) => {
                                    setSelectedCatalogueItems(params.api.getSelectedNodes());
                                }}
                                pageSize={10}
                                selected={ppoDetailsStates.rowDataItemReq}
                                backendPagination
                                backendServerConfig={catalogueBEServerConfig}
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
                                columnDefs={ForecastItemColDefs}
                                rowDataItem={forecastItems}
                                onSelectionChanged={(params) => {
                                    setSelectedForecastItems(params.api.getSelectedNodes());
                                }}
                                pageSize={10}
                                selected={ppoDetailsStates.rowDataItemReq}
                                backendPagination
                                backendServerConfig={catalogueBEServerConfig}
                            />
                        </Form>
                    );
                }}
            </Formik>
            <ActionModal
                ref={refActionModalCancel}
                title="Cancel Pre-Purchase Order"
                body="Do you wish to cancel this order?"
                button="Yes"
                color="primary"
                textCancel="No"
                colorCancel="danger"
                action={() => onCancelPressHandler()}
            />
        </Container>
    );
};

export default PPODetails;
