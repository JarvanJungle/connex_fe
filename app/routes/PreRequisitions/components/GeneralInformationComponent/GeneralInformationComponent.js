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
        procurementTypes,
        approvalRoutes,
        handleChange,
        values,
        onChangeApprovalRoute,
        handleRolePermission
    } = props;

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("GeneralInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="pprTitle"
                            label={t("PPR Title")}
                            type="textarea"
                            rows={1}
                            placeholder={t("Enter PPR Title")}
                            className="label-required"
                            errors={errors.pprTitle}
                            touched={touched.pprTitle}
                            value={values.pprTitle}
                            disabled={!values.isEdit}
                            colLabel={5}
                            colValue={7}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <SelectInput
                            name="procurementType"
                            label={t("Procurement Type")}
                            className="label-required"
                            placeholder={t("PleaseSelectProcurementType")}
                            errors={errors.procurementType}
                            touched={touched.procurementType}
                            options={procurementTypes}
                            optionLabel="label"
                            optionValue="value"
                            onChange={handleChange}
                            value={values.procurementType}
                            disabled={!values.isEdit}
                            colLabel={5}
                            colValue={7}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        {
                            (values.isEdit && handleRolePermission?.write) ? (
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
                                    colLabel={5}
                                    colValue={7}
                                />
                            )
                                : (
                                    <HorizontalInput
                                        name="approvalRoute"
                                        label={t("ApprovalRoute")}
                                        type="text"
                                        placeholder=""
                                        disabled
                                        value={values.approvalCode}
                                        colLabel={5}
                                        colValue={7}
                                    />
                                )
                        }
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
                            colLabel={5}
                            colValue={7}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="requester"
                            label={t("Requester")}
                            type="text"
                            placeholder=""
                            errors={errors.requester}
                            touched={touched.requester}
                            disabled
                            value={values.requester}
                            colLabel={5}
                            colValue={7}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="submittedDate"
                            label={t("SubmittedDate")}
                            type="text"
                            placeholder=""
                            errors={errors.submittedDate}
                            touched={touched.submittedDate}
                            disabled
                            className="mb-0"
                            value={values.submittedDate}
                            colLabel={5}
                            colValue={7}
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default GeneralInformationComponent;
