import React from "react";
import { useTranslation } from "react-i18next";

import {
    UncontrolledDropdown,
    DropdownToggle,
    IconOnly,
    ExtendedDropdown,
    ListGroup,
    ListGroupItem,
    Media
} from "../../components";

const NavbarMessages = (props) => {
    const { t, i18n } = useTranslation();
    const Languages = [t("English"), t("Chinese")];
    const changeLanguage = (language) => {
        if (language === Languages[1]) {
            i18n.changeLanguage("cn");
        } else if (language === Languages[0]) {
            i18n.changeLanguage("en");
        }
    };

    return (
        <UncontrolledDropdown nav inNavbar {...props}>
            <DropdownToggle nav>
                <IconOnly>
                    <i className="fa fa-globe fa-fw" />
                </IconOnly>
            </DropdownToggle>
            <ExtendedDropdown right>
                <ExtendedDropdown.Section className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">{t("Languages")}</h6>
                </ExtendedDropdown.Section>
                <ExtendedDropdown.Section list>
                    <ListGroup>
                        {Languages.map((language) => (
                            <ListGroupItem tag={ExtendedDropdown.Link} key={language} action>
                                <Media>
                                    <Media body>
                                        <p className="mt-2 mb-1" onClick={(e) => { e.preventDefault(); changeLanguage(language); }}>
                                            { language }
                                        </p>
                                    </Media>
                                </Media>
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                </ExtendedDropdown.Section>
            </ExtendedDropdown>
        </UncontrolledDropdown>
    );
};

export default NavbarMessages;
