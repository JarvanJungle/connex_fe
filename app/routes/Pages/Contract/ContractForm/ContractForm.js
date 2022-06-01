import {
    // Button,
    Container,
    Row,
    Col,
    Input, Button
} from "components";
import React, {
    useState, useEffect, useRef, useMemo
} from "react";
import { useTranslation } from "react-i18next";
import {
    Formik, Form
} from "formik";
import * as Yup from "yup";
import {
    formatDateString,
    sortArrayByName,
    formatBudget,
    convertToLocalTime,
    formatDisplayDecimal
} from "helper/utilities";
import { HeaderMain } from "routes/components/HeaderMain";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
import CUSTOM_CONSTANTS, { RESPONSE_STATUS, PROJECT_TYPES, FEATURE } from "helper/constantsDefined";
import _ from "lodash";
import ExtVendorService from "services/ExtVendorService";
import AddressDataService from "services/AddressService";
import ManageProjectService from "services/ManageProjectService";
import ProjectService from "services/ProjectService/ProjectService";
import useToast from "routes/hooks/useToast";
import CurrenciesService from "services/CurrenciesService";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import {
    AuditTrail, BudgetDetails, CommonConfirmDialog
} from "routes/components";
import UOMDataService from "services/UOMService";
import TaxRecordDataService from "services/TaxRecordService";
import ContractModuleService from "services/ContractModuleService/ContractModuleService";
import CONTRACT_REQUEST_FORM_ROUTE from "services/ContractModuleService/urls";
import { CONTRACT_REQUEST_LIST_STATUS } from "helper/constantsDefined";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";
import useUnsavedChangesWarning from "routes/components/UseUnsaveChangeWarning/useUnsaveChangeWarning";
import ConversationService from "services/ConversationService/ConversationService";
import useBudgetDetails from "routes/hooks/useBudgetDetails";
import DocumentPrefixService from "services/DocumentPrefixService/DocumentPrefixService";
import ContractItems from "../components/ContractItems/ContractItems";
import ContractingConversion from "../components/Conversations/Conversations";
import itemSchema from "../components/ContractItems/ConlumnDefs/validation/itemSchema";
import GeneralInformation from "./Generalnformation/GeneralInformation";
import ContractDocuments from "./ContractDocuments/ContractDocuments";
import ESignDocuments from "./ESign/ESignDocuments";
import StickyFooterSubmit from "./Footer/StickyFooterSubmit";
import ContractPreviewModal from "../components/ContractPreviewModal/ContractPreviewModal";

