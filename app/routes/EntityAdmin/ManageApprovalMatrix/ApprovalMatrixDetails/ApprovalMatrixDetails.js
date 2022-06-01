/* eslint-disable max-len */
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router";
import useToast from "routes/hooks/useToast";
import {
    Button, ButtonToolbar, Col, Container, Row
} from "components";
import StickyFooter from "components/StickyFooter";
import { HeaderMain } from "routes/components/HeaderMain";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import UserService from "services/UserService";
import CUSTOM_CONSTANTS, { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import _, { isNaN } from "lodash";
import ApprovalGroupService from "services/ApprovalGroupService";
import ApprovalMatrixManagementService from "services/ApprovalMatrixManagementService";
import { clearNumber, formatDisplayDecimal } from "helper/utilities";
import { useCurrentCompany, usePermission } from "routes/hooks";
import ApprovalMatrixForm from "./ApprovalMatrixForm";

const ApprovalMatrixDetails = (props) => {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const [isCreate, setIsCreate] = useState(true);
    const [isEdit, setIsEdit] = useState(true);
    const [form, setForm] = useState({});
    const [backupForm, setBackupForm] = useState({});
    const [userList, setUserList] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [userGroupList, setUserGroupList] = useState([]);
    const [detailsStates, setDetailsStates] = useState({
        companyUuid: "",
        uuid: "",
        features: []
    });
    const handleRolePermission = usePermission(FEATURE.APPROVAL_MATRIX);
    const currentCompany = useCurrentCompany();

    const validationSchema = Yup.object().shape({
        approvalCode: Yup.string().required(t("EnterApprovalCode")),
        approvalName: Yup.string().required(t("EnterApprovalName")),
        approvalFor: Yup.string().required(t("PleaseSelectAFeature")),
        approvalLevel: Yup.string().required(t("PleaseSelectApprovalLevel")),
        approvalRange: Yup.array()
            .of(Yup.object().shape({
                approvalGroups: Yup.array().min(1, t("PleaseSelectApprover"))
            }))
    });

    const initialValues = {
        approvalCode: "",
        approvalName: "",
        approvalFor: "",
        taskCode: "",
        taskName: "",
        approvalLevel: "",
        goodReceivers: [],
        approvalRange: []
    };

    const getFeature = async (companyUuid) => {
        try {
            const resFeature = await ApprovalMatrixManagementService
                .getListFeature(companyUuid);
            setDetailsStates((prevStates) => ({
                ...prevStates,
                features: resFeature?.data?.data?.sort(
                    (a, b) => a?.featureName?.localeCompare(b?.featureName)
                )
            }));
        } catch (err) {
            console.log("getFeature ~ err", err);
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(props.location.search);
        const uuid = query.get("uuid");
        if (uuid) {
            setIsCreate(false);
            setIsEdit(false);
        }
        if (!_.isEmpty(currentCompany)) {
            getFeature(currentCompany.companyUuid);
            setDetailsStates((prevStates) => ({
                ...prevStates,
                companyUuid: currentCompany.companyUuid,
                uuid
            }));
        }
    }, [currentCompany]);

    const getApprovalDetails = async () => {
        try {
            if (detailsStates.uuid && detailsStates.companyUuid) {
                const approvalRes = await ApprovalMatrixManagementService
                    .getApprovalMatrixByApprovalUuid(detailsStates.companyUuid, detailsStates.uuid);
                if (approvalRes.data.status === RESPONSE_STATUS.OK) {
                    setForm(approvalRes.data.data);
                    setBackupForm(approvalRes.data.data);
                } else {
                    throw new Error(approvalRes.data.message);
                }
            }

            if (detailsStates.companyUuid) {
                const companyUsersRes = await UserService
                    .getCompanyUsers(detailsStates.companyUuid);
                if (companyUsersRes.data.status === RESPONSE_STATUS.OK) {
                    const companyUserList = companyUsersRes.data.data;
                    setUserList(companyUserList);
                } else {
                    throw new Error(companyUsersRes.data.message);
                }
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const getApprovalGroups = () => {
        Promise.all([
            ApprovalGroupService.getAllGroups(UserService.getCurrentCompanyUuid()),
            ApprovalGroupService.getAllGroups(UserService.getCurrentCompanyUuid(), true)
        ]).then(([approvalGroupsRes, singleUserGroupsRes]) => {
            const groups = approvalGroupsRes?.data?.data;
            const singleUserGroups = singleUserGroupsRes?.data?.data;
            groups?.sort((a, b) => a?.groupName?.localeCompare(b?.groupName));
            singleUserGroups?.sort((a, b) => a?.groupName?.localeCompare(b?.groupName));
            setGroupList(groups);
            setUserGroupList(singleUserGroups);
        }).catch((e) => {
            showToast("error", e?.response?.data?.message || e?.message);
        });
    };

    useEffect(() => {
        getApprovalGroups();
    }, []);

    useEffect(() => {
        getApprovalDetails();
    }, [detailsStates]);

    const allApprovalGroups = useMemo(
        () => [...groupList, ...userGroupList], [groupList, userGroupList]
    );

    const toggleEdit = () => {
        setIsEdit(!isEdit);
    };

    const onSaveApprovalPressHandler = async (values) => {
        try {
            const dataForm = _.cloneDeep(values);
            const {
                approvalCode,
                approvalName,
                featureCode,
                featureName,
                featureUuid
            } = dataForm;

            let {
                goodReceivers,
                approvalRange
            } = dataForm;

            goodReceivers = goodReceivers.map((receiver) => ({
                userUuid: receiver.value,
                name: receiver.name
            }));
            let seqIndex = 0;
            const groupRange = dataForm.approvalRange;
            approvalRange = approvalRange.map((range) => {
                const mappedRange = { ...range };
                mappedRange.approvalGroups = range.approvalGroups.map((group) => {
                    const mappingGroup = allApprovalGroups.find((g) => g.uuid === group.value);
                    return {
                        group: {
                            uuid: mappingGroup?.uuid
                        },
                        // eslint-disable-next-line no-plusplus
                        sequence: ++seqIndex,
                        numberApprovers: Number(group.numberApprovers)
                    };
                });
                return mappedRange;
            });
            approvalRange.forEach((item, index) => {
                console.log(item);
                approvalRange[index].rangeFrom = Number(
                    clearNumber(approvalRange[index].rangeFrom)
                );
                approvalRange[index].rangeTo = Number(clearNumber(approvalRange[index].rangeTo));
                if (Number.isNaN(clearNumber(approvalRange[index].rangeFrom))) {
                    throw Error("Approval Range is invalid: Range From must be Number");
                }
                if (Number.isNaN(clearNumber(approvalRange[index].rangeTo))) {
                    throw Error("Approval Range is invalid: Range To must be Number");
                }
                if (Number(clearNumber(item.rangeFrom)) > Number(clearNumber(item.rangeTo))) {
                    throw Error("Approval Range is invalid: Range To must be greater than or equal to Range From");
                }
                if (index > 0 && index < approvalRange.length) {
                    if (approvalRange[index].rangeFrom < approvalRange[index - 1].rangeTo) {
                        throw Error("Approval Range is invalid: Range From must be greater than or equal to previous Range To");
                    }
                }
            });
            console.log("onSaveApprovalPressHandler ~ groupRange", groupRange);
            groupRange.forEach((item) => {
                item.approvalGroups.forEach((child) => {
                    if (child.numberApprovers > child.sumUser) {
                        throw Error(`Number Approvers of ${child.name} is invalid: Number Approvers must less than or equal to total User of Group (${child.sumUser})`);
                    }
                    if (child.numberApprovers < 1
                        || isNaN(child.numberApprovers)) {
                        throw Error("Number Approvers is invalid: Number Approvers must be greater or equal than 1");
                    }
                });
            });
            let data = {
                approvalCode,
                approvalName,
                featureCode,
                featureName,
                goodReceivers,
                approvalRange,
                featureUuid
            };
            if (isCreate) {
                const response = await ApprovalMatrixManagementService
                    .createApprovalMatrix(detailsStates.companyUuid, data);
                if (response.data.status === RESPONSE_STATUS.OK) {
                    showToast("success", response.data.message);
                    setTimeout(() => {
                        history.goBack();
                    }, 1000);
                } else {
                    throw new Error(response.data.message);
                }
            } else if (isEdit) {
                data = {
                    ...data,
                    uuid: form.uuid,
                    active: form.active
                };
                const response = await ApprovalMatrixManagementService
                    .updateApprovalMatrix(detailsStates.companyUuid, data);
                if (response.data.status === RESPONSE_STATUS.OK) {
                    toggleEdit();
                    showToast("success", response.data.data);
                } else {
                    throw new Error(response.data.message);
                }
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onBackButtonPressHandler = () => {
        if (!isCreate) {
            setForm((prevStates) => ({
                ...backupForm,
                hasChanged: prevStates.hasChanged ? !prevStates.hasChanged : true
            }));
            setIsEdit(!isEdit);
        } else {
            history.goBack();
        }
    };

    const convertNumber = (value) => (
        Number(value) === 0 ? "0.00" : formatDisplayDecimal(value, CUSTOM_CONSTANTS.DEFAULT_PRECISION_NUMBER)
    );

    return (
        <>
            <Container fluid>
                <Row className="mb-1">
                    <Col lg={12}>
                        {
                            location.pathname === "/approval-matrix/create"
                                ? (
                                    <HeaderMain
                                        title={(t("CreateApproval"))}
                                        className="mb-3 mb-lg-3"
                                    />
                                )
                                : (
                                    <HeaderMain
                                        title={(t("ApprovalDetails"))}
                                        className="mb-3 mb-lg-3"
                                    />
                                )
                        }
                    </Col>
                </Row>
                <Row className="mb-5">
                    <Col lg={12}>
                        <Formik
                            enableReinitialize
                            initialValues={_.isEmpty(form) ? initialValues : form}
                            validationSchema={validationSchema}
                            onSubmit={() => { }}
                        >
                            {({
                                errors, values, touched, handleChange, dirty, setFieldValue, handleSubmit
                            }) => {
                                useEffect(() => {
                                    if (form.uuid) {
                                        let { goodReceivers } = _.cloneDeep(form);
                                        const { approvalRange, featureUuid } = _.cloneDeep(form);

                                        approvalRange.forEach((range, index) => {
                                            approvalRange[index].rangeFrom = convertNumber(
                                                range.rangeFrom
                                            );
                                            approvalRange[index].rangeTo = convertNumber(
                                                range.rangeTo
                                            );
                                            let { approvalGroups } = range;
                                            approvalGroups = approvalGroups.map((group) => ({
                                                name: group.group.groupName,
                                                value: group.group.uuid,
                                                numberApprovers: group.numberApprovers,
                                                sumUser: group?.group?.groupUserList?.length,
                                                groupList: group?.group?.groupUserList,
                                                type: group?.group?.singleUserGroup ? "user" : "group"
                                            }));
                                            approvalRange[index].approvalGroups = approvalGroups;
                                        });
                                        setFieldValue("approvalRange", approvalRange);
                                        goodReceivers = goodReceivers.map((receiver) => ({
                                            name: receiver.name,
                                            value: receiver.userUuid
                                        }));
                                        setFieldValue("goodReceivers", goodReceivers);
                                        setFieldValue("approvalFor", featureUuid);
                                        setFieldValue("approvalLevel", approvalRange.length);
                                    }
                                }, [form]);

                                useEffect(() => {
                                    if (form.uuid && detailsStates.features?.length > 0) {
                                        const {
                                            featureUuid, featureName, featureCode
                                        } = _.cloneDeep(form);
                                        if (!detailsStates.features.find(
                                            (item) => item.uuid === featureUuid
                                        )) {
                                            setDetailsStates((prevStates) => ({
                                                ...prevStates,
                                                features: [...detailsStates.features, {
                                                    uuid: featureUuid,
                                                    featureName,
                                                    featureCode
                                                }]
                                            }));
                                        }
                                    }
                                }, [form, detailsStates.features]);

                                return (
                                    <>
                                        <Form>
                                            <ApprovalMatrixForm
                                                errors={errors}
                                                values={values}
                                                touched={touched}
                                                handleChange={handleChange}
                                                dirty={dirty}
                                                setFieldValue={setFieldValue}
                                                isCreate={isCreate}
                                                isEdit={isEdit}
                                                headerName={isCreate ? t("NewApprovalItem") : t("ApprovalDetails")}
                                                userList={userList}
                                                groupList={groupList}
                                                userGroupList={userGroupList}
                                                features={detailsStates.features}
                                            />
                                            <StickyFooter>
                                                <Row className="mx-0 px-3 justify-content-between">
                                                    <Button
                                                        className="mb-2"
                                                        color="secondary"
                                                        onClick={() => (isEdit
                                                            ? onBackButtonPressHandler()
                                                            : history.goBack())}
                                                    >
                                                        {t("Back")}
                                                    </Button>
                                                    {
                                                        isCreate ? (
                                                            <Button
                                                                className="mb-2"
                                                                color="primary"
                                                                type="button"
                                                                onClick={
                                                                    () => {
                                                                        handleSubmit();
                                                                        if (!dirty || (dirty && Object.keys(errors).length)) {
                                                                            showToast("error", "Validation error, please check your input.");
                                                                            return;
                                                                        }
                                                                        onSaveApprovalPressHandler(values);
                                                                    }
                                                                }
                                                            >
                                                                {t("Create")}
                                                            </Button>
                                                        ) : (
                                                            <>
                                                                {
                                                                    isEdit ? (
                                                                        handleRolePermission?.write && (
                                                                            <ButtonToolbar>
                                                                                <Button
                                                                                    className="mb-2"
                                                                                    color="primary"
                                                                                    type="button"
                                                                                    onClick={
                                                                                        () => {
                                                                                            handleSubmit();
                                                                                            if (!dirty || (dirty && Object.keys(errors).length)) {
                                                                                                showToast("error", "Validation error, please check your input.");
                                                                                                return;
                                                                                            }
                                                                                            onSaveApprovalPressHandler(values);
                                                                                        }
                                                                                    }
                                                                                >
                                                                                    {t("Save")}
                                                                                </Button>
                                                                            </ButtonToolbar>
                                                                        )
                                                                    ) : (
                                                                        handleRolePermission?.write && (
                                                                            <Button className="mb-2 btn-facebook btn-secondary" onClick={toggleEdit}>
                                                                                {`${t("Edit")} `}
                                                                                <i className="fa fa-pencil ml-1" />
                                                                            </Button>
                                                                        )
                                                                    )
                                                                }
                                                            </>
                                                        )
                                                    }
                                                </Row>
                                            </StickyFooter>
                                        </Form>
                                    </>
                                );
                            }}
                        </Formik>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default ApprovalMatrixDetails;
