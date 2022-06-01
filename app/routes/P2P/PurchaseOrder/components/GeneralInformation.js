import React, { useMemo } from "react";
import {
    Row, Card, CardBody,
    CardHeader, Col
} from "components";
import HorizontalInput from "./HorizontalInput";
import SelectInput from "./SelectInput";

const GeneralInformation = (props) => {
    const {
        t, errors, touched,
        values, setFieldValue,
        poStatus, isBuyer,
        approvalRoutes, prCreator,
        setDirty, approvalRef
    } = props;

    const editableApprovalRoute = useMemo(
        () => prCreator
            && ["PENDING_REVIEW", "SENT_BACK", "RECALLED"].includes(poStatus),
        [poStatus, prCreator]
    );

    const onChangeApprovalRoute = (evt) => {
        setDirty();
        const { value } = evt.target;
        const { approvalRouteUuid } = values;
        // check user change from approval route to without approval route
        // or from without approval route to approval route
        if (
            (!value && approvalRouteUuid)
            || (value && !approvalRouteUuid)
        ) {
            setFieldValue("changeNatureApproval", true);
        }
        setFieldValue("approvalRouteUuid", value);
    };

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("GeneralInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="poTitle"
                            label={t("POTitle")}
                            type="textarea"
                            rows={1}
                            placeholder={t("EnterPRTitle")}
                            className="label-required"
                            errors={errors.poTitle}
                            touched={touched.poTitle}
                            disabled={!["PENDING_REVIEW", "SENT_BACK", "RECALLED"].includes(poStatus) || !prCreator}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="procurementType"
                            label={t("ProcurementType")}
                            type="text"
                            placeholder=""
                            className="label-required"
                            errors={errors.procurementType}
                            touched={touched.procurementType}
                            disabled
                        />
                    </Col>
                </Row>
                {!isBuyer && (
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="requestorName"
                                label={t("Requester")}
                                type="text"
                                placeholder=""
                                errors={errors.requestorName}
                                touched={touched.requestorName}
                                disabled
                            />
                        </Col>
                    </Row>
                )}
                {isBuyer && (
                    <>
                        {editableApprovalRoute && (
                            <Row>
                                <Col xs={12}>
                                    <SelectInput
                                        name="approvalRouteUuid"
                                        label={t("ApprovalRoute")}
                                        placeholder={t("PleaseSelectApprovalRoute")}
                                        className="label-required"
                                        errors={errors.approvalRouteUuid}
                                        touched={touched.approvalRouteUuid}
                                        options={approvalRoutes}
                                        optionLabel="approvalName"
                                        optionValue="uuid"
                                        onChange={onChangeApprovalRoute}
                                        value={values.approvalRouteUuid}
                                        disabled={!values.approvalConfig}
                                        showOptionPlaceholder
                                        // ref={approvalRef}
                                    />
                                </Col>
                            </Row>
                        )}
                        {!editableApprovalRoute && (
                            <Row>
                                <Col xs={12}>
                                    <HorizontalInput
                                        name="approvalRouteName"
                                        label={t("ApprovalRoute")}
                                        type="text"
                                        placeholder=""
                                        errors={errors.approvalRouteSequence}
                                        touched={touched.approvalRouteSequence}
                                        disabled
                                    />
                                </Col>
                            </Row>
                        )}
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="approvalRouteSequence"
                                    label={t("ApprovalSequence")}
                                    type="text"
                                    placeholder=""
                                    errors={errors.approvalRouteSequence}
                                    touched={touched.approvalRouteSequence}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="requestorName"
                                    label={t("Requester")}
                                    type="text"
                                    placeholder=""
                                    errors={errors.requestorName}
                                    touched={touched.requestorName}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="convertedDate"
                                    label={t("ConvertedDate")}
                                    type="text"
                                    placeholder=""
                                    errors={errors.convertedDate}
                                    touched={touched.convertedDate}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="poDate"
                                    label={t("PurchaseOrderDate")}
                                    type="text"
                                    placeholder=""
                                    errors={errors.poDate}
                                    touched={touched.poDate}
                                    className="mb-0"
                                    disabled
                                />
                            </Col>
                        </Row>
                    </>
                )}
                {!isBuyer && (
                    <Row>
                        <Col xs={12}>
                            <HorizontalInput
                                name="issuedDate"
                                label={t("IssuedDate")}
                                type="text"
                                placeholder=""
                                errors={errors.issuedDate}
                                touched={touched.issuedDate}
                                className="mb-0"
                                disabled
                            />
                        </Col>
                    </Row>
                )}
            </CardBody>
        </Card>
    );
};

export default GeneralInformation;
