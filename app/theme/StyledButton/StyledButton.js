
import React from 'react';
import styled from "styled-components";
import { Button } from '../../components';

const CustomButton = styled(Button).attrs((props) => ({}))`
    ${(props) => (props.backgroundColor ? `background-color: ${props.backgroundColor}` : '')};
`;

export const StyledButton = (props) => {
    return <CustomButton {...props} />;
}