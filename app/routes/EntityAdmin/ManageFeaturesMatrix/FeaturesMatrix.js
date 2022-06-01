/* eslint-disable max-len */
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import useToast from "routes/hooks/useToast";
import UserService from "services/UserService";
import {
    Container,
    Col,
    Row,
    Button
} from "components";
import StickyFooter from "components/StickyFooter";
import { HeaderMain } from "routes/components/HeaderMain";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import FeaturesMatrixService from "services/FeaturesMatrixService/FeaturesMatrixService";
import _ from "lodash";
import { isNullOrUndefinedOrEmpty } from "helper/utilities";
import MatrixSearchForm from "./MatrixSearchForm";
import ModulesTable from "./ModulesTable";
import { usePermission } from "routes/hooks";

const FeaturesMatrix = () => {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const [userList, setUserList] = useState([]);
    const [modules, setModules] = useState([]);
    const [listModules, setListModules] = useState([]);
    const [detailsStates, setDetailsStates] = useState({
        companyUuid: ""
    });
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userPermission } = permissionReducer;
    const [dataChange, setDataChange] = useState(null);
    const handleRolePermission = usePermission(FEATURE.FEATURE_MATRIX);

    useEffect(() => {
        if (permissionReducer && permissionReducer.currentCompany) {
            setDetailsStates((prevStates) => ({
                ...prevStates,
                companyUuid: permissionReducer.currentCompany.companyUuid
            }));
        }
    }, [permissionReducer]);

    const retrieveCompanyData = async () => {
        if (detailsStates.companyUuid) {
            const companyUsersRes = await UserService.getCompanyUsers(detailsStates.companyUuid);
            if (companyUsersRes.data.status === RESPONSE_STATUS.OK) {
                const companyUserList = companyUsersRes.data.data;
                companyUserList?.sort((a, b) => a?.name?.localeCompare(b?.name));
                setUserList(companyUserList);
            } else {
                throw new Error(companyUsersRes.data.message);
            }
        }
    };

    const retrieveModuleData = async () => {
        if (detailsStates.companyUuid) {
            const moduleRes = await FeaturesMatrixService.getListModule(detailsStates.companyUuid);
            if (moduleRes.data.status === RESPONSE_STATUS.OK) {
                const modulesList = moduleRes.data.data;
                modulesList?.sort((a, b) => a?.moduleName?.localeCompare(b?.moduleName));

                setModules(modulesList);
            } else {
                throw new Error(moduleRes.data.message);
            }
        }
    };

    useEffect(() => {
        retrieveCompanyData();
        retrieveModuleData();
    }, [detailsStates]);

    const searchValidationSchema = Yup.object().shape({
        userUuid: Yup.string().required(t("PleaseSelectAnUser"))
    });

    const initialSearchValues = {
        userUuid: "",
        moduleCode: ""
    };

    const initialModulesValues = {
        listModules: []
    };

    const extractCompanyAuthData = (companyAuth) => {
        const grouped = _.groupBy(companyAuth, "moduleCode");
        const listModulesTemp = [];

        Object.keys(grouped).forEach((key) => {
            let features = grouped[key];
            features = features.map((feature) => ({
                feature: feature.feature,
                featureCode: feature.featureCode,
                actions: {
                    read: false,
                    write: false,
                    approve: false
                }
            }));
            listModulesTemp.push({
                moduleCode: key,
                features
            });
        });
        return listModulesTemp;
    };

    const extractUserAuthData = (features) => {
        const grouped = _.groupBy(features, "feature.moduleCode");
        const listModulesTemp = [];
        Object.keys(grouped).forEach((key) => {
            listModulesTemp.push({
                moduleCode: key,
                features: grouped[key]
            });
        });
        return listModulesTemp;
    };

    const onSearchPressHandler = async (values) => {
        try {
            const { userUuid, moduleCode } = values;
            setDetailsStates((prevStates) => ({
                ...prevStates,
                userUuid,
                moduleCode
            }));

            let companyModules = [];

            const companyAuthResponse = await FeaturesMatrixService
                .getCompanyAuthorities(detailsStates.companyUuid);
            if (companyAuthResponse.data.status === RESPONSE_STATUS.OK) {
                const companyData = companyAuthResponse.data.data;
                companyModules = extractCompanyAuthData(companyData);
            } else {
                throw new Error(companyAuthResponse.data.message);
            }
            const userAuthResponse = await FeaturesMatrixService
                .getUserAuthorities(detailsStates.companyUuid, userUuid);
            if (userAuthResponse.data.status === RESPONSE_STATUS.OK) {
                const userData = userAuthResponse.data.data;
                const userModules = extractUserAuthData(userData.filter((ft) => !ft.fromRole));
                const moduleList = companyModules?.map((module) => {
                    const userModule = userModules?.find((m) => module.moduleCode === m.moduleCode);
                    // eslint-disable-next-line no-param-reassign
                    module.features = module?.features?.map((feature) => {
                        // eslint-disable-next-line no-param-reassign
                        feature.actions.read = userModule?.features?.some((ft) => ft.featureCode === feature.featureCode && ft.actions.read);
                        // eslint-disable-next-line no-param-reassign
                        feature.actions.write = userModule?.features?.some((ft) => ft.featureCode === feature.featureCode && ft.actions.write);
                        // eslint-disable-next-line no-param-reassign
                        feature.actions.approve = userModule?.features?.some((ft) => ft.featureCode === feature.featureCode && ft.actions.approve);
                        return feature;
                    });
                    return module;
                })?.filter((module) => moduleCode?.length === 0 || moduleCode?.find((m) => m.value === module.moduleCode));
                setListModules(moduleList);
            } else {
                throw new Error(userAuthResponse.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onSaveFeaturesPressHandler = async (values) => {
        try {
            const featuresList = [];
            values.listModules.forEach((module) => {
                module.features.forEach((feature) => {
                    const actions = [];
                    Object.keys(feature.actions).forEach((key) => {
                        if (feature.actions[key]) {
                            actions.push(key.toUpperCase());
                        }
                    });
                    featuresList.push({
                        featureCode: feature.featureCode,
                        actions
                    });
                });
            });
            await FeaturesMatrixService
                .grantUserAuthorities(detailsStates.companyUuid,
                    detailsStates.userUuid,
                    featuresList);
            showToast("success", t("Assigned features have been updated successfully"));
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const onChangeAction = (action, event, data) => {
        setDataChange({ action, event, data });
    };

    useEffect(() => {
        if (!_.isEmpty(dataChange)) {
            const { action, event, data } = dataChange;
            const { checked } = event.target;
            const { feature: { featureCode }, moduleCode } = data;
            const modulesList = [];
            listModules.forEach((module) => {
                if (module.moduleCode === moduleCode) {
                    const listFeature = module.features.map((item) => {
                        if (item.feature.featureCode === featureCode) {
                            return {
                                ...item,
                                actions: {
                                    ...item.actions,
                                    [action]: checked
                                }
                            };
                        }
                        return item;
                    });
                    modulesList.push({
                        features: listFeature,
                        moduleCode
                    });
                } else {
                    modulesList.push(module);
                }
            });
            setListModules(modulesList);
        }
    }, [dataChange]);

    return (
        <>
            <Container fluid>
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={(t("ManageFeatureMatrix"))}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row className="mb-5">
                    <Col lg={12}>
                        <Formik
                            enableReinitialize
                            initialValues={initialSearchValues}
                            validationSchema={searchValidationSchema}
                            onSubmit={() => { }}
                        >
                            {({
                                errors, values, touched, handleChange, dirty, setFieldValue
                            }) => {
                                useEffect(() => {
                                    setListModules([]);
                                }, [values.userUuid]);
                                return (
                                    <>
                                        <Form>
                                            <MatrixSearchForm
                                                userList={userList}
                                                modules={modules}
                                                onSubmit={onSearchPressHandler}
                                                errors={errors}
                                                values={values}
                                                touched={touched}
                                                handleChange={handleChange}
                                                dirty={dirty}
                                                setFieldValue={setFieldValue}
                                            />
                                        </Form>
                                    </>
                                );
                            }}
                        </Formik>
                        <Formik
                            enableReinitialize
                            initialValues={initialModulesValues}
                            onSubmit={() => { }}
                        >
                            {({
                                errors, values, touched, handleChange, dirty, setFieldValue
                            }) => {
                                useEffect(() => {
                                    setFieldValue("listModules", listModules);
                                }, [listModules]);
                                return (
                                    <>
                                        <Form>
                                            {
                                                listModules.length > 0 && (
                                                    <>
                                                        <ModulesTable
                                                            errors={errors}
                                                            values={values}
                                                            touched={touched}
                                                            handleChange={handleChange}
                                                            dirty={dirty}
                                                            setFieldValue={setFieldValue}
                                                            onChangeAction={onChangeAction}
                                                            modules={modules}
                                                        />
                                                        <StickyFooter>
                                                            <Row className="mx-0 px-3 justify-content-between">
                                                                <Button
                                                                    className="mb-2 btn btn-secondary"
                                                                    onClick={() => history.goBack()}
                                                                >
                                                                    {t("Back")}
                                                                </Button>
                                                                {handleRolePermission?.write && (
                                                                    <Button
                                                                        className="mb-2"
                                                                        color="primary"
                                                                        type="button"
                                                                        onClick={
                                                                            () => onSaveFeaturesPressHandler(
                                                                                values
                                                                            )
                                                                        }
                                                                    >
                                                                        {t("Save")}
                                                                    </Button>
                                                                )}
                                                            </Row>
                                                        </StickyFooter>
                                                    </>
                                                )
                                            }

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

export default FeaturesMatrix;
