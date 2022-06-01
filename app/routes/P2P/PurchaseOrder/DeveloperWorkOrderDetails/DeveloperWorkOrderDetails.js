/* eslint-disable max-len */
import React, { useState, useEffect, useRef } from "react";
import useToast from "routes/hooks/useToast";
import { ToastContainer } from "react-toastify";
import { DWO_STATUSES, TOAST_PROPS } from "helper/constantsDefined";
import StickyFooter from "components/StickyFooter";
import {
    Container, Row, Col, Button, ButtonToolbar,
    Input
} from "components";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import {
    Formik, Form
} from "formik";
import * as Yup from "yup";
import {
    Conversation
} from "routes/components";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import PurchaseOrderService from "services/PurchaseOrderService/PurchaseOrderService";
import ManageProjectService from "services/ManageProjectService";
import CurrenciesService from "services/CurrenciesService";
import ExtVendorService from "services/ExtVendorService";
import UOMDataService from "services/UOMService";
import EntitiesService from "services/EntitiesService";
import ConversationService from "services/ConversationService/ConversationService";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { useSelector } from "react-redux";
import _ from "lodash";

import CUSTOM_CONSTANTS from "helper/constantsDefined";
import {
    convertToLocalTime, formatDateString, clearNumber, convertDate2String, getCurrentCompanyUUIDByStore, sortArrayByName, sortArrayByNameFloat
} from "helper/utilities";

import CategoryService from "services/CategoryService/CategoryService";
import moment from "moment";
import UserService from "services/UserService";
import { HeaderMain } from "routes/components/HeaderMain";

import {
    CommonConfirmDialog
} from "routes/components";
import ActionModal from "routes/components/ActionModal";
import {
    GeneralInformationComponent,
    RequisitionComponent,
    InitialSettingComponent,
    InitialSettingComponentSupplier,
    VendorInformationComponent,
    SummaryDetailsComponent,
    WorkSpaceComponent
} from "./components";
import AuditTrailComponent from "./components/AuditTrailComponent/AuditTrailComponent";
import PURCHASE_ORDER_ROUTES from "../route";

