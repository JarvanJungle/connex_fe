/* eslint-disable import/prefer-default-export */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable max-len */
import React from "react";
import PropTypes from "prop-types";
import {
    UncontrolledDropdown,
    DropdownToggle,
    ExtendedDropdown,
    ListGroup,
    ListGroupItem,
    Media
} from "../../components";

const LOGO = require("../../images/logos/Doxa holdings 1.png");

const SidebarCompany = ({ onChangeCompany, companies, companyLogo }, props) => (
    <>
        {!(companies && companies.length === 1 && companies[0].companies === null) && (
            <UncontrolledDropdown nav inNavbar {...props} style={{ border: "1px solid rgba(0, 0, 0, 0.05)", listStyleType: "none" }}>
                <DropdownToggle nav caret>
                    <img src={companyLogo || LOGO} height="55" alt="logo" />
                </DropdownToggle>

                <ExtendedDropdown>
                    <ExtendedDropdown.Section list>
                        <ListGroup>
                            {companies.map((companyRole) => (
                                <ListGroupItem tag={ExtendedDropdown.Link} key={companyRole.companyUuid} action>
                                    <Media>
                                        <Media body>
                                            <p className="mt-2 mb-1" onClick={() => onChangeCompany(companyRole.companyUuid)}>
                                                <img
                                                    src={companyRole.logoUrl || LOGO}
                                                    style={{ height: "70px" }}
                                                    alt="logo"
                                                />
                                            </p>
                                        </Media>
                                    </Media>
                                </ListGroupItem>
                            ))}
                        </ListGroup>
                    </ExtendedDropdown.Section>
                </ExtendedDropdown>
            </UncontrolledDropdown>
        )}
    </>
);

SidebarCompany.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    onChangeCompany: PropTypes.func,
    companies: PropTypes.array
};

export { SidebarCompany };
