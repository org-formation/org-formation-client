import S3 from "aws-sdk/clients/s3";
import { AccountResource } from "./model";
import { OrgResourceTypes } from "./model/resource-types";
import { IOrganizationBinding, TemplateRoot } from "./parser";
import { PersistedState } from "./persisted-state";


export class Parser {
    private template: TemplateRoot;
    private persistedState: PersistedState;

    constructor(private organizationObject: string, private stateObject: string) {
        this.template = TemplateRoot.createFromContents(organizationObject);
        this.persistedState = PersistedState.Load(stateObject);
    }

    public enumerateAccountIdsFromBinding(binding: IOrganizationBinding) : string[] {
        const logicalAccountIds = this.template.resolveNormalizedLogicalAccountIds(binding);
        const physicalIds = logicalAccountIds.map(x=>this.persistedState.getAccountBinding(x)?.physicalId);
        return physicalIds;
    }

    public getAccountResource(accountId: string) : AccountResource {
        const logicalId = this.persistedState.getLogicalIdForPhysicalId(accountId);
        if (logicalId === undefined) {
            return undefined;
        }

        return this.template.organizationSection.findAccount(x=>x.logicalId === logicalId);
    }

    static async FromS3(s3client: S3, bucketName: string, stateObjectKey: string, organizationObjectKey: string) : Promise<Parser> {
        const stateObject = await s3client.getObject({Bucket: bucketName, Key: stateObjectKey}).promise();
        const stateObjectContents = stateObject.Body.toString();

        const organizationObject = await s3client.getObject({Bucket: bucketName, Key: organizationObjectKey}).promise();
        const organizationObjectContents = organizationObject.Body.toString();

        return new Parser(organizationObjectContents, stateObjectContents);
    }
}