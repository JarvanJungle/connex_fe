import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col,
    SelectInput,
    HorizontalInput
} from "components";

const GeneralInformationComponent = (props) => {
    const {
        t, errors,
        touched,
        approvalRoutes,
        onChangeApprovalRoute,
        values,
        isCreate
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("GeneralInformation")}
            </CardHeader>
            <CardBody>
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
                            onChange={(e) => onChangeApprovalRoute(e)}
                            value={values.approvalRoute}
                            disabled={!values.isEdit || !values.approvalConfig}
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
                            disabled
                            value={values.approvalSequence}
                        />
                    </Col>
                </Row>
                {
                    values.nextApprover && (
                        <Row>
                            <Col xs={12}>
                                <HorizontalInput
                                    name="nextApprover"
                                    label={t("Next Approver")}
                                    type="text"
                                    placeholder=""
                                    errors={errors.nextApprover}
                                    touched={touched.nextApprover}
                                    disabled
                                    value={values.nextApprover}
                                />
                            </Col>
                        </Row>
                    )
                }
                <Row>
                    <Col xs={12}>
                        { isCreate ? (
                            <HorizontalInput
                                name="createBy"
                                label={t("Create By")}
                                type="text"
                                value={values.createBy}
                                disabled
                            />
                        ) : (
                            <HorizontalInput
                                name="createBy"
                                label={t("Created By")}
                                type="text"
                                value={values.createBy}
                                disabled
                            />
                        )}
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="createDate"
                            label={t("Creation Date")}
                            type="text"
                            value={values.createDate}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="status"
                            label={t("Status")}
                            type="text"
                            value={values.status}
                            disabled
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="paymentReleaseDate"
                            label={t("Payment Release Date")}
                            type="text"
                            value={values.paymentReleaseDate}
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default GeneralInformationComponent;
