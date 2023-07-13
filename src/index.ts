import { Organizations } from "@aws-sdk/client-organizations";
import { AccountResource } from "./model";
import { IOrganizationBinding, TemplateRoot } from "./parser";
import { PersistedState } from "./persisted-state";
import { S3, S3ClientConfig } from "@aws-sdk/client-s3";

export interface OrgFormationClientConfiguration extends S3ClientConfig {
    stateBucketName?: string;
    stateObjectKey?: string;
    organizationObjectKey?: string;
}

export class OrgFormationClient {
    private internalData: InternalData = undefined;

    constructor(private readonly config: OrgFormationClientConfiguration = {}) {
    }

    private async ensureInitialized(): Promise<InternalData> {
        if (this.internalData === undefined) {
            const stateBucketName = this.config.stateBucketName || await this.getDefaultStateBucketName();
            const stateObjectKey = this.config.stateObjectKey || 'state.json';
            const organizationObjectKey = this.config.organizationObjectKey || 'organization.yml';

            this.internalData = await this.getInternalData(stateBucketName, stateObjectKey, organizationObjectKey);
        }
        return this.internalData;
    }

    public async enumerateAccountIds(binding: IOrganizationBinding): Promise<string[]> {
        const data = await this.ensureInitialized();
        const logicalAccountIds = data.template.resolveNormalizedLogicalAccountIds(binding);
        const physicalIds = logicalAccountIds.map(x => data.persistedState.getAccountBinding(x)?.physicalId);
        return physicalIds;
    }

    public async getAccount(accountId: string): Promise<AccountResource> {
        const data = await this.ensureInitialized();
        const logicalId = data.persistedState.getLogicalIdForPhysicalId(accountId);
        if (logicalId === undefined) {
            return undefined;
        }

        const acc = data.template.organizationSection.findAccount(x => x.logicalId === logicalId);
        if (acc === undefined) {
            throw new Error(`unable to find account with name ${logicalId} in organization file. is your state and organization file in synch?`);
        }

        acc.accountId = accountId;

        return acc;
    }

    private async getDefaultStateBucketName(): Promise<string> {
        const organizations = new Organizations({ ...this.config, region: 'us-east-1'});
        const describedOrg = await organizations.describeOrganization({});
        return `organization-formation-${describedOrg.Organization.MasterAccountId}`;
    }

    private async getInternalData(stateBucketName: string, stateObjectKey: string, organizationObjectKey: string): Promise<InternalData> {
        const s3client = new S3(this.config);
        const state = await this.getObjectContents(s3client, stateBucketName, stateObjectKey);
        const organization = await this.getObjectContents(s3client, stateBucketName, organizationObjectKey);

        return {
            template: TemplateRoot.createFromContents(organization),
            persistedState: PersistedState.Load(state)
        };
    }

    private async getObjectContents(s3client: S3, bucketName: string, key: string) {
        const stateObject = await s3client.getObject({ Bucket: bucketName, Key: key });
        return stateObject.Body.toString();
    }
}


interface InternalData {
    template: TemplateRoot;
    persistedState: PersistedState;
}