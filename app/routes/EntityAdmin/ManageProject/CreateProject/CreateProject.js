import React, { useEffect, useRef, useState } from "react";
import {
    Container,
    Button,
    Row,
    Col
} from "components";
import useToast from "routes/hooks/useToast";
import { HeaderMain } from "routes/components/HeaderMain";
import CUSTOM_CONSTANTS, {
    RESPONSE_STATUS,
    PROJECT_FORECAST_ROLES
} from "helper/constantsDefined";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
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
import URL_MANAGE_PROJECT from "services/ProjectService/url";
import ProjectDetailsMemberTable from "../components/ProjectDetailsMemberTable";
import ProjectDetailsInformationCard from "../components/ProjectDetailsInformationCard";

const CreateProject = () => {
    const showToast = useToast();
    const [projectStates, setProjectStates] = useState({
        listUser: null,
        listAddress: null,
        listCurrency: null
    });
    const [formData, setFormData] = useState(null);
    const { t } = useTranslation();
    const history = useHistory();
    const refActionModal = useRef(null);

    const onSaveProjectPressHandler = (values) => {
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
        } catch (error) {
            showToast("error", error.message || error);
        }
    };

    useEffect(() => {
        getDataInit();
    }, []);

    const initialValues = {
        companyUuid: "",
        projectCode: "",
        projectTitle: "",
        erpProjectCode: "",
        startDate: "",
        endDate: "",
        currency: "",
        draftStatus: false,
        overallBudget: "",
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
        // projectCode: Yup.string()
        //     .required(t("PleaseEnterValidProjectCode"))
        //     .test(
        //         "invalid-project-code",
        //         t("ProjectCodeIsInvalid"),
        //         (projectCode) => projectCode.match(/^[a-zA-Z0-9/\-_]+$/)
        //     ),
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
        overallBudget: Yup.string()
            .matches(/^(0*[1-9][0-9]*(\.[0-9]+)?|0+\.[0-9]*[1-9][0-9]*)$/, t("OverallBudgetMustBePositiveNumber"))
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

        delete body.addressFirstLine;
        delete body.addressSecondLine;
        delete body.country;
        delete body.postalCode;
        delete body.projectAdmin;
        delete body.projectInCharge;
        delete body.projectTeamMember;
        delete body.state;
        delete body.city;

        ProjectService.createNewProject(body).then((res) => {
            if (res.data.status === RESPONSE_STATUS.OK) {
                showToast("success", "New project is created successfully");
                history.push(URL_MANAGE_PROJECT.LIST_PROJECT);
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
                        title={t("Create New Project")}
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
                    errors, values, touched, handleChange, dirty, setFieldValue
                }) => (
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
                                <Button
                                    color="primary"
                                    type="submit"
                                    onClick={
                                        () => {
                                            if (!dirty || (dirty && Object.keys(errors).length)) {
                                                showToast("error", "Validation error, please check your input.");
                                                return;
                                            }

                                            onSaveProjectPressHandler(values);
                                        }
                                    }
                                >
                                    {t("Create")}
                                </Button>
                            </Row>
                        </StickyFooter>
                    </Form>
                )}
            </Formik>

            <ActionModal
                ref={refActionModal}
                title={t("CreateNewProject")}
                body="Do you wish to create this project?"
                button="Yes"
                color="primary"
                action={handleCreateProject}
            />
        </Container>
    );
};

export default CreateProject;
