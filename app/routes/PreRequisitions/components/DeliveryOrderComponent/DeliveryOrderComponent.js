import React, { useEffect, useState } from "react";

import {
    Row,
    Col
} from "components";
import { AgGridReact } from "components/agGrid";
import ManageProjectForecastService from "services/ManageProjectForecastService";
import { isNullOrUndefined } from "helper/utilities";
import { defaultColDef, columnDefs } from "./DeliveryOrderGridDefinition";

const DeliveryOrderComponent = (props) => {
    const {
        values,
        setFieldValue,
        showToast
    } = props;

    const [deliveryOrderRowData, setDeliveryOrderRowData] = useState([]);

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

    const transformBudgetDetailData = (data) => {
        const resultArray = [];
        const doArray = {
            projectCode: data.projectCode,
            projectTitle: data.projectTitle,
            overallBudget: data.overallBudget,
            totalForeCasted: 0,
            totalSpend: 0,
            totalContractedSpend: 0,
            contractPendingApprovalInvoices: 0,
            contractApprovalInvoices: 0,
            contractPendingBilling: 0,
            contractedSpendBalance: 0,
            totalNonContractedSpend: 0,
            nonContractPendingApprovalInvoices: 0,
            nonContractApprovalInvoices: 0,
            nonContractPendingBilling: 0
        };
        const poArray = data.projectForecastTradeDetailsDtoList;
        poArray.forEach((eParent) => {
            const { projectForecastItemList } = eParent;

            const summaryObject = {
                totalForeCasted: 0,
                totalSpend: 0,
                totalContractedSpend: 0,
                contractPendingApprovalInvoices: 0,
                contractApprovalInvoices: 0,
                contractPendingBilling: 0,
                contractedSpendBalance: 0,
                totalNonContractedSpend: 0,
                nonContractPendingApprovalInvoices: 0,
                nonContractApprovalInvoices: 0,
                nonContractPendingBilling: 0
            };
            if (projectForecastItemList.length > 0) {
                projectForecastItemList.forEach((eChild) => {
                    const newItem = {
                        tradeCode: [eParent.tradeCode, eChild.itemCode],
                        tradeTitle: eParent.tradeTitle,
                        tradeDescription: eParent.tradeDescription,
                        ...eChild
                    };
                    Object.keys(summaryObject).map((key) => {
                        summaryObject[key] += newItem[key] || 0;
                    });
                    resultArray.push(newItem);
                });
            }
            const newParentItem = {
                tradeCode: [eParent.tradeCode],
                tradeTitle: eParent.tradeTitle,
                tradeDescription: eParent.tradeDescription,
                ...summaryObject
            };
            Object.keys(summaryObject).map((key) => {
                doArray[key] += summaryObject[key] || 0;
            });
            resultArray.push(newParentItem);
        });
        setDeliveryOrderRowData([doArray]);
        return resultArray;
    };

    useEffect(() => {
        (async () => {
            const companyRole = JSON.parse(localStorage.getItem("companyRole"));
            if (!isNullOrUndefined(companyRole) && !!values.selectProject) {
                try {
                    const selectedProjectUuid = values.selectProject.projectCode;
                    const response = await ManageProjectForecastService
                        .getProjectForecastDetail(companyRole.companyUuid, selectedProjectUuid);
                    const { data, statusCode, message } = response.data;
                    if (statusCode === 200) {
                        setFieldValue(
                            "purchaseOrderDetails",
                            transformBudgetDetailData(data)
                        );
                    } else {
                        throw new Error(message);
                    }
                } catch (error) {
                    showToast("error", error.message);
                }
            }
        })();
    }, [values.selectProject]);

    return (
        <Row id="deliveryOrderComponent">
            <Col
                md={12}
                lg={12}
            >
                <AgGridReact
                    className="ag-theme-custom-react"
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowData={deliveryOrderRowData}
                    onGridReady={onGridReady}
                    containerStyle={{ height: 250 }}
                />
            </Col>
        </Row>
    );
};

export default DeliveryOrderComponent;
