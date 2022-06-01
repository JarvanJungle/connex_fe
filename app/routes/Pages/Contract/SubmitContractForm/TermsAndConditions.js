import { Container, Row, Col, Card, CardBody } from 'components'
import React from 'react'

function TermsAndConditions() {
    return (
       <div>
            <Card className = "mt-3 mb-3" style={{width: '50%'}}>
                <CardBody>
                    <Container>
                        <div className="font-weight-bold"> Terms & Conditions </div>
                        <Row xs="2">
                            <Col>
                                <label>Terms & Conditions</label>
                            </Col>
                            <Col>
                                #########
                            </Col>

                        </Row>
                    </Container>
                </CardBody>
            </Card>
        </div>
    )
}

export default TermsAndConditions
