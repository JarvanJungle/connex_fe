import React, { useEffect, useState } from "react";
import {
    Container,
    Button,
    Row,
    Col
} from "components";
import useToast from "routes/hooks/useToast";
import { HeaderMain } from "routes/components/HeaderMain";
import ProjectForecastService from "services/ProjectForecastService";
import { RESPONSE_STATUS, LS_KEYS, FEATURE } from "helper/constantsDefined";
import { getFromLS } from "helper/utilities";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import StickyFooter from "components/StickyFooter";
import URL_CONFIG from "services/urlConfig";
import UserService from "services/UserService";
import { usePermission } from "routes/hooks";
import ProjectDetailsInformationCard from "../components/ProjectDetailsInformationCard";
import ProjectDetailsMemberTable from "../components/ProjectDetailsMemberTable";

const ProjectDetailsForecast = () => {
    const showToast = useToast();
    const [detailsStates, setDetailsStates] = useState({
        isLoading: false,
        projectDetail: null,
        listUser: null
    });
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const forecastPermission = usePermission(FEATURE.PROJECT_FORECAST);

    const onForecastPressHandler = () => {
        const query = new URLSearchParams(location.search);
        const projectCode = query.get("projectCode");
        history.push({
            pathname: URL_CONFIG.PROJECT_FORECAST,
            search: `?projectCode=${projectCode}`
        });
    };

    const getInitData = async (companyUuid, projectCode) => {
        try {
            setDetailsStates((prevStates) => ({
                ...prevStates,
                isLoading: true
            }));
            const res = await ProjectForecastService.getProjectDetail(companyUuid, projectCode);
            if (res.data.status !== RESPONSE_STATUS.OK) {
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                showToast("error", res.data.message);
                return;
            }

            const usersRes = await UserService.getCompanyUsers(companyUuid);
            if (usersRes.data.status !== RESPONSE_STATUS.OK) {
                setDetailsStates((prevStates) => ({
                    ...prevStates,
                    isLoading: false
                }));
                showToast("error", usersRes.data.message);
                return;
            }

            setDetailsStates((prevStates) => ({
                ...prevStates,
                isLoading: false
            }));

            const listUser = [];
            usersRes.data.data.forEach((user) => {
                listUser.push({
                    userUuid: user.uuid,
                    userName: user.name
                });
            });

            setDetailsStates((prevStates) => ({
                ...prevStates,
                projectDetail: res.data.data,
                listUser
            }));
        } catch (error) {
            showToast("error", error);
            await setDetailsStates((prevStates) => ({
                ...prevStates,
                isLoading: false
            }));
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const projectCode = query.get("projectCode");
        const companyRole = getFromLS(LS_KEYS.COMPANY_ROLE);

        if (companyRole.companyUuid && projectCode) {
            getInitData(companyRole.companyUuid, projectCode);
        }
    }, []);

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("ProjectForecastDetails")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    {
                        detailsStates.projectDetail
                        && (
                            <ProjectDetailsInformationCard
                                t={t}
                                detailsStates={detailsStates.projectDetail}
                            />
                        )
                    }
                </Col>
            </Row>

            <Row style={{ marginBottom: 64 }}>
                <Col lg={12}>
                    {
                        detailsStates.projectDetail
                        && detailsStates.projectDetail.projectUserDtoList
                        && (
                            <ProjectDetailsMemberTable
                                t={t}
                                projectUserDtoList={detailsStates.projectDetail.projectUserDtoList}
                                users={detailsStates.listUser}
                            />
                        )
                    }
                </Col>
            </Row>
            <StickyFooter>
                <Row className="justify-content-between px-3 mx-0">
                    <Button
                        color="secondary"
                        className="mb-2 mr-2 px-3"
                        onClick={() => history.goBack()}
                    >
                        {t("Back")}
                    </Button>
                    {forecastPermission.write && (
                        <Button
                            color="primary"
                            className="mb-2 mr-2 px-3"
                            onClick={onForecastPressHandler}
                        >
                            {t("Forecast")}
                        </Button>
                    )}
                </Row>
            </StickyFooter>
        </Container>
    );
};

export default ProjectDetailsForecast;
