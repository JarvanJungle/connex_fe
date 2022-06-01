import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import useToast from "routes/hooks/useToast";
import useAttachment from "routes/hooks/useAttachment";
import useConversation from "routes/hooks/useConversation";
import useBudgetDetails from "routes/hooks/useBudgetDetails";
import useCustomState from "routes/hooks/useCustomState";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import StickyFooter from "components/StickyFooter";
import { Formik, Form } from "formik";
import {
    Container, Row, Col, Button, ButtonToolbar
} from "components";
import {
    AuditTrail, BudgetDetails, Conversation, AddItemDialog, HeaderMain
} from "routes/components";
import { v4 as uuidv4 } from "uuid";
import CatalogueService from "services/CatalogueService";
import ManageProjectService from "services/ManageProjectService";
import CurrenciesService from "services/CurrenciesService";
import ExtVendorService from "services/ExtVendorService";
import AddressDataService from "services/AddressService";
import UOMDataService from "services/UOMService";
import TaxRecordDataService from "services/TaxRecordService";
import ProjectService from "services/ProjectService/ProjectService";
import PurchaseRequestService from "services/PurchaseRequestService/PurchaseRequestService";
import RequestForQuotationService from "services/RequestForQuotationService";
import ConversationService from "services/ConversationService/ConversationService";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import _ from "lodash";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import {
    formatDateTime,
    convertToLocalTime,
    convertDate2String,
    getCurrentCompanyUUIDByStore,
    formatDateString
} from "helper/utilities";
import { CatalogueItemPRColDefs, ForecastItemPRColDefs } from "routes/P2P/PurchaseRequest/ColumnDefs";
import UserService from "services/UserService";
import {
    InitialSettings, VendorInformation, GeneralInformation, RequestTerms, AddItems, RaiseRequisition
} from "../components/Buyer";
import { itemsSchema, rfqFormSchema } from "../helper";
import { useAddItems } from "../hooks";
import RFQ_ROUTES from "../routes";

