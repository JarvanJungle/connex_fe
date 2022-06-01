import React from "react";
import {
    Row,
    Card,
    CardBody,
    CardHeader,
    Col
} from "components";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const LoadingRowInput = () => (
    <Row className="d-lg-flex form-group">
        <Col lg={6}>
            <Row className="d-lg-flex">
                <Col md={4} lg={4}>
                    <Skeleton height={24} width={100} />
                </Col>
                <Col md={8} lg={8}>
                    <Skeleton height={36} width={280} />
                </Col>
            </Row>
        </Col>
        <Col lg={6}>
            <Row className="d-lg-flex">
                <Col md={4} lg={4}>
                    <Skeleton height={24} width={100} />
                </Col>
                <Col md={8} lg={8}>
                    <Skeleton height={36} width={280} />
                </Col>
            </Row>
        </Col>
    </Row>
);

const Loading = () => (
    <SkeletonTheme duration={5}>
        <Skeleton height={42} width={200} className="mb-4" />
        <Row className="mb-4">
            <Col lg={12}>
                <Card className="mb-4">
                    <CardHeader tag="h6">
                        <Skeleton height={28} width={150} />
                    </CardHeader>
                    <CardBody>
                        <Row className="d-lg-flex align-items-center form-group">
                            <Col lg={6}>
                                <Row>
                                    <Col md={4} lg={4}>
                                        <Skeleton height={24} width={80} />
                                    </Col>
                                    <Col md={8} lg={8}>
                                        <Row className="d-lg-flex align-items-center">
                                            <Col lg={3}>
                                                <Skeleton height={20} width={20} />
                                            </Col>
                                            <Col lg={3}>
                                                <Skeleton height={20} width={20} />
                                            </Col>
                                            <Col lg={6} />
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                            <Col lg={6} />
                        </Row>
                        <LoadingRowInput />
                        <LoadingRowInput />
                        <LoadingRowInput />
                        <LoadingRowInput />
                        <LoadingRowInput />
                    </CardBody>
                </Card>
            </Col>
        </Row>
        <Row className="mb-2">
            <Col lg={12}>
                <Card className="mb-4">
                    <CardHeader tag="h6">
                        <Skeleton height={28} width={150} />
                    </CardHeader>
                    <CardBody>
                        <LoadingRowInput />
                        <Row className="d-lg-flex form-group">
                            <Col lg={6}>
                                <Row className="d-lg-flex">
                                    <Col md={4} lg={4}>
                                        <Skeleton height={24} width={100} />
                                    </Col>
                                    <Col md={8} lg={8}>
                                        <Skeleton height={36} width={280} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col lg={6} />
                        </Row>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    </SkeletonTheme>
);

export default Loading;
