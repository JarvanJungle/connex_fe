import React, { useState } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Row,
    FormGroup,
    Input,
    Label,
    Table,
    MultiSelect,
    CustomInput,
    Nav,
    NavItem,
    NavLink
} from "components";
import { Field, ErrorMessage, FieldArray } from "formik";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import { clearNumber, formatDisplayDecimal } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { IconButton } from "@material-ui/core";

const APPROVAL_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 10];
export const FEATURES = [
    {
        taskId: 1,
        taskCode: "PURCHASE_REQUEST",
        taskName: "Purchase Request"
    }
];

const ApprovalMatrixForm = (props) => {
    const {
        errors,
        values,
        touched,
        handleChange,
        dirty,
        setFieldValue,
        headerName,
        isCreate,
        isEdit,
        userList,
        groupList,
        userGroupList,
        features
    } = props;
    const { t } = useTranslation();

    const convertNumber = (value) => (
        Number(value) === 0 ? "0.00" : formatDisplayDecimal(value, CUSTOM_CONSTANTS.DEFAULT_PRECISION_NUMBER)
    );
    const [tab, setTab] = useState(1);

    return (
        <>
            <Card className="mb-4">
                <CardHeader tag="h6">
                    {headerName}
                </CardHeader>
                <CardBody className="p-4">
                    <Row className="d-flex mx-0">
                        <Col md={6}>
                            <FormGroup>
                                <Col className="label-required">
                                    <Label>{t("ApprovalCode")}</Label>
                                </Col>
                                <Col>
                                    <Input
                                        className="form-control"
                                        type="text"
                                        name="approvalCode"
                                        tag={Field}
                                        maxLength={20}
                                        invalid={errors.approvalCode && touched.approvalCode}
                                        disabled={!isCreate}
                                        placeholder={t("EnterApprovalCode")}
                                        invalid={_.has(errors, "approvalCode") && touched.approvalCode}
                                    />
                                    <ErrorMessage name="approvalCode" component="div" className="invalid-feedback" />
                                </Col>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Col className="label-required">
                                    <Label>{t("ApprovalName")}</Label>
                                </Col>
                                <Col>
                                    <Input
                                        className="form-control"
                                        type="text"
                                        name="approvalName"
                                        tag={Field}
                                        maxLength={200}
                                        invalid={errors.approvalName && touched.approvalName}
                                        disabled={!isEdit}
                                        placeholder={t("EnterApprovalName")}
                                        invalid={_.has(errors, "approvalName") && touched.approvalName}
                                    />
                                    <ErrorMessage name="approvalName" component="div" className="invalid-feedback" />
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className="d-flex mx-0">
                        <Col md={6}>
                            <FormGroup>
                                <Col className="label-required">
                                    <Label>{t("ApprovalMatrixFor")}</Label>
                                </Col>
                                <Col>
                                    <Field name="approvalFor">
                                        {({ field }) => (
                                            <select
                                                {...field}
                                                className={`form-control${(errors.approvalFor && touched.approvalFor) ? " is-invalid" : ""}`}
                                                disabled={!isEdit}
                                                onChange={(event) => {
                                                    const { value } = event.target;
                                                    const feature = features
                                                        .find((f) => f.uuid === value);
                                                    if (feature) {
                                                        setFieldValue("featureCode", feature.featureCode);
                                                        setFieldValue("featureName", feature.featureName);
                                                        setFieldValue("featureUuid", feature.uuid);
                                                    } else {
                                                        setFieldValue("featureCode", "");
                                                        setFieldValue("featureName", "");
                                                    }
                                                    setFieldValue("approvalFor", value);
                                                }}
                                            >
                                                <option value="">{t("SelectFeature")}</option>
                                                {features
                                                    .map((feature) => (
                                                        <option key={uuidv4()} value={feature.uuid}>
                                                            {feature.featureName}
                                                        </option>
                                                    ))}
                                            </select>
                                        )}
                                    </Field>
                                    <ErrorMessage name="approvalFor" component="div" className="invalid-feedback" />
                                </Col>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Col className="label-required">
                                    <Label>{t("NoOfApprovalLevel")}</Label>
                                </Col>
                                <Col>
                                    <Field name="approvalLevel">
                                        {({ field }) => (
                                            <select
                                                {...field}
                                                className={`form-control${(errors.approvalLevel && touched.approvalLevel) ? " is-invalid" : ""}`}
                                                disabled={!isEdit}
                                                onChange={(event) => {
                                                    let { value } = event.target;
                                                    if (!_.isEmpty(value)) {
                                                        value = Number(value);
                                                        let { approvalRange } = values;
                                                        const approvalRangeLen = approvalRange.length;
                                                        if (value < approvalRangeLen) {
                                                            approvalRange = approvalRange.slice(0, value);
                                                            setFieldValue("approvalRange", approvalRange);
                                                        } else if (value > approvalRangeLen) {
                                                            approvalRange = approvalRange.concat(Array(value - approvalRangeLen).fill({
                                                                rangeFrom: convertNumber(0),
                                                                rangeTo: convertNumber(0),
                                                                approvalGroups: [],
                                                                valueCriteria: false
                                                            }));
                                                            approvalRange.forEach((item, index) => {
                                                                if (approvalRange[0].valueCriteria) {
                                                                    if (index > 0) {
                                                                        approvalRange[index].rangeFrom = convertNumber(Number(clearNumber(approvalRange[index - 1].rangeTo)));
                                                                    }
                                                                } else {
                                                                    approvalRange[index].rangeFrom = convertNumber(0);
                                                                    approvalRange[index].rangeTo = convertNumber(0);
                                                                }
                                                            });
                                                            setFieldValue("approvalRange", approvalRange);
                                                        }
                                                    }
                                                    setFieldValue("approvalLevel", value);
                                                }}
                                            >
                                                <option value="">{t("SelectNo")}</option>
                                                {APPROVAL_RANGE
                                                    .map((range) => (
                                                        <option key={uuidv4()} value={range}>
                                                            {range}
                                                        </option>
                                                    ))}
                                            </select>
                                        )}
                                    </Field>
                                    <ErrorMessage name="approvalLevel" component="div" className="invalid-feedback" />
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className="d-none mx-0">
                        <Col md={6}>
                            <FormGroup>
                                <Col>
                                    <Label>{t("AssignedGoodReceivers")}</Label>
                                </Col>
                                <Col>
                                    <MultiSelect
                                        disabled={!isEdit}
                                        name="goodReceivers"
                                        className="form-control"
                                        options={userList.map((user) => ({
                                            name: user.name,
                                            value: user.uuid
                                        }))}
                                        objectName="Receiver"
                                        setFieldValue={setFieldValue}
                                        defaultValue={values.goodReceivers}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className="d-flex mx-0">
                        <Col md={12}>
                            {values?.approvalLevel > 0 && (
                                <FormGroup>
                                    <Col>
                                        <Label>{t("ApprovalRange")}</Label>
                                    </Col>
                                    <Col>
                                        <FieldArray
                                            name="approvalRange"
                                            render={(arrayHelpers) => (
                                                <>
                                                    <Table className="mb-0" bordered responsive>
                                                        <thead>
                                                            <tr style={{ height: "50px" }}>
                                                                <td style={{ width: "10%" }} className="align-middle">{t("Action")}</td>
                                                                <td style={{ width: "10%" }} className="align-middle">{t("ValueCriteria")}</td>
                                                                <td style={{ width: "15%" }} className="align-middle">{t("RangeFrom")}</td>
                                                                <td style={{ width: "15%" }} className="align-middle">{t("RangeTo")}</td>
                                                                <td style={{ width: "50%" }} className="align-middle">{t("AssignedApprovers")}</td>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                (values.approvalRange && values.approvalRange.length > 0) && (
                                                                    values.approvalRange.map((range, index) => (
                                                                        <tr key={index}>
                                                                            <td className="align-middle">
                                                                                <IconButton
                                                                                    className="d-flex justify-content-center m-auto"
                                                                                    size="small"
                                                                                    onClick={() => {
                                                                                        values.approvalRange.splice(index, 1);
                                                                                        setFieldValue("approvalRange", values.approvalRange);
                                                                                        setFieldValue("approvalLevel", values.approvalRange.length);
                                                                                    }}
                                                                                    style={{ color: "red" }}
                                                                                    disabled={!isEdit}
                                                                                >
                                                                                    <i className="fa fa-trash" />
                                                                                </IconButton>
                                                                            </td>
                                                                            <td className="align-middle">
                                                                                { index === 0 ? (
                                                                                    <CustomInput
                                                                                        type="checkbox"
                                                                                        name={`approvalRange.${index}.valueCriteria`}
                                                                                        label=""
                                                                                        id={`approvalRange.${index}.valueCriteria`}
                                                                                        checked={range.valueCriteria}
                                                                                        onChange={(event) => {
                                                                                            const { checked } = event.target;
                                                                                            setFieldValue(`approvalRange.${index}.valueCriteria`, checked);
                                                                                            values.approvalRange.forEach((_item, i) => {
                                                                                                if (i > 0) {
                                                                                                    setFieldValue(`approvalRange.${i}.rangeFrom`, convertNumber(Number(values.approvalRange[i - 1].rangeTo)));
                                                                                                }
                                                                                                setFieldValue(`approvalRange.${i}.rangeTo`, convertNumber(0));
                                                                                            });
                                                                                            if (!checked) {
                                                                                                setFieldValue(`approvalRange.${index}.rangeFrom`, convertNumber(0));
                                                                                                setFieldValue(`approvalRange.${index}.rangeTo`, convertNumber(0));
                                                                                                values.approvalRange.forEach((_item, i) => {
                                                                                                    setFieldValue(`approvalRange.${i}.rangeFrom`, convertNumber(0));
                                                                                                    setFieldValue(`approvalRange.${i}.rangeTo`, convertNumber(0));
                                                                                                });
                                                                                            }
                                                                                        }}
                                                                                        disabled={!isEdit}
                                                                                        className="align-middle d-flex justify-content-center"
                                                                                    />
                                                                                ) : (
                                                                                    <CustomInput
                                                                                        type="checkbox"
                                                                                        name={`approvalRange.${index}.valueCriteria`}
                                                                                        label=""
                                                                                        id={`approvalRange.${index}.valueCriteria`}
                                                                                        checked={values.approvalRange[0].valueCriteria}
                                                                                        disabled
                                                                                        className="align-middle d-flex justify-content-center"
                                                                                    />
                                                                                )}
                                                                            </td>
                                                                            <td className="align-middle">
                                                                                { index === 0 ? (
                                                                                    <Input
                                                                                        className="form-control text-right"
                                                                                        type="text"
                                                                                        name={`approvalRange.${index}.rangeFrom`}
                                                                                        tag={Field}
                                                                                        onBlur={(event) => {
                                                                                            setFieldValue(`approvalRange.${index}.rangeFrom`, convertNumber(event.target.value));
                                                                                        }}
                                                                                        disabled={!isEdit || !values.approvalRange[0].valueCriteria}
                                                                                        placeholder={t("EnterRangeFrom")}
                                                                                    />
                                                                                ) : (
                                                                                    <Input
                                                                                        className="form-control text-right"
                                                                                        type="text"
                                                                                        name={`approvalRange.${index}.rangeFrom`}
                                                                                        tag={Field}
                                                                                        onBlur={(event) => {
                                                                                            setFieldValue(`approvalRange.${index}.rangeFrom`, convertNumber(event.target.value));
                                                                                        }}
                                                                                        disabled={!isEdit || !values.approvalRange[0].valueCriteria}
                                                                                        placeholder={t("EnterRangeFrom")}
                                                                                    />
                                                                                )}
                                                                            </td>
                                                                            <td className="align-middle">
                                                                                <Input
                                                                                    className="form-control text-right"
                                                                                    type="text"
                                                                                    name={`approvalRange.${index}.rangeTo`}
                                                                                    tag={Field}
                                                                                    onBlur={(event) => {
                                                                                        if (index < values.approvalRange.length - 1) {
                                                                                            setFieldValue(`approvalRange.${index + 1}.rangeFrom`, convertNumber(Number(event.target.value)));
                                                                                            setFieldValue(`approvalRange.${index}.rangeTo`, convertNumber(event.target.value));
                                                                                        } else {
                                                                                            setFieldValue(`approvalRange.${index}.rangeTo`, convertNumber(event.target.value));
                                                                                        }
                                                                                    }}
                                                                                    disabled={!isEdit || !values.approvalRange[0].valueCriteria}
                                                                                    placeholder={t("EnterRangeTo")}
                                                                                />
                                                                            </td>
                                                                            <td className="align-middle">
                                                                                <div>
                                                                                    <Nav tabs>
                                                                                        <NavItem>
                                                                                            <NavLink href="#" onClick={() => setTab(1)} active={tab === 1}>
                                                                                                Users
                                                                                            </NavLink>
                                                                                        </NavItem>
                                                                                        <NavItem>
                                                                                            <NavLink href="#" onClick={() => setTab(2)} active={tab === 2}>
                                                                                                Groups
                                                                                            </NavLink>
                                                                                        </NavItem>
                                                                                    </Nav>
                                                                                </div>
                                                                                <Card>
                                                                                    <CardBody>
                                                                                        {tab === 1 && (
                                                                                            <>
                                                                                                <MultiSelect
                                                                                                    disabled={!isEdit}
                                                                                                    name={`approvalRange[${index}].approvalGroups`}
                                                                                                    className="form-control"
                                                                                                    options={userGroupList.map((group) => ({
                                                                                                        name: group.groupName,
                                                                                                        value: group.uuid,
                                                                                                        numberApprovers: 1,
                                                                                                        sumUser: group?.groupUserList?.length,
                                                                                                        groupList: group?.groupUserList,
                                                                                                        type: "user"
                                                                                                    }))}
                                                                                                    withSerialNumber
                                                                                                    numberApprovers
                                                                                                    objectName="Approver"
                                                                                                    setFieldValue={setFieldValue}
                                                                                                    defaultValue={values.approvalRange[index].approvalGroups}
                                                                                                    invalid={_.has(errors, `approvalRange[${index}].approvalGroups`) && _.has(touched, `approvalRange[${index}].approvalGroups`)}
                                                                                                />
                                                                                            </>

                                                                                        )}
                                                                                        {tab === 2 && (
                                                                                            <>
                                                                                                <MultiSelect
                                                                                                    disabled={!isEdit}
                                                                                                    name={`approvalRange[${index}].approvalGroups`}
                                                                                                    className="form-control"
                                                                                                    options={groupList.map((group) => ({
                                                                                                        name: group.groupName,
                                                                                                        value: group.uuid,
                                                                                                        numberApprovers: 1,
                                                                                                        sumUser: group?.groupUserList?.length,
                                                                                                        type: "group",
                                                                                                        groupList: group?.groupUserList
                                                                                                    }))}
                                                                                                    withSerialNumber
                                                                                                    numberApprovers
                                                                                                    objectName="Approver"
                                                                                                    setFieldValue={setFieldValue}
                                                                                                    defaultValue={values.approvalRange[index].approvalGroups}
                                                                                                    invalid={_.has(errors, `approvalRange[${index}].approvalGroups`) && _.has(touched, `approvalRange[${index}].approvalGroups`)}
                                                                                                />
                                                                                            </>

                                                                                        )}
                                                                                    </CardBody>
                                                                                </Card>
                                                                                <ErrorMessage name={`approvalRange[${index}].approvalGroups`} component="div" className="invalid-feedback" />
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                )
                                                            }
                                                        </tbody>
                                                    </Table>
                                                </>
                                            )}
                                        />
                                    </Col>
                                </FormGroup>
                            )}
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </>
    );
};

export default ApprovalMatrixForm;
