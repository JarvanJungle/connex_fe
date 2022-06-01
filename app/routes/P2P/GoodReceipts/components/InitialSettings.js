import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    Tooltip
} from "components";
import { SelectInput, HorizontalInput } from "routes/PreRequisitions/RaisePreRequisitions/components";
import classNames from "classnames";

const InitialSettings = (props) => {
    const {
        t,
        disabled,
        setFieldValue,
        approvalRoutes,
        values,
        touched,
        errors,
        type,
        onChangeApprovalRoute,
        modeView,
        tooltipOpen,
        toggle,
        enablePrefix
    } = props;
    const ApprovalRoute = ({ modeView, disabled, values }) => {
        if (!modeView.isGrCreator && modeView.isGrCreator !== undefined) {
            return (<Row>
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
                        disabled
                    />
                </Col>
            </Row>);
        }
        if (disabled && !values.isEdit) {
            return (<Row>
                <Col xs={12}>
                    <HorizontalInput
                        name="approvalRouteName"
                        label={t("ApprovalRoute")}
                        type="text"
                        value={values.approvalRouteName}
                        placeholder=""
                        errors={errors.approvalRouteName}
                        touched={touched.approvalRouteName}
                        disabled
                        className="label-required"
                    />
                </Col>
            </Row>);
        }
        if (!disabled || values.isEdit) {
            return (
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
                            disabled={!values.approvalConfig}
                        />
                    </Col>
                </Row>
            )
        }
    }

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
                            className={enablePrefix ? "label-required" : ""}
                            placeholder=""
                            errors={errors.grNumber}
                            touched={touched.grNumber}
                            disabled={!enablePrefix}
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
                    <Col xs={12} id="tooltip">
                        <HorizontalInput
                            name="deliveryOrderNumber"
                            label={t("DeliveryOrderNo")}
                            type="text"
                            value={values.deliveryOrderNumber}
                            placeholder={t("PleaseEnterDeliveryOrderNo")}
                            errors={errors.deliveryOrderNumber}
                            touched={touched.deliveryOrderNumber}
                            disabled={(disabled && (type === "DO")) || modeView.isViewDetailsMode}
                            className={classNames({ "label-required": type !== "DO" })}
                        />
                    </Col>
                    <Tooltip placement="top" isOpen={tooltipOpen} target="tooltip" toggle={toggle}>
                        {values.deliveryOrderNumber}
                    </Tooltip>
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
                            disabled={disabled && !values.isEdit}
                            className="label-required"
                        />
                    </Col>
                </Row>
                <ApprovalRoute modeView={modeView} disabled={disabled}
                    values={values} />
                {/* {(disabled && !values.isEdit) && ( */}
                {/* <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="approvalRouteName"
                                label={t("ApprovalRoute")}
                                type="text"
                                value={values.approvalRouteName}
                                placeholder=""
                                errors={errors.approvalRouteName}
                                touched={touched.approvalRouteName}
                                disabled
                                className="label-required"
                            />
                        </Col>
                    </Row> */}
                {/* )} */}

                {/* {(!disabled || values.isEdit) && (
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
                                disabled
                                // disabled={!values.approvalConfig}
                            />
                        </Col>
                    </Row>
                )} */}

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
                {
                    modeView.isApprovalMode
                    && (
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="nextApprover"
                                    label={t("NextApprover")}
                                    type="text"
                                    placeholder=""
                                    errors={errors.nextApprover}
                                    touched={touched.nextApprover}
                                    value={values.nextApprover}
                                    disabled
                                />
                            </Col>
                        </Row>
                    )
                }
                {
                    modeView.isViewDetailsMode
                    && values.receiptDate
                    && (
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="receiptDate"
                                    label={t("ReceiptDate")}
                                    type="text"
                                    placeholder=""
                                    errors={errors.receiptDate}
                                    touched={touched.receiptDate}
                                    value={values.receiptDate}
                                    disabled
                                />
                            </Col>
                        </Row>
                    )
                }
            </CardBody>
        </Card>
    );
};

export default InitialSettings;