const DeveloperWorkOrderDetails = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();

    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { userPermission } = permissionReducer;

    const [projectsState, setProjectsState] = useState([]);
    const [supliersState, setSupliersState] = useState([]);
    const [currenciesState, setCurrenciesState] = useState([]);

    const [workOrderDetailState, setWorkOrderDetailState] = useState({});
    const [displayReasonDialog, setDisplayReasonDialog] = useState(false);
    const [displayReasonDialogBySupplier, setDisplayReasonDialogBySupplier] = useState(false);
    const [reasonState, setReasonState] = useState(null);
    const refActionModalCancel = useRef(null);

    const [isRecall, setIsRecall] = useState(true);
    const [isReject, setIsReject] = useState(true);

    const [isBuyer, setIsBuyer] = useState(true);

    const companyID = useRef("");
    const dwoID = useRef("");

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
        listCategory: [],
        natureOfRequisitions: [
            { label: "Project", value: true },
            { label: "Non-Project", value: false }
        ],
        projects: [],
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
        users: []
    });

    const validationSchema = Yup.object().shape({
        dwoTitle: Yup.string()
            .required(t("PleaseEnterValidWORTitle"))
    });

    const prepareData = (values) => {
        const data = {
            workReferenceNumber: values.dwoRefNumber,
            workOrderTitle: values.dwoTitle,
            dwoDate: moment(values.dwoDate).format(CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
            remarks: values.remarks,
            newDocuments: []
        };

        const internalAttachments = raisePRStates.rowDataInternalAttachment;
        const externalAttachments = raisePRStates.rowDataExternalAttachment;

        const documents = [...internalAttachments, ...externalAttachments].map(({
            guid, fileLabel, fileDescription, externalDocument
        }) => ({
            guid,
            fileLabel,
            fileDescription,
            externalDocument
        }));

        data.newDocuments = documents;
        return data;
    };

    const onSavePressHandler = async (values, issue, errors) => {
        try {
            if (!Object.keys(errors || {}).length) {
                const bodyData = prepareData(values);
                const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
                const query = new URLSearchParams(location.search);
                const dwoUuid = query.get("uuid");
                const response = await PurchaseOrderService.issueWorkOrder(companyUuid, dwoUuid, bodyData);
                const { data } = response.data;

                if (raisePRStates.externalConversationLines.length > 0) {
                    const conversationBody = {
                        referenceId: data,
                        supplierUuid: userDetails.uuid,
                        conversations: raisePRStates.externalConversationLines
                    };
                    await ConversationService
                        .createExternalConversation(companyUuid, conversationBody);
                }
                if (raisePRStates.internalConversationLines.length > 0) {
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
                    history.push(PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_LIST);
                }, 1000);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const changeStatusWithReason = async () => {
        if (!reasonState) {
            setReasonState("");
        } else {
            try {
                const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
                const query = new URLSearchParams(location.search);
                const dwoUuid = query.get("uuid");
                let response;
                if (isRecall) {
                    response = await PurchaseOrderService.recallWorkOrder(companyUuid, dwoUuid);
                } else {
                    response = await PurchaseOrderService.cancelWorkOrder(companyUuid, dwoUuid);
                }

                const {
                    status, statusCode, message, data
                } = response.data;
                if (status === "OK" || statusCode === 200) {
                    const conversationLines = [];
                    conversationLines.push({ text: reasonState });
                    const conversationBody = {
                        referenceId: dwoUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: conversationLines
                    };
                    await ConversationService
                        .createInternalConversation(companyUuid, conversationBody);
                    history.push(PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_LIST);
                    showToast("success", message);
                } else {
                    throw new Error(message);
                }
            } catch (error) {
                showToast("error", error.message);
            }
        }
    };
    const changeStatusWithReasonBySupplier = async () => {
        if (!reasonState) {
            setReasonState("");
        } else {
            try {
                const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
                const query = new URLSearchParams(location.search);
                const dwoUuid = query.get("uuid");
                let response;
                if (isReject) {
                    response = await PurchaseOrderService.rejectWorkOrder(companyUuid, dwoUuid);
                }

                const {
                    status, statusCode, message, data
                } = response.data;
                if (status === "OK" || statusCode === 200) {
                    const conversationLines = [];
                    conversationLines.push({ text: reasonState });
                    const conversationBody = {
                        referenceId: dwoUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: conversationLines
                    };
                    await ConversationService
                        .createExternalConversation(companyUuid, conversationBody);
                    history.push(PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_LIST);
                    showToast("success", message);
                } else {
                    throw new Error(message);
                }
            } catch (error) {
                showToast("error", error.message);
            }
        }
    };
    const cancelWorkOrder = async () => {
        try {
            const response = await PurchaseOrderService.cancelWorkOrder(companyID.current, dwoID.current);
            showToast("success", response.data?.message);
            setTimeout(() => {
                history.push(PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_LIST);
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onAcknowledgeWorkOrder = async () => {
        try {
            const response = await PurchaseOrderService.acknowledgeWorkOrder(companyID.current, dwoID.current);
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            const { data } = response.data;
            if (raisePRStates.externalConversationLines.length > 0) {
                const conversationBody = {
                    referenceId: data,
                    supplierUuid: userDetails.uuid,
                    conversations: raisePRStates.externalConversationLines
                };
                await ConversationService
                    .createExternalConversation(companyUuid, conversationBody);
            }
            if (raisePRStates.internalConversationLines.length > 0) {
                const conversationBody = {
                    referenceId: data,
                    supplierUuid: userDetails.uuid,
                    conversations: raisePRStates.internalConversationLines
                };
                await ConversationService
                    .createInternalConversation(companyUuid, conversationBody);
            }
            showToast("success", response.data?.message);
            setTimeout(() => {
                history.push(PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_LIST);
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const backToList = () => {
        history.push(PURCHASE_ORDER_ROUTES.DEVELOPER_WORK_ORDER_LIST);
    };

    const initData = async () => {
        try {
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            if (!companyUuid) return;

            const query = new URLSearchParams(location.search);
            const dwoUuid = query.get("uuid");

            const responseProjects = await ManageProjectService.getCompanyProjectList(
                companyUuid
            );
            const projects = sortArrayByName(responseProjects?.data?.data, "projectTitle");

            const responseCurrencies = await CurrenciesService.getCurrencies(
                companyUuid
            );
            const currencies = sortArrayByName(responseCurrencies?.data?.data, "currencyName");

            const responseSuppliers = await ExtVendorService.getExternalVendors(
                companyUuid
            );
            const suppliers = sortArrayByName(responseSuppliers?.data?.data, "companyCode");

            const responseUOMs = await UOMDataService.getUOMRecords(companyUuid);

            let listParentItemsWorkSpace = await PurchaseOrderService.getListChildWorkSpace(permissionReducer.isBuyer, companyUuid, dwoUuid, 0);
            listParentItemsWorkSpace = sortArrayByNameFloat(listParentItemsWorkSpace?.data?.data, "groupNumber");
            listParentItemsWorkSpace = listParentItemsWorkSpace.map((item) => ({ ...item, groupNumber: [item.groupNumber] }));

            const listCategoryResponse = await CategoryService
                .getListCategory(companyUuid);

            let listCategory = listCategoryResponse.data.data.filter(
                (address) => address.active === true
            );

            listCategory = sortArrayByName(listCategory, "categoryName");

            //= ================= get conversations ============================

            const resExternalConversation = await ConversationService
                .getDetailExternalConversation(
                    companyUuid, dwoUuid
                );
            const rowDataExternalConversation = [
                ...raisePRStates.rowDataExternalConversation];

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
                    companyUuid, dwoUuid
                );
            const rowDataInternalConversation = [
                ...raisePRStates.rowDataInternalConversation];
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

            //= ============ end get conversations================

            const listUserResponse = await UserService.getCompanyUsers(companyUuid);
            const listUser = listUserResponse.data.data;

            setProjectsState(projects);
            setSupliersState(suppliers);
            setCurrenciesState(currencies);

            setRaisePRStates((prevStates) => ({
                ...prevStates,
                companyUuid,
                rowDataExternalConversation,
                rowDataInternalConversation,
                uoms: responseUOMs.data.data,
                listCategory,
                users: listUser,
                rowDataSummary: listParentItemsWorkSpace
            }));
        } catch (error) {
            // console.log(error);
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
                dateTime: convertDate2String(
                    new Date(), CUSTOM_CONSTANTS.DDMMYYYHHmmss
                ),
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
            dateTime: convertDate2String(
                new Date().toISOString(), CUSTOM_CONSTANTS.DDMMYYYHHmmss
            ),
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
        if (isInternal) {
            const { rowDataInternalAttachment } = raisePRStates;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.push({
                guid: "",
                fileLabel: "",
                fileDescription: "",
                uploadedOn: convertToLocalTime(new Date(moment(new Date()).utc().format(CUSTOM_CONSTANTS.YYYYMMDDHHmmss))),
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
            uploadedOn: convertToLocalTime(new Date(moment(new Date()).utc().format(CUSTOM_CONSTANTS.YYYYMMDDHHmmss))),
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

    const onDeleteAttachment = (uuid, rowData, isInternal) => {
        if (isInternal) {
            const newRowData = rowData.filter((row) => row.uuid !== uuid);
            const rowDeleted = rowData.find((row) => row.uuid === uuid);
            if (rowDeleted && rowDeleted.guid) {
                handelDeleteFile(rowDeleted.guid);
            }
            setRaisePRStates((prevStates) => ({
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
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const onCellEditingStopped = (params, isInternal) => {
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
            groupNumber: [`${rootItems.length + 1}`],
            evaluators: null
        };
        setRaisePRStates((prevStates) => ({
            ...prevStates,
            rowDataDWRItem: [...rowDataDWRItem, item]
        }));
    };
    const addDWRChildItem = async (parentNode, rowData) => {
        try {
            const query = new URLSearchParams(location.search);
            const dwoUuid = query.get("uuid");
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);

            const { data } = await PurchaseOrderService.getListChildWorkSpace(permissionReducer.isBuyer, companyUuid, dwoUuid, parentNode.itemUuid);
            let itemChild = sortArrayByNameFloat(data?.data, "groupNumber");
            itemChild = itemChild.map((item) => ({ ...item, groupNumber: [...parentNode.groupNumber, item.groupNumber] }));

            setRaisePRStates((prevStates) => ({
                ...prevStates,
                rowDataSummary: [...rowData, ...itemChild]
            }));
        } catch (error) {
            console.log(error);
            showToast("error", error?.response?.data?.message);
        }
    };

    const checkFulFilled = (obj) => {
        if (obj.status === "fulfilled") {
            return obj.value.data.data;
        }
        showToast("error", obj.value.response ? obj.value.response.data.message : obj.value.message);
        return [];
    };

    const loadWorkOrderDetail = async () => {
        try {
            const query = new URLSearchParams(location.search);
            const dwoUuid = query.get("uuid");
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            companyID.current = companyUuid;
            dwoID.current = dwoUuid;
            const { data } = await PurchaseOrderService.getWorkOrderDetail(permissionReducer.isBuyer, companyUuid, dwoUuid);
            setIsBuyer(permissionReducer.isBuyer);
            setWorkOrderDetailState(data.data);
        } catch (e) {
            console.log(e);
        }
    };

    const getQuantitySurveyors = () => {
        const consultants = workOrderDetailState.workSpace?.consultants || [];
        return consultants.filter((item) => item.role === "MAIN_QS");
    };
    const getArchitects = () => {
        const consultants = workOrderDetailState.workSpace?.consultants || [];
        return consultants.filter((item) => item.role === "ARCHITECT");
    };

    useEffect(() => {
        if (permissionReducer && permissionReducer.currentCompany) {
            loadWorkOrderDetail();
        }
    }, [permissionReducer]);

    const initialValues = {
        project: false,
        projectCode: "",
        dwoNumber: "",
        dwoRefNumber: "",
        dwoDate: "",
        dwrNumber: "",
        currencyCode: "",
        vendorCode: "",
        contactName: "",
        originalContractSum: "",
        dwoTitle: "",
        tradeTitle: "",
        tradeCode: "",
        remarks: "",
        requisitionType: "Developer Work Request",
        rowDataInternalAttachment: "",
        rowDataExternalAttachment: "",
        submittedDate: "",

        contractType: "",

        dwoStatus: "",
        vendorAckStatus: "",
        dateOfConfirmation: "",

        bqContingencySum: "",
        remeasuredContractSum: "",
        includeVariation: "",
        retentionPercentage: "",
        retentionCappedPercentage: "",
        retentionAmountCappedAt: "",
        adjustedContractSum: "",
        agreedVariationOrderSum: "",

        companyRegistrationNo: "",
        companyUuid: "",
        contactEmail: "",
        contactNumber: "",
        countryCode: "",
        countryName: "",
        vendorName: "",
        vendorUuid: ""
    };

    return (
        <Container fluid>
            <HeaderMain
                title={t("DeveloperWorkOrder")}
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
                        if (
                            !_.isEmpty(userDetails)
                        && !_.isEmpty(userPermission)
                        ) {
                            setFieldValue("requester", userDetails.name);
                            setFieldValue("submittedDate", convertToLocalTime(new Date(moment(new Date()).utc().format(CUSTOM_CONSTANTS.YYYYMMDDHHmmss))));
                            initData();
                        }
                    }, [userDetails, userPermission]);

                    useEffect(() => {
                        if (Object.keys(workOrderDetailState).length) {
                            const workSpace = workOrderDetailState.workSpace || {};
                            const vendorInformation = isBuyer ? workOrderDetailState.supplierInformation : workOrderDetailState.buyerInformation;

                            const quantitySurveyors = getQuantitySurveyors();
                            const architects = getArchitects();

                            const rowDataInternalAttachment = (workOrderDetailState.dwoDocumentMetadataList || []).filter((item) => item.externalDocument === false);
                            const rowDataExternalAttachment = (workOrderDetailState.dwoDocumentMetadataList || []).filter((item) => item.externalDocument === true);

                            setRaisePRStates((prevState) => ({
                                ...prevState,
                                rowDataInternalAttachment,
                                rowDataExternalAttachment
                            }));

                            setValues({
                                ...initialValues,
                                project: workSpace.project || false,
                                projectCode: workSpace.projectCode,
                                tradeTitle: workSpace.tradeTitle,
                                tradeCode: workSpace.tradeCode,
                                currencyCode: workSpace.currencyCode,
                                contractType: workSpace.contractType,

                                dwrNumber: workOrderDetailState.dwrNumber,
                                dwoTitle: workOrderDetailState.workOrderTitle,
                                dwoNumber: workOrderDetailState.dwoNumber,
                                dwoRefNumber: workOrderDetailState.workReferenceNumber,
                                dwoDate: moment(workOrderDetailState.dwoDate).format(CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
                                dwoStatus: workOrderDetailState.dwoStatus,
                                remarks: workOrderDetailState.remarks,
                                vendorAckStatus: workOrderDetailState.vendorAckStatus,
                                dateOfConfirmation: workOrderDetailState.dateOfConfirmation,

                                originalContractSum: workSpace.originalContractSum,
                                bqContingencySum: workSpace.bqContingencySum,
                                remeasuredContractSum: workSpace.remeasuredContractSum,
                                includeVariation: workSpace.includeVariation,
                                retentionPercentage: workSpace.retentionPercentage,
                                retentionCappedPercentage: workSpace.retentionCappedPercentage,
                                retentionAmountCappedAt: workSpace.retentionAmountCappedAt,
                                adjustedContractSum: workSpace.adjustedContractSum,
                                agreedVariationOrderSum: workSpace.agreedVariationOrderSum,

                                companyRegistrationNo: vendorInformation.companyRegistrationNo,
                                companyUuid: vendorInformation.companyUuid,
                                contactEmail: vendorInformation.contactEmail,
                                contactName: vendorInformation.contactName,
                                contactNumber: vendorInformation.contactNumber,
                                countryCode: vendorInformation.countryCode,
                                countryName: vendorInformation.countryName,
                                vendorCode: vendorInformation.vendorCode,
                                vendorName: vendorInformation.vendorName,
                                vendorUuid: vendorInformation.vendorUuid,

                                // vendorCode: vendorInformation.vendorCode,
                                // vendorUuid: vendorInformation.vendorUuid,
                                // contactName: vendorInformation.contactName,
                                // contactEmail: vendorInformation.contactName,

                                quantitySurveyors,
                                architects
                            });
                        }
                    }, [JSON.stringify(workOrderDetailState), isBuyer]);

                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>
                                            {/* Raise Requisition */}
                                            {
                                                isBuyer
                                                    ? (
                                                        <>
                                                            <RequisitionComponent
                                                                t={t}
                                                                values={values}
                                                                errors={errors}
                                                                touched={touched}
                                                                handleChange={handleChange}
                                                                setFieldValue={setFieldValue}
                                                                natureOfRequisitions={raisePRStates.natureOfRequisitions}
                                                                projects={projectsState}
                                                            />
                                                            {/* Initial Settings */}
                                                            <InitialSettingComponent
                                                                t={t}
                                                                values={values}
                                                                errors={errors}
                                                                touched={touched}
                                                                handleChange={handleChange}
                                                                setFieldValue={setFieldValue}
                                                                currencies={currenciesState}
                                                            />
                                                        </>
                                                    )
                                                    : (
                                                        <InitialSettingComponentSupplier
                                                            t={t}
                                                            values={values}
                                                            errors={errors}
                                                            touched={touched}
                                                            handleChange={handleChange}
                                                            setFieldValue={setFieldValue}
                                                            currencies={currenciesState}
                                                        />
                                                    )
                                            }

                                            <VendorInformationComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                vendors={supliersState}
                                                vendorInformation={isBuyer ? workOrderDetailState.supplierInformation : workOrderDetailState.buyerInformation}
                                                contacts={[]}
                                            />

                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={12}>

                                            <GeneralInformationComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                procurementTypes={raisePRStates.procurementTypes}
                                            />

                                            {/* Request Terms */}

                                            <SummaryDetailsComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched.toString()}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                dwrItems={raisePRStates.rowDataDWRItem}
                                            />

                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <>
                                <HeaderSecondary
                                    title={t("WorkSpace")}
                                    className="mb-2"
                                />
                                <Row className="mb-4">
                                    <Col xs={12}>
                                        {/* Budget Details */}
                                        {permissionReducer?.currentCompany && (
                                            <WorkSpaceComponent
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                users={raisePRStates.users}
                                                rowDataWorkSpace={raisePRStates.rowDataSummary}
                                                onAddChildItem={addDWRChildItem}
                                                uoms={raisePRStates.uoms}
                                            />
                                        )}
                                    </Col>
                                </Row>
                            </>

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
                                        disabled={values.dwoStatus !== DWO_STATUSES.PENDING_ISSUE}
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
                                        disabled={(values.dwoStatus !== DWO_STATUSES.PENDING_ISSUE && !(values.dwoStatus === DWO_STATUSES.ISSUED && ["VIEWED", "NOT_VIEWED"].includes(values.vendorAckStatus)))}
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
                                    <AuditTrailComponent
                                        rowData={workOrderDetailState.dwoAuditTrail || []}
                                        onGridReady={(params) => {
                                            params.api.sizeColumnsToFit();
                                        }}
                                        paginationPageSize={10}
                                        gridHeight={350}
                                        defaultExpanded
                                    />
                                </Col>
                            </Row>

                            {/* Recalled status */}
                            <CommonConfirmDialog
                                footerBetween
                                isShow={displayReasonDialog}
                                onHide={() => setDisplayReasonDialog(false)}
                                title={t("Reason")}
                                positiveProps={
                                    {
                                        onPositiveAction: () => setDisplayReasonDialog(false),
                                        contentPositive: t("Close"),
                                        colorPositive: "secondary"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => {
                                            changeStatusWithReason();
                                        },
                                        contentNegative: isRecall ? t("Recall") : t("Cancel"),
                                        colorNegative: isRecall ? "warning" : "danger"
                                    }
                                }
                                size="xs"
                                titleCenter
                                titleRequired
                            >

                                <Input
                                    type="textarea"
                                    rows={5}
                                    className={
                                        classNames("form-control", {
                                            "is-invalid": reasonState !== null && reasonState === ""
                                        })
                                    }
                                    placeholder={t("Please enter reason..")}
                                    value={reasonState}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setReasonState(value);
                                    }}
                                />
                                {
                                    reasonState !== null && reasonState === ""
                                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                                }
                            </CommonConfirmDialog>

                            {/* Issued status by supplier */}
                            <CommonConfirmDialog
                                footerBetween
                                isShow={displayReasonDialogBySupplier}
                                onHide={() => setDisplayReasonDialogBySupplier(false)}
                                title={t("Reason")}
                                positiveProps={
                                    {
                                        onPositiveAction: () => setDisplayReasonDialogBySupplier(false),
                                        contentPositive: t("Close"),
                                        colorPositive: "secondary"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => {
                                            changeStatusWithReasonBySupplier();
                                        },
                                        contentNegative: isReject ? t("Reject") : t("Acknowledge"),
                                        colorNegative: isReject ? "danger" : "primary"
                                    }
                                }
                                size="xs"
                                titleCenter
                                titleRequired
                            >

                                <Input
                                    type="textarea"
                                    rows={5}
                                    className={
                                        classNames("form-control", {
                                            "is-invalid": reasonState !== null && reasonState === ""
                                        })
                                    }
                                    placeholder={t("Please enter reason..")}
                                    value={reasonState}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setReasonState(value);
                                    }}
                                />
                                {
                                    reasonState !== null && reasonState === ""
                                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                                }
                            </CommonConfirmDialog>
                            {/* Footer */}
                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-between">
                                    <Button
                                        color="secondary"
                                        onClick={() => backToList()}
                                    >
                                        {t("Back")}
                                    </Button>
                                    {
                                        isBuyer
                                            ? (
                                                <div>
                                                    {
                                                        workOrderDetailState.dwoStatus === DWO_STATUSES.RECALLED
                                                        && (
                                                            <Row className="mx-0">
                                                                <Button
                                                                    color="danger"
                                                                    className="mr-3"
                                                                    type="submit"
                                                                    onClick={() => {
                                                                        refActionModalCancel.current.toggleModal();
                                                                    }}
                                                                >
                                                                    {t("Cancel")}
                                                                </Button>
                                                            </Row>
                                                        )
                                                    }
                                                    {
                                                        (workOrderDetailState.dwoStatus === DWO_STATUSES.PENDING_ISSUE)
                                                        && (
                                                            <Row className="mx-0">

                                                                <Button
                                                                    color="danger"
                                                                    className="mr-3"
                                                                    type="submit"
                                                                    onClick={() => {
                                                                        refActionModalCancel.current.toggleModal();
                                                                    }}
                                                                >
                                                                    {t("Cancel")}
                                                                </Button>

                                                                <Button
                                                                    color="primary"
                                                                    className="mr-3"
                                                                    type="submit"
                                                                    onClick={() => onSavePressHandler(values, DWO_STATUSES.ISSUED)}
                                                                >
                                                                    {t("Issue")}
                                                                </Button>
                                                            </Row>
                                                        )
                                                    }
                                                    {
                                                        (workOrderDetailState.dwoStatus === DWO_STATUSES.ISSUED && workOrderDetailState.vendorAckStatus !== "REJECTED") && (
                                                            <Row className="mx-0">
                                                                <Button
                                                                    color="danger"
                                                                    className="mr-3"
                                                                    type="submit"
                                                                    onClick={() => {
                                                                        setIsRecall(false);
                                                                        setDisplayReasonDialog(true);
                                                                    }}
                                                                >
                                                                    {t("Cancel")}
                                                                </Button>

                                                                <Button
                                                                    color="warning"
                                                                    className="mr-3"
                                                                    type="submit"
                                                                    onClick={() => {
                                                                        setIsRecall(true);
                                                                        setDisplayReasonDialog(true);
                                                                    }}
                                                                >
                                                                    {t("Recall")}
                                                                </Button>

                                                            </Row>
                                                        )
                                                    }
                                                </div>
                                            )
                                            : (
                                                <div>
                                                    {
                                                        (workOrderDetailState.dwoStatus === DWO_STATUSES.ISSUED && workOrderDetailState.vendorAckStatus !== "REJECTED") && (
                                                            <Row className="mx-0">
                                                                <Button
                                                                    color="danger"
                                                                    className="mr-3"
                                                                    type="submit"
                                                                    onClick={() => {
                                                                        setIsReject(true);
                                                                        setDisplayReasonDialogBySupplier(true);
                                                                    }}
                                                                >
                                                                    {t("Reject")}
                                                                </Button>

                                                                <Button
                                                                    color="primary"
                                                                    className="mr-3"
                                                                    type="submit"
                                                                    onClick={() => onAcknowledgeWorkOrder()}
                                                                >
                                                                    {t("Acknowledge")}
                                                                </Button>

                                                            </Row>
                                                        )
                                                    }
                                                </div>
                                            )
                                    }
                                </Row>
                            </StickyFooter>
                            <ActionModal
                                ref={refActionModalCancel}
                                title="Cancel Work Order"
                                body="Do you wish to cancel this work order?"
                                button="Yes"
                                color="primary"
                                textCancel="No"
                                colorCancel="danger"
                                action={() => cancelWorkOrder()}
                            />

                        </Form>
                    );
                }}
            </Formik>
        </Container>
    );
};
export default DeveloperWorkOrderDetails;
