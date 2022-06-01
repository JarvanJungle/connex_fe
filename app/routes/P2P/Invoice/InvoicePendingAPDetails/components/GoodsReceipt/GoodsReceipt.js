import React, { useMemo } from "react";
import { AgGridTable } from "routes/components";
import {
    Row,
    Col
} from "components";
import {
    agGridLinkRenderer, formatDisplayDecimal, roundNumberWithUpAndDown, sumArray
} from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import DeliveryOrderService from "services/DeliveryOrderService/DeliveryOrderService";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { useToast } from "routes/hooks";
import ColumnDefs from "./ColumnDefs";

const GoodsReceipt = (props) => {
    const {
        t, invoiceList, currencyCode, companyUuid
    } = props;

    const showToast = useToast();

    const getTotalAmount = () => formatDisplayDecimal(
        roundNumberWithUpAndDown(
            sumArray(invoiceList?.map((i) => roundNumberWithUpAndDown(i.itemNetPrice)))
        ),
        2,
        currencyCode
    );

    const goToDODetails = async (uuid, currentCompanyUuid) => {
        try {
            const response = await DeliveryOrderService.viewPDFBuyer(
                currentCompanyUuid, uuid
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

    const linkCellRendererDO = (params) => {
        const { data, context } = params;
        const { deliveryOrderNumber, deliveryOrderUuid } = data;

        return (
            <div className="d-flex" style={{ textDecoration: "underline", color: "#4472C4", cursor: "pointer" }} onClick={() => goToDODetails(deliveryOrderUuid, context?.companyUuid)} aria-hidden="true">
                {deliveryOrderNumber}
            </div>
        );
    };

    return (
        <>
            <Row>
                <Col xs={12} className="mb-1">
                    <HeaderSecondary
                        title={t("GoodsReceipt")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
                <Col xs={12} className="mb-3">
                    {companyUuid && (
                        <AgGridTable
                            gridHeight={350}
                            columnDefs={ColumnDefs}
                            frameworkComponents={{
                                linkRenderer: agGridLinkRenderer,
                                linkCellRendererDO
                            }}
                            rowData={invoiceList}
                            sizeColumnsToFit={false}
                            autoSizeColumn={false}
                            context={{ companyUuid }}
                        />
                    )}
                </Col>
                <Col
                    xs={3}
                    style={{ fontSize: 16 }}
                    className="offset-9 mb-3 justify-content-between d-flex"
                >
                    <div>
                        {`${t("Total Amount")}:`}
                    </div>
                    <div>
                        {getTotalAmount()}
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default GoodsReceipt;