function ContractFormRequest() {
    const { t } = useTranslation();
    const ONE_DATE_MS = 86400000;
    const contractPreviewModalRef = useRef();
    const validationSchema = Yup.object().shape({
        contractNumber: Yup.string()
            .required(t("Please Enter Contract Number")),
        contractType: Yup.string()
            .required(t("Please select Contract Type")),
        procurementType: Yup.string()
            .required(t("Please select Procurement Type")),
        contractTitle: Yup.string()
            .required(t("PleaseEnterContractTitle")),
        contractStartDate: Yup.date()
            .min(new Date(Date.now() - ONE_DATE_MS), t("PleaseSelectValidStartDateThanToday"))
            .required(t("PleaseSelectValidStartDate")),
        contractEndDate: Yup.date().min(
            Yup.ref("contractStartDate"), t("EndDateShouldBeGreaterThanStartDate")
        ).required(t("PleaseSelectValidEndDate")),
        approvalRoute: Yup.string()
            .nullable()
            .required(t("PleaseSelectApprovalRoute")),
        deliveryAddress: Yup.string()
            .required(t("PleaseSelectDeliveryAddress")),
        currency: Yup.string()
            .required(t("PleaseSelectCurrency")),
        project: Yup.string()
            .test("projectRequired",
                t("PleaseSelectValidProject"),
                (value, testContext) => {
                    const { parent } = testContext;
                    const myCondition = parent.natureOfContract.toString() === "true";
                    return ((value && myCondition)
                    || (!value && !myCondition));
                }),
        // productServiceDescription: Yup.string()
        //     .required(t("PleaseEnterProduct/ServiceDescription")),
        supplierCode: Yup.string()
            .required(t("PleaseSelectValidSupplier"))
    });

    const requestFormRef = useRef(null);
    const history = useHistory();
    const params = useParams();
    const showToast = useToast();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);

    const { userDetails } = authReducer;
    const { userPermission } = permissionReducer;

    const contractingType = useMemo(() => {
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
    }, [permissionReducer]);

    const [contractFormState, setContractFormState] = useState({
        loading: false,
        companyUuid: "",
        contractUuid: "",
        renewalOptions: [
            { label: "None", value: "None" },
            { label: "Yes", value: "Yes" }
        ],
        natureOfContract: [
            { label: "Project", value: true },
            { label: "Non-Project", value: false }
        ],
        modeView: {
            isEditMode: true,
            isViewDetailsMode: false,
            isApprovalMode: false
        }
    });

    // API response states
    const [rejectObj, setRejectObj] = useState({
        showErrorReasonReject: false,
        reasonReject: ""
    });

    const [sendBackObj, setSendBackObj] = useState({
        showErrorReasonSendBack: false,
        reasonSendBack: ""
    });

    // const [recallObj, setRecallObj] = useState({
    //     showErrorReasonRecall: false,
    //     reasonRecall: ""
    // });
    const [
        rowDataProject, rowDataTrade, ,
        getBudgetDetailsByProjectCode
    ] = useBudgetDetails();
    // check unsave + warning
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

    const [isESign, setIsESign] = useState(false);
    const [loadButton, setLoadButton] = useState(false);
    const [contractData, setContractData] = useState();
    const [contractStatus, setContractStatus] = useState("");
    const [refreshSummaryItems, setRefreshSummaryItems] = useState(false);
    const [projects, setProjects] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [approvalRoutes, setApprovalRoutes] = useState([]);
    // const [stateForecastItems, setStateForecastItems] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [taxRecords, setTaxRecords] = useState([]);
    const [subTotal, setSubTotal] = useState(0);
    const [isManualDocumentPrefix, setIsManualDocumentPrefix] = useState(false);

    const [catalogueItems, setCatalogueItems] = useState([]);
    const [rowContractItems, setRowContractItems] = useState([]);
    const [rowDataAuditTrail, setRowDataAuditTrail] = useState([]);
    const [displayTerminateReasonDialog, setDisplayTerminateReasonDialog] = useState(false);
    const [displayRecallReasonDialog, setDisplayRecallReasonDialog] = useState(false);
    const [displaySendBackReasonDialog, setDisplaySendBackReasonDialog] = useState(false);
    const [displayRejectReasonDialog, setDisplayRejectReasonDialog] = useState(false);
    const [conversation, setConversation] = useState({
        activeInternalTab: 1, // set default tab
        activeExternalTab: 1, // set default tab
        internalConversationLines: [],
        externalConversationLines: [],
        rowDataInternalConversation: [],
        rowDataInternalAttachment: [],
        rowDataExternalConversation: [],
        rowDataExternalAttachment: []
    });

    const [contractDocumentsAttachment, setContractDocumentsAttachment] = useState([]);

    const initialValues = {
        isEdit: false,
        contractNumber: "",
        contractTitle: "",
        contractingEntity: "",
        contractingOwner: "",
        contractType: "",
        outsourcingContract: true,
        currency: "",
        contractValue: 0,
        contractStartDate: formatDateString(new Date(), CUSTOM_CONSTANTS.YYYYMMDD),
        contractEndDate: "",
        paymentTermName: "",
        paymentTermUuid: "",
        renewalOptions: "None",
        createdBy: "",
        createdDate: formatDateString(new Date(), CUSTOM_CONSTANTS.DDMMYYYY),
        natureOfContract: "false",
        project: "",
        projectTitle: "",
        projectRFQNo: "",
        costCenter: 0,
        totalUsedCurrencyCode: "",
        totalUsed: "0.00",
        // deliveryDate: "",
        deliveryAddress: "",
        supplier: "",
        supplierCode: "",
        supplierDetails: {},
        supplierAddress: [],
        supplierContact: [],
        supplierContactUuid: "",
        supplierAddressDetails: "",
        supplierAddressSelect: "",
        deliveryAddressObject: {},
        productServiceDescription: "",
        approvalRoute: "", // approvalMatrixName on API
        approvalRouteName: "",
        approvalRouteSequence: "",
        status: "",
        addressFirstLine: "",
        addressSecondLine: "",
        contactName: "",
        contactEmail: "",
        contactNumber: "",
        taxRegNo: "",
        country: "",
        addressUuid: "",
        convertedDate: "",
        supplierUuid: "",
        eSignRouting: false
    };

    const [summary, setSummary] = useState({
        subTotal: 0,
        tax: 0,
        total: 0
    });

    // return a array
    const checkFulFilled = (obj) => {
        if (obj.status === "fulfilled") {
            return obj.value.data.data;
        }
        showToast("error", obj.value.response ? obj.value.response.data.message : obj.value.message);
        return [];
    };

    const procurementTypes = [
        { label: "Goods", value: "Goods" },
        { label: "Service", value: "Service" }
    ];

    const getBudgetDetails = async (code) => {
        try {
            await getBudgetDetailsByProjectCode(contractFormState.companyUuid, code);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const initData = (currentCompanyUUID, contractDataRes = null, isPendingSubmission = false) => {
        if (isPendingSubmission) {
            const responseSuppliers = ExtVendorService.getExternalVendors(
                currentCompanyUUID
            );

            // need to consider this place
            const responseProjects = ManageProjectService.getCompanyProjectList(
                currentCompanyUUID
            );

            const responseCurrencies = CurrenciesService.getCurrencies(
                currentCompanyUUID
            );

            const responseApprovalRoutes = ApprovalMatrixManagementService.retrieveListOfApprovalMatrixDetails(
                currentCompanyUUID,
                "contract"
            );

            const responseUOMs = UOMDataService.getUOMRecords(
                currentCompanyUUID
            );

            const responseAddresses = AddressDataService.getCompanyAddresses(
                currentCompanyUUID
            );

            // const responseGLAccounts = GLDataService.getGLs(
            //     currentCompanyUUID
            // );

            const responseTaxRecords = TaxRecordDataService.getTaxRecords(
                currentCompanyUUID
            );

            Promise.allSettled([
                responseProjects,
                responseSuppliers,
                responseCurrencies,
                responseApprovalRoutes,
                responseUOMs,
                responseAddresses,
                // responseGLAccounts,
                responseTaxRecords
            ])
                .then(([resProject,
                    resSuppliers,
                    resCurrencies,
                    resApprovalRoutes,
                    resUOM,
                    resAddresses,
                    // resGlAccounts,
                    resTaxRecords
                ]) => {
                    // set the result to states
                    setProjects(sortArrayByName(checkFulFilled(resProject).filter((x) => x.projectStatus === PROJECT_TYPES.FORECASTED), "projectTitle"));
                    // filter to get the supplier only
                    setSuppliers(sortArrayByName(checkFulFilled(resSuppliers).filter((x) => x.seller), "companyName", true));
                    setCurrencies(sortArrayByName(checkFulFilled(resCurrencies).filter((x) => x.active), "currencyCode"));
                    setApprovalRoutes(sortArrayByName(checkFulFilled(resApprovalRoutes).filter((x) => x.active), "approvalName"));
                    setUoms(checkFulFilled(resUOM));
                    setAddresses(sortArrayByName(checkFulFilled(resAddresses).filter((x) => x.active), "addressLabel"));
                    // setGlAccounts(checkFulFilled(resGlAccounts));
                    setTaxRecords(checkFulFilled(resTaxRecords));

                    setContractData(contractDataRes);
                });
        } else {
            setContractData(contractDataRes);
        }

        setLoadButton(true);
        setConversation((prev) => ({
            ...prev,
            activeInternalTab: 2,
            activeExternalTab: 2
        }));
    };

    const formatConversationText = (responseData, isInternal = true, isSupplier = false) => {
        const result = [];
        if (responseData.status === RESPONSE_STATUS.FULFILLED) {
            const { value } = responseData;
            const { data, status, message } = value && value.data;
            if (status === RESPONSE_STATUS.OK) {
                if (data) {
                    data.conversations.forEach((item) => {
                        result.push({
                            userName: item.sender,
                            userRole: item.designation || (isSupplier && "Supplier"),
                            userUuid: item.userUuid,
                            dateTime: convertToLocalTime(
                                new Date(isInternal ? item.date : item.createdAt),
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

    const getConversationText = (currentCompanyUUID, contractUUID) => {
        let rowDataInternalConversation = [];
        let rowDataExternalConversation = [];

        // get conversation
        Promise.allSettled(
            [
                ConversationService.getDetailInternalConversation(
                    currentCompanyUUID, contractUUID
                ),
                ConversationService.getDetailExternalConversation(
                    currentCompanyUUID, contractUUID
                )
            ]
        ).then((response) => {
            const [resInternalConversation, resExternalConversation] = response;
            rowDataInternalConversation = formatConversationText(resInternalConversation);
            rowDataExternalConversation = rowDataExternalConversation.concat(
                formatConversationText(resExternalConversation, false)
            );

            setConversation((prevStates) => ({
                ...prevStates,
                rowDataInternalConversation,
                rowDataExternalConversation
            }));
        });
    };

    const getDocumentPrefixStatus = (currentCompanyUUID) => {
        DocumentPrefixService.getAllPrefixes(currentCompanyUUID)
            .then((res) => res?.data?.data)
            .then((data = {}) => {
                const contractDPConfig = data?.buyerPortalList?.find((dp) => dp?.functionName === "Contract");
                setIsManualDocumentPrefix(contractDPConfig?.type === "Manual");
            }).catch((err) => {
                console.error(err);
            });
    };

    const getContractDetail = async (currentCompanyUUID, contractUUID) => {
        try {
            const contractDetailResult = await ContractModuleService
                .getContractDetailByType(permissionReducer.isBuyer,
                    currentCompanyUUID,
                    contractUUID);
            const { data } = contractDetailResult.data;
            setContractStatus(data.contractStatus);
            switch (data.contractStatus) {
            case CONTRACT_REQUEST_LIST_STATUS.RECALLED:
            case CONTRACT_REQUEST_LIST_STATUS.SEND_BACK_CONTRACT:
            case CONTRACT_REQUEST_LIST_STATUS.PENDING_SUBMISSION:
                initData(currentCompanyUUID, data, true, contractUUID);
                break;
            case CONTRACT_REQUEST_LIST_STATUS.SAVE_AS_DRAFT_CONTRACT:
                initData(currentCompanyUUID, data, true, contractUUID);
                break;
            default:
                initData(currentCompanyUUID, data, false);
                break;
            }
        } catch (error) {
            console.log(error);
            showToast("error", error.message ? error.message : error.response.data.message);
        }
    };

    useEffect(() => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (currentCompanyUUID && !_.isEmpty(userDetails)) {
            getDocumentPrefixStatus(currentCompanyUUID);
            setContractFormState((prevStates) => ({
                ...prevStates,
                companyUuid: currentCompanyUUID
            }));

            // check mode create new / detail / so on ...
            const contractUUID = params.uuid;
            if (contractUUID) {
                setContractFormState((prevStates) => ({
                    ...prevStates,
                    contractUuid: contractUUID
                }));

                getContractDetail(currentCompanyUUID, contractUUID);
                // get conversation text portion
                getConversationText(currentCompanyUUID, contractUUID);
            } else {
                history.back();
            }
        }
    }, [permissionReducer, userDetails]);

    useEffect(() => {
        switch (contractStatus) {
        case CONTRACT_REQUEST_LIST_STATUS.SAVE_AS_DRAFT_CONTRACT:
        case CONTRACT_REQUEST_LIST_STATUS.RECALLED:
        case CONTRACT_REQUEST_LIST_STATUS.SEND_BACK_CONTRACT:
        case CONTRACT_REQUEST_LIST_STATUS.PENDING_SUBMISSION:
            requestFormRef?.current?.setFieldValue("isEdit", true);
            break;
        default:
            requestFormRef?.current?.setFieldValue("isEdit", false);
        }
    }, [contractStatus]);

    const onChangeEsign = (setFieldValue, value) => {
        setIsESign(!value.eSignRouting);
        setFieldValue("eSignRouting", !value.eSignRouting);
    };

    // const onChangeSubTotal = async (e, setFieldValue) => {

    // };

    const onChangeProject = async (e, setFieldValue, isBuyer = true, changeRequestTerms = true) => {
        // setDirty();
        // get project code
        const projectCode = e.target ? e.target.value : e;
        setFieldValue("project", projectCode);
        if (isBuyer) {
            try {
                getBudgetDetails(projectCode);
                const response = await ProjectService.getProjectDetails(projectCode);
                const { data } = response.data;
                const issuedPoBudget = `${data.currency} ${formatBudget(data.issuedPoBudget ?? 0)}`;
                setFieldValue("projectTitle", data.projectTitle);
                setFieldValue("projectName", data.projectTitle);
                setFieldValue("projectRFQNo", projectCode);
                setFieldValue("projectUuid", data.uuid);
                setFieldValue("projectCode", projectCode);
                setFieldValue("totalUsedCurrencyCode", data.currency);
                setFieldValue("totalUsed", issuedPoBudget);
                setFieldValue("deliveryDate", data.endDate);
                if (changeRequestTerms) {
                    setFieldValue("deliveryAddress", data.projectAddressDto.addressLabel);
                    setFieldValue("deliveryAddressObject", data.projectAddressDto);
                }
            } catch (error) {
                showToast("error", error.response ? error.response.data.message : error.message);
            }
        }
    };

    // const onChangeApprovalRoute = async (e, setFieldValue) => {
    //     setDirty();
    //     const approvalRouteUUID = e?.target?.value || e;
    //     setFieldValue("approvalRoute", approvalRouteUUID);
    //     try {
    //         const response = await ApprovalMatrixManagementService
    //             .getApprovalMatrixByApprovalUuid(contractFormState.companyUuid,
    //                 approvalRouteUUID);
    //         const { data } = response.data;
    //         const { approvalRange } = data;
    //         let approvalSequence = "";
    //         approvalRange.forEach((approval, index) => {
    //             const { approvalGroups } = approval;
    //             if (index === 0) {
    //                 approvalSequence = approvalGroups[0].group.groupName;
    //             } else {
    //                 approvalSequence += ` > ${approvalGroups[0].group.groupName}`;
    //             }
    //         });
    //         setFieldValue("approvalSequence", approvalSequence);
    //     } catch (error) {
    //         showToast("error", error.response ? error.response.data.message : error.message);
    //     }
    // };

    const prepareBody = async (values) => {
        const {
            rowDataInternalAttachment,
            rowDataExternalAttachment
        } = conversation;

        const approvalMatrix = approvalRoutes.find((x) => x.uuid === values.approvalRoute);
        const isProject = values.natureOfContract === "true" || values.natureOfContract === true;
        // preparing the body
        const objectAddress = addresses.find(
            (x) => x.addressLabel === values.deliveryAddress
        );
        const body = {
            contractNumber: values.contractNumber,
            contractTitle: values.contractTitle,
            contractType: values.contractType,
            isOutsourcingContract: values.outsourcingContract,
            currencyCode: values.currency,
            // contractValue: values.contractValue,
            contractStartDate: convertToLocalTime(
                values.contractStartDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
            ),
            contractEndDate: convertToLocalTime(
                values.contractEndDate, CUSTOM_CONSTANTS.YYYYMMDDHHmmss
            ),
            paymentTermName: values.paymentTermName,
            paymentTermUuid: values.paymentTermUuid,
            renewalOption: values.renewalOption,
            project: isProject,
            projectCode: isProject ? values.projectCode : "",
            projectName: isProject ? values.projectName : "",
            projectUuid: isProject ? values.projectRFQNo : "",
            projectRfqNo: isProject ? values.projectRFQNo : "",
            procurementType: values.procurementType,
            natureOfContract: values.natureOfContract,
            // projectDeliveryDate: isProject ? values.deliveryDate : "",
            // connectedVendor: true, // need to confirm
            deliveryAddress: {
                ...objectAddress
            },
            totalUsedCurrencyCode: (values.totalUsed && values.totalUsed !== 0 && isProject)
                ? values.totalUsed.toString()
                    .split(" ")[0] : "",
            totalUsed: (values.totalUsed && values.totalUsed !== 0 && isProject)
                ? values.totalUsed.toString()
                    .split(" ")[1]
                    .replace(/,/g, "")
                    .replace(".00", "") : 0,
            approvalRouteUuid: approvalMatrix.uuid,
            eSignRouting: values.eSignRouting,
            buyerInformation: {
                ...contractData.buyerInformation
            },
            supplierInformation: {
                supplierCode: values.supplierCode,
                supplierVendorConnectionUuid: values.supplierDetails.uuid,
                supplierCompanyUuid: values.supplierDetails.vendorCompanyUuid,
                companyName: values.supplierDetails.companyName,
                taxRegNo: values.supplierDetails.gstRegNo,
                companyAddress: {
                    ...(values.supplierDetails.addressesDto.find((o) => o.default) ?? {})
                },
                companyCountry: values.country,
                contactInformation: {
                    contactName: values.contactName,
                    contactEmail: values.contactEmail,
                    contactNumber: values.contactNumber
                }
            },
            supplierName: values.supplierDetails.companyName,
            supplierUuid: values.supplierDetails.uuid,
            connected: values.supplierDetails.connected,
            items: [],
            contractDocuments: [],
            note: values.note
        };

        const itemRequests = rowContractItems.map(
            ({
                itemCode,
                itemName,
                itemDescription,
                itemModel,
                itemSize,
                itemBrand,
                trade,
                manualItem,
                uomCode,
                itemQuantity,
                currencyCode,
                itemUnitPrice,
                taxCode,
                exchangeRate,
                inSourceCurrency,
                inDocumentCurrency,
                // address,
                // requestedDeliveryDate,
                // glAccount,
                note
            }) => {
                const item = ({
                    itemCode,
                    itemName,
                    itemDescription: (itemDescription || ""),
                    model: itemModel,
                    size: itemSize,
                    brand: itemBrand,
                    trade,
                    uom: uomCode?.uomCode || uomCode,
                    qty: Number(itemQuantity || 0),
                    currency: _.isString(currencyCode) ? currencyCode
                        : currencyCode.currencyCode,
                    unitPrice: Number(itemUnitPrice),
                    taxCode: taxCode?.taxCode,
                    taxCodeUuid: taxCode?.uuid,
                    taxCodeValue: taxCode?.taxRate,
                    inSourceCurrency,
                    exchangeRate: exchangeRate || 0,
                    inDocumentCurrency,
                    glAccount: null,
                    // deliveryAddress: address?.addressLabel,
                    // requestedDeliveryDate: convertToLocalTime(
                    //     requestedDeliveryDate, CUSTOM_CONSTANTS.DDMMYYYY
                    // ),
                    // glAccountNumber: glAccount?.accountNumber,
                    // glAccountUuid: glAccount?.uuid,
                    note,
                    manualItem
                });
                if (!item.currencyCode) delete item.currencyCode;
                if (!item.taxCode) delete item.taxCode;
                if (!item.uomCode) delete item.uomCode;

                return item;
            }
        );

        await itemSchema.validate(itemRequests);
        body.items = itemRequests;

        const addedDocument = [
            ...(rowDataInternalAttachment?.map((item) => ({ ...item, externalDocument: false })) ?? []),
            ...(rowDataExternalAttachment?.map((item) => ({ ...item, externalDocument: true })) ?? []),
            ...(contractDocumentsAttachment?.map((item) => ({ ...item, isAttachment: true })) ?? [])
        ];
        const addedDocumentFormatted = addedDocument.filter(({ isNew }) => isNew).map((
            {
                fileDescription,
                description,
                title,
                fileLabel,
                guid,
                attachment,
                uploadedBy,
                uploadBy,
                uploaderUuid,
                uploadOn,
                externalDocument,
                isAttachment
            }
        ) => ({
            title: fileLabel ?? title,
            description: fileDescription ?? description,
            fileName: attachment,
            uploadOn: formatDateString(uploadOn, CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
            updatedOn: formatDateString(new Date(), CUSTOM_CONSTANTS.YYYYMMDDHHmmss),
            mainDocument: isAttachment,
            guid,
            externalDocument,
            uploadBy: uploadedBy ?? uploadBy,
            uploaderUuid
        }));
        body.contractDocuments.push(...addedDocumentFormatted);
        return body;
    };

    const onCreatePressHandler = async (values, isDraft = false) => {
        try {
            const {
                companyUuid,
                contractUuid
            } = contractFormState;

            const body = await prepareBody(values);
            const res = isDraft
                ? await ContractModuleService.submitContractDraft(companyUuid, contractUuid, body)
                : await ContractModuleService.submitContract(companyUuid, contractUuid, body);
            setPristine();
            showToast("success", res.data.message);
            setTimeout(() => {
                history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_LIST);
            }, 1000);
        } catch (error) {
            console.log(error);
            showToast("error", error?.response?.data?.message ?? error?.message);
        }
    };

    const onChangeApprovalRoute = async (e, setFieldValue) => {
        // setDirty();
        const approvalRouteUUID = e?.target?.value || e;
        setFieldValue("approvalRoute", approvalRouteUUID);
        try {
            const response = await ApprovalMatrixManagementService
                .getApprovalMatrixByApprovalUuid(contractFormState.companyUuid,
                    approvalRouteUUID);
            const { data } = response.data;
            const { approvalRange } = data;
            let approvalSequence = "";
            approvalRange.forEach((approval, index) => {
                const { approvalGroups } = approval;
                if (index === 0) {
                    approvalSequence = approvalGroups[0].group.groupName;
                } else {
                    approvalSequence += ` > ${approvalGroups[0].group.groupName}`;
                }
            });
            setFieldValue("approvalSequence", approvalSequence);
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const issueContract = async () => {
        try {
            const response = await ContractModuleService
                .issueContract(contractFormState.companyUuid,
                    contractFormState.contractUuid);
            const { status, statusCode, message } = response.data;
            if (status === "OK" || statusCode === 200) {
                // setPristine();
                history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_LIST);
                showToast("success", message);
            } else {
                throw new Error(message);
            }
        } catch (error) {
            showToast("error", error.message);
        }
    };

    const acknowledgementContract = async () => {
        try {
            const response = await ContractModuleService
                .acknowledgementContract(contractFormState.companyUuid,
                    contractFormState.contractUuid);
            const { status, statusCode, message } = response.data;
            if (status === "OK" || statusCode === 200) {
                // setPristine();
                history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_LIST);
                showToast("success", message);
            } else {
                throw new Error(message);
            }
        } catch (error) {
            showToast("error", error.message);
        }
    };

    const terminateContract = async () => {
        try {
            const response = await ContractModuleService
                .terminateContract(contractFormState.companyUuid,
                    contractFormState.contractUuid);
            const { status, statusCode, message } = response.data;
            if (status === "OK" || statusCode === 200) {
                // setPristine();
                history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_LIST);
                showToast("success", message);
            } else {
                throw new Error(message);
            }
        } catch (error) {
            showToast("error", error.message);
        }
    };

    const approveContract = async () => {
        try {
            const response = await ContractModuleService
                .approveContract(contractFormState.companyUuid,
                    contractFormState.contractUuid);
            const { status, statusCode, message } = response.data;
            if (status === "OK" || statusCode === 200) {
                // setPristine();
                history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_LIST);
                showToast("success", message);
            } else {
                throw new Error(message);
            }
        } catch (error) {
            showToast("error", error.message);
        }
    };

    const rejectContract = async (reason) => {
        if (rejectObj.reasonReject) {
            setRejectObj((prevStates) => ({
                ...prevStates,
                showErrorReasonReject: false
            }));
            try {
                const response = await ContractModuleService
                    .rejectContract(contractFormState.companyUuid,
                        contractFormState.contractUuid);
                const { status, statusCode, message } = response.data;
                if (status === "OK" || statusCode === 200) {
                    const conversationLines = [];
                    conversationLines.push({ text: reason });
                    const conversationBody = {
                        referenceId: contractFormState.contractUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: conversationLines
                    };
                    await ConversationService
                        .createInternalConversation(contractFormState.companyUuid,
                            conversationBody);

                    setPristine();
                    history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_LIST);
                    showToast("success", message);
                } else {
                    throw new Error(message);
                }
            } catch (error) {
                showToast("error", error.message);
            }
        }
    };

    const sendBackContract = async (reason) => {
        if (sendBackObj.reasonSendBack) {
            setRejectObj((prevStates) => ({
                ...prevStates,
                showErrorReasonSendBack: false
            }));
            try {
                const response = await ContractModuleService
                    .sendBackContract(contractFormState.companyUuid,
                        contractFormState.contractUuid);
                const { status, statusCode, message } = response.data;
                if (status === "OK" || statusCode === 200) {
                    const conversationLines = [];
                    conversationLines.push({ text: reason });
                    const conversationBody = {
                        referenceId: contractFormState.contractUuid,
                        supplierUuid: userDetails.uuid,
                        conversations: conversationLines
                    };
                    await ConversationService
                        .createInternalConversation(contractFormState.companyUuid,
                            conversationBody);

                    setPristine();
                    history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_LIST);
                    showToast("success", message);
                } else {
                    throw new Error(message);
                }
            } catch (error) {
                showToast("error", error.message);
            }
        }
    };

    const recallContract = async () => {
        try {
            const response = await ContractModuleService
                .recallContract(contractFormState.companyUuid,
                    contractFormState.contractUuid);
            const { status, statusCode, message } = response.data;
            if (status === "OK" || statusCode === 200) {
                history.push(CONTRACT_REQUEST_FORM_ROUTE.CONTRACT_LIST);
                showToast("success", message);
            } else {
                throw new Error(message);
            }
        } catch (error) {
            showToast("error", error.message);
        }
    };

    return (
        <Container fluid>
            <Formik
                innerRef={requestFormRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={() => { }}
                validateOnChange
            >
                {({
                    errors, values, touched, dirty, handleChange, setFieldValue, handleSubmit
                }) => {
                    useEffect(() => {
                        if (!values.createdBy) setFieldValue("createdBy", authReducer?.userDetails?.name);
                    }, [authReducer]);

                    useEffect(() => {
                        if (contractData) {
                            setFieldValue("contractNumber", contractData.contractNumber === "Manual" ? "" : contractData.contractNumber);
                            setFieldValue("contractTitle", contractData.contractTitle);
                            setFieldValue("contractType", contractData.contractType);
                            setFieldValue("procurementType", contractData.procurementType);
                            setFieldValue("note", contractData.note);
                            setFieldValue("currency", contractData.currencyCode);
                            setFieldValue("contractValue", formatDisplayDecimal(contractData.contractValue || 0));
                            setFieldValue("contractStartDate", contractData.contractStartDate
                                ? convertToLocalTime(
                                    contractData.contractStartDate,
                                    CUSTOM_CONSTANTS.YYYYMMDD
                                )
                                : formatDateString(new Date(), CUSTOM_CONSTANTS.YYYYMMDD));
                            setFieldValue("contractEndDate", contractData.contractEndDate
                                ? convertToLocalTime(
                                    contractData.contractEndDate,
                                    CUSTOM_CONSTANTS.YYYYMMDD
                                )
                                : "");
                            setFieldValue("renewalOption", contractData.renewalOption);
                            setFieldValue("natureOfContract", contractData.natureOfContract);
                            if (contractData.natureOfContract === true || contractData.natureOfContract === "true") {
                                setFieldValue("project", contractData.projectRfqNo);
                                setFieldValue("projectName", contractData.projectName);
                                setFieldValue("projectUuid", contractData.projectUuid);
                                setFieldValue("projectRFQNo", contractData.projectRfqNo);
                                setFieldValue("projectCode", contractData.projectCode);
                                setFieldValue("totalUsed", formatDisplayDecimal(contractData.totalUsed, 2, contractData.currencyCode));

                                // Budget Details
                                onChangeProject(
                                    contractData.projectCode,
                                    setFieldValue,
                                    permissionReducer.isBuyer,
                                    false
                                );
                            }
                            setFieldValue("deliveryAddress", contractData.deliveryAddress.addressLabel);
                            setFieldValue("deliveryAddressObject", contractData.deliveryAddress);
                            setFieldValue("productServiceDescription", contractData.productServiceDescription);
                            setFieldValue("approvalRoute", contractData.approvalRouteUuid);
                            setFieldValue("approvalRouteName", contractData.approvalRouteName);
                            setFieldValue("approvalRouteSequence", contractData.approvalRouteSequence);
                            setFieldValue("eSignRouting", contractData.eSignRouting);
                            setFieldValue("createdBy", contractData.createdByName);
                            setFieldValue("convertedDate", contractData.updatedDate
                                ? convertToLocalTime(
                                    contractData.updatedDate,
                                    CUSTOM_CONSTANTS.DDMMYYYHHmmss
                                )
                                : "");
                            setFieldValue("status", contractData.contractStatus);

                            // set supplier information
                            setFieldValue("supplierInformation", contractData.supplierInformation);
                            setFieldValue("supplierUuid", contractData?.supplierInformation?.supplierVendorConnectionUuid);
                            setFieldValue("supplierCode", contractData?.supplierInformation?.supplierCode);
                            setFieldValue("supplierName", contractData?.supplierInformation?.companyName);
                            setFieldValue("supplierAddressSelect", contractData?.supplierInformation?.companyAddress?.addressLabel);
                            setFieldValue("supplierAddressDetails", `${contractData?.supplierInformation?.companyAddress?.addressFirstLine} ${contractData?.supplierInformation?.companyAddress?.addressSecondLine}`);
                            setFieldValue("contactName", contractData?.supplierInformation?.contactInformation?.contactName);
                            setFieldValue("contactEmail", contractData?.supplierInformation?.contactInformation?.contactEmail);
                            setFieldValue("contactNumber", contractData?.supplierInformation?.contactInformation?.contactNumber);
                            setFieldValue("paymentTermName", contractData.paymentTermName);
                            setFieldValue("paymentTermUuid", contractData.paymentTermUuid);
                            const supplierUuid = contractData.supplierInformation
                                .supplierVendorConnectionUuid;
                            // Supplier Information
                            ExtVendorService.getExternalVendorDetails(
                                contractFormState.companyUuid, supplierUuid
                            ).then((dataRes) => {
                                const { data } = dataRes.data;
                                data.supplierUserList.map((item) => {
                                    item.uuid = uuidv4();
                                    return item;
                                });
                                setFieldValue("supplierAddress", data.addressesDto);
                                setFieldValue("supplierContact", data.supplierUserList);
                                setFieldValue("supplierDetails", data);
                                setFieldValue("companyRegNo", data.uen);
                                setFieldValue("country", data?.addressesDto?.find((o) => o.default)?.country);
                                if (!contractData.paymentTermUuid) {
                                    setFieldValue("paymentTermName", data?.paymentTerm?.ptName);
                                    setFieldValue("paymentTermUuid", data?.paymentTerm?.ptUuid);
                                }
                            });

                            // Contract Documents
                            setContractDocumentsAttachment(contractData?.contractDocuments?.filter((item) => item.mainDocument) ?? []);

                            // Contract Items
                            const rowContractItemsFormat = contractData.items
                                .map((item) => ({
                                    uuid: uuidv4(),
                                    ...item,
                                    requestedDeliveryDate: item.deliveryDate,
                                    taxCode: taxRecords.find(
                                        (x) => x.taxCode.toLowerCase()
                                        === item.taxCode?.toLowerCase()
                                    ),
                                    address: addresses.find(
                                        (x) => x.addressLabel === item.deliveryAddress
                                    ),
                                    itemQuantity: item.qty,
                                    itemModel: item.model,
                                    itemSize: item.size,
                                    itemBrand: item.brand,
                                    uomCode: item.uom,
                                    itemUnitPrice: item.unitPrice,
                                    currencyCode: item.currency,
                                    taxPercentage: item.taxCodeValue
                                }));
                            setRowContractItems(rowContractItemsFormat);
                            const newCatalogueItems = [...catalogueItems];
                            newCatalogueItems.forEach(
                                (item, index) => {
                                    for (let i = 0; i < contractData.items.length; i++) {
                                        if (item.catalogueItemCode === contractData
                                            .items[i].catalogueItemCode) {
                                            newCatalogueItems[index].isSelected = true;
                                        }
                                    }
                                }
                            );
                            setCatalogueItems(newCatalogueItems);

                            // // re-calculator for Contract Items
                            setRefreshSummaryItems(true);

                            // conversations
                            // const conversationsFromAPI = contractData.contractDocuments.filter(
                            //     (x) => x.attachment
                            // );
                            // const newRowExternalConversationData = [];
                            // const newRowInternalConversationData = [];
                            // for (let i = 0; i < conversationsFromAPI.length; i++) {
                            //     const docData = conversationsFromAPI[i];
                            //     const formatData = {
                            //         guid: docData.guid,
                            //         fileLabel: docData.fileName,
                            //         fileDescription: docData.description,
                            //         uploadedOn: convertToLocalTime(new Date(docData.uploadOn),
                            //             CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                            //         uploadedBy: docData.uploadBy,
                            //         uploaderUuid: docData.uploaderUuid,
                            //         externalDocument: docData.externalDocument,
                            //         uuid: uuidv4(),
                            //         isNew: false
                            //     };

                            //     if (docData.externalDocument) {
                            //         newRowExternalConversationData.push(formatData);
                            //     } else {
                            //         newRowInternalConversationData.push(formatData);
                            //     }
                            // }

                            setConversation((prevStates) => ({
                                ...prevStates,
                                rowDataExternalAttachment: contractData
                                    ?.contractDocuments
                                    ?.filter((item) => !item.mainDocument && item.externalDocument)
                                    ?.map((item) => ({
                                        ...item,
                                        fileLabel: item.title,
                                        fileDescription: item.description,
                                        attachment: item.fileName,
                                        isHaveFileName: !!item.fileName,
                                        uploadedOn: formatDateString(item.uploadOn, CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                        uploadedBy: item.uploadBy
                                    })) ?? [],
                                rowDataInternalAttachment: contractData
                                    ?.contractDocuments
                                    ?.filter((item) => !item.mainDocument && !item.externalDocument)
                                    ?.map((item) => ({
                                        ...item,
                                        fileLabel: item.title,
                                        fileDescription: item.description,
                                        attachment: item.fileName,
                                        isHaveFileName: !!item.fileName,
                                        uploadedOn: formatDateString(item.uploadOn, CUSTOM_CONSTANTS.DDMMYYYHHmmss),
                                        uploadedBy: item.uploadBy
                                    })) ?? []
                            }));

                            // // audit trail
                            const rowsAuditTrailFormat = contractData.auditTrails
                                .map((item) => ({
                                    ...item,
                                    userRole: item.role,
                                    dateTime: convertToLocalTime(
                                        item.createdDate, CUSTOM_CONSTANTS.DDMMYYYY
                                    )
                                }));
                            setRowDataAuditTrail(rowsAuditTrailFormat);
                        }
                    }, [contractData]);
                    return (
                        <Form>
                            <Row className="mb-4">
                                <Col
                                    md={12}
                                    lg={12}
                                >

                                    <Row>
                                        <Col
                                            md={6}
                                            lg={6}
                                        >
                                            <HeaderMain
                                                title={t("Contract Form")}
                                                className="mb-4"
                                            />
                                        </Col>
                                        <Col md={6} lg={6} className="text-right">
                                            {[CONTRACT_REQUEST_LIST_STATUS.PENDING_ISSUE_CONTRACT].includes(contractStatus)
                                                && (
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
                                                        onClick={() => contractPreviewModalRef?.current?.toggle()}
                                                    >
                                                        {t("Preview Contract")}
                                                    </Button>
                                                )}
                                            {[
                                                CONTRACT_REQUEST_LIST_STATUS.PENDING_ACKNOWLEDGEMENT,
                                                CONTRACT_REQUEST_LIST_STATUS.COMPLETED,
                                                CONTRACT_REQUEST_LIST_STATUS.TERMINATED
                                            ].includes(contractStatus)
                                                && (
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
                                                        onClick={() => {}}
                                                    >
                                                        {t("View Contract")}
                                                    </Button>
                                                )}
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <GeneralInformation
                                t={t}
                                disabled={!values.isEdit}
                                values={values}
                                touched={touched}
                                errors={errors}
                                setFieldValue={setFieldValue}
                                handleChange={handleChange}
                                onChangeEsign={onChangeEsign}
                                contractStatus={contractStatus}
                                currencies={currencies}
                                renewalOptions={contractFormState.renewalOptions}
                                contractingType={contractingType}
                                natureOfContract={contractFormState.natureOfContract}
                                addresses={addresses}
                                projects={projects}
                                onChangeProject={onChangeProject}
                                approvalRoutes={approvalRoutes}
                                onChangeApprovalRoute={onChangeApprovalRoute}
                                suppliers={suppliers}
                                companyUuid={contractFormState.companyUuid}
                                procurementTypes={procurementTypes}
                                permissionReducer={permissionReducer}
                                contractData={contractData}
                                // Allow user edit contractNo when documentPrefixConfiguration is manual is "Manual" and status is save as draft
                                // Or current contractNo is "Manual"
                                isManualDP={
                                    (isManualDocumentPrefix && contractStatus === CONTRACT_REQUEST_LIST_STATUS.SAVE_AS_DRAFT_CONTRACT)
                                    || contractData?.contractNumber === "Manual"
                                }
                            />
                            <ContractDocuments
                                title={t("Contract Document (s)")}
                                userDetails={userDetails}
                                rowDataAttachment={contractDocumentsAttachment}
                                setContractDocumentsAttachment={setContractDocumentsAttachment}
                                defaultExpanded
                                disabled={false}
                            />
                            {
                                values.natureOfContract !== "" && values.project !== "" && permissionReducer?.isBuyer
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
                                                />
                                            </Col>
                                        </Row>
                                    </>
                                )
                            }
                            <ContractItems
                                t={t}
                                values={values}
                                addresses={addresses}
                                uoms={uoms}
                                taxRecords={taxRecords}
                                // glAccounts={glAccounts}
                                currencies={currencies}
                                catalogueItems={catalogueItems}
                                setCatalogueItems={setCatalogueItems}
                                rowContractItems={rowContractItems}
                                setRowContractItems={setRowContractItems}
                                setSubTotal={setSubTotal}
                                refreshSummaryItems={refreshSummaryItems}
                                // onChangeSubTotal={onChangeSubTotal}
                                modeView={contractFormState.modeView}
                                setDirty={setDirty}
                                summary={summary}
                                forceCalculator
                            />
                            {/* eSign Document */}
                            {isESign
                                ? (
                                    <>
                                        <HeaderSecondary
                                            title={t("eSign Documents")}
                                            className="mb-2"
                                        />
                                        <ESignDocuments
                                            title={t("eSign Documents")}
                                            defaultExpanded
                                            disabled={false}
                                        />
                                    </>
                                ) : <></>}

                            {/* Conversations */}
                            <ContractingConversion
                                t={t}
                                conversation={conversation}
                                userDetails={userDetails}
                                setConversation={setConversation}
                                showToast={showToast}
                                disabled={!values.isEdit}
                                setDirty={setDirty}
                                enableAddComment={
                                    contractStatus === CONTRACT_REQUEST_LIST_STATUS.PENDING_APPROVAL_CONTRACT
                                    && contractData?.approverRole
                                }
                            />
                            {/* Audit Trail */}
                            <HeaderSecondary
                                title={t("AuditTrail")}
                                className="mb-2"
                            />
                            <Row className="mb-5">
                                <Col xs={12}>
                                    <AuditTrail
                                        rowData={rowDataAuditTrail}
                                        onGridReady={(params) => {
                                            params.api.sizeColumnsToFit();
                                        }}
                                        paginationPageSize={10}
                                        gridHeight={350}
                                        fullSize
                                        defaultExpanded
                                    />
                                </Col>
                            </Row>

                            {/* Recall */}
                            <CommonConfirmDialog
                                footerEnd
                                reverse
                                isShow={displayRecallReasonDialog}
                                onHide={() => setDisplayRecallReasonDialog(false)}
                                title={t("Recall Confirmation")}
                                content="Are you sure you want to recall this contract?"
                                positiveProps={
                                    {
                                        onPositiveAction:
                                            () => setDisplayRecallReasonDialog(false),
                                        contentPositive: t("Close"),
                                        colorPositive: "secondary"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => {
                                            recallContract();
                                        },
                                        contentNegative: t("Recall"),
                                        colorNegative: "warning"
                                    }
                                }
                                size="xs"
                                titleCenter
                                titleRequired
                            />

                            {/* Terminate */}
                            <CommonConfirmDialog
                                footerEnd
                                reverse
                                isShow={displayTerminateReasonDialog}
                                onHide={() => setDisplayTerminateReasonDialog(false)}
                                title={t("Terminate Confirmation")}
                                content="Are you sure you want to terminate this contract?"
                                positiveProps={
                                    {
                                        onPositiveAction:
                                            () => setDisplayTerminateReasonDialog(false),
                                        contentPositive: t("Close"),
                                        colorPositive: "secondary"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => {
                                            terminateContract();
                                        },
                                        contentNegative: t("Terminate"),
                                        colorNegative: "danger"
                                    }
                                }
                                size="xs"
                                titleCenter
                                titleRequired
                            />

                            {/* SendBack */}
                            <CommonConfirmDialog
                                footerEnd
                                reverse
                                isShow={displaySendBackReasonDialog}
                                onHide={() => setDisplaySendBackReasonDialog(false)}
                                title={t("Reason")}
                                positiveProps={
                                    {
                                        onPositiveAction:
                                            () => setDisplaySendBackReasonDialog(false),
                                        contentPositive: t("Close"),
                                        colorPositive: "secondary"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => {
                                            sendBackContract(sendBackObj.reasonSendBack);
                                        },
                                        contentNegative: t("SendBack"),
                                        colorNegative: "warning"
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
                                            "is-invalid": sendBackObj.showErrorReasonSendBack && !sendBackObj.reasonSendBack
                                        })
                                    }
                                    placeholder={t("Please enter reason...")}
                                    value={sendBackObj.reasonSendBack}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setSendBackObj((prevStates) => ({
                                            ...prevStates,
                                            reasonSendBack: value
                                        }));
                                    }}
                                />
                                {
                                    sendBackObj.showErrorReasonSendBack
                                    && !sendBackObj.reasonSendBack
                                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                                }
                            </CommonConfirmDialog>

                            {/* Reject */}
                            <CommonConfirmDialog
                                footerEnd
                                reverse
                                isShow={displayRejectReasonDialog}
                                onHide={() => setDisplayRejectReasonDialog(false)}
                                title={t("Reason")}
                                positiveProps={
                                    {
                                        onPositiveAction: () => setDisplayRejectReasonDialog(false),
                                        contentPositive: t("Close"),
                                        colorPositive: "secondary"
                                    }
                                }
                                negativeProps={
                                    {
                                        onNegativeAction: () => {
                                            rejectContract(rejectObj.reasonReject);
                                        },
                                        contentNegative: t("Reject"),
                                        colorNegative: "danger"
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
                                            "is-invalid": rejectObj.showErrorReasonReject && !rejectObj.reasonReject
                                        })
                                    }
                                    placeholder={t("Please enter reason..")}
                                    value={rejectObj.reasonReject}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setRejectObj((prevStates) => ({
                                            ...prevStates,
                                            reasonReject: value
                                        }));
                                    }}
                                />
                                {
                                    rejectObj.showErrorReasonReject
                                    && !rejectObj.reasonReject
                                    && (<div className="invalid-feedback">{t("PleaseEnterValidReason")}</div>)
                                }
                            </CommonConfirmDialog>
                            <ContractPreviewModal
                                ref={contractPreviewModalRef}
                                data={contractData}
                            />
                            {/* Action Buttons */}
                            {loadButton && (
                                <StickyFooterSubmit
                                    t={t}
                                    errors={errors}
                                    history={history}
                                    dirty={dirty}
                                    values={values}
                                    onSaveAsDraftPressHandler={() => onCreatePressHandler(values,
                                        true)}
                                    onCreatePressHandler={() => onCreatePressHandler(values, false)}
                                    showToast={showToast}
                                    setDisplayRejectReasonDialog={setDisplayRejectReasonDialog}
                                    setDisplaySendBackReasonDialog={setDisplaySendBackReasonDialog}
                                    setDisplayRecallReasonDialog={setDisplayRecallReasonDialog}
                                    setDisplayTerminateReasonDialog={
                                        setDisplayTerminateReasonDialog
                                    }
                                    handleSubmit={handleSubmit}
                                    contractStatus={contractStatus}
                                    approveContract={approveContract}
                                    issueContract={issueContract}
                                    acknowledgementContract={acknowledgementContract}
                                    terminateContract={terminateContract}
                                    contractData={contractData}
                                    isBuyer={permissionReducer?.isBuyer}
                                    isESign={isESign}
                                />
                            )}
                        </Form>
                    );
                }}
            </Formik>
            {Prompt}
        </Container>
    );
}

export default ContractFormRequest;
