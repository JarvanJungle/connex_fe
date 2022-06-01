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
import { PPR_STATUS } from "helper/purchasePreRequisitionConstants";

const InitialSettingsComponent = (props) => {
    const {
        t, values, errors,
        touched,
        currencies,
        handleChange,
        onSelectProject,
        projects,
        pprStatus,
        enablePrefix,
        handleRolePermission
    } = props;
    return (
        <Card>
            <CardHeader tag="h6">
                {t("InitialSettings")}
            </CardHeader>
            <CardBody>
                <Row>
                    <Col xs={12}>
                        <HorizontalInput
                            name="pprNumber"
                            label={t("PurchaseRequestNo")}
                            type="text"
                            className={enablePrefix ? "label-required" : ""}
                            value={values.pprNumber}
                            errors={errors.pprNumber}
                            touched={touched.pprNumber}
                            disabled={!enablePrefix}
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
                                    name="currencyCode"
                                    label={t("Currency")}
                                    className="label-required"
                                    placeholder={t("PleaseSelectACurrency")}
                                    errors={errors.currencyCode}
                                    touched={touched.currencyCode}
                                    options={currencies}
                                    optionLabel="currencyName"
                                    optionValue="currencyCode"
                                    onChange={handleChange}
                                    value={values.currencyCode}
                                    disabled={values.natureOfRequisition || !values.isEdit}
                                    colLabel={5}
                                    colValue={7}
                                />
                            )
                                : (
                                    <HorizontalInput
                                        name="currencyCode"
                                        label={t("Currency")}
                                        type="text"
                                        value={values.currencyName ? `${values.currencyName} (+${values.currencyCode})` : values.currencyCode}
                                        disabled
                                        colLabel={5}
                                        colValue={7}
                                    />
                                )
                        }
                    </Col>
                </Row>
                {
                    (values.natureOfRequisition === true || values.natureOfRequisition === "true" || values.project)
                    && (
                        <Row>
                            {
                                pprStatus !== PPR_STATUS.RAISING_PPR
                                && (
                                    <Col xs={12}>
                                        {
                                            (values.isEdit && handleRolePermission?.write) ? (
                                                <SelectInput
                                                    name="projectCode"
                                                    label={t("SelectProject")}
                                                    className="label-required"
                                                    placeholder={t("PleaseSelectProject")}
                                                    errors={errors.projectCode}
                                                    touched={touched.projectCode}
                                                    options={projects}
                                                    optionLabel="projectCode"
                                                    optionValue="projectCode"
                                                    disabled
                                                    onChange={(e) => onSelectProject(e)}
                                                    value={values.projectCode}
                                                    colLabel={5}
                                                    colValue={7}
                                                />
                                            )
                                                : (
                                                    <HorizontalInput
                                                        name="projectCode"
                                                        label={t("SelectProject")}
                                                        type="text"
                                                        value={values.projectCode}
                                                        disabled
                                                        colLabel={5}
                                                        colValue={7}
                                                    />
                                                )
                                        }
                                    </Col>
                                )
                            }
                        </Row>
                    )
                }
            </CardBody>
        </Card>
    );
};

export default InitialSettingsComponent;
