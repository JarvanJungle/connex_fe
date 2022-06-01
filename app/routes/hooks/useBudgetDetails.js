import { useState } from "react";
import useToast from "routes/hooks/useToast";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import ProjectForecastService from "services/ProjectForecastService";

const useBudgetDetails = () => {
    const showToast = useToast();
    const [rowDataProject, setRowDataProject] = useState([]);
    const [rowDataTrade, setRowDataTrade] = useState([]);
    const [forecastItems, setForecastItems] = useState([]);

    const getBudgetDetailsByProjectCode = async (companyUuid, projectUuid) => {
        try {
            const response = await ProjectForecastService
                .getProjectForecastDetail(companyUuid, projectUuid);
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response && response.data;
                const {
                    overallBudget,
                    projectCode,
                    projectTitle,
                    currency,
                    projectForecastTradeDetailsDtoList
                } = data;
                const projects = [];
                const trades = [];
                const forecasts = [];

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
                            * Number(element.itemQuantity)
                            * Number(element.exchangeRate);
                        item.totalContracted = element.totalContracted;
                        item.totalContractedSpend = element.totalContractedSpend;
                        item.pendingApproveInvoicesContract = element
                            .contractPendingApprovalInvoices;
                        item.approveInvoicesContract = element.contractApprovalInvoices;
                        item.pendingBillingContract = element.contractPendingBilling;
                        item.contractedSpendBalance = item.totalContracted
                            - item.totalContractedSpend;
                        item.totalNonContractedSpend = element.totalNonContractedSpend;
                        item.pendingApproveInvoicesNonContract = element
                            .nonContractPendingApprovalInvoices;
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
                        forecastItem.categoryName = element.categoryName;
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
                        forecasts.push(forecastItem);
                    });

                    const trade = {};
                    trade.code = tradeCode;
                    trade.name = tradeTitle;
                    trade.tradeDescription = tradeDescription;
                    trade.currency = listItems[0]?.currency;
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
                        trade.pendingApproveInvoicesContract += element
                            .pendingApproveInvoicesContract;
                        trade.approveInvoicesContract += element.approveInvoicesContract;
                        trade.pendingBillingContract += element.pendingBillingContract;
                        trade.contractedSpendBalance += element.contractedSpendBalance;
                        trade.totalNonContractedSpend += element.totalNonContractedSpend;
                        trade.pendingApproveInvoicesNonContract += element
                            .pendingApproveInvoicesNonContract;
                        trade.approveInvoicesNonContract += element.approveInvoicesNonContract;
                        trade.pendingBillingNonContract += element.pendingBillingNonContract;
                        trade.totalSpend += element.totalSpend;
                    });

                    trades.push(trade);
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
                trades.forEach((element) => {
                    project.totalForecasted += element.totalForecasted;
                    project.totalContracted += element.totalContracted;
                    project.totalContractedSpend += element.totalContractedSpend;
                    project.pendingApproveInvoicesContract += element
                        .pendingApproveInvoicesContract;
                    project.approveInvoicesContract += element.approveInvoicesContract;
                    project.pendingBillingContract += element.pendingBillingContract;
                    project.contractedSpendBalance += element.contractedSpendBalance;
                    project.totalNonContractedSpend += element.totalNonContractedSpend;
                    project.pendingApproveInvoicesNonContract += element
                        .pendingApproveInvoicesNonContract;
                    project.approveInvoicesNonContract += element.approveInvoicesNonContract;
                    project.pendingBillingNonContract += element.pendingBillingNonContract;
                    project.totalSpend += element.totalSpend;
                });

                projects.push(project);

                setRowDataProject(projects);
                setRowDataTrade(trades);
                setForecastItems(forecasts);
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    return [
        rowDataProject, rowDataTrade,
        forecastItems,
        getBudgetDetailsByProjectCode,
        setForecastItems
    ];
};

export default useBudgetDetails;
