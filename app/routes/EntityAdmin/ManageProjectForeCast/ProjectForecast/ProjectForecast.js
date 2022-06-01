/* eslint-disable max-len */
import React, {
    useState, useRef, useEffect, useMemo
} from "react";
import {
    Container, Button, Row,
    Col, Input, Label
} from "components";
import { HeaderMain } from "routes/components/HeaderMain";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import StickyFooter from "components/StickyFooter";
import ProjectForecastService from "services/ProjectForecastService";
import CatalogueService from "services/CatalogueService";
import ManageProjectTradeService from "services/ManageProjectTradeService";
import useToast from "routes/hooks/useToast";
import { AddItemDialog, CommonConfirmDialog } from "routes/components";
import IconButton from "@material-ui/core/IconButton";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import { makeStyles } from "@material-ui/core/styles";
import {
    clearNumber,
    convertToLocalTime,
    defaultColDef,
    isNullOrUndefinedOrEmpty
} from "helper/utilities";
import CSVTemplates from "helper/commonConfig/CSVTemplates";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CategoryService from "services/CategoryService/CategoryService";
import { useSelector } from "react-redux";
import CurrenciesService from "services/CurrenciesService";
import UOMService from "services/UOMService";
import _ from "lodash";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import CSVHelper from "helper/CSVHelper";
import UserService from "services/UserService";
import AgDropdownSelection from "components/AgDropdownSelection";
import PriceValueSummaryRenderer from "../components/PriceValueSummaryRenderer";
import SummaryButtonToolbar from "../components/SummaryButtonToolbar";
import ProjectDetailsInformationCard from "../components/ProjectDetailsInformationCard";
import ProjectForecastTable from "../components/ProjectForecastTable";
import PriceValueForecastDetailRenderer from "../components/PriceValueForecastDetailRenderer";
import EditCell from "./EditCell";

const useStyles = makeStyles({
    icon: {
        color: "#AEC57D",
        padding: 0,
        marginLeft: 8,
        marginRight: 8
    }
});

