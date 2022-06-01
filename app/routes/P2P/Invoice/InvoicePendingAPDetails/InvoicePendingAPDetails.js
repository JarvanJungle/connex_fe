import { useTranslation } from "react-i18next";
import React, { useEffect, useRef, useState } from "react";
import { Form, Formik } from "formik";
import { StickyFooter } from "components/StickyFooter/StickyFooter";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router";
import { usePermission, useApprovalConfig } from "routes/hooks";
import {
    convertToLocalTime,
    formatDateString,
    formatDateTimeUpdated,
    formatDisplayDecimal,
    isNullOrUndefinedOrEmpty,
    roundNumberWithUpAndDown,
    sumArray,
    itemAttachmentSchema,
    convertDate2String,
    clearNumber
} from "helper/utilities";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import { v4 as uuidv4 } from "uuid";
import EntitiesService from "services/EntitiesService";
import {
    Button, Col, Container, Input, Row
} from "components";
import {
    CommonConfirmDialog, Conversation, Overview
} from "routes/components";
import classNames from "classnames";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import * as Yup from "yup";
import ConversationService from "services/ConversationService/ConversationService";
import { HeaderMain } from "routes/components/HeaderMain";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import InvoiceService from "services/InvoiceService/InvoiceService";
import CurrenciesService from "services/CurrenciesService";
import useToast from "routes/hooks/useToast";
import _ from "lodash";
import GLDataService from "services/GLService";
import PurchaseOrderService from "services/PurchaseOrderService/PurchaseOrderService";
import InvoiceAndPO from "./components/InvoiceAndPO/InvoiceAndPO";
import {
    GeneralInformation, GoodsReceipt, InitialSetting, InvoiceDetails,
    OpcInvoiceDetails
} from "./components";
import SummaryInvoiceTable from "../components/SummaryInvoiceTable";
import { INVOICE_ROUTES } from "..";
import { Badge } from "../components";
import { INVOICE_CONSTANTS } from "../helper";
import { DVPC_INVOICE_TYPE, INVOICE_TYPE } from "../helper/constant";

