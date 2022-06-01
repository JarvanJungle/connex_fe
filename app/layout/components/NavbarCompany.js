import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

import {
    UncontrolledDropdown,
    DropdownToggle,
    IconOnly,
    ExtendedDropdown,
    ListGroup,
    ListGroupItem,
    Media
} from "../../components";

const NavbarCompany = (props) => {
    const { t, i18n } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const [companies, setCompanies] = useState([]);
    const history = useHistory();

    useEffect(() => {
        if (authReducer && authReducer.userDetails?.companies?.length > 0) {
            setCompanies(authReducer.userDetails.companies);
        }
    }, [authReducer]);

    const changeCompany = (companyUuid) => {
        const company = companies.filter((companyRole) => companyRole.companyUuid === companyUuid);
        localStorage.setItem("companyRole", JSON.stringify(company[0]));
        history.push("/dashboard");
    };

    return (
        <>
            {
                !(companies.length === 1 && companies[0].companies === null)
            && (
                <UncontrolledDropdown nav inNavbar {...props}>
                    <DropdownToggle nav>
                        <IconOnly>
                            <i className="fa fa-building-o" />
                        </IconOnly>
                    </DropdownToggle>
                    <ExtendedDropdown right>
                        <ExtendedDropdown.Section className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">{t("Companies")}</h6>
                        </ExtendedDropdown.Section>
                        <ExtendedDropdown.Section list>
                            <ListGroup>
                                {companies.map((companyRole) => (
                                    <ListGroupItem tag={ExtendedDropdown.Link} key={companyRole.companyUuid} action>
                                        <Media>
                                            <Media body>
                                                <p className="mt-2 mb-1" onClick={() => changeCompany(companyRole.companyUuid)}>
                                                    { companyRole.companyName }
                                                </p>
                                            </Media>
                                        </Media>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        </ExtendedDropdown.Section>
                    </ExtendedDropdown>
                </UncontrolledDropdown>
            )
            }
        </>
    );
};

NavbarCompany.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object
};

export { NavbarCompany };