const RaiseRFQ = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userPermission } = permissionReducer;
    const { userDetails } = authReducer;
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
    const [activeInternalTab, setActiveInternalTab] = useState(1);
    const [activeExternalTab, setActiveExternalTab] = useState(1);
    const [
        rowDataProject, rowDataTrade, ,
        getBudgetDetailsByProjectCode
    ] = useBudgetDetails();
    const [contactPersons, setContactPersons] = useState({});
    const [isConvertPR, setIsConvertPR] = useState(false);
    const [companyUuid, setCompanyUuid] = useState("");
    const [purchaseDetails, setPurchaseDetails] = useCustomState({});
    const [vendors, setVendors] = useCustomState([]);
    const [uoms, setUOMs] = useCustomState([]);
    const [taxRecords, setTaxRecords] = useCustomState([]);
    const [currencies, setCurrencies] = useCustomState([]);
    const [addresses, setAddresses] = useCustomState([]);
    const [projects, setProjects] = useCustomState([]);
    const [showAddCatalogue, setShowAddCatalogue] = useState(false);
    const [selectedCatalogueItems, setSelectedCatalogueItems] = useState([]);
    const [showAddForecast, setShowAddForecast] = useState(false);
    const [selectedForecastItems, setSelectedForecastItems] = useState([]);
    const [gridApi, addItemActions] = useAddItems({ setDirtyFunc: setDirty });
    const [internalAttachments, externalAttachments, attachmentActions] = useAttachment({
        setDirtyFunc: setDirty,
        defaultValue: []
    });
    const [internalConversations, externalConversations, conversationActions] = useConversation();
    const [typeOfRequisitions, setTypeOfRequisitions] = useState([]);
    const [rfqStates] = useState({
        natureOfRequisitions: [
            { label: "Project", value: true },
            { label: "Non-Project", value: false }
        ],
        procurementTypes: [
            { label: "Goods", value: "Goods" },
            { label: "Service", value: "Service" }
        ],
        rfqTypes: [
            { label: "One-off quotation", value: "One-off" },
            { label: "Contract", value: "Contract" }
        ]
    });
    const [projectCode, setProjectCode] = useState("");

    const initialValues = {
        // Raise Requisition Form
        requisitionType: "",
        pprNumber: "",
        pprUuid: "",
        project: false,
        projectCode: "",
        projectUuid: "",
        rfqProcess: true,
        // Initial Settings Form
        rfqNumber: "",
        rfqStatus: "",
        currencyCode: "",
        // Vendor Information Form
        vendors: [],
        // General Information Form
        rfqTitle: "",
        procurementType: "",
        requester: "",
        submittedDate: "",
        // Request Terms Form
        rfqType: "",
        validityStartDate: "",
        validityEndDate: "",
        dueDate: "",
        deliveryAddress: "",
        deliveryDate: "",
        note: ""
    };

    const getTypeOfRequisitions = () => {
        const permissionUser = userPermission[permissionReducer.featureBasedOn];
        const listTypeOfRequisition = [];
        if (permissionUser) {
            permissionUser.features.forEach((item) => {
                if ([
                    FEATURE.PR,
                    FEATURE.WR,
                    FEATURE.VR,
                    FEATURE.BC,
                    FEATURE.DWR
                ].includes(item.featureCode)
                    && !listTypeOfRequisition.find(({ value }) => value === item.featureCode)
                ) {
                    listTypeOfRequisition.push({
                        label: item.feature.featureName,
                        value: item.featureCode
                    });
                }
            });
        }
        return listTypeOfRequisition;
    };

    const initData = async (currentCompanyUuid) => {
        try {
            const { search, state } = location;
            const query = new URLSearchParams(search);
            const purchaseUuid = query.get("prUuid");
            if (state?.purchaseDetails) {
                setPurchaseDetails(state.purchaseDetails);
            }
            const response = await Promise.allSettled([
                ManageProjectService.getCompanyProjectList(currentCompanyUuid),
                CurrenciesService.getCurrencies(currentCompanyUuid),
                ExtVendorService.getExternalVendors(currentCompanyUuid),
                AddressDataService.getCompanyAddresses(currentCompanyUuid),
                UOMDataService.getUOMRecords(currentCompanyUuid),
                TaxRecordDataService.getTaxRecords(currentCompanyUuid),
                purchaseUuid && PurchaseRequestService.getDetailsPurchaseRequisition(
                    currentCompanyUuid, purchaseUuid
                )
            ]);
            const [
                responseProjects,
                responseCurrencies,
                responseSuppliers,
                responseAddresses,
                responseUOMs,
                responseTaxRecords,
                responsePurchaseDetails
            ] = response;
            setProjects(
                responseProjects,
                {
                    isResponse: true,
                    filter: { condition: { projectStatus: "FORECASTED" } },
                    sort: { key: "projectTitle" }
                }
            );
            setCurrencies(
                responseCurrencies,
                {
                    isResponse: true,
                    filter: { condition: { active: true } },
                    sort: { key: "currencyName" }
                }
            );
            setVendors(
                responseSuppliers,
                {
                    isResponse: true,
                    filter: { condition: { seller: true } },
                    sort: { key: "companyName" }
                }
            );
            setAddresses(
                responseAddresses,
                {
                    isResponse: true,
                    filter: { condition: { active: true } },
                    sort: { key: "addressLabel" }
                }
            );
            setUOMs(
                responseUOMs,
                {
                    isResponse: true,
                    filter: { condition: { active: true } }
                }
            );
            setTaxRecords(
                responseTaxRecords,
                {
                    isResponse: true,
                    filter: { condition: { active: true } }
                }
            );
            if (purchaseUuid) {
                setPurchaseDetails(
                    responsePurchaseDetails,
                    { isResponse: true }
                );
            }
            setIsConvertPR(!!purchaseUuid);
            setCompanyUuid(currentCompanyUuid);
            setTypeOfRequisitions(getTypeOfRequisitions());
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onChangeProject = async (e, setFieldValue) => {
        setDirty();
        const { value } = e.target;
        setFieldValue("projectCode", value);
        setProjectCode(value);

        try {
            const response = await ProjectService.getProjectDetails(value);
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const { projectAddressDto, uuid } = data;
                setFieldValue("projectUuid", uuid);
                setFieldValue("deliveryAddress", projectAddressDto?.uuid ?? "");
                setFieldValue("currencyCode", data?.currency ?? "");

                await getBudgetDetailsByProjectCode(companyUuid, value);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onAddNewItemCatalogue = (values) => {
        setDirty();
        let address;
        if (values.deliveryAddress) {
            address = addresses.find((item) => item.uuid === values.deliveryAddress);
        }
        setShowAddCatalogue(false);

        const newRowData = [];
        selectedCatalogueItems.forEach((node) => {
            const { data } = node;

            const sourceCurrency = currencies.find(
                (item) => item.currencyCode.toLowerCase() === data.currencyCode.toLowerCase()
            );

            let exchangeRate = 0;
            if (sourceCurrency) {
                exchangeRate = sourceCurrency.exchangeRate;
            }

            const itemAdded = {
                uuid: uuidv4(),
                itemCode: data.catalogueItemCode,
                itemName: data.catalogueItemName,
                itemCategory: data?.categoryDto?.categoryName,
                itemCategoryUuid: data?.categoryDto?.uuid,
                itemDescription: data.description,
                itemModel: data.itemModel || "",
                itemSize: data.itemSize || "",
                itemBrand: data.itemBrand || "",
                uom: uoms.find(
                    (item) => item.uomCode.toLowerCase() === data.uomCode.toLowerCase()
                ),
                itemQuantity: data.itemQuantity,
                sourceCurrency,
                editableCurrency: !sourceCurrency,
                itemUnitPrice: data.unitPrice,
                editableUnitPrice: !Number(data.unitPrice),
                exchangeRate,
                taxCode: taxRecords.find(
                    (item) => item.taxCode.toLowerCase() === data.taxCode?.toLowerCase()
                ),
                taxRate: data.taxRate,
                note: "",
                address: address || addresses[0],
                requestedDeliveryDate: values.deliveryDate
                    ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                    : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD)
            };
            newRowData.push(itemAdded);
        });
        gridApi?.applyTransaction({ add: newRowData });
        setSelectedCatalogueItems([]);
    };

    const onAddNewItemForecast = (values) => {
        setDirty();
        let address;
        if (values.deliveryAddress) {
            address = addresses.find((item) => item.uuid === values.deliveryAddress);
        }
        const newRowData = [];
        setShowAddForecast(false);
        selectedForecastItems.forEach((node) => {
            const { data } = node;

            const sourceCurrency = currencies.find(
                (item) => item.currencyCode.toLowerCase() === data.currencyCode.toLowerCase()
            );
            const exchangeRate = sourceCurrency?.exchangeRate ?? 0;

            const itemRequest = {
                uuid: uuidv4(),
                itemCode: data.catalogueItemCode,
                itemName: data.catalogueItemName,
                itemCategory: data?.categoryDto?.categoryName,
                itemCategoryUuid: data?.categoryDto?.uuid,
                itemDescription: data.description,
                itemModel: data.itemModel || "",
                itemSize: data.itemSize || "",
                itemBrand: data.itemBrand || "",
                uom: uoms.find(
                    (item) => item.uomCode.toLowerCase() === data.uomCode.toLowerCase()
                ),
                itemQuantity: data.itemQuantity,
                sourceCurrency,
                editableCurrency: !sourceCurrency,
                itemUnitPrice: values.project
                    ? data?.forecast?.itemUnitPrice ?? data.unitPrice
                    : data.unitPrice,
                editableUnitPrice: !Number(data.unitPrice),
                exchangeRate,
                taxCode: taxRecords.find(
                    (item) => item.taxCode.toLowerCase() === data.taxCode?.toLowerCase()
                ),
                taxRate: data.taxRate,
                address: address || addresses[0],
                requestedDeliveryDate: values.deliveryDate
                    ? convertDate2String(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDD)
                    : convertDate2String(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
                projectForecastTradeCode: data?.forecast?.tradeCode
            };

            newRowData.push(itemRequest);
        });
        gridApi?.applyTransaction({ add: newRowData });
        setSelectedForecastItems([]);
    };

    const validateItems = (items = []) => {
        // Not allow item with same itemCode
        const itemCodes = items.map(({ itemCode }) => itemCode);
        if ([...(new Set(itemCodes))].length !== items.length) throw new Error("Duplicated item found");
    };

    const mappingBody = async (values) => {
        try {
            const addressItem = addresses.find((item) => item.uuid === values.deliveryAddress);
            const deliveryAddress = {
                addressLabel: addressItem.addressLabel,
                addressFirstLine: addressItem.addressFirstLine,
                addressSecondLine: addressItem.addressSecondLine,
                city: addressItem.city,
                state: addressItem.state,
                country: addressItem.country,
                postalCode: addressItem.postalCode
            };
            const deliveryDate = convertToLocalTime(values.deliveryDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss);
            const validityStartDate = convertToLocalTime(values.validityStartDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss);
            const validityEndDate = convertToLocalTime(values.validityEndDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss);
            const dueDate = formatDateString(values.dueDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss);
            const body = {
                prUuid: values.prUuid,
                pprUuid: values.pprUuid,
                project: String(values.project) === "true",
                currencyCode: values.currencyCode,
                projectCode: values.projectCode,
                projectUuid: values.projectUuid,
                rfqTitle: values.rfqTitle,
                rfqType: values.rfqType,
                procurementType: values.procurementType,
                note: values.note,
                validityStartDate,
                validityEndDate,
                dueDate,
                rfqItemDtoList: [],
                rfqDocumentMetaDataDtoList: [],
                rfqVendorDtoList: [],
                deliveryAddress,
                deliveryDate,
                requisitionType: values.requisitionType
            };

            // rfqItemDtoList
            const rowDataItems = addItemActions.getRowDataItems();
            body.rfqItemDtoList = rowDataItems.map((rowItem) => {
                const address = {
                    addressLabel: rowItem?.address?.addressLabel,
                    addressFirstLine: rowItem?.address?.addressFirstLine,
                    addressSecondLine: rowItem?.address?.addressSecondLine,
                    city: rowItem?.address?.city,
                    state: rowItem?.address?.state,
                    country: rowItem?.address?.country,
                    postalCode: rowItem?.address?.postalCode
                };
                const sourceCurrency = typeof rowItem?.sourceCurrency === "string"
                    ? rowItem?.sourceCurrency
                    : rowItem?.sourceCurrency.currencyCode;
                const exchangeRate = rowItem?.sourceCurrency?.exchangeRate
                    ?? rowItem?.exchangeRate
                    ?? 1;
                const uom = typeof rowItem?.uom === "string"
                    ? rowItem?.uom
                    : rowItem?.uom.uomCode;
                const requestedDeliveryDate = convertToLocalTime(
                    rowItem?.requestedDeliveryDate,
                    CUSTOM_CONSTANTS.YYYYMMDDHHmmss
                );
                return {
                    itemCode: rowItem.itemCode,
                    itemName: rowItem.itemName,
                    itemCategory: rowItem.itemCategory,
                    itemCategoryUuid: rowItem.itemCategoryUuid,
                    itemDescription: rowItem.itemDescription,
                    itemModel: rowItem.itemModel,
                    itemSize: rowItem.itemSize,
                    itemBrand: rowItem.itemBrand,
                    sourceCurrency,
                    exchangeRate,
                    uom,
                    itemUnitPrice: Number(rowItem.itemUnitPrice || 0),
                    itemQuantity: Number(rowItem.itemQuantity || 0),
                    address,
                    requestedDeliveryDate,
                    note: rowItem.note,
                    projectForecastTradeCode: rowItem.projectForecastTradeCode,
                    manualItem: rowItem.manualItem || false
                };
            });
            validateItems(body.rfqItemDtoList);
            await itemsSchema.validate(body.rfqItemDtoList);

            // rfqDocumentMetaDataDtoList
            const documents = await attachmentActions.getNewAttachments();
            if (!Array.isArray(documents)) return documents;
            body.rfqDocumentMetaDataDtoList = documents;

            // rfqVendorDtoList
            values.vendors.forEach((vendor) => {
                if (vendor.isNew) {
                    body.rfqVendorDtoList.push({
                        nonVendorCompanyName: vendor.supplierName,
                        contactPersonName: vendor.contactPersonName,
                        contactPersonEmail: vendor.contactPersonEmail
                    });
                } else {
                    body.rfqVendorDtoList.push({
                        supplierUuid: vendor.supplierUuid,
                        contactPersonName: vendor.contactPersonName,
                        contactPersonEmail: vendor.contactPersonEmail
                    });
                }
            });

            if (!body.prUuid) delete body.prUuid;
            if (!body.pprUuid) delete body.pprUuid;
            if (!body.project) {
                delete body.projectCode;
                delete body.projectUuid;
            }

            return body;
        } catch (error) {
            return error.message;
        }
    };

    const onSaveAsDraftPressHandler = async (values) => {
        setPristine();
        try {
            const body = await mappingBody(values);
            if (!(typeof body === "object")) throw new Error(body);
            const response = await RequestForQuotationService.saveAsDraftRFQ(companyUuid, body);
            const { data, message, status } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                try {
                    conversationActions.postConversation(data, companyUuid);
                } catch (error) {}

                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onSendToVendorsPressHandler = async (values) => {
        setPristine();
        try {
            const body = await mappingBody(values);
            if (!(typeof body === "object")) throw new Error(body);
            const response = await RequestForQuotationService.submitRFQ(companyUuid, body);
            const { data, message, status } = response && response.data;
            if (status === RESPONSE_STATUS.OK) {
                try {
                    conversationActions.postConversation(data, companyUuid);
                } catch (error) {}

                showToast("success", response.data.message);
                setTimeout(() => {
                    history.push(RFQ_ROUTES.RFQ_LIST);
                }, 1000);
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const getConversation = async (pprUuid) => {
        const responses = await Promise.allSettled([
            ConversationService.getDetailInternalConversation(companyUuid, pprUuid),
            ConversationService.getDetailExternalConversation(companyUuid, pprUuid)
        ]);
        const [
            responseInternalConversations,
            responseExternalConversations
        ] = responses;
        conversationActions.setConversations([responseInternalConversations], true, true);
        conversationActions.setConversations([responseExternalConversations], true, false);
    };

    const getBudgetDetails = async (code) => {
        try {
            await getBudgetDetailsByProjectCode(companyUuid, code);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
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
        getDataFunc: (query) => getDataFunc({
            ...query,
            project: projectCode
        })
    }), [projectCode]);

    const backendServerConfigCatalogue = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (query) => getDataFunc(query)
    }), []);

    return (
        <Container fluid>
            <HeaderMain
                title={t("RaiseARequestForQuotation")}
                className="mb-2"
            />
            <Formik
                initialValues={initialValues}
                validationSchema={rfqFormSchema}
                onSubmit={(values, actions) => {
                    setTimeout(() => {
                        actions.setSubmitting(false);
                    }, 1500);
                }}
            >
                {({
                    errors, values, touched, handleChange, setFieldValue, dirty, setTouched, handleSubmit, isSubmitting
                }) => {
                    useEffect(() => {
                        if (!_.isEmpty(purchaseDetails) && gridApi && companyUuid) {
                            const {
                                purchaseReqItem,
                                uuid,
                                pprUuid,
                                purchaseReqDocumentMetadata,
                                conversations
                            } = purchaseDetails;
                            setFieldValue("requisitionType", FEATURE.PR);
                            setFieldValue("pprNumber", purchaseDetails.pprNumber);
                            setFieldValue("prUuid", uuid || "");
                            setFieldValue("pprUuid", purchaseDetails.pprUuid);
                            setFieldValue("currencyCode", purchaseDetails.currencyCode);
                            setFieldValue("rfqTitle", purchaseDetails.prTitle);
                            let procurementType = "";
                            if (purchaseDetails.procurementType) {
                                procurementType = purchaseDetails.procurementType.toUpperCase() === "GOODS"
                                    ? "Goods"
                                    : "Service";
                            }
                            setFieldValue("procurementType", procurementType);
                            setFieldValue("requester", purchaseDetails.requestorName);
                            setFieldValue("submittedDate", purchaseDetails.submittedDate);
                            setFieldValue("submittedDate",
                                purchaseDetails.submittedDate
                                    ? convertToLocalTime(purchaseDetails.submittedDate)
                                    : "");
                            setFieldValue("deliveryDate", purchaseDetails?.deliveryDate || "");
                            setFieldValue("deliveryAddress", purchaseDetails?.deliveryAddress || "");
                            if (purchaseReqItem.length) {
                                const deliveryAddress = purchaseDetails?.deliveryAddress
                                    ? purchaseDetails?.deliveryAddress
                                    : addresses.find(
                                        (item) => item.addressLabel === purchaseReqItem[0]
                                            .address.addressLabel
                                    )?.uuid ?? "";
                                setFieldValue("deliveryAddress", deliveryAddress);
                                const deliveryDate = purchaseDetails.deliveryDate
                                    || formatDateTime(
                                        purchaseReqItem[0]?.requestedDeliveryDate ?? "",
                                        CUSTOM_CONSTANTS.YYYYMMDD
                                    );
                                setFieldValue("deliveryDate", deliveryDate);
                            }
                            const rowDataItem = [];
                            const sourceCurrency = currencies.find(
                                (item) => item.currencyCode === purchaseDetails.currencyCode
                            );
                            purchaseReqItem.forEach((data) => {
                                const itemRequest = {
                                    uuid: uuidv4(),
                                    itemCode: data.itemCode || "",
                                    itemName: data.itemName || "",
                                    itemDescription: data.itemDescription || "",
                                    itemModel: data.itemModel || "",
                                    itemSize: data.itemSize || "",
                                    itemBrand: data.itemBrand || "",
                                    uom: uoms.find(
                                        (item) => item.uomCode === data.uom
                                    ) || "",
                                    itemQuantity: data.itemQuantity || 0,
                                    note: data.note || "",
                                    address: addresses.find((item) => item.addressLabel
                                        === data.address.addressLabel) ?? "",
                                    requestedDeliveryDate: convertDate2String(
                                        data.requestedDeliveryDate,
                                        CUSTOM_CONSTANTS.YYYYMMDD
                                    ) || "",
                                    editableCurrency: true,
                                    editablePrice: true,
                                    sourceCurrency: data.sourceCurrency || sourceCurrency,
                                    itemUnitPrice: Number(data?.itemUnitPrice ?? 0)
                                };
                                rowDataItem.push(itemRequest);
                            });
                            gridApi.setRowData(rowDataItem);
                            setFieldValue("note", purchaseDetails.note || purchaseDetails.pprNote || "");
                            if (pprUuid) getConversation(pprUuid);
                            if (purchaseDetails.project) {
                                setFieldValue("project", purchaseDetails.project);
                                setFieldValue("projectCode", purchaseDetails.projectCode || "");
                                setFieldValue("projectUuid", purchaseDetails.projectUuid || "");
                                getBudgetDetails(purchaseDetails.projectCode);
                            }
                            if (conversations) {
                                const extConversation = conversations.filter(
                                    (item) => item.externalConversation === true
                                );
                                const intConversation = conversations.filter(
                                    (item) => item.externalConversation === false
                                );
                                conversationActions.setConversations(intConversation, false, true);
                                conversationActions.setConversations(extConversation, false, false);
                                attachmentActions.setAttachments(
                                    purchaseReqDocumentMetadata, false, true
                                );
                                attachmentActions.setAttachments(
                                    purchaseReqDocumentMetadata, false, false
                                );
                            } else {
                                attachmentActions.setAttachments(
                                    purchaseReqDocumentMetadata, true, true
                                );
                                attachmentActions.setAttachments(
                                    purchaseReqDocumentMetadata, true, false
                                );
                            }
                        }
                    }, [purchaseDetails, gridApi, companyUuid]);
                    useEffect(() => {
                        if (
                            !_.isEmpty(userDetails)
                            && !_.isEmpty(permissionReducer)
                        ) {
                            setFieldValue("requester", userDetails.name);
                            setFieldValue("submittedDate", convertToLocalTime(new Date()));
                            setFieldValue("requisitionType", FEATURE.PR);
                            const currentCompanyUuid = getCurrentCompanyUUIDByStore(
                                permissionReducer
                            );
                            if (currentCompanyUuid) initData(currentCompanyUuid);
                        }
                    }, [userDetails, permissionReducer]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* Raise Requisition */}
                                            {!isConvertPR && (
                                                <RaiseRequisition
                                                    t={t}
                                                    values={values}
                                                    errors={errors}
                                                    touched={touched}
                                                    handleChange={handleChange}
                                                    typeOfRequisitions={typeOfRequisitions}
                                                    natureOfRequisitions={
                                                        rfqStates.natureOfRequisitions
                                                    }
                                                    projects={projects}
                                                    setFieldValue={setFieldValue}
                                                    onChangeProject={
                                                        (e) => onChangeProject(e, setFieldValue)
                                                    }
                                                />
                                            )}
                                            {/* Initial Settings */}
                                            <InitialSettings
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                currencies={currencies}
                                                setFieldValue={setFieldValue}
                                                gridApi={gridApi}
                                                isConvertPR={isConvertPR}
                                                isCreate
                                            />
                                            {/* Vendor Information */}
                                            <VendorInformation
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                setFieldValue={setFieldValue}
                                                setTouched={setTouched}
                                                vendors={vendors}
                                                companyUuid={companyUuid}
                                                contactPersons={contactPersons}
                                                setContactPersons={setContactPersons}
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
                                                procurementTypes={rfqStates.procurementTypes}
                                                isConvertPR={isConvertPR}
                                            />
                                            {/* Request Terms */}
                                            <RequestTerms
                                                t={t}
                                                errors={errors}
                                                touched={touched}
                                                addresses={addresses}
                                                rfqTypes={rfqStates.rfqTypes}
                                                handleChange={handleChange}
                                                values={values}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            {Boolean(values.project) && (
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
                                            />
                                        </Col>
                                    </Row>
                                </>
                            )}

                            <HeaderSecondary
                                title={t("Items")}
                                className="mb-2"
                            />
                            <Row className="mb-4">
                                <Col xs={12}>
                                    <ButtonToolbar className="justify-content-end mb-2">
                                        <Button
                                            color="primary"
                                            onClick={() => {
                                                if (String(values.project) === "true") {
                                                    setShowAddForecast(true);
                                                } else setShowAddCatalogue(true);
                                            }}
                                            className="mr-1"
                                        >
                                            <span className="mr-1">+</span>
                                            <span>{t("AddCatalogue")}</span>
                                        </Button>
                                        <Button
                                            color="primary"
                                            onClick={() => addItemActions.addItemManual(
                                                values, addresses, currencies
                                            )}
                                            className="mr-1"
                                        >
                                            <span className="mr-1">+</span>
                                            <span>{t("AddManual")}</span>
                                        </Button>
                                    </ButtonToolbar>
                                    <AddItems
                                        t={t}
                                        gridHeight={350}
                                        onDeleteItem={(uuid) => addItemActions.deleteRowDataItem(
                                            uuid
                                        )}
                                        onCellValueChanged={addItemActions.onCellValueChanged}
                                        onGridReady={(params) => {
                                            addItemActions.setGridApi(params.api);
                                        }}
                                        gridApi={gridApi}
                                        addresses={addresses}
                                        disabled={false}
                                        isProject={Boolean(values.project)}
                                        uoms={uoms}
                                        currencies={currencies}
                                        values={values}
                                        subTotal={0}
                                        tax={0}
                                        total={0}
                                        showTotal={false}
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
                                        activeTab={activeInternalTab}
                                        setActiveTab={(idx) => {
                                            setActiveInternalTab(idx);
                                        }}
                                        sendConversation={
                                            (comment) => conversationActions
                                                .sendCommentConversation(comment, true)
                                        }
                                        addNewRowAttachment={
                                            () => attachmentActions.addNewRowAttachment(true)
                                        }
                                        rowDataConversation={internalConversations}
                                        rowDataAttachment={internalAttachments}
                                        onDeleteAttachment={
                                            (uuid, rowData) => attachmentActions
                                                .onDeleteAttachment(uuid, rowData, true)
                                        }
                                        onAddAttachment={
                                            (e, uuid, rowData) => attachmentActions
                                                .onAddAttachment(e, uuid, rowData, true)
                                        }
                                        onCellEditingStopped={
                                            (params) => attachmentActions
                                                .onCellEditingStopped(params, true)
                                        }
                                        defaultExpanded
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col xs={12}>
                                    {/* External Conversations */}
                                    <Conversation
                                        title={t("ExternalConversations")}
                                        activeTab={activeExternalTab}
                                        setActiveTab={(idx) => {
                                            setActiveExternalTab(idx);
                                        }}
                                        sendConversation={
                                            (comment) => conversationActions
                                                .sendCommentConversation(comment, false)
                                        }
                                        addNewRowAttachment={
                                            () => attachmentActions.addNewRowAttachment(false)
                                        }
                                        rowDataConversation={externalConversations}
                                        rowDataAttachment={externalAttachments}
                                        onDeleteAttachment={
                                            (uuid, rowData) => attachmentActions
                                                .onDeleteAttachment(uuid, rowData, false)
                                        }
                                        onAddAttachment={
                                            (e, uuid, rowData) => attachmentActions
                                                .onAddAttachment(e, uuid, rowData, false)
                                        }
                                        onCellEditingStopped={
                                            (params) => attachmentActions
                                                .onCellEditingStopped(params, false)
                                        }
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
                                    <Row className="mx-0">
                                        <Button
                                            color="secondary"
                                            className="mr-3"
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={
                                                () => {
                                                    handleSubmit();
                                                    if (!dirty || (dirty && Object.keys(errors).length)) {
                                                        showToast("error", "Validation error, please check your input.");
                                                        return;
                                                    }

                                                    onSaveAsDraftPressHandler(values);
                                                }
                                            }
                                        >
                                            {t("SaveAsDraft")}
                                        </Button>
                                        <Button
                                            color="primary"
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={
                                                () => {
                                                    handleSubmit();
                                                    if (!dirty || (dirty && Object.keys(errors).length)) {
                                                        showToast("error", "Validation error, please check your input.");
                                                        return;
                                                    }

                                                    onSendToVendorsPressHandler(values);
                                                }
                                            }
                                        >
                                            {t("SendToVendors")}
                                        </Button>
                                    </Row>
                                </Row>
                            </StickyFooter>

                            {/* Add Forecast And Catalogue Dialog */}
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
                                selected={addItemActions.getRowDataItems()}
                                backendPagination
                                backendServerConfig={backendServerConfigForecast}
                                pageSize={10}
                            />
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
                                selected={addItemActions.getRowDataItems()}
                                backendPagination
                                backendServerConfig={backendServerConfigCatalogue}
                                pageSize={10}
                            />
                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
        </Container>
    );
};

export default RaiseRFQ;