const InvoiceForm = (props) => {
    const {
        t, initialValues, formik, showToast, invoiceUuid
    } = props;

    const authReducer = useSelector((state) => state.authReducer);
    const { userDetails } = authReducer;
    const permissionReducer = useSelector((state) => state?.permissionReducer);
    const history = useHistory();
    const { isBuyer } = permissionReducer;

    const [state, setState] = useState({
        loading: true,
        activeInternalTab: 1,
        activeExternalTab: 1,
        rowDataInternalConversation: [],
        rowDataExternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalAttachment: [],
        rowDataAuditTrail: [],
        activeAuditTrailTab: 1,
        rowDataOverview: [],
        externalConversationLines: [],
        internalConversationLines: [],
        showErrorReasonReject: false,
        displayRejectReasonDialog: false,
        reasonReject: "",
        companyUuid: "",
        invoiceUuid: "",
        attachments: [],
        approvalRoutes: []
    });

    const [glAccounts, setGLAccounts] = useState([]);
    const [listCurrency, setListCurrency] = useState(null);
    const [summary, setSummary] = useState(null);
    const [exchangeRate, setExchangeRate] = useState("1.00");
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [rounded, setRounded] = useState(null);
    const [invoiceItemsUpdated, setInvoiceItemsUpdated] = useState([]);

    const handleRolePermission = usePermission(FEATURE.INV);
    const approvalConfig = useApprovalConfig(FEATURE.INV);

    const getDataPath = (data) => data.documentType;

    const autoGroupColumnDef = {
        headerName: "Document Type",
        cellRendererParams: { suppressCount: true },
        valueFormatter: (params) => params.data.type
    };

    const calculateSummary = () => {
        const sumColumns = (cb) => sumArray(initialValues?.matchItemDtoList?.map(cb));
        const itemList = initialValues?.matchItemDtoList || [];

        const invSubTotal = roundNumberWithUpAndDown(
            sumColumns((i) => roundNumberWithUpAndDown(i.invoiceQty * i.invoiceUnitPrice))
        );

        const diffTaxInv = itemList?.some((item) => item.invoiceTaxCodeValue !== itemList[0]?.invoiceTaxCodeValue);
        let taxInv;
        if (diffTaxInv) {
            taxInv = roundNumberWithUpAndDown(sumColumns(
                (i) => roundNumberWithUpAndDown(
                    (i.invoiceQty * i.invoiceUnitPrice * i.invoiceTaxCodeValue) / 100
                )
            ));
        } else {
            taxInv = roundNumberWithUpAndDown((invSubTotal * itemList[0]?.invoiceTaxCodeValue) / 100);
        }

        const amountSubTotal = roundNumberWithUpAndDown(sumColumns(
            (i) => roundNumberWithUpAndDown((i.pendingInvoiceQty) * i.poUnitPrice)
        ));

        const diffTaxAmount = itemList?.some((item) => item.invoiceTaxCodeValue !== itemList[0]?.invoiceTaxCodeValue);
        let taxAmount;
        if (diffTaxAmount) {
            taxAmount = roundNumberWithUpAndDown(sumColumns(
                (i) => roundNumberWithUpAndDown((
                    (i.pendingInvoiceQty)
                    * i.poUnitPrice
                    * i.poTaxCodeValue
                ) / 100)
            ));
        } else {
            taxAmount = roundNumberWithUpAndDown((amountSubTotal * itemList[0]?.invoiceTaxCodeValue) / 100);
        }

        setSummary({
            invoice: {
                subTotal: invSubTotal,
                tax: taxInv
            },
            amountToInvoice: {
                subTotal: amountSubTotal,
                tax: taxAmount
            }
        });
    };

    const sendCommentConversation = async (comment, isInternal) => {
        if (isInternal) {
            const internalConversationLines = [...state.internalConversationLines];
            const { rowDataInternalConversation } = state;
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
            setState((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation: newRowData,
                internalConversationLines
            }));
            return;
        }

        const { rowDataExternalConversation } = state;
        const newRowData = [...rowDataExternalConversation];
        const externalConversationLines = [...state.externalConversationLines];
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
        setState((prevStates) => ({
            ...prevStates,
            rowDataExternalConversation: newRowData,
            externalConversationLines
        }));
    };
    const addNewRowAttachment = (isInternal) => {
        if (isInternal) {
            const { rowDataInternalAttachment } = state;
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
            setState((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = state;
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
        setState((prevStates) => ({
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
    const handleDeleteFile = async (guid) => {
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
                setState((prevStates) => ({
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
            setState((prevStates) => ({
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
                handleDeleteFile(rowDeleted.guid);
            }
            setState((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const newRowData = rowData.filter((row) => row.uuid !== uuid);
        const rowDeleted = rowData.find((row) => row.uuid === uuid);
        if (rowDeleted && rowDeleted.guid) {
            handleDeleteFile(rowDeleted.guid);
        }
        setState((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };
    const onCellEditingStopped = (params, isInternal) => {
        const { data } = params;
        if (isInternal) {
            const { rowDataInternalAttachment } = state;
            const newRowData = [...rowDataInternalAttachment];
            newRowData.forEach((rowData, index) => {
                if (rowData.uuid === data.uuid) {
                    newRowData[index] = {
                        ...data
                    };
                }
            });
            setState((prevStates) => ({
                ...prevStates,
                rowDataInternalAttachment: newRowData
            }));
            return;
        }

        const { rowDataExternalAttachment } = state;
        const newRowData = [...rowDataExternalAttachment];
        newRowData.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = {
                    ...data
                };
            }
        });
        setState((prevStates) => ({
            ...prevStates,
            rowDataExternalAttachment: newRowData
        }));
    };

    const INVOICE_STATUS = {
        PENDING_TWO_WAY: "PENDING_TWO_WAY",
        PENDING_THREE_WAY: "PENDING_THREE_WAY",
        PENDING_APPROVAL: "PENDING_APPROVAL",
        REJECTED_TWO_WAY: "REJECTED_TWO_WAY",
        REJECTED_THREE_WAY: "REJECTED_THREE_WAY",
        APPROVED_TWO_WAY: "APPROVED_TWO_WAY",
        APPROVED_THREE_WAY: "APPROVED_THREE_WAY",

        PENDING_INVOICE_APPROVAL: "PENDING_INVOICE_APPROVAL"
    };

    const mappingBodyParams = async (data) => {
        try {
            let listDocument = [
                ...state.rowDataInternalAttachment?.map((item) => {
                    if ((item.attachment || item.guid || item.fileLabel || item.fileDescription)
                        && item.isNew === true
                    ) {
                        return {
                            guid: item.guid,
                            fileLabel: item.fileLabel || item.attachment,
                            fileDescription: item.fileDescription,
                            uploadedBy: item.uploadedBy,
                            externalDocument: false
                        };
                    }
                    return null;
                }),
                ...state.rowDataExternalAttachment?.map((item) => {
                    if ((item.attachment || item.guid || item.fileLabel || item.fileDescription)
                        && item.isNew === true
                    ) {
                        return {
                            guid: item.guid,
                            fileLabel: item.fileLabel || item.attachment,
                            fileDescription: item.fileDescription,
                            uploadedBy: item.uploadedBy,
                            externalDocument: true
                        };
                    }
                    return null;
                })
            ];
            listDocument = listDocument.filter((item) => !_.isEmpty(item));

            await itemAttachmentSchema.validate(listDocument);

            if (data) {
                return {
                    approvalRouteUuid: data,
                    invoiceDocumentMetadataDtoList: listDocument
                };
            }
            return {
                invoiceDocumentMetadataDtoList: listDocument
            };
        } catch (error) {
            showToast("error", error.message);
        }
        return {
            error: true,
            approvalRouteUuid: "",
            invoiceDocumentMetadataDtoList: []
        };
    };

    const postConservation = (isReject = false) => Promise.all([
        state.externalConversationLines.length > 0 && (() => {
            const conversationBody = {
                referenceId: state.invoiceUuid,
                supplierUuid: userDetails.uuid,
                conversations: [...state.externalConversationLines]
            };
            return ConversationService
                .createExternalConversation(state.companyUuid, conversationBody);
        })(),
        state.internalConversationLines.length > 0 && (() => {
            const conversationBody = {
                referenceId: state.invoiceUuid,
                supplierUuid: userDetails.uuid,
                conversations: [...state.internalConversationLines]
            };
            return ConversationService
                .createInternalConversation(state.companyUuid, conversationBody);
        })(),
        (
            (initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_TWO_WAY
                || initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_THREE_WAY
            ) && isReject) && (() => {
            const conversationBody = {
                referenceId: state.invoiceUuid,
                supplierUuid: userDetails.uuid,
                conversations: [{ text: state.reasonReject }]
            };
            return ConversationService
                .createExternalConversation(state.companyUuid, conversationBody);
        })(),
        initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_APPROVAL && isReject && (() => {
            const conversationBody = {
                referenceId: state.invoiceUuid,
                supplierUuid: userDetails.uuid,
                conversations: [{ text: state.reasonReject }]
            };
            return ConversationService
                .createInternalConversation(state.companyUuid, conversationBody);
        })()
    ]);

    const onRejectInvoicePAPressHandler = async () => {
        setState((prevStates) => ({
            ...prevStates,
            showErrorReasonReject: true
        }));
        if (state.reasonReject) {
            setState((prevStates) => ({
                ...prevStates,
                showErrorReasonReject: false,
                displayRejectReasonDialog: false
            }));
            const rejectBody = await mappingBodyParams();
            if (rejectBody.error) return;
            try {
                const resReject = initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_APPROVAL
                    ? await InvoiceService
                        .rejectInvoicePendingAP(state.companyUuid, state.invoiceUuid, rejectBody)
                    : await InvoiceService
                        .rejectInvoice(state.companyUuid, state.invoiceUuid, rejectBody);
                const { message } = resReject.data;
                try {
                    postConservation(true);
                } catch (error) {}
                showToast("success", message || "Invoice has been successfully updated");
                setTimeout(() => {
                    history.push(INVOICE_ROUTES.INVOICE_PENDING_APPROVAL);
                }, 1000);
            } catch (error) {
                showToast("error", error.response ? error.response.data.data : error.message);
            }
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

    const onApproveInvoicePAPressHandler = async (data) => {
        try {
            const params = await mappingBodyParams(data);
            if (params.error) return;
            const body = {
                ...params,
                exchangeRate: Number(exchangeRate)
            };

            if (initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_TWO_WAY
                || initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_THREE_WAY
            ) {
                body.invoiceItemDto = [];
                invoiceItemsUpdated.forEach((item, index) => {
                    const newItem = {
                        id: item.id,
                        itemCode: item.itemCode,
                        taxClaimable: item?.taxClaimable,
                        glCode: item?.glCode?.accountNumber ?? item?.glCode ?? "",
                        costCode: item?.costCode?.code ?? item?.costCode ?? "",
                        departmentCode: item?.departmentCode?.code ?? item?.departmentCode ?? "",
                        invoiceNetPriceRounded: formik.values?.invoiceList
                            ? clearNumber(formik.values?.invoiceList[index]?.invoiceNetPriceRounded)
                            : null,
                        invoiceNetPriceRoundedDecimalPlace: formik.values?.invoiceList
                            ? clearNumber(formik.values?.invoiceList[index]?.invoiceNetPriceRoundedDecimalPlace)
                            || initialValues?.matchItemDtoList[0].invoiceNetPriceRoundedDecimalPlace
                            : initialValues?.matchItemDtoList[0].invoiceNetPriceRoundedDecimalPlace || null,
                        invoiceNetPriceRoundedType: formik.values?.invoiceList
                            ? formik.values?.invoiceList[index]?.invoiceNetPriceRoundedType
                            || initialValues?.matchItemDtoList[0].invoiceNetPriceRoundedType
                            : initialValues?.matchItemDtoList[0].invoiceNetPriceRoundedType || null
                    };
                    body.invoiceItemDto.push(newItem);
                });
                if (body.invoiceItemDto.some((item) => !item.glCode)) {
                    throw new Error(t("GLAccountIsRequired"));
                }
            }
            if (initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_APPROVAL) {
                body.invoiceItemDto = [];
                invoiceItemsUpdated.forEach((item, index) => {
                    const newItem = {
                        id: item.id,
                        itemCode: item.itemCode,
                        taxClaimable: item?.taxClaimable,
                        glCode: item?.glCode?.accountNumber ?? item?.glCode ?? "",
                        costCode: item?.costCode?.code ?? item?.costCode ?? "",
                        departmentCode: item?.departmentCode?.code ?? item?.departmentCode ?? "",
                        invoiceNetPriceRounded: formik.values?.invoiceList
                            ? clearNumber(formik.values?.invoiceList[index]?.invoiceNetPriceRounded)
                            : null,
                        invoiceNetPriceRoundedDecimalPlace: formik.values?.invoiceList
                            ? clearNumber(formik.values?.invoiceList[index]?.invoiceNetPriceRoundedDecimalPlace)
                            || initialValues?.matchItemDtoList[0].invoiceNetPriceRoundedDecimalPlace
                            : initialValues?.matchItemDtoList[0].invoiceNetPriceRoundedDecimalPlace || null,
                        invoiceNetPriceRoundedType: formik.values?.invoiceList
                            ? formik.values?.invoiceList[index]?.invoiceNetPriceRoundedType
                            || initialValues?.matchItemDtoList[0].invoiceNetPriceRoundedType
                            : initialValues?.matchItemDtoList[0].invoiceNetPriceRoundedType || null
                    };
                    body.invoiceItemDto.push(newItem);
                });
            }
            // return;

            let resApprove = {};

            switch (initialValues?.invoiceType) {
            case INVOICE_TYPE.DVPC_INVOICE_PROJECT:
            case INVOICE_TYPE.DVPC_INVOICE_NON_PROJECT:
                switch (initialValues?.invoiceStatus) {
                case INVOICE_CONSTANTS.PENDING_INVOICE_APPROVAL:
                    resApprove = await InvoiceService.approveInvoiceOpc(
                        state.companyUuid,
                        state.invoiceUuid,
                        params
                    );
                    break;
                case INVOICE_CONSTANTS.PENDING_APPROVAL:
                    resApprove = await InvoiceService.approveOpc(
                        state.companyUuid,
                        state.invoiceUuid
                    );
                    break;
                }
                break;
            default:
                resApprove = initialValues?.invoiceStatus
                        === INVOICE_STATUS.PENDING_APPROVAL
                    ? await InvoiceService.approveInvoicePendingAP(
                        state.companyUuid,
                        state.invoiceUuid,
                        body
                    )
                    : await InvoiceService.issueInvPendingAP(
                        state.companyUuid,
                        state.invoiceUuid,
                        body
                    );

                break;
            }

            const { message } = resApprove.data;
            try {
                postConservation();
            } catch (error) {}
            showToast("success", message || "Invoice has been successfully updated");
            setTimeout(() => {
                history.push(INVOICE_ROUTES.INVOICE_PENDING_APPROVAL);
            }, 1000);
        } catch (error) {
            showToast("error", error.response ? error.response.data.data : error.message);
        }
    };

    const onChangeApprovalRoute = async (e) => {
        formik.setFieldValue("approvalRoute", e.target.value);
    };

    const initData = async (companyUuid, uuid) => {
        try {
            if (initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_THREE_WAY
                || initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_TWO_WAY
                || initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_APPROVAL
                || initialValues?.invoiceStatus === INVOICE_STATUS.APPROVED_TWO_WAY
                || initialValues?.invoiceStatus === INVOICE_STATUS.APPROVED_TWO_WAY
            ) {
                const responseGLAccounts = await GLDataService.getGLs(companyUuid);
                const listGLAccount = responseGLAccounts && responseGLAccounts.data
                    && responseGLAccounts.data.data;
                if (listGLAccount) {
                    setGLAccounts(listGLAccount
                        .filter((item) => item.active === true)
                        .sort((a, b) => {
                            if (a.accountNumber > b.accountNumber) return 1;
                            if (a.accountNumber < b.accountNumber) return -1;
                            return 0;
                        }));
                }
            }
            const resApproval = await ApprovalMatrixManagementService
                .retrieveListOfApprovalMatrixDetails(
                    companyUuid, FEATURE.INV
                );
            const listApproval = resApproval?.data?.data.filter((item) => item.active);
            const { supplierDto, buyerDto } = initialValues;
            let rowDataExternalConversation = [];
            let rowDataInternalConversation = [];
            const responsesConversation = await Promise.allSettled([
                // buyer
                isBuyer && ConversationService.getDetailInternalConversation(
                    companyUuid, uuid
                ),
                ConversationService.getDetailExternalConversation(companyUuid, uuid),
                isBuyer && supplierDto
                && supplierDto.supplierCompanyUuid
                && ConversationService.getDetailExternalConversation(
                    supplierDto.supplierCompanyUuid, uuid
                ),
                // supplier
                !isBuyer && buyerDto
                && buyerDto.buyerCompanyUuid
                && ConversationService.getDetailExternalConversation(
                    buyerDto.buyerCompanyUuid, uuid
                ),
                ConversationService.getDetailExternalConversation(companyUuid, uuid)
            ]);

            const [
                // buyer
                internalConversationBuyerSide,
                externalConversationBuyerSide,
                supplierExternalConversationBuyerSide,
                // supplier
                buyerExternalConversationSupplierSide,
                externalConversationSupplierSide
            ] = responsesConversation;

            if (isBuyer) {
                rowDataInternalConversation = rowDataInternalConversation.concat(
                    getDataConversation(internalConversationBuyerSide)
                );

                rowDataExternalConversation = rowDataExternalConversation.concat(
                    getDataConversation(externalConversationBuyerSide, false),
                    getDataConversation(supplierExternalConversationBuyerSide, false)
                );
            }

            if (!isBuyer) {
                rowDataExternalConversation = rowDataExternalConversation.concat(
                    getDataConversation(buyerExternalConversationSupplierSide, false),
                    getDataConversation(externalConversationSupplierSide, false)
                );
            }

            const overview = [];
            try {
                const resOverview = await InvoiceService
                    .getInvOverviewDetails(companyUuid, invoiceUuid, isBuyer);
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
                    resOverview?.data?.data?.forEach((item) => {
                        getAllItemsPerChildren(item, null);
                    });
                }
            } catch (error) {
                console.log("error", error);
            }

            setState((prevStates) => ({
                ...prevStates,
                approvalRoutes: listApproval,
                rowDataExternalConversation,
                rowDataInternalConversation,
                rowDataOverview: overview
            }));
        } catch (error) {
            console.log("error", error);
        }
    };

    useEffect(() => {
        if (approvalConfig && formik.values) formik.setFieldValue("approvalConfig", approvalConfig);
    }, [approvalConfig, formik.values]);

    const onViewInvoicePressHandler = async () => {
        try {
            const {
                companyUuid
            } = state;

            const response = await InvoiceService.viewPDF(
                companyUuid, invoiceUuid, isBuyer
            );

            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const { url } = data;
                if (url) {
                    window.open(url);
                }
            } else {
                showToast("error", response.data.message || response.data.data);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const convertActionAuditTrail = (action) => {
        switch (action) {
        case INVOICE_CONSTANTS.PROJECT_INVOICE_CREATED:
            return "Created Project Invoice";
        case INVOICE_CONSTANTS.NON_PO_INVOICE_CREATED:
            return "Created Non-PO Invoice";
        case INVOICE_CONSTANTS.ISSUE_PENDING_APPROVAL_INVOICE:
            return "Issued Invoice";
        case INVOICE_CONSTANTS.INVOICE_REJECTED:
        case INVOICE_CONSTANTS.REJECT_PENDING_APPROVAL_INVOICE:
            return "Rejected Invoice";
        case INVOICE_CONSTANTS.INVOICE_APPROVED:
            return "Approved Invoice";
        case INVOICE_CONSTANTS.DO_INVOICE_CREATED:
            return "Created DO Invoice";
        case INVOICE_CONSTANTS.INVOICE_REISSUED:
            return "Reissued invoice";
        default:
            return action;
        }
    };

    const checkOpcInvoice = (status) => [
        DVPC_INVOICE_TYPE.DVPC_INVOICE_PROJECT.key,
        DVPC_INVOICE_TYPE.DVPC_INVOICE_NON_PROJECT.key
    ].includes(status);

    useEffect(() => {
        if (initialValues) {
            formik.setValues({
                ...initialValues,
                approvalRoute: initialValues?.approvalRouteName ?? "",
                invoiceStatus: initialValues?.invoiceStatus?.replaceAll("_", " "),
                invoiceDueDate: formatDateString(
                    initialValues?.invoiceDueDate,
                    CUSTOM_CONSTANTS.DDMMYYYY
                )
            });
        }
        calculateSummary();
        if (initialValues) {
            setExchangeRate(initialValues.exchangeRate || "1.00");
            const attachments = initialValues?.invoiceDocumentMetadataDtoList?.map((item) => ({
                ...item,
                uploadedOn: formatDateString(
                    formatDateTimeUpdated(item.uploadedOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss)
                )
            }));
            setState((prevStates) => ({
                ...prevStates,
                attachments,
                rowDataAuditTrail: (initialValues?.invoiceAuditTrailDtoList || initialValues?.developerInvoiceAuditTrails).map((item) => ({
                    userName: item.userName,
                    userRole: item.role,
                    dateTime: convertToLocalTime(item.date),
                    action: convertActionAuditTrail(item.action)
                })),
                rowDataInternalAttachment: attachments?.filter(
                    (attachment) => attachment?.externalDocument === false
                ) || [],
                rowDataExternalAttachment: attachments?.filter(
                    (attachment) => attachment?.externalDocument === true
                ) || []
            }));
        }
    }, [initialValues]);

    useEffect(() => {
        if (listCurrency && initialValues && formik?.values?.currencyCode) {
            const currency = listCurrency?.find(
                (c) => c.currencyCode === initialValues.currencyCode
            );
            formik.setFieldValue("currencyCode", `${currency?.currencyName} (+${initialValues.currencyCode})`);
        }
    }, [initialValues, listCurrency]);

    useEffect(() => {
        const companyUuid = permissionReducer?.currentCompany?.companyUuid;
        if (!isNullOrUndefinedOrEmpty(companyUuid)
            && invoiceUuid
            && typeof isBuyer === "boolean"
            && initialValues?.invoiceStatus
        ) {
            setState((prevStates) => ({
                ...prevStates,
                companyUuid,
                invoiceUuid
            }));
            initData(companyUuid, invoiceUuid);
        }
        if (!listCurrency && companyUuid) {
            CurrenciesService.getCurrencies(companyUuid)
                .then(({ data }) => {
                    setListCurrency(data?.data);
                });
        }
    }, [permissionReducer, invoiceUuid, initialValues]);

    useEffect(() => {
        if (initialValues?.matchItemDtoList) {
            setRounded({
                decimalPlaces: initialValues?.matchItemDtoList[0]
                    .invoiceNetPriceRoundedDecimalPlace || 2,
                type: initialValues?.matchItemDtoList[0].invoiceNetPriceRoundedType || "normal"
            });
            setInvoiceItems(initialValues?.matchItemDtoList.map(
                (item) => ({ ...item, uuid: uuidv4() })
            ));
            setInvoiceItemsUpdated(initialValues?.matchItemDtoList.map(
                (item) => ({ ...item, uuid: uuidv4() })
            ));
        }
    }, [initialValues?.matchItemDtoList]);

    const renderActionButton = () => {
        if (!formik.values) return (<></>);
        const {
            invoiceStatus, apSpecialist, approverRole,
            hasApproved, invoiceApproverRole, hasInvoiceApproved
        } = formik.values;
        if ((invoiceStatus
            && invoiceStatus === INVOICE_STATUS.PENDING_APPROVAL.replaceAll("_", " ")
            && approverRole
            && !hasApproved)
            || (invoiceStatus
                && (invoiceStatus === INVOICE_STATUS.PENDING_THREE_WAY.replaceAll("_", " ")
                    || invoiceStatus === INVOICE_STATUS.PENDING_TWO_WAY.replaceAll("_", " "))
                && apSpecialist)
            || (invoiceStatus
                && (invoiceStatus === INVOICE_STATUS.PENDING_INVOICE_APPROVAL.replaceAll("_", " ")
                    && isBuyer))
            || (invoiceStatus
                && (invoiceStatus === INVOICE_STATUS.PENDING_APPROVAL.replaceAll("_", " ")
                    && invoiceApproverRole && !hasInvoiceApproved))
        ) {
            return (
                <div className="mx-0">
                    <Button
                        className="mr-3"
                        color="danger"
                        type="button"
                        onClick={() => {
                            setState((prevStates) => ({
                                ...prevStates,
                                displayRejectReasonDialog: true
                            }));
                        }}
                    >
                        {t("Reject")}
                    </Button>
                    <Button
                        color="primary"
                        type="button"
                        onClick={
                            () => {
                                formik?.handleSubmit();
                                if (!formik.dirty || (formik.dirty
                                    && Object.keys(formik.errors).length)) {
                                    showToast("error", "Validation error, please check your input.");
                                    return;
                                }
                                onApproveInvoicePAPressHandler(formik.values.approvalRoute);
                            }
                        }
                    >
                        {t("Approve")}
                    </Button>
                </div>
            );
        }

        return (<></>);
    };

    const onCellValueChanged = (params) => {
        const { data, colDef } = params;
        const { field } = colDef;
        const newRowData = [...invoiceItems];

        invoiceItems.forEach((rowData, index) => {
            if (rowData.uuid === data.uuid) {
                newRowData[index] = data;
                if (field === "glCode") {
                    newRowData[index].glCode = data.glCode;
                    newRowData[index].costCode = "";
                    newRowData[index].departmentCode = "";
                }
            }
        });
        params.api.applyTransaction({ update: newRowData });
        setInvoiceItemsUpdated(newRowData);
    };

    return (
        <Form>
            <Row className="justify-content-between mx-0 mb-2 align-items-center">
                <HeaderMain
                    title={[INVOICE_STATUS.APPROVED_THREE_WAY, INVOICE_STATUS.APPROVED_TWO_WAY].includes(initialValues?.invoiceStatus) ? t("InvoiceDetails") : t("InvoicePendingApproval")}
                    className="mb-3 mb-lg-3"
                />
                <Row className="mx-0 mb-3 mb-lg-3">
                    <Button
                        type="button"
                        className="text-secondary"
                        style={{
                            border: "1px solid #7b7b7b7b",
                            padding: "2px 8px",
                            background: "#fff",
                            height: 48,
                            minWidth: 100
                        }}
                        onClick={() => onViewInvoicePressHandler()}
                    >
                        {t("ViewInvoice")}
                    </Button>

                    {!checkOpcInvoice(initialValues?.invoiceType) && (
                        <>
                            <Badge
                                bg="secondary"
                                className="mx-2"
                                amount={{
                                    text: `${t("TotalInvoiceAmount")}:`,
                                    formatNumber: formatDisplayDecimal(
                                        roundNumberWithUpAndDown(
                                            summary?.invoice?.subTotal + summary?.invoice?.tax
                                        ),
                                        2,
                                        initialValues?.currencyCode
                                    )
                                }}
                            />
                            <Badge
                                bg={roundNumberWithUpAndDown((summary?.amountToInvoice?.subTotal
                                    + summary?.amountToInvoice?.tax) - (summary?.invoice?.subTotal
                                        + summary?.invoice?.tax)) === 0 ? "primary" : "danger"}
                                amount={{
                                    text: `${t("Balance")}:`,
                                    formatNumber: formatDisplayDecimal(
                                        roundNumberWithUpAndDown((summary?.amountToInvoice?.subTotal
                                                + summary?.amountToInvoice?.tax)
                                            - (summary?.invoice?.subTotal + summary?.invoice?.tax)),
                                        2,
                                        initialValues?.currencyCode
                                    )
                                }}
                            />
                        </>
                    )}
                </Row>
            </Row>
            <Row className="my-4">
                <Col xs={6}>
                    {/* Initial Setting Section */}
                    <InitialSetting t={t} readOnly values={formik.values} />
                    {/* General Information Section */}
                    {checkOpcInvoice(initialValues?.invoiceType)
                        ? (
                            <>
                                {isBuyer && (
                                    <GeneralInformation
                                        t={t}
                                        readOnly={
                                            ![INVOICE_STATUS.PENDING_INVOICE_APPROVAL].includes(
                                                initialValues?.invoiceStatus
                                            )
                                        }
                                        approvalRoutes={state.approvalRoutes}
                                        values={formik.values}
                                        touched={formik.touched}
                                        errors={formik.errors}
                                        onChangeApprovalRoute={(e) => onChangeApprovalRoute(e)}
                                    />
                                )}
                            </>
                        )
                        : (
                            <GeneralInformation
                                t={t}
                                readOnly={
                                    initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_APPROVAL
                                || initialValues?.invoiceStatus === INVOICE_CONSTANTS.APPROVED_TWO_WAY
                                || initialValues?.invoiceStatus === INVOICE_CONSTANTS.APPROVED_THREE_WAY
                                || initialValues?.approverRole || !initialValues?.apSpecialist
                                }
                                approvalRoutes={state.approvalRoutes}
                                values={formik.values}
                                touched={formik.touched}
                                errors={formik.errors}
                                onChangeApprovalRoute={(e) => onChangeApprovalRoute(e)}
                            />
                        )}

                </Col>
                <Col xs={6}>
                    {/* Invoice Details Section */}
                    {
                        checkOpcInvoice(initialValues?.invoiceType)
                            ? (
                                <OpcInvoiceDetails
                                    invoiceStatus={initialValues?.invoiceStatus}
                                    t={t}
                                    values={formik.values}
                                    setFieldValue={formik.setFieldValue}
                                    listCurrency={listCurrency}
                                    readOnly
                                />
                            )
                            : (
                                <InvoiceDetails
                                    readOnly
                                    t={t}
                                    values={formik.values}
                                    setFieldValue={formik.setFieldValue}
                                    listCurrency={listCurrency}
                                />
                            )
                    }

                </Col>
                <Col xs={12}>
                    {/* Invoice And PO Section */}
                    {
                        checkOpcInvoice(initialValues?.invoiceType)
                            ? (
                                <SummaryInvoiceTable
                                    // taxRecords={taxRecords}
                                    invoiceDetails={initialValues}
                                    viewMode
                                />
                            )
                            : (
                                rounded && (
                                    <InvoiceAndPO
                                        t={t}
                                        invoiceList={invoiceItems}
                                        rounded={rounded}
                                        summary={summary}
                                        currencyCode={initialValues?.currencyCode}
                                        isThreeWay={initialValues?.matching === "THREE_WAY"}
                                        exchangeRate={exchangeRate}
                                        setExchangeRate={setExchangeRate}
                                        editable={
                                            initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_THREE_WAY
                                            || initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_TWO_WAY
                                        }
                                        isEditGL={initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_THREE_WAY
                                            || initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_TWO_WAY || initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_APPROVAL }
                                        glAccounts={glAccounts}
                                        onCellValueChanged={(params) => onCellValueChanged(params)}
                                        setFieldValue={formik.setFieldValue}
                                        isProject={!isNullOrUndefinedOrEmpty(initialValues?.projectTitle)}
                                        invoiceStatus={initialValues?.invoiceStatus}
                                        apSpecialist={initialValues?.apSpecialist}
                                    />
                                )
                            )
                    }


                </Col>
                <Col xs={12}>
                    {/* Goods Receipt Section */}
                    {initialValues?.matching === "THREE_WAY"
                        && (
                            <GoodsReceipt
                                t={t}
                                // fake data test view DO PDF
                                invoiceList={initialValues?.goodsReceiptItemDtoList}
                                currencyCode={initialValues?.currencyCode}
                                companyUuid={state.companyUuid}
                            />
                        )}
                </Col>
            </Row>
            <HeaderSecondary
                title={t("Conversations")}
                className="mb-2"
            />
            <Row className="mb-2">
                <Col xs={12}>
                    {
                        initialValues?.approverRole
                            ? (
                                <Conversation
                                    title={t("InternalConversations")}
                                    activeTab={state.activeInternalTab}
                                    setActiveTab={(idx) => {
                                        setState((prevStates) => ({
                                            ...prevStates,
                                            activeInternalTab: idx
                                        }));
                                    }}
                                    sendConversation={
                                        (comment) => sendCommentConversation(
                                            comment, true
                                        )
                                    }
                                    addNewRowAttachment={
                                        () => addNewRowAttachment(true)
                                    }
                                    rowDataConversation={
                                        state.rowDataInternalConversation
                                    }
                                    rowDataAttachment={
                                        state.rowDataInternalAttachment
                                    }
                                    onDeleteAttachment={
                                        (uuid, rowData) => onDeleteAttachment(
                                            uuid, rowData, true
                                        )
                                    }
                                    onAddAttachment={
                                        (e, uuid, rowData) => onAddAttachment(
                                            e, uuid, rowData, true
                                        )
                                    }
                                    onCellEditingStopped={
                                        (params) => onCellEditingStopped(params, true)
                                    }
                                    defaultExpanded
                                    disabled={!handleRolePermission?.approve
                                        || initialValues.invoiceStatus !== INVOICE_STATUS.PENDING_APPROVAL}
                                />
                            ) : (
                                <Conversation
                                    title={t("InternalConversations")}
                                    activeTab={state.activeInternalTab}
                                    setActiveTab={(idx) => {
                                        setState((prevStates) => ({
                                            ...prevStates,
                                            activeInternalTab: idx
                                        }));
                                    }}
                                    sendConversation={
                                        (comment) => sendCommentConversation(
                                            comment, true
                                        )
                                    }
                                    addNewRowAttachment={
                                        () => addNewRowAttachment(true)
                                    }
                                    rowDataConversation={
                                        state.rowDataInternalConversation
                                    }
                                    rowDataAttachment={
                                        state.rowDataInternalAttachment
                                    }
                                    onDeleteAttachment={
                                        (uuid, rowData) => onDeleteAttachment(
                                            uuid, rowData, true
                                        )
                                    }
                                    onAddAttachment={
                                        (e, uuid, rowData) => onAddAttachment(
                                            e, uuid, rowData, true
                                        )
                                    }
                                    onCellEditingStopped={
                                        (params) => onCellEditingStopped(params, true)
                                    }
                                    defaultExpanded
                                    disabled={!initialValues?.apSpecialist
                                        || (handleRolePermission?.approve
                                            && (initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_APPROVAL
                                                || initialValues?.invoiceStatus === INVOICE_STATUS.APPROVED_TWO_WAY
                                                || initialValues?.invoiceStatus === INVOICE_STATUS.APPROVED_THREE_WAY))}
                                />
                            )
                    }
                </Col>
            </Row>
            <Row className="mb-4">
                <Col xs={12}>
                    {
                        initialValues?.approverRole
                            ? (
                                <Conversation
                                    title={t("ExternalConversations")}
                                    activeTab={state.activeExternalTab}
                                    setActiveTab={(idx) => {
                                        setState((prevStates) => ({
                                            ...prevStates,
                                            activeExternalTab: idx
                                        }));
                                    }}
                                    sendConversation={
                                        (comment) => sendCommentConversation(comment, false)
                                    }
                                    addNewRowAttachment={() => addNewRowAttachment(false)}
                                    rowDataConversation={
                                        state.rowDataExternalConversation
                                    }
                                    rowDataAttachment={
                                        state.rowDataExternalAttachment
                                    }
                                    onDeleteAttachment={
                                        (uuid, rowData) => onDeleteAttachment(
                                            uuid, rowData, false
                                        )
                                    }
                                    onAddAttachment={
                                        (e, uuid, rowData) => onAddAttachment(
                                            e, uuid, rowData, false
                                        )
                                    }
                                    onCellEditingStopped={
                                        (params) => onCellEditingStopped(params, false)
                                    }
                                    defaultExpanded
                                    borderTopColor="#A9A2C1"
                                    disabled={!handleRolePermission?.approve
                                        || initialValues.invoiceStatus !== INVOICE_STATUS.PENDING_APPROVAL}
                                />
                            ) : (
                                <Conversation
                                    title={t("ExternalConversations")}
                                    activeTab={state.activeExternalTab}
                                    setActiveTab={(idx) => {
                                        setState((prevStates) => ({
                                            ...prevStates,
                                            activeExternalTab: idx
                                        }));
                                    }}
                                    sendConversation={
                                        (comment) => sendCommentConversation(comment, false)
                                    }
                                    addNewRowAttachment={() => addNewRowAttachment(false)}
                                    rowDataConversation={
                                        state.rowDataExternalConversation
                                    }
                                    rowDataAttachment={
                                        state.rowDataExternalAttachment
                                    }
                                    onDeleteAttachment={
                                        (uuid, rowData) => onDeleteAttachment(
                                            uuid, rowData, false
                                        )
                                    }
                                    onAddAttachment={
                                        (e, uuid, rowData) => onAddAttachment(
                                            e, uuid, rowData, false
                                        )
                                    }
                                    onCellEditingStopped={
                                        (params) => onCellEditingStopped(params, false)
                                    }
                                    defaultExpanded
                                    borderTopColor="#A9A2C1"
                                    disabled={!initialValues?.apSpecialist
                                        || (handleRolePermission?.approve
                                            && (initialValues?.invoiceStatus === INVOICE_STATUS.PENDING_APPROVAL
                                                || initialValues?.invoiceStatus === INVOICE_STATUS.APPROVED_TWO_WAY
                                                || initialValues?.invoiceStatus === INVOICE_STATUS.APPROVED_THREE_WAY))}
                                />
                            )
                    }

                </Col>
            </Row>
            <Row className="mb-5">
                {/* Audit Trail Section */}
                <Col xs={12} className="">
                    <HeaderSecondary
                        title={t("AuditTrail")}
                        className="mb-2"
                    />
                </Col>
                <Col xs={12}>
                    <Overview
                        rowData={state.rowDataOverview}
                        rowDataAuditTrail={state.rowDataAuditTrail}
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
                        activeTab={state.activeAuditTrailTab}
                        setActiveTab={(idx) => {
                            setState((prevStates) => ({
                                ...prevStates,
                                activeAuditTrailTab: idx
                            }));
                        }}
                        companyUuid={state.companyUuid}
                        isBuyer={isBuyer}
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
                    {renderActionButton()}
                </Row>
            </StickyFooter>
            <CommonConfirmDialog
                isShow={state.displayRejectReasonDialog}
                onHide={() => setState((prevStates) => ({
                    ...prevStates,
                    displayRejectReasonDialog: false
                }))}
                title={t("Reason")}
                positiveProps={
                    {
                        onPositiveAction: () => {
                            onRejectInvoicePAPressHandler(state.reasonReject);
                        },
                        contentPositive: t("Reject"),
                        colorPositive: "danger"
                    }
                }
                negativeProps={
                    {
                        onNegativeAction: () => setState((prevStates) => ({
                            ...prevStates,
                            displayRejectReasonDialog: false
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
                    name="rejectReason"
                    className={
                        classNames("form-control", {
                            "is-invalid": state.showErrorReasonReject && !state.reasonReject
                        })
                    }
                    placeholder={t("Please enter reason..")}
                    value={state.reasonReject}
                    onChange={(e) => {
                        const { value } = e.target;
                        setState((prevStates) => ({
                            ...prevStates,
                            reasonReject: value
                        }));
                    }}
                />
                {
                    state.showErrorReasonReject
                    && !state.reasonReject
                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                }
            </CommonConfirmDialog>
        </Form>
    );
};

const InvoicePendingAPDetails = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const showToast = useToast();
    const permissionReducer = useSelector((state) => state?.permissionReducer);
    const { isBuyer } = permissionReducer;

    const [invoiceUuid, setInvoiceUuid] = useState(null);
    const [invoiceDetails, setInvoiceDetails] = useState(null);
    const confirmModal = useRef(null);

    const validationSchema = Yup.object().shape({
        approvalRoute: Yup.string()
            // .when("approvalRouteName", (apRouteName, schema) => {
            //     if (!apRouteName) {
            //         return schema.required(t("PleaseSelectValidApprovalRoute1"));
            //     }
            //     return schema;
            // })
            .when("approvalConfig", {
                is: true,
                then: Yup.string().required(t("PleaseSelectValidApprovalRoute"))
            })
    });

    const getPendingInvoiceDetails = async (companyUuid, uuid) => {
        try {
            const query = new URLSearchParams(location.search);
            const OPC = query.get("isOPC");
            let responses;
            if (OPC) {
                responses = await InvoiceService.getOPCInvoiceDetail(
                    companyUuid,
                    uuid,
                    isBuyer
                );
                if (
                    responses.data?.data?.supplierInformation
                    || responses.data?.data?.buyerInformation
                ) {
                    responses.data.data.supplierDto = isBuyer
                        ? responses.data.data.supplierInformation
                        : responses.data?.data?.buyerInformation;
                }
            } else {
                responses = await InvoiceService.getInvPendingAPDetails(companyUuid, uuid);
                const poMap = {};
                await Promise.all(
                    responses.data?.data?.matchItemDtoList?.map(async (row) => {
                        try {
                            if (row.poUuid && row.poUnitPrice === 0) {
                                if (!poMap[row.poUuid]) {
                                    poMap[row.poUuid] = await PurchaseOrderService.getDetailsPO(companyUuid, row.poUuid, true);
                                }
                                const poDetails = poMap[row.poUuid];
                                const poItem = poDetails?.data?.data?.poItemDtoList?.filter((item) => item.itemCode === row.itemCode)[0];
                                if (poItem?.contracted) row.poUnitPrice = poItem.contractedPrice || 0;
                            }
                        } catch (error) {
                            console.log(`Cannot get PO details: ${row.poUuid}`);
                        }
                    })
                );
            }
            setInvoiceDetails({
                ...responses?.data?.data,
                approvalConfig: false
            });
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const uuid = query.get("uuid");
        setInvoiceUuid(uuid);
        if (uuid && permissionReducer?.currentCompany) {
            getPendingInvoiceDetails(permissionReducer?.currentCompany?.companyUuid, uuid);
        }
    }, [permissionReducer]);

    return (
        <Container fluid>
            <Formik
                initialValues={null}
                validationSchema={validationSchema}
                onSubmit={() => { }}
            >
                {(props) => (
                    <InvoiceForm
                        t={t}
                        initialValues={invoiceDetails}
                        confirmModal={confirmModal}
                        formik={props}
                        showToast={showToast}
                        invoiceUuid={invoiceUuid}
                    />
                )}
            </Formik>
        </Container>
    );
};

export default InvoicePendingAPDetails;
