import React from "react";
import {
    Card, CardBody, CardHeader, Col, Row
} from "components";
import HorizontalInput from "routes/P2P/PurchaseOrder/components/HorizontalInput";
import { SelectInput } from "routes/P2P/PurchaseRequest/components";

const GeneralInformation = (props) => {
    const {
        t,
        readOnly = false,
        approvalRoutes,
        onChangeApprovalRoute,
        values, touched, errors
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("GeneralInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        {readOnly ? (
                            <HorizontalInput
                                name="approvalRouteName"
                                label={t("APApprovalRoute")}
                                type="text"
                                value={values?.approvalRouteName}
                                disabled
                            />
                        ) : (
                            <SelectInput
                                name="approvalRoute"
                                label={t("APApprovalRoute")}
                                className="label-required"
                                placeholder={t("PleaseSelectApprovalRoute")}
                                errors={errors.approvalRoute}
                                touched={touched.approvalRoute}
                                options={approvalRoutes}
                                optionLabel="approvalName"
                                optionValue="uuid"
                                onChange={(e) => onChangeApprovalRoute(e)}
                                value={values?.approvalRoute}
                                disabled={readOnly || !values?.approvalConfig}
                            />
                        )}

                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="approvalRouteSequence"
                            label={t("ApprovalSequence")}
                            type="text"
                            value={values?.approvalRouteSequence}
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default GeneralInformation;
