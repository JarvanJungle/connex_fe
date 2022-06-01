
import React from 'react';
import styled from "styled-components";

const Container = styled.div.attrs((props) => ({}))`
    ${(props) => (props.backgroundColor ? `background-color: ${props.backgroundColor}` : '')};
`;

export const StyledContainer = (props) => {
    return <Container {...props} />;
}