import PropTypes from "prop-types";

class PPRDetailModel {
    constructor(
        companyUuid,
        pprTitle,
        currencyCode,
        procurementType,
        project,
        projectCode,
        approvalCode,
        approvalCodeUuid,
        pprNumber,
        status,
        approvalSequence,
        note,
        requesterName,
        requesterUuid
    ) {
        this.companyUuid = companyUuid;
        this.pprTitle = pprTitle;
        this.currencyCode = currencyCode;
        this.procurementType = procurementType;
        this.project = project;
        this.projectCode = projectCode;
        this.approvalCode = approvalCode;
        this.approvalCodeUuid = approvalCodeUuid;
        this.pprNumber = pprNumber;
        this.status = status;
        this.approvalSequence = approvalSequence;
        this.note = note;
        this.requesterName = requesterName;
        this.requesterUuid = requesterUuid;
    }
}
