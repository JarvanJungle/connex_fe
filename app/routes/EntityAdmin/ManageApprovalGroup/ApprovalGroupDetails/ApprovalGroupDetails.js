import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router";
import useToast from "routes/hooks/useToast";
import ApprovalGroupService from "services/ApprovalGroupService";
import {
    Container,
    Col,
    Row,
    Button,
    ButtonToolbar
} from "components";
import StickyFooter from "components/StickyFooter";
import { HeaderMain } from "routes/components/HeaderMain";
import UserService from "services/UserService";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import _ from "lodash";
import { useCurrentCompany, usePermission } from "routes/hooks";
import GroupForm from "./GroupForm";

const ApprovalGroupDetails = (props) => {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const [isCreate, setIsCreate] = useState(true);
    const [isEdit, setIsEdit] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [detailsStates, setDetailsStates] = useState({
        companyUuid: "",
        uuid: ""
    });
    const [userList, setUserList] = useState([]);
    const [form, setForm] = useState({});
    const [backupForm, setBackupForm] = useState({});

    const updateForm = (name, value) => {
        setForm({
            ...form,
            [name]: value
        });
    };
    const currentCompany = useCurrentCompany();

    const handleRolePermission = usePermission(FEATURE.APPROVAL_MATRIX);

    const initialValues = {
        groupName: "",
        groupUserList: [],
        groupDescription: "",
        numberApprovers: 1,
        active: true
    };

    useEffect(() => {
        const query = new URLSearchParams(props.location.search);
        const uuid = query.get("uuid");
        if (uuid) {
            setIsCreate(false);
            setIsEdit(false);
        }

        if (currentCompany) {
            setDetailsStates((prevStates) => ({
                ...prevStates,
                companyUuid: currentCompany.companyUuid,
                uuid
            }));
        }
    }, [currentCompany]);

    const getApprovalGroupDetails = async () => {
        try {
            if (detailsStates.companyUuid && detailsStates.uuid) {
                const groupRes = await ApprovalGroupService.getGroupByUuid(detailsStates.companyUuid, detailsStates.uuid);
                if (groupRes.data.status === RESPONSE_STATUS.OK) {
                    const {
                        groupName,
                        groupDescription,
                        groupUserList,
                        active,
                        numberApprovers
                    } = groupRes.data.data;
                    setForm((prevStates) => ({
                        ...prevStates,
                        uuid: detailsStates.uuid,
                        groupName,
                        groupDescription,
                        groupUserList,
                        active,
                        numberApprovers: numberApprovers === null
                            ? groupUserList.length : numberApprovers
                    }));
                    setBackupForm((prevStates) => ({
                        ...prevStates,
                        uuid: detailsStates.uuid,
                        groupName,
                        groupDescription,
                        groupUserList,
                        active,
                        numberApprovers: numberApprovers === null
                            ? groupUserList.length : numberApprovers
                    }));
                } else {
                    throw new Error(groupRes.data.message);
                }
            }

            if (detailsStates.companyUuid) {
                const companyUsersRes = await UserService.getCompanyUsers(detailsStates.companyUuid);
                if (companyUsersRes.data.status === RESPONSE_STATUS.OK) {
                    let companyUserList = companyUsersRes.data.data;
                    companyUserList = companyUserList.map((user) => ({
                        name: user.name,
                        uuid: user.uuid
                    }));
                    setUserList(companyUserList);
                } else {
                    throw new Error(companyUsersRes.data.message);
                }
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        getApprovalGroupDetails();
    }, [detailsStates]);

    const toggleEdit = () => {
        setIsEdit(!isEdit);
    };

    const onBackButtonPressHandler = () => {
        if (isEdit) {
            setIsEdit(!isEdit);
            setForm(backupForm);
        }
    };

    const handleCreateOrUpdate = async (values) => {
        const {
            groupName,
            groupDescription,
            active,
            numberApprovers
        } = values;
        let { groupUserList } = values;
        groupUserList = groupUserList?.map((user) => ({
            userUuid: user.value,
            name: user.name
        }));
        const number = groupUserList.length;

        setIsLoading(true);
        try {
            if (isCreate) {
                const response = await ApprovalGroupService.createGroup(detailsStates.companyUuid, {
                    groupName, groupDescription, groupUserList, active, numberApprovers: number
                });
                if (response.data.status === RESPONSE_STATUS.OK) {
                    setIsLoading(false);
                    showToast("success", response.data.message);
                    setTimeout(() => {
                        history.goBack();
                    }, 1000);
                } else {
                    throw new Error(response.data.message);
                }
            } else if (isEdit) {
                const response = await ApprovalGroupService.updateGroup(detailsStates.companyUuid, {
                    groupName,
                    groupDescription,
                    groupUserList,
                    uuid: detailsStates.uuid,
                    active,
                    numberApprovers: number
                });
                if (response.data.status === RESPONSE_STATUS.OK) {
                    setIsLoading(false);
                    showToast("success", response.data.message);
                    setIsEdit(false);
                    getApprovalGroupDetails();
                } else {
                    throw new Error(response.data.message);
                }
            }
        } catch (error) {
            setIsLoading(false);
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onSaveGroupPressHandler = (values) => {
        setForm(values);
        handleCreateOrUpdate(values);
    };

    const validationSchema = Yup.object().shape({
        groupName: Yup.string().required(t("ApprovalGroupNameIsRequired")),
        groupUserList: Yup.array().min(1, t("ApprovalGroupApproverIsRequired"))
        // numberApprovers: Yup.number()
        //     .min(1, t("Min No. of Approvers must be greater than 1"))
        //     .required(t("Min No. of Approvers is required"))
        //     .when("groupUserList", (groupUserList, schema) => schema.max(groupUserList.length, t("Min No. of Approvers must be less than or equal to Selected Approvers")))
    });

    return (
        <>
            <Container fluid>
                <Row className="mb-1">
                    <Col lg={12}>
                        {
                            location.pathname === "/create-approval-groups"
                                ? (
                                    <HeaderMain
                                        title={(t("CreateApprovalGroup"))}
                                        className="mb-3 mb-lg-3"
                                    />
                                )
                                : (
                                    <HeaderMain
                                        title={(t("ApprovalGroupDetails"))}
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
                                        let {
                                            groupName,
                                            groupDescription,
                                            groupUserList,
                                            active,
                                            numberApprovers
                                        } = form;
                                        groupUserList = groupUserList.map((user) => ({
                                            name: user.name,
                                            value: user.userUuid
                                        }));
                                        setFieldValue("groupName", groupName);
                                        setFieldValue("groupDescription", groupDescription);
                                        setFieldValue("groupUserList", groupUserList);
                                        setFieldValue("active", active);
                                        setFieldValue("numberApprovers", numberApprovers);
                                    }
                                }, [form]);
                                return (
                                    <>
                                        { userList
                                        && (
                                            <Form>
                                                <GroupForm
                                                    headerName={isCreate ? t("NewApprovalGroupItem") : t("ApprovalGroupDetails")}
                                                    isCreate={isCreate}
                                                    isEdit={isEdit}
                                                    form={form}
                                                    updateForm={updateForm}
                                                    userList={userList}
                                                    validationSchema={validationSchema}
                                                    errors={errors}
                                                    values={values}
                                                    touched={touched}
                                                    handleChange={handleChange}
                                                    dirty={dirty}
                                                    setFieldValue={setFieldValue}
                                                />
                                                <StickyFooter>
                                                    <Row className="mx-0 px-3 justify-content-between">
                                                        <Button
                                                            color="secondary"
                                                            className="mb-2 btn"
                                                            onClick={
                                                                isEdit
                                                                    ? onBackButtonPressHandler
                                                                    : () => history.goBack()
                                                            }
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
                                                                            if (!_.isEmpty(errors)) {
                                                                                showToast("error", "Validation error, please check your input.");
                                                                                return;
                                                                            }
                                                                            onSaveGroupPressHandler(values);
                                                                        }
                                                                    }
                                                                    disabled={isLoading}
                                                                >
                                                                    {t("Create")}
                                                                </Button>
                                                            ) : (
                                                                <>
                                                                    {
                                                                        isEdit ? (
                                                                            <ButtonToolbar>
                                                                                <Button
                                                                                    className="mb-2"
                                                                                    color="primary"
                                                                                    type="button"
                                                                                    onClick={
                                                                                        () => {
                                                                                            handleSubmit();
                                                                                            if (!_.isEmpty(errors)) {
                                                                                                showToast("error", "Validation error, please check your input.");
                                                                                                return;
                                                                                            }
                                                                                            onSaveGroupPressHandler(values);
                                                                                        }
                                                                                    }
                                                                                    disabled={isLoading}
                                                                                >
                                                                                    {t("Save")}
                                                                                </Button>
                                                                            </ButtonToolbar>
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
                                        )}
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

export default ApprovalGroupDetails;
