/* eslint-disable max-len */
import React, { useEffect, useRef, useState } from "react";
import {
    Container,
    Button,
    Row,
    Col,
    ButtonToolbar
} from "components";
import useToast from "routes/hooks/useToast";
import { HeaderMain } from "routes/components/HeaderMain";
import CUSTOM_CONSTANTS, {
    RESPONSE_STATUS, PROJECT_FORECAST_ROLES, FEATURE
} from "helper/constantsDefined";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import StickyFooter from "components/StickyFooter";
import * as Yup from "yup";
import {
    Formik, Form
} from "formik";
import ActionModal from "routes/components/ActionModal";
import CurrenciesService from "services/CurrenciesService";
import UserService from "services/UserService";
import AddressService from "services/AddressService";
import ProjectService from "services/ProjectService/ProjectService";
import moment from "moment";
import { formatDateTime } from "helper/utilities";
import { usePermission } from "routes/hooks";
import ProjectDetailsMemberTable from "../components/ProjectDetailsMemberTable";
import ProjectDetailsInformationCard from "../components/ProjectDetailsInformationCard";

const ProjectDetails = () => {
    const showToast = useToast();
    const [projectStates, setProjectStates] = useState({
        listUser: null,
        listAddress: null,
        listCurrency: null,
        isDetail: true,
        isEdit: false
    });
    const [formData, setFormData] = useState(null);
    const [projectDetails, setProjectDetails] = useState(null);
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const refActionModal = useRef(null);
    const projectPermission = usePermission(FEATURE.PROJECT);

    const onUpdateProjectPressHandler = (dirty, errors, values) => {
        if (!dirty || (dirty && Object.keys(errors).length)) {
            showToast("error", "Validation error, please check your input.");
            return;
        }
        setFormData(values);
        refActionModal.current.toggleModal();
    };

    const getDataInit = async () => {
        try {
            const currenciesRes = await CurrenciesService.getCurrencies(
                UserService.getCurrentCompanyUuid()
            );
            if (currenciesRes.data.status !== RESPONSE_STATUS.OK) {
                showToast("error", currenciesRes.data.message);
                return;
            }
            const addressesRes = await AddressService.getCompanyAddresses(
                UserService.getCurrentCompanyUuid()
            );
            if (addressesRes.data.status !== RESPONSE_STATUS.OK) {
                showToast("error", addressesRes.data.message);
                return;
            }
            const usersRes = await UserService.getCompanyUsers(UserService.getCurrentCompanyUuid());
            if (usersRes.data.status !== RESPONSE_STATUS.OK) {
                showToast("error", usersRes.data.message);
                return;
            }

            const listUser = [];
            usersRes.data.data.forEach((user) => {
                listUser.push({
                    userUuid: user.uuid,
                    userName: user.name
                });
            });

            setProjectStates((prevStates) => ({
                ...prevStates,
                listUser,
                listAddress: addressesRes.data.data,
                listCurrency: currenciesRes.data.data
            }));

            const query = new URLSearchParams(location.search);
            const projectCode = query.get("projectCode");
            if (projectCode) {
                const resProjectDetail = await ProjectService.getProjectDetails(projectCode);
                if (resProjectDetail.data.status === RESPONSE_STATUS.OK) {
                    setProjectDetails(resProjectDetail.data.data);
                } else {
                    showToast("error", resProjectDetail.data.message);
                }
            }
        } catch (error) {
            showToast("error", error.message || error);
        }
    };

    const cancelEdit = () => {
        setProjectStates((prevStates) => ({
            ...prevStates,
            isEdit: false
        }));
        getDataInit();
    };

    useEffect(() => {
        getDataInit();
    }, []);

    const initialValues = {
        companyUuid: "",
        projectCode: "",
        erpProjectCode: "",
        projectTitle: "",
        startDate: "",
        endDate: "",
        currency: "",
        draftStatus: false,
        overallBudget: "",
        issuedPoBudget: "",
        approvedPrBudget: "",
        addressUuid: "",
        addressFirstLine: "",
        addressSecondLine: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        projectDescription: "",
        projectInCharge: "",
        projectInChargeRemarks: "",
        projectAdmin: "",
        projectAdminRemarks: "",
        projectTeamMember: [],
        projectTeamMemberRemarks: ""
    };

    const validationSchema = Yup.object().shape({
        projectTitle: Yup.string()
            .required(t("PleaseEnterValidProjectTitle")),
        startDate: Yup.date()
            .required(t("PleaseSelectValidStartDate")),
        endDate: Yup.date().min(
            Yup.ref("startDate"), t("EndDateShouldBeGreaterThanStartDate")
        )
            .required(t("PleaseSelectValidEndDate")),
        currency: Yup.string()
            .required(t("PleaseEnterValidCurrency")),
        draftStatus: false,
        overallBudget: Yup.number()
            .required(t("PleaseEnterValidOverallBudget")),
        addressUuid: Yup.string()
            .required(t("PleaseSelectValidAddress")),
        projectDescription: Yup.string()
            .required(t("PleaseEnterValidProjectDescription")),
        projectInCharge: Yup.string()
            .required(t("PleaseSelectUser")),
        projectAdmin: Yup.string()
            .required(t("PleaseSelectUser"))
    });

    const getUser = (uuid) => projectStates.listUser.find((user) => user.userUuid === uuid);

    const handleCreateProject = async () => {
        const body = { ...formData };

        body.companyUuid = UserService.getCurrentCompanyUuid();
        body.startDate = moment(new Date(formData.startDate)).format(CUSTOM_CONSTANTS.DDMMYYYY);
        body.endDate = moment(new Date(formData.endDate)).format(CUSTOM_CONSTANTS.DDMMYYYY);
        body.projectUserDtoList = [];

        const projectAdmin = getUser(formData.projectAdmin);
        const projectInCharge = getUser(formData.projectInCharge);
        body.projectUserDtoList.push({
            userUuid: projectAdmin?.userUuid,
            userName: projectAdmin?.userName,
            projectUserRole: PROJECT_FORECAST_ROLES.PROJECT_ADMIN,
            remarks: formData.projectAdminRemarks
        });
        body.projectUserDtoList.push({
            userUuid: projectInCharge?.userUuid,
            userName: projectInCharge?.userName,
            projectUserRole: PROJECT_FORECAST_ROLES.PROJECT_IN_CHARGE,
            remarks: formData.projectInChargeRemarks
        });
        formData.projectTeamMember.forEach((user) => {
            body.projectUserDtoList.push({
                userUuid: user?.userUuid,
                userName: user?.userName,
                projectUserRole: PROJECT_FORECAST_ROLES.PROJECT_TEAM_MEMBER,
                remarks: formData.projectTeamMemberRemarks
            });
        });

        delete body.projectTeamMemberRemarks;
        delete body.projectInChargeRemarks;
        delete body.projectAdminRemarks;
        delete body.addressFirstLine;
        delete body.addressSecondLine;
        delete body.country;
        delete body.postalCode;
        delete body.projectAdmin;
        delete body.currency;
        delete body.projectInCharge;
        delete body.projectTeamMember;
        delete body.state;
        delete body.city;
        delete body.overallBudget;

        ProjectService.updateProjectDetails(body).then((res) => {
            if (res.data.status === RESPONSE_STATUS.OK) {
                showToast("success", "Project details is updated successfully");
                setProjectStates((prevStates) => ({
                    ...prevStates,
                    isEdit: false
                }));
            } else {
                showToast("error", res.data.message);
            }
        }).catch((error) => showToast("error", error.message || error));
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("ProjectDetails")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={() => { }}
            >
                {({
                    errors, values, touched, handleChange, dirty, setFieldValue, setErrors, handleSubmit
                }) => {
                    useEffect(() => {
                        if (projectDetails) {
                            setFieldValue("projectCode", projectDetails.projectCode);
                            setFieldValue("projectTitle", projectDetails.projectTitle);
                            setFieldValue("startDate", formatDateTime(
                                projectDetails.startDate,
                                CUSTOM_CONSTANTS.YYYYMMDD
                            ));
                            setFieldValue("endDate", formatDateTime(
                                projectDetails.endDate,
                                CUSTOM_CONSTANTS.YYYYMMDD
                            ));
                            setFieldValue("currency", projectDetails.currency);
                            setFieldValue("erpProjectCode", projectDetails.erpProjectCode);
                            setFieldValue("addressUuid", projectDetails.projectAddressDto?.uuid);
                            setFieldValue("addressFirstLine", projectDetails.projectAddressDto?.addressFirstLine);
                            setFieldValue("addressSecondLine", projectDetails.projectAddressDto?.addressSecondLine);
                            setFieldValue("state", projectDetails.projectAddressDto?.state);
                            setFieldValue("country", projectDetails.projectAddressDto?.country);
                            setFieldValue("city", projectDetails.projectAddressDto?.city);
                            setFieldValue("postalCode", projectDetails.projectAddressDto?.postalCode);
                            setFieldValue("projectDescription", projectDetails.projectDescription);
                            setFieldValue("overallBudget", projectDetails.overallBudget);
                            setFieldValue("issuedPoBudget", projectDetails.issuedPoBudget);
                            setFieldValue("approvedPrBudget", projectDetails.approvedPrBudget);
                            projectDetails.projectUserDtoList.forEach((user) => {
                                switch (user.projectUserRole) {
                                case PROJECT_FORECAST_ROLES.PROJECT_ADMIN:
                                    setFieldValue("projectAdmin", user.userUuid);
                                    setFieldValue("projectAdminRemarks", user.remarks);
                                    break;
                                case PROJECT_FORECAST_ROLES.PROJECT_IN_CHARGE:
                                    setFieldValue("projectInCharge", user.userUuid);
                                    setFieldValue("projectInChargeRemarks", user.remarks);
                                    break;
                                default:
                                    break;
                                }
                            });

                            let projectTeamMembers = projectDetails.projectUserDtoList.filter(
                                // eslint-disable-next-line max-len
                                (user) => user.projectUserRole === PROJECT_FORECAST_ROLES.PROJECT_TEAM_MEMBER
                            );

                            if (projectTeamMembers.length > 0) {
                                setFieldValue("projectTeamMemberRemarks", projectTeamMembers[0].remarks);
                                projectTeamMembers = projectTeamMembers.map((user) => ({
                                    userUuid: user.userUuid,
                                    userName: user.userName
                                }));
                                setFieldValue("projectTeamMember", projectTeamMembers);
                            }
                        }
                    }, [projectDetails]);

                    return (
                        <Form>
                            {/* Project Information */}
                            {
                                projectStates.listAddress && projectStates.listCurrency
                                && (
                                    <Row className="mb-3">
                                        <Col lg={12}>
                                            <ProjectDetailsInformationCard
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                addresses={projectStates.listAddress}
                                                currencies={projectStates.listCurrency}
                                                isDetail
                                                isEdit={projectStates.isEdit}
                                            />
                                        </Col>
                                    </Row>
                                )
                            }

                            {/* Project Members */}
                            {
                                projectStates.listUser
                                && (
                                    <Row style={{ marginBottom: 64 }}>
                                        <Col lg={12}>
                                            <ProjectDetailsMemberTable
                                                t={t}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                handleChange={handleChange}
                                                setFieldValue={setFieldValue}
                                                users={projectStates.listUser}
                                                isDetail
                                                isEdit={projectStates.isEdit}
                                            />
                                        </Col>
                                    </Row>
                                )
                            }

                            {/* Footer */}
                            <StickyFooter>
                                <Row className="mx-0 px-3 justify-content-between">
                                    <Button
                                        color="secondary"
                                        onClick={() => history.goBack()}
                                    >
                                        {t("Back")}
                                    </Button>
                                    {projectPermission.write && (
                                        projectStates.isEdit
                                            ? (
                                                <ButtonToolbar>
                                                    <Button
                                                        color="primary"
                                                        type="button"
                                                        onClick={() => {
                                                            handleSubmit();
                                                            onUpdateProjectPressHandler(dirty, errors, values);
                                                        }}
                                                    >
                                                        {t("Save")}
                                                    </Button>
                                                </ButtonToolbar>
                                            ) : (
                                                !projectDetails?.projectStatus?.includes("Closed") && (
                                                    <ButtonToolbar>
                                                        <Button
                                                            className="px-3 btn-facebook"
                                                            onClick={() => {
                                                                setErrors({});
                                                                setProjectStates((prevStates) => ({
                                                                    ...prevStates,
                                                                    isEdit: true
                                                                }));
                                                            }}
                                                        >
                                                            {t("Edit")}
                                                            <i className="ml-1 fa fa-pencil" />
                                                        </Button>
                                                    </ButtonToolbar>
                                                )
                                            )
                                    )}
                                </Row>
                            </StickyFooter>
                        </Form>
                    );
                }}
            </Formik>

            <ActionModal
                ref={refActionModal}
                title={t("Update Project")}
                body="Do you wish to update this project?"
                button="Yes"
                color="primary"
                textCancel="Cancel"
                action={handleCreateProject}
            />
        </Container>
    );
};

export default ProjectDetails;