const ProjectForecast = () => {
    const { t } = useTranslation();
    const showToast = useToast();
    const uploadTradeRef = useRef(null);
    const history = useHistory();
    const location = useLocation();
    const classes = useStyles();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const [forecastStates, setForecastStates] = useState({
        isLoading: false,
        projectTrades: null,
        catalogueItems: null,
        gridApiBreakdown: null,
        projectDetail: null,
        projectSummary: null,
        projectForecastTradeDetail: null,
        projectForecastAuditTrail: null,
        auditTrailComment: "",
        responseForecastProject: null,
        listCategory: []
    });
    const query = new URLSearchParams(location.search);
    const projectCode = query.get("projectCode");
    const [listTradeAdded, setListTradeAdded] = useState([]);
    const [isAddTrade, setIsAddTrade] = useState(false);
    const [isAddItem, setIsAddItem] = useState(false);
    const [addItemManual, setAddItemManual] = useState("");
    const [cellValueChange, setCellValueChange] = useState("");
    const [itemDelete, setItemDelete] = useState("");
    const [addedNewItemsExistingTrade] = useState([]);
    const [deletedItemsList, setDeletedItemsList] = useState([]);
    const [isShowDialogClose, setIsShowDialogClose] = useState(false);
    const [projectStatus, setProjectStatus] = useState();
    const message = t("SomethingWentWrong");

    const [dialogProps, setDialogProps] = useState({
        dialogVisibility: false,
        isTrade: false,
        onHide: () => { },
        title: "",
        positiveProps: {
            onPositiveAction: () => { },
            contentPositive: "abc",
            colorPositive: "warning"
        },
        negativeProps: {
            onNegativeAction: () => { }
        },
        columnDefs: [],
        rowData: [],
        isAddManually: false,
        isShowProjectTrades: false,
        isShowCatalogueItems: false,
        gridApi: null,
        catalogueItemCode: ""
    });

    const calcProjectSummary = (projectForecastDetails) => {
        const projectSummary = {
            code: projectForecastDetails?.projectCode,
            name: projectForecastDetails?.projectTitle,
            totalBudgeted: projectForecastDetails?.overallBudget,
            totalForecasted: projectForecastDetails?.totalForecasted,
            totalSpend: projectForecastDetails.totalSpend,
            totalContracted: projectForecastDetails.totalContracted,
            totalContractedSpend: projectForecastDetails.totalContractedSpend,
            pendingApproveInvoicesContract: projectForecastDetails.contractPendingApprovalInvoices,
            approveInvoicesContract: projectForecastDetails.contractApprovalInvoices,
            pendingBillingContract: projectForecastDetails.contractPendingBilling,
            contractedSpendBalance: projectForecastDetails.contractSpendBalance,
            totalNonContractedSpend: projectForecastDetails.totalNonContractedSpend,
            pendingApproveInvoicesNonContract: projectForecastDetails.nonContractPendingApprovalInvoices,
            approveInvoicesNonContract: projectForecastDetails.nonContractApprovalInvoices,
            pendingBillingNonContract: projectForecastDetails.nonContractPendingBilling,
            currency: projectForecastDetails.currency
        };

        return [projectSummary];
    };

    const handleOnError = (err) => {
        showToast("error", err?.response?.data?.message || err?.message || message);
    };

    const initData = async () => {
        try {
            const currentCompanyUUID = permissionReducer.currentCompany.companyUuid;
            const responseProjectTrades = await ManageProjectTradeService.getListProjectTrade({
                companyUuid: currentCompanyUUID
            });
            const catalogueList = [];
            const responseForecastDetail = await ProjectForecastService.getProjectForecastDetail(
                currentCompanyUUID,
                projectCode
            );
            const projectList = await ProjectForecastService.getProjects(
                currentCompanyUUID
            );

            projectList.data.data.forEach((item) => {
                if (item.projectCode === projectCode) {
                    setProjectStatus(item.projectStatus);
                }
            });

            const listCategoryResponse = await CategoryService
                .getListCategory(currentCompanyUUID);

            const listCategory = listCategoryResponse.data.data.filter(
                (address) => address.active === true
            );

            const sortedCategory = _.sortBy(listCategory, "categoryName");

            const responseCurrencies = await CurrenciesService.getCurrencies(
                currentCompanyUUID
            );

            const currencies = responseCurrencies.data.data.filter(
                (currency) => currency.active === true
            );
            const sortedCurrency = _.sortBy(currencies, "currencyName");

            const responseUOMs = await UOMService.getUOMRecords(
                currentCompanyUUID
            );
            const uomList = responseUOMs.data.data;
            const { projectForecastTradeDetailsDtoList, projectForecastAuditTrailDtoList } = responseForecastDetail.data.data;
            const projectForecastTradeDetail = [];
            const projectForecastAuditTrail = [];
            projectForecastTradeDetailsDtoList.forEach((trade, index) => {
                projectForecastTradeDetail.push({
                    path: [`${index + 1}`],
                    code: trade.tradeCode || "",
                    name: trade.tradeTitle || "",
                    description: trade.tradeDescription || "",
                    totalForecastedInSourceCurrency: trade.totalForecastedSource || ""
                });
                const { projectForecastItemList } = trade;
                projectForecastItemList.forEach((item, idx) => {
                    projectForecastTradeDetail.push({
                        tradeCode: trade.tradeCode,
                        path: [`${index + 1}`, `${idx + 1}`],
                        code: item.itemCode || "",
                        name: item.itemName || "",
                        description: item.itemDescription || "",
                        itemModel: item.itemModel || "",
                        itemSize: item.itemSize || "",
                        itemBrand: item.itemBrand || "",
                        uom: item.uom || "",
                        itemCategory: item.categoryName,
                        sourceCurrency: item.sourceCurrency || "",
                        itemUnitPrice: item.itemUnitPrice || 0,
                        itemQuantity: item.itemQuantity || 0,
                        totalForecastedInSourceCurrency: item.totalForecastedSource ? item.totalForecastedSource : item.itemUnitPrice * item.itemQuantity,
                        exchangeRate: item.exchangeRate || 1,
                        totalForecastedInDocumentCurrency: item.itemUnitPrice * item.itemQuantity * item.exchangeRate,
                        totalSpend: item.totalContractedSpend + item.totalNonContractedSpend,
                        totalContracted: item.totalContracted || 0,
                        totalContractedSpend: item.totalContractedSpend || 0,
                        contractPendingApprovalInvoices: item.contractPendingApprovalInvoices || 0,
                        contractApprovalInvoices: item.contractApprovalInvoices || 0,
                        contractPendingBilling: item.contractPendingBilling || 0,
                        contractedSpendBalance: item.totalContracted - item.totalContractedSpend,
                        totalNonContractedSpend: item.totalNonContractedSpend || 0,
                        nonContractPendingApprovalInvoices: item.nonContractPendingApprovalInvoices || 0,
                        nonContractApprovalInvoices: item.nonContractApprovalInvoices || 0,
                        nonContractPendingBilling: item.nonContractPendingBilling || 0,
                        manual: false
                    });
                });
            });

            projectForecastAuditTrailDtoList.forEach((trail) => {
                projectForecastAuditTrail.push({
                    user: trail.name || "",
                    role: trail.designation?.toUpperCase(),
                    action: trail.action || "",
                    date: trail.dateTime || "",
                    comment: trail.comment || ""
                });
            });

            const projectDetails = (await ProjectForecastService.getProjectDetail(currentCompanyUUID, projectCode))?.data?.data;

            const projectSummary = calcProjectSummary(responseForecastDetail.data.data);
            setForecastStates((prevStates) => ({
                ...prevStates,
                projectDetail: projectDetails,
                catalogueItems: catalogueList,
                projectTrades: responseProjectTrades.data.data,
                projectSummary,
                projectForecastTradeDetail,
                projectForecastAuditTrail,
                listCategory: sortedCategory,
                uomList,
                currencies: sortedCurrency,
                responseForecastProject: projectForecastTradeDetail
            }));
        } catch (error) {
            handleOnError(error);
        }
    };

    const hideDialogClose = () => {
        setIsShowDialogClose(false);
    };

    const openDialogClose = () => {
        setIsShowDialogClose(true);
    };

    const onCloseProject = async () => {
        const currentCompanyUUID = permissionReducer.currentCompany.companyUuid;
        try {
            const response = await ProjectForecastService.closeProjectForecast(currentCompanyUUID, projectCode);
            if (response.data.status === RESPONSE_STATUS.OK) {
                showToast("success", response.data.message);
                hideDialogClose();
                initData();
            } else {
                showToast("error", response.data.message);
            }
        } catch (err) {
            handleOnError(err);
        }
    };

    const onSavePressHandler = async () => {
        try {
            const projectForecastTradeDetail = [...forecastStates.projectForecastTradeDetail];
            const currentCompanyUUID = permissionReducer.currentCompany.companyUuid;
            const listNewTrade = [];
            const listNewlyAddedTrade = [];
            projectForecastTradeDetail.forEach((trade) => {
                if (trade.newTrade) {
                    listNewTrade.push(trade);
                }
            });
            listNewTrade.forEach((trade) => {
                const newAddedTrade = {};
                newAddedTrade.tradeCode = trade.code;
                newAddedTrade.tradeTitle = trade.name;
                newAddedTrade.tradeDescription = trade.description;
                newAddedTrade.projectForecastItemList = [];
                newAddedTrade.totalForecastedSource = trade.totalForecastedInSourceCurrency;
                listNewlyAddedTrade.push(newAddedTrade);
            });

            const updatedItemsExistingTrade = [];
            const updatedTradeDetails = [];
            projectForecastTradeDetail.forEach((item) => {
                if (item.isUpdate === true) {
                    if (item.path.length === 2) {
                        updatedItemsExistingTrade.push({
                            tradeCode: item.tradeCode,
                            itemCode: item.code,
                            itemName: item.name,
                            itemSize: item.itemSize,
                            itemModel: item.itemModel,
                            itemBrand: item.itemBrand,
                            itemDescription: item.description,
                            uom: item.uom,
                            sourceCurrency: item.sourceCurrency,
                            itemUnitPrice: item.itemUnitPrice,
                            itemQuantity: item.itemQuantity,
                            exchangeRate: Number(item.exchangeRate),
                            manualItem: item.manual || false,
                            isManual: !!item.isManual
                        });
                    } else {
                        updatedTradeDetails.push({
                            tradeCode: item.code,
                            name: item.name,
                            description: item.description,
                            totalForecastedSource: item.totalForecastedInSourceCurrency,
                            exchangeRate: item.exchangeRate,
                            totalForecastedDocument: item.totalForecastedDocument
                        });
                    }
                }
            });

            const newAddedItem = [...addedNewItemsExistingTrade];
            projectForecastTradeDetail.forEach((item) => {
                const uom = item.uom && typeof (item.uom) === "object"
                    ? item.uom?.uomCode : item?.uom;
                const sourceCurrency = item.sourceCurrency && typeof (item.sourceCurrency) === "object"
                    ? item.sourceCurrency.currencyCode : item.sourceCurrency;
                if (item.isNew === true && item.tradeCode) {
                    newAddedItem.push({
                        tradeCode: item.tradeCode,
                        itemCode: item.code,
                        itemName: item.name,
                        itemSize: item.itemSize,
                        itemModel: item.itemModel,
                        itemBrand: item.itemBrand,
                        itemDescription: item.description,
                        uom: uom ?? "",
                        sourceCurrency: sourceCurrency ?? "",
                        itemUnitPrice: item.itemUnitPrice,
                        itemQuantity: item.itemQuantity,
                        exchangeRate: Number(item.exchangeRate),
                        manualItem: item.manual || false,
                        isManual: !!item.isManual,
                        itemCategory: typeof item?.itemCategory === "object" ? item?.itemCategory.categoryName || forecastStates.listCategory[0].categoryName : item?.itemCategory,
                        categoryName: typeof item?.itemCategory === "object" ? item?.itemCategory.categoryName || forecastStates.listCategory[0].categoryName : item?.itemCategory,
                        categoryUuid: item?.itemCategory.uuid || forecastStates.listCategory[0].uuid
                    });
                }
            });

            const body = {
                projectCode,
                companyUuid: currentCompanyUUID,
                saveAsDraft: false,
                auditTrailComment: "",
                newlyAddedTrade: listNewlyAddedTrade,
                addedNewItemsExistingTrade: newAddedItem,
                updatedTradeDetails,
                updatedItemsExistingTrade,
                deletedTradesList: [],
                deletedItemsList
            };

            const response = await ProjectForecastService.saveProjectForecast(currentCompanyUUID, body);

            if (response.data.status === RESPONSE_STATUS.OK) {
                newAddedItem.forEach(async (item) => {
                    if (item.isManual) {
                        const bodyCategory = {
                            catalogueItemName: item.itemName,
                            catalogueItemCode: item.itemCode,
                            companyUuid: currentCompanyUUID,
                            uomCode: item.uom,
                            description: item.itemDescription,
                            unitPrice: Number(clearNumber(item.itemUnitPrice)),
                            isManual: true,
                            currencyCode: item.sourceCurrency,
                            itemSize: item.itemSize,
                            itemModel: item.itemModel,
                            itemBrand: item.itemBrand,
                            tradeCode: item.tradeCode,
                            itemCategory: item.itemCategory,
                            categoryDto: forecastStates.listCategory
                                .filter((cat) => cat.categoryName === item.itemCategory)[0]
                        };
                        await CatalogueService.postCreateCatalogue(bodyCategory);
                    }
                });
                setDeletedItemsList([]);
                showToast("success", response.data.message);
                initData();
            } else {
                setDeletedItemsList([]);
                showToast("error", response.data.message);
            }
        } catch (error) {
            setDeletedItemsList([]);
            handleOnError(error);
        }
    };

    const autoGroupColumnDef = {
        headerName: t("Action"),
        cellRendererParams: {
            suppressCount: true,
            innerRenderer: "actionButton"
        }
        // cellRendererFramework: ActionButton
    };
    const getDataPath = (data) => data.path;

    const onDownloadPressHandler = () => {
        forecastStates.gridApiBreakdown.exportDataAsCsv(
            {
                fileName: CSVTemplates.ManageProjectForecast_Filename
            }
        );
    };

    const handleOpenDialog = (e) => {
        if (uploadTradeRef?.current) {
            uploadTradeRef?.current.open(e);
        }
    };

    const handleOnDrop = (list = []) => {
        const listItemAdded = [];
        const projectForecastTradeDetail = [...forecastStates.projectForecastTradeDetail];
        try {
            for (let i = 0; i < list.length; i++) {
                if (list[i].data[0] !== "" && !list[i].data[0].includes("Item Code")) {
                    const validationResult = CSVHelper.validateCSV(list, ["Trade Code"]);
                    if (validationResult.missingField) {
                        throw new Error("Please assign trade codes to project");
                    } else if (!validationResult.validate) {
                        throw new Error(CSVTemplates.NeededFields_Error);
                    }
                    const { data } = list[i];
                    const selectedCategory = forecastStates.listCategory.find((cat) => cat.categoryName === data[12]);
                    if (isNullOrUndefinedOrEmpty(selectedCategory)) {
                        throw new Error(`Row ${i + 1}: Please select invalid Category`);
                    }
                    listItemAdded.push({
                        code: data[0],
                        name: data[1],
                        description: data[2],
                        itemModel: data[3],
                        itemSize: data[4],
                        itemBrand: data[5],
                        uom: data[6],
                        sourceCurrency: data[7],
                        itemUnitPrice: data[8],
                        itemQuantity: data[9],
                        exchangeRate: data[10],
                        trade: data[11],
                        itemCategory: selectedCategory,
                        manualItem: false,
                        isManual: false
                    });
                }
            }

            listItemAdded.forEach((item) => {
                const newList = projectForecastTradeDetail.filter((value) => item.trade === value.code);
                if (newList.length === 0) {
                    throw new Error("Please select all trade codes as defined in import sheet");
                }
            });
            const filteredTradeCode = listItemAdded.filter((item) => projectForecastTradeDetail.filter((value) => item.trade === value.code).length === 1);
            if (filteredTradeCode.length === 0) {
                throw new Error("Please select all trade codes as defined in import sheet");
            }
        } catch (error) {
            handleOnError(error);
            return;
        }
        const filteredArray = listItemAdded.filter((item) => projectForecastTradeDetail.filter((value) => item.code === value.code).length === 0);
        if (filteredArray.length === 0) {
            showToast("error", "Trade items already exists or invalid, please upload another item");
        }
        filteredArray.forEach((item, index) => {
            const trade = projectForecastTradeDetail.find((x) => x.code === item.trade);
            const idx = trade.path[0];
            const numTradeItem = projectForecastTradeDetail.filter((x) => x.path.length === 2 && x.path[0] === idx).length;
            projectForecastTradeDetail.push({
                tradeCode: item.trade,
                path: [`${idx}`, `${numTradeItem + index + 1}`],
                ...item,
                isNew: true,
                manual: true,
                isManual: true,
                itemQuantity: Number(item.itemQuantity),
                itemUnitPrice: Number(item.itemUnitPrice),
                totalForecastedInSourceCurrency: Number(item.itemUnitPrice) * Number(item.itemQuantity),
                totalForecastedInDocumentCurrency: Number(item.exchangeRate) * Number(item.itemUnitPrice) * Number(item.itemQuantity)
            });
        });
        setForecastStates((prevStates) => ({
            ...prevStates,
            projectForecastTradeDetail
        }));
    };

    const handleHideDialog = () => setDialogProps((prevStates) => ({
        ...prevStates,
        dialogVisibility: false,
        isShowCatalogueItems: false,
        isShowProjectTrades: false,
        gridApi: null
    }));

    const handleAddTrade = () => {
        setIsAddTrade(true);

        handleHideDialog();
    };

    const handleAddItem = () => {
        setIsAddItem(true);

        handleHideDialog();
    };

    useEffect(() => {
        if (isAddTrade === true) {
            const projectForecastTradeDetail = [...forecastStates.projectForecastTradeDetail];
            const listTrade = projectForecastTradeDetail.filter((x) => x.path.length === 1);
            const filteredArray = listTradeAdded.filter((item) => forecastStates.projectForecastTradeDetail.filter((value) => item.code === value.code).length === 0);
            if (filteredArray.length === 0) {
                showToast("error", "Trade already exists, please choose another Trade");
            }
            filteredArray.forEach((trade, index) => {
                projectForecastTradeDetail.push({
                    isNew: true,
                    totalForecastedInSourceCurrency: 0,
                    path: [`${listTrade.length + 1 + index}`],
                    ...trade
                });
            });

            setForecastStates((prevStates) => ({
                ...prevStates,
                projectForecastTradeDetail
            }));

            setListTradeAdded([]);
            setIsAddTrade(false);
        }
    }, [isAddTrade]);

    useEffect(() => {
        if (isAddItem === true) {
            const projectForecastTradeDetail = [...forecastStates.projectForecastTradeDetail];
            const trade = projectForecastTradeDetail.find((x) => x.code === dialogProps.catalogueItemCode);
            const idx = trade.path[0];
            const numTradeItem = projectForecastTradeDetail.filter((x) => x.path.length === 2 && x.path[0] === idx).length;
            const filteredArray = listTradeAdded.filter((item) => forecastStates.projectForecastTradeDetail.filter((value) => item.code === value.code).length === 0);
            if (filteredArray.length === 0) {
                showToast("error", "Trade items already exists, please choose another item");
            }
            filteredArray.forEach((item, index) => {
                projectForecastTradeDetail.push({
                    tradeCode: trade.code,
                    path: [`${idx}`, `${numTradeItem + index + 1}`],
                    ...item,
                    itemCategory: {
                        categoryName: item.itemCategory
                    },
                    isNew: true
                });
            });
            setForecastStates((prevStates) => ({
                ...prevStates,
                projectForecastTradeDetail
            }));
            setIsAddItem(false);
        }
    }, [isAddItem]);

    useEffect(() => {
        if (itemDelete) {
            const listDeletedItems = [...deletedItemsList];
            let projectForecastTradeDetail = [...forecastStates.projectForecastTradeDetail];
            const trade = projectForecastTradeDetail.find((x) => x.path.length === 1 && x.path[0] === itemDelete[0]);
            const item = projectForecastTradeDetail.find((x) => x.path[0] === itemDelete[0] && x.path[1] === itemDelete[1]);
            projectForecastTradeDetail = projectForecastTradeDetail.filter((x) => x?.code !== item?.code);
            if (itemDelete.length === 1) {
                projectForecastTradeDetail = projectForecastTradeDetail.filter((x) => x?.tradeCode !== item?.code);
            }
            if (trade && item) {
                if (!item.isNew) {
                    listDeletedItems.push({
                        tradeCode: trade.code,
                        itemCode: item.code,
                        itemName: item.name
                    });
                }
            }

            setDeletedItemsList(listDeletedItems);

            setForecastStates((prevStates) => ({
                ...prevStates,
                projectForecastTradeDetail
            }));
        }
    }, [itemDelete]);

    useEffect(() => {
        if (addItemManual) {
            const projectForecastTradeDetail = [...forecastStates.projectForecastTradeDetail];
            const trade = projectForecastTradeDetail.filter((x) => x.path.length === 1 && x.path[0] === addItemManual.path[0])[0];
            const numTradeItem = projectForecastTradeDetail.filter((x) => x.path.length === 2 && x.path[0] === addItemManual.path[0]).length;
            projectForecastTradeDetail.push({
                tradeCode: trade.code,
                path: [`${addItemManual.path[0]}`, `${numTradeItem + 1}`],
                code: "",
                name: "",
                description: "",
                itemModel: "",
                itemSize: "",
                itemBrand: "",
                uom: "",
                sourceCurrency: "",
                itemUnitPrice: 0,
                itemQuantity: 0,
                totalForecastedInSourceCurrency: 0,
                exchangeRate: 1,
                totalForecastedInDocumentCurrency: 0,
                manual: true,
                isNew: true,
                isManual: true,
                itemCategory: forecastStates.listCategory[0].categoryName
            });

            setForecastStates((prevStates) => ({
                ...prevStates,
                projectForecastTradeDetail
            }));
        }
    }, [addItemManual]);

    useEffect(() => {
        if (cellValueChange) {
            const { data } = cellValueChange;
            const projectForecastTradeDetail = [...forecastStates.projectForecastTradeDetail];
            projectForecastTradeDetail.forEach((item, index) => {
                if (item.path[0] === data.path[0] && item.path[1] === data.path[1]) {
                    if (data.path.length === 2) {
                        data.itemQuantity = Number(data.itemQuantity);
                        data.itemUnitPrice = Number(data.itemUnitPrice);
                        data.totalForecastedInSourceCurrency = Number(data.itemUnitPrice) * Number(data.itemQuantity);
                        data.totalForecastedInDocumentCurrency = Number(data.exchangeRate) * Number(data.itemUnitPrice) * Number(data.itemQuantity);
                        const arr = projectForecastTradeDetail.filter((value) => value.code === data.tradeCode);
                        const arr2 = projectForecastTradeDetail.filter((value) => value.tradeCode === data.tradeCode);
                        let sum = 0;
                        for (let i = 0; i < arr2.length; i++) {
                            sum += arr2[i]?.totalForecastedInSourceCurrency;
                        }
                        projectForecastTradeDetail.forEach((value, idx) => {
                            if (value.code === arr[0].code) {
                                projectForecastTradeDetail[idx].totalForecastedInSourceCurrency = sum;
                                projectForecastTradeDetail[idx].isUpdate = true;
                            }
                        });
                    } else {
                        let arr = [];
                        if (cellValueChange.value === data.code) {
                            arr = projectForecastTradeDetail.filter((value) => value.tradeCode === cellValueChange.oldValue);
                            arr.forEach((value, idx) => {
                                arr[idx].tradeCode = data.code;
                            });
                        } else {
                            arr = projectForecastTradeDetail.filter((value) => value.tradeCode === cellValueChange.value);
                            arr.forEach((value, idx) => {
                                arr[idx].tradeCode = data.code;
                            });
                        }
                        let sum = 0;
                        for (let i = 0; i < arr.length; i++) {
                            sum += arr[i].totalForecastedInSourceCurrency;
                        }
                        projectForecastTradeDetail.map((obj) => arr.find((o) => o.tradeCode === obj.tradeCode) || obj);
                        forecastStates.projectTrades.forEach((value) => {
                            if (value.tradeCode === data.code) {
                                data.description = value.description;
                                data.name = value.tradeTitle;
                                data.totalForecastedInSourceCurrency = Number(data.totalForecastedInSourceCurrency);
                                data.isUpdate = true;
                                // data.totalForecastedInSourceCurrency = arr.length === 0 ? Number(data.totalForecastedInSourceCurrency) : sum;
                                // data.totalForecastedInSourceCurrency = sum;
                            }
                        });
                    }
                    if (data.isNew) {
                        projectForecastTradeDetail[index] = { ...data };
                    } else {
                        projectForecastTradeDetail[index] = { ...data, isUpdate: true };
                    }
                }
            });
            // const changedData = [data];
            // cellValueChange.api.applyTransaction({ update: changedData });
            cellValueChange.api.setRowData(projectForecastTradeDetail);
            setForecastStates((prevStates) => ({
                ...prevStates,
                projectForecastTradeDetail
            }));
        }
    }, [cellValueChange]);

    const onSelectionChanged = (params) => {
        const selectedNodes = params.api.getSelectedNodes();
        const listAdded = [];
        if (dialogProps.isShowProjectTrades === true) {
            selectedNodes.forEach((node) => {
                listAdded.push({
                    code: node.data.tradeCode,
                    name: node.data.tradeTitle,
                    description: node.data.description,
                    newTrade: true
                });
            });
            const filteredArray = listAdded.filter((item) => forecastStates.projectForecastTradeDetail.filter((value) => item.code === value.code).length === 0);
            setListTradeAdded([...filteredArray]);
        } else {
            selectedNodes.forEach((node) => {
                listAdded.push({
                    code: node.data.catalogueItemCode || "",
                    name: node.data.catalogueItemName || "",
                    description: node.data.description || "",
                    itemModel: node.data.itemModel || "",
                    itemSize: node.data.itemSize || "",
                    itemBrand: node.data.itemBrand || "",
                    itemCategory: node.data.itemCategory || "",
                    uom: node.data.uomCode || "",
                    sourceCurrency: node.data.currencyCode || "",
                    itemUnitPrice: node.data.unitPrice || 0,
                    itemQuantity: 0,
                    totalForecastedInSourceCurrency: 0,
                    exchangeRate: forecastStates?.currencies?.find((c) => c.currencyCode === node.data.currencyCode)?.exchangeRate || 1,
                    totalForecastedInDocumentCurrency: 0
                });
            });

            setListTradeAdded([...listAdded]);
        }
    };

    const onAddTradePressHandler = () => {
        forecastStates.projectForecastTradeDetail.forEach((node) => {
            forecastStates.projectTrades.forEach(
                (item, index) => {
                    if (item.tradeCode === node.code) {
                        forecastStates.projectTrades[index].isSelected = true;
                    }
                }
            );
        });
        setDialogProps((prevStates) => ({
            ...prevStates,
            dialogVisibility: true,
            isTrade: true,
            title: `${t("ProjectTrade")}`,
            positiveProps: {
                colorPositive: "primary",
                onPositiveAction: handleAddTrade,
                contentPositive: `${t("Add")}`
            },
            negativeProps: {
                onNegativeAction: handleHideDialog
            },
            columnDefs: ProjectForecastService.getProjectTradesColDefs(t),
            rowData: forecastStates?.projectTrades?.filter((item) => item.active),
            isShowProjectTrades: true
        }));
    };

    const onAddItemPress = (catalogueItems, catalogueItemCode, projectForecastTradeDetail) => {
        const catItem = catalogueItems;
        projectForecastTradeDetail.forEach((node) => {
            catItem.forEach(
                (item, index) => {
                    if (item.catalogueItemCode === node.code) {
                        catItem[index].isSelected = true;
                    }
                }
            );
        });
        setDialogProps((prevStates) => ({
            ...prevStates,
            dialogVisibility: true,
            title: `${t("CatalogueItems")}`,
            isTrade: false,
            positiveProps: {
                colorPositive: "primary",
                onPositiveAction: handleAddItem,
                contentPositive: `${t("Add")}`
            },
            negativeProps: {
                onNegativeAction: handleHideDialog
            },
            columnDefs: ProjectForecastService.getCatalogueItemsColDefs(t),
            // 2021/11/23: Update condition according to ticket: https://doxa-connex.atlassian.net/browse/DC20-1231?focusedCommentId=11671
            rowData: catItem?.filter((cat) => cat.active && !cat.supplierName && !cat.isManual),
            isShowCatalogueItems: true,
            catalogueItemCode
        }));
    };

    const onAddItemManuallyPress = (path) => {
        setAddItemManual({ path });
    };

    const onRemoveItemPress = (path) => {
        setItemDelete(path);
    };

    const ActionButton = (props) => {
        const { data, context } = props;
        if (data?.path.length === 1) {
            return (
                <>
                    <IconButton className={classes.icon} onClick={() => onAddItemManuallyPress(data.path)} size="small" color="primary">
                        <i className="fa fa-plus-circle" color="primary" />
                    </IconButton>
                    <IconButton className={classes.icon} onClick={() => onAddItemPress(context.forecastStates.catalogueItems, data.code, context.forecastStates.projectForecastTradeDetail)} size="small" color="primary">
                        <i className="fa fa-book" color="primary" />
                    </IconButton>
                    {data.isNew === true
                        && (
                            <IconButton className={classes.icon} onClick={() => onRemoveItemPress(data.path)} size="small" color="secondary">
                                <i className="fa fa-fw fa-trash" color="secondary" style={{ color: "red" }} />
                            </IconButton>
                        )}
                </>
            );
        }
        return (
            <IconButton className={classes.icon} onClick={() => onRemoveItemPress(data.path)} size="small" color="secondary">
                <i className="fa fa-fw fa-trash" color="secondary" style={{ color: "red" }} />
            </IconButton>
        );
    };

    const frameworkComponents = {
        actionButton: ActionButton,
        priceValueRenderer: PriceValueSummaryRenderer,
        priceValueForecastDetailRenderer: PriceValueForecastDetailRenderer,
        editCell: EditCell,
        customTooltip: CustomTooltip,
        agDropdownSelection: AgDropdownSelection
    };

    const onAuditGridReady = (params) => {
        params.api.sizeColumnsToFit();
    };

    const cellValueChanged = (params) => {
        setCellValueChange(params);
        // const changedData = [params.data];
        // setTimeout(() => {
        //     params.api.applyTransaction({ update: changedData });
        // }, 100);
    };

    const onDialogGridReady = (params) => {
        setDialogProps((prevStates) => ({
            ...prevStates,
            gridApi: params.api
        }));

        if (dialogProps.isShowProjectTrades) {
            params.api.sizeColumnsToFit();
        }
    };

    const onCellChanged = ({ column, node, value }) => {
        if (column?.colId === "sourceCurrency") {
            node?.setDataValue("exchangeRate", value?.exchangeRate);
        }
    };

    useEffect(() => {
        if (permissionReducer?.currentCompany?.companyUuid) {
            initData();
        }
    }, [permissionReducer]);

    const catalogueBEServerConfig = useMemo(() => ({
        dataField: "catalogues",
        getDataFunc: (q) => CatalogueService
            .getCataloguesV2(UserService.getCurrentCompanyUuid(), {
                ...q,
                supplier: "GENERIC"
                // TODO: Only generic items
            }).then(({ data: { data } }) => data)
    }), []);

    return (
        <Container fluid className="mb-3">
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("ForecastTrade")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    {
                        forecastStates.projectDetail
                        && (
                            <ProjectDetailsInformationCard
                                t={t}
                                detailsStates={forecastStates.projectDetail}
                            />
                        )
                    }
                </Col>
            </Row>
            <Row style={{ marginBottom: 36 }}>
                <Col lg={12}>
                    <div className="d-flex">
                        <HeaderSecondary
                            title={t("ProjectSummary")}
                            className="mb-3 mb-lg-3"
                        />
                        <div className="ml-auto">
                            <Button color="primary" className="mb-2 mr-2 px-3" onClick={onAddTradePressHandler}>
                                <i className="fa fa-plus" />
                                {` ${t("AddTrade")}`}
                            </Button>
                        </div>
                    </div>
                    {
                        forecastStates.projectSummary
                        && (
                            <ProjectForecastTable
                                columnDefs={ProjectForecastService.getProjectForecastSummaryColDefs(t)}
                                rowData={forecastStates.projectSummary}
                                onGridReady={() => { }}
                                selectCell={() => { }}
                                onSelectionChanged={() => { }}
                                onRowDoubleClicked={() => { }}
                                paginationPageSize={10}
                                defaultColumnDef={{
                                    ...defaultColDef,
                                    floatingFilter: false
                                }}
                                pagination={false}
                                gridHeight={150}
                                frameworkComponents={frameworkComponents}
                            />
                        )
                    }
                </Col>
            </Row>
            <Row style={{ marginBottom: 36 }}>
                <Col lg={12}>
                    <Row>
                        <Col lg={6}>
                            <HeaderSecondary
                                title={t("ProjectForecastDetailedBreakdown")}
                                className="mb-3 mb-lg-3"
                            />
                        </Col>
                        <Col lg={6}>
                            <SummaryButtonToolbar
                                t={t}
                                buttonRef={uploadTradeRef}
                                handleOnDrop={handleOnDrop}
                                isLoading={forecastStates.isLoading}
                                handleOnError={handleOnError}
                                handleOpenDialog={handleOpenDialog}
                                onDownloadPressHandler={onDownloadPressHandler}
                            />
                        </Col>
                    </Row>
                    {
                        forecastStates.catalogueItems && forecastStates.projectForecastTradeDetail
                        && (
                            <ProjectForecastTable
                                columnDefs={ProjectForecastService
                                    .getProjectForecastDetailBreakdownColDefs(t, forecastStates.projectTrades, forecastStates.projectForecastTradeDetail, forecastStates.listCategory, forecastStates.uomList, forecastStates.currencies)}
                                rowData={forecastStates.projectForecastTradeDetail}
                                onGridReady={(params) => {
                                    setForecastStates((prevStates) => ({
                                        ...prevStates,
                                        gridApiBreakdown: params.api
                                    }));

                                    params.api.forEachNode((node) => node.setExpanded(true));
                                }}
                                onCellValueChanged={onCellChanged}
                                selectCell={() => { }}
                                onSelectionChanged={() => { }}
                                onRowDoubleClicked={() => { }}
                                paginationPageSize={10}
                                gridOptions={{
                                    treeData: true, context: { forecastStates }, onCellEditingStopped: cellValueChanged, groupDefaultExpanded: -1
                                }}
                                getDataPath={getDataPath}
                                autoGroupColumnDef={autoGroupColumnDef}
                                frameworkComponents={frameworkComponents}
                            />
                        )
                    }
                </Col>
            </Row>
            <Row style={{ marginBottom: 36 }}>
                <Col lg={12}>
                    <HeaderSecondary
                        title={t("AuditTrail")}
                        className="mb-3 mb-lg-3"
                    />
                    <Accordion style={{ borderTop: "6px solid #AEC57D" }} defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>Audit trail</Typography>
                        </AccordionSummary>
                        <AccordionDetails style={{ display: "block" }}>
                            <Typography component="span" style={{ width: "100%" }}>
                                {
                                    forecastStates.projectForecastAuditTrail
                                    && (
                                        <ProjectForecastTable
                                            gridHeight={300}
                                            columnDefs={ProjectForecastService.getProjectForecastAuditTrailColDefs(t)}
                                            rowData={forecastStates?.projectForecastAuditTrail?.map((at) => ({
                                                ...at,
                                                date: convertToLocalTime(at.date)
                                            }))}
                                            onGridReady={onAuditGridReady}
                                            selectCell={() => { }}
                                            onSelectionChanged={() => { }}
                                            onRowDoubleClicked={() => { }}
                                            paginationPageSize={10}
                                        />
                                    )
                                }
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                </Col>
            </Row>
            <StickyFooter>
                <Row className="mx-0 px-3 justify-content-between">
                    <Col className="d-flex justify-content-start">
                        <Button
                            color="secondary"
                            className="mb-2 mr-2 px-3"
                            onClick={() => history.goBack()}
                        >
                            {t("Back")}
                        </Button>
                    </Col>
                    {
                        projectStatus && projectStatus !== "Project Closed"
                        && (
                            <Col className="d-flex justify-content-end">
                                <Button
                                    color="danger"
                                    className="mb-2 mr-2 px-3"
                                    onClick={openDialogClose}
                                >
                                    {t("Close Project")}
                                </Button>
                                <Button
                                    color="primary"
                                    className="mb-2 mr-2 px-3"
                                    onClick={onSavePressHandler}
                                >
                                    {t("Save")}
                                </Button>
                            </Col>
                        )
                    }
                </Row>
            </StickyFooter>
            <CommonConfirmDialog
                isShow={dialogProps.dialogVisibility && dialogProps.isTrade}
                onHide={dialogProps.negativeProps.onNegativeAction}
                title={dialogProps.title}
                positiveProps={
                    {
                        onPositiveAction: dialogProps.positiveProps.onPositiveAction,
                        contentPositive: dialogProps.positiveProps.contentPositive,
                        colorPositive: dialogProps.positiveProps.colorPositive
                    }
                }
                negativeProps={
                    {
                        onNegativeAction: dialogProps.negativeProps.onNegativeAction
                    }
                }
                size="xl"
                centered
                titleCenter
            >
                <Row className="mb-3 align-items-center w-50">
                    <Col xs="2">
                        <Label>Search</Label>
                    </Col>
                    <Col xs="10">
                        <Input
                            placeholder="Enter key words"
                            type="search"
                            onChange={(e) => dialogProps.gridApi.setQuickFilter(e.target.value)}
                        />
                    </Col>
                </Row>
                <ProjectForecastTable
                    columnDefs={dialogProps.columnDefs}
                    rowData={dialogProps?.rowData}
                    onGridReady={onDialogGridReady}
                    selectCell={() => { }}
                    onSelectionChanged={onSelectionChanged}
                    onRowDoubleClicked={() => { }}
                    paginationPageSize={10}
                    frameworkComponents={frameworkComponents}
                />
            </CommonConfirmDialog>
            <AddItemDialog
                isShow={dialogProps.dialogVisibility && !dialogProps.isTrade}
                onHide={dialogProps.negativeProps.onNegativeAction}
                title={dialogProps.title}
                onPositiveAction={dialogProps.positiveProps.onPositiveAction}
                onNegativeAction={dialogProps.negativeProps.onNegativeAction}
                columnDefs={dialogProps.columnDefs}
                rowDataItem={dialogProps?.rowData}
                pageSize={10}
                onSelectionChanged={onSelectionChanged}
                // selected={forecastStates.projectForecastTradeDetail}
                backendPagination
                backendServerConfig={catalogueBEServerConfig}
            />
            <CommonConfirmDialog
                isShow={isShowDialogClose}
                onHide={hideDialogClose}
                title={t("Close Project")}
                content={t("Do you wish to close this Project?")}
                positiveProps={
                    {
                        onPositiveAction: onCloseProject,
                        contentPositive: "Yes",
                        colorPositive: "primary"
                    }
                }
                negativeProps={
                    {
                        onNegativeAction: hideDialogClose,
                        contentNegative: "No",
                        colorNegative: "danger"
                    }
                }
                size="md"
                centered
                titleCenter
            />
        </Container>
    );
};

export default ProjectForecast;
