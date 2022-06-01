import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import { SelectInput, HorizontalInput } from "routes/PreRequisitions/RaisePreRequisitions/components";

const InitialSettings = (props) => {
    const {
        t,
        disabled,
        setFieldValue,
        approvalRoutes,
        values,
        touched,
        errors,
        onChangeApprovalRoute
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("InitialSettings")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="grNumber"
                            label={t("GoodsReceiptNo")}
                            type="text"
                            value={values.grNumber}
                            placeholder=""
                            errors={errors.grNumber}
                            touched={touched.grNumber}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="grStatus"
                            label={t("Status")}
                            type="text"
                            value={values.grStatus}
                            placeholder=""
                            errors={errors.grStatus}
                            touched={touched.grStatus}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="deliveryOrderNumber"
                            label={t("DeliveryOrderNo")}
                            type="text"
                            value={values.deliveryOrderNumber}
                            placeholder={t("PleaseEnterDeliveryOrderNo")}
                            errors={errors.deliveryOrderNumber}
                            touched={touched.deliveryOrderNumber}
                            className="label-required"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="deliveryDate"
                            label={t("DeliveryDate")}
                            type="date"
                            value={values.deliveryDate}
                            placeholder=""
                            errors={errors.deliveryDate}
                            touched={touched.deliveryDate}
                            className="label-required"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <SelectInput
                            name="approvalRoute"
                            label={t("ApprovalRoute")}
                            className="label-required"
                            placeholder={t("PleaseSelectApprovalRoute")}
                            errors={errors.approvalRoute}
                            touched={touched.approvalRoute}
                            options={approvalRoutes}
                            optionLabel="approvalName"
                            optionValue="uuid"
                            onChange={(e) => onChangeApprovalRoute(e, setFieldValue)}
                            value={values.approvalRoute}
                            disabled={(disabled && !values.isEdit) || !values.approvalConfig}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="approvalSequence"
                            label={t("ApprovalSequence")}
                            type="text"
                            placeholder=""
                            errors={errors.approvalSequence}
                            touched={touched.approvalSequence}
                            value={values.approvalSequence}
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default InitialSettings;
