import { OrgFormationError } from './org-formation-error';
import { ConsoleUtil } from './console-util';
import { OrgResourceTypes } from './model';

export class PersistedState {
    public static Load(contents: string): PersistedState {
        try {
            let object = {} as IState;
            if (contents && contents.trim().length > 0) {
                object = JSON.parse(contents);
            }
            return new PersistedState(object);
        } catch (err) {
            if (err instanceof SyntaxError) {
                throw new OrgFormationError(`unable to parse state file ${err}`);
            }
            throw err;
        }
    }
    private state: IState;

    constructor(state: IState) {
        this.state = state;
    }

    public getTemplateHash(): string {
        return this.getValue('organization.template.hash');
    }

    public getTemplateHashLastPublished(): string {
        return this.getValue('organization.template-last-published.hash');
    }

    public getValue(key: string): string | undefined {
        return this.state.values?.[key];
    }

    public getAccountBinding(logicalId: string): IBinding | undefined {
        const typeDict = this.state.bindings?.[OrgResourceTypes.MasterAccount];
        if (!typeDict) {
            return this.getBinding(OrgResourceTypes.Account, logicalId);
        }

        const result = typeDict[logicalId];
        if (result === undefined) {
            return this.getBinding(OrgResourceTypes.Account, logicalId);
        }
        return result;
    }

    public getBinding(type: string, logicalId: string): IBinding | undefined {
        const typeDict = this.state.bindings?.[type];
        if (!typeDict) { return undefined; }

        const result = typeDict[logicalId];
        if (result === undefined) {
            ConsoleUtil.LogDebug(`unable to find binding for ${type}/${logicalId}`);
        }
        return result;
    }
}

export interface IState {
    targets?: Record<string, Record<string, Record<string, Record<string, Record<string, Record<string, IGenericTarget<unknown>>>>>>>;
    masterAccountId: string;
    bindings: Record<string, Record<string, IBinding>>;
    stacks: Record<string, Record<string, Record<string, ICfnTarget>>>;
    values: Record<string, string>;
    trackedTasks: Record<string, ITrackedTask[]>;
    previousTemplate: string;
}

export interface IBinding {
    logicalId: string;
    type: string;
    physicalId: string;
    lastCommittedHash: string;
}

export interface ICfnTarget {
    logicalAccountId: string;
    region: string;
    accountId: string;
    stackName: string;
    customRoleName?: string;
    cloudFormationRoleName?: string;
    terminationProtection?: boolean;
    lastCommittedHash: string;
}

export interface IGenericTarget<TTaskDefinition> {
    targetType: string;
    logicalAccountId: string;
    region: string;
    accountId: string;
    logicalName: string;
    organizationLogicalName: string;
    logicalNamePrefix?: string;
    lastCommittedHash: string;
    lastCommittedLocalHash?: string;
    definition: TTaskDefinition;
}

export interface ITrackedTask {
    logicalName: string;
    physicalIdForCleanup: string;
    type: string;
}
