import React from "react";
import faker from "faker/locale/en_US";

import {
    Card,
    UncontrolledTooltip,
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button,
    Badge,
    CardBody
} from "components";

import {
    Profile
} from "../Profile";

import { randomArray } from "helper/utilities";

const badgesColors = [
    "info",
    "primary",
    "secondary"
];

const UsersResultsCard = () => (
    <>
        { /* START Card */}
        <Card className="mb-3">
            <CardBody>
                <div className="d-flex">
                    <Button color="link" size="sm" id="tooltipGridAddToFavorites">
                        <i className="fa fa-star-o" />
                    </Button>
                    <UncontrolledTooltip placement="top" target="tooltipGridAddToFavorites">
                        Add To Favorites
                    </UncontrolledTooltip>
                    <UncontrolledButtonDropdown className="ml-auto">
                        <DropdownToggle color="link" size="sm">
                            <i className="fa fa-bars" />
                        </DropdownToggle>
                        <DropdownMenu right>
                            <DropdownItem>
                                <i className="fa fa-fw fa-phone mr-2" />
                                Call
                            </DropdownItem>
                            <DropdownItem>
                                <i className="fa fa-fw fa-comment mr-2" />
                                Chat
                            </DropdownItem>
                            <DropdownItem>
                                <i className="fa fa-fw fa-video-camera mr-2" />
                                Video
                            </DropdownItem>
                            <DropdownItem>
                                <i className="fa fa-fw fa-user mr-2" />
                                Profile
                            </DropdownItem>
                            <DropdownItem>
                                <i className="fa fa-fw fa-pencil mr-2" />
                                Edit
                            </DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem>
                                <i className="fa fa-fw fa-trash mr-2" />
                                Delete
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                </div>
                <Profile />
                <div className="text-center mb-4">
                    <div className="mb-2">
                        <span className="small">
                            Labels
                        </span>
                    </div>
                    <Badge pill color={randomArray(badgesColors)} className="mr-1">
                        { faker.commerce.department() }
                    </Badge>
                    <Badge pill color={randomArray(badgesColors)} className="mr-1">
                        { faker.commerce.department() }
                    </Badge>
                    <Badge pill color={randomArray(badgesColors)}>
                        { faker.commerce.department() }
                    </Badge>
                </div>
                <div className="text-center mb-4">
                    <div className="mb-2">
                        <span className="small">
                            Profile
                        </span>
                    </div>
                    <p className="mb-0">
                        { faker.lorem.paragraph() }
                    </p>
                </div>
            </CardBody>
        </Card>
        { /* END Card */}
    </>
);

export { UsersResultsCard };
