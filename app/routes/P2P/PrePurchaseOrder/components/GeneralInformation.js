import React, { useState, useEffect } from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import HorizontalInput from "./HorizontalInput";
import SelectInput from "./SelectInput";

const GeneralInformation = (props) => {
    const {
        t, errors,
        touched,
        procurementTypes,
        approvalRoutes,
        handleChange,
        values,
        onChangeApprovalRoute,
        disabled,
        permission,
        prePoCreator
    } = props;

    const [disabledProcurementType, setDisabledProcurementType] = useState(true);

    useEffect(() => {
        if (values.prePoStatus && permission && prePoCreator) {
            if (values.prePoStatus === "SENT BACK"
                && permission.write && permission.read
                && prePoCreator
            ) {
                setDisabledProcurementType(false);
            } else {
                setDisabledProcurementType(true);
            }
        }
    }, [values, permission, prePoCreator]);

    return (
        <Card className="mb-4">
            <CardHeader tag="h6">
                {t("GeneralInformation")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="prePoTitle"
                            label={t("PurchaseOrderTitle")}
                            type="textarea"
                            rows={1}
                            placeholder={t("EnterPRTitle")}
                            className="label-required"
                            errors={errors.prePoTitle}
                            touched={touched.prePoTitle}
                            disabled={disabled}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <SelectInput
                            name="procurementType"
                            label={t("ProcurementType")}
                            className="label-required"
                            placeholder={t("PleaseSelectProcurementType")}
                            errors={errors.procurementType}
                            touched={touched.procurementType}
                            options={procurementTypes}
                            optionLabel="label"
                            optionValue="value"
                            onChange={handleChange}
                            value={values.procurementType}
                            disabled={disabledProcurementType}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <SelectInput
                            name="approvalRouteUuid"
                            label={t("ApprovalRoute")}
                            className="label-required"
                            placeholder={t("PleaseSelectApprovalRoute")}
                            errors={errors.approvalRouteUuid}
                            touched={touched.approvalRouteUuid}
                            options={approvalRoutes}
                            optionLabel="approvalName"
                            optionValue="uuid"
                            onChange={(e) => onChangeApprovalRoute(e)}
                            value={values.approvalRouteUuid}
                            disabled={disabled}
                        />
                    </Col>
                </Row>
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
                            className="mb-0"
                            disabled
                        />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );
};

export default GeneralInformation;
