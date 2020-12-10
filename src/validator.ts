import { ConsoleUtil } from './console-util';
import { OrgFormationError } from './org-formation-error';
import { IOrganizationBinding, IResourceRef, ITemplate } from './parser';
import { ResourceUtil } from './resource-util';

export class Validator {


    public static ValidateTemplateRoot(root: ITemplate): void {

        if (root.AWSTemplateFormatVersion === undefined) {
            throw new OrgFormationError('AWSTemplateFormatVersion is missing');
        }
        if ((root.AWSTemplateFormatVersion as any) instanceof Date) {
            const templateVersionDate = (root.AWSTemplateFormatVersion as any) as Date;
            (root.AWSTemplateFormatVersion as string) = ResourceUtil.ToVersion(templateVersionDate);
        }
        if (root.AWSTemplateFormatVersion !== '2010-09-09-OC' && root.AWSTemplateFormatVersion !== '2010-09-09') {
            throw new OrgFormationError(`Unexpected AWSTemplateFormatVersion version ${root.AWSTemplateFormatVersion}, expected '2010-09-09-OC or 2010-09-09'`);
        }
        if (!root.Organization) {
            throw new OrgFormationError('Top level Organization attribute is missing');
        }

        if (root.OrganizationBinding !== undefined) {
            Validator.ValidateOrganizationBinding(root.OrganizationBinding, 'top level OrganizationBinding');
        }

        if (root.DefaultOrganizationBinding !== undefined) {
            Validator.ValidateOrganizationBinding(root.DefaultOrganizationBinding, 'DefaultOrganizationBinding');
        }

        for (const bindingName in root.OrganizationBindings) {
            const binding: IOrganizationBinding = root.OrganizationBindings[bindingName];
            Validator.ValidateOrganizationBinding(binding, `binding ${bindingName}`);
        }

        Validator.ThrowForUnknownAttribute(root, 'template root',
            'AWSTemplateFormatVersion', 'Description', 'Organization', 'OrganizationBinding', 'DefaultOrganizationBinding', 'OrganizationBindings', 'DefaultOrganizationBindingRegion', 'OrganizationBindingRegion',
            'Metadata', 'Parameters', 'Mappings', 'Conditions', 'Resources', 'Outputs', 'Transform');

    }

    public static ValidateOrganizationBinding(binding: IOrganizationBinding, id: string): void {
        if (binding === undefined || binding === null) {
            return;
        }
        if (binding.Account !== undefined) {
            Validator.validateReferenceToAccount(binding.Account, id);
        }
        if (binding.ExcludeAccount !== undefined) {
            Validator.validateReferenceToAccount(binding.ExcludeAccount, id);
        }
        if (binding.OrganizationalUnit !== undefined) {
            Validator.validateReferenceToOU(binding.OrganizationalUnit, id);
        }
        if (binding.IncludeMasterAccount !== undefined) {
            if (typeof binding.IncludeMasterAccount !== 'boolean') {
                throw new OrgFormationError(`expected value for IncludeMasterAccount on ${id} to be boolean (true | false)`);
            }
        }
        if (typeof binding.Region === 'string') {
            Validator.validateRegion(binding.Region);
        } else if (Array.isArray(binding.Region)) {
            for (const element of binding.Region) {
                Validator.validateRegion(element);
            }
        } else if (typeof binding.Region !== 'undefined') {
            throw new OrgFormationError(`expected Region to be a string or string[], found ${typeof binding.Region} (${binding.Region})`);

        }
        Validator.ThrowForUnknownAttribute(binding, id, 'OrganizationalUnit', 'Account', 'ExcludeAccount', 'Region', 'IncludeMasterAccount', 'AccountsWithTag');
    }

    public static ThrowForUnknownAttribute(obj: any, id: string, ...knownAttributes: string[]): void {
        for (const att in obj) {
            if (knownAttributes.indexOf(att) < 0) {
                throw new OrgFormationError(`unexpected attribute ${att} found on ${id}. expected attributes are ${knownAttributes.join(', ')}`);
            }
        }
    }

    public static validateBoolean(val: boolean, name: string): void {
        if (typeof val !== 'boolean' && typeof val !== 'undefined') {
            throw new OrgFormationError(`expected ${name} to be a boolean, found ${typeof val} (${val})`);
        }
    }
    public static validatePositiveInteger(val: number, name: string): void {
        if (!isNaN(val)) {
            if (val < 0) {
                throw new OrgFormationError(`expected ${name} to be a positive integer, found ${val}`);
            }

        } else {
            throw new OrgFormationError(`expected ${name} to be a number, found ${typeof val} (${val})`);
        }
    }

    public static validateRegion(region: string): void {
        if (typeof region !== 'string') {
            throw new OrgFormationError(`region ${region} expected to be string, found ${typeof region}`);

        }
    }

    private static validateReferenceToAccount(resourceRefs: IResourceRef | IResourceRef[], id: string): void {
        if (resourceRefs === undefined) { return; }

        const validateSingleReference = (elm: any): void => {
            if (typeof elm === 'string') {
                if (elm.match(/\d{12}/)) {
                    throw new OrgFormationError(`Invalid account binding ${elm} on ${id}. Directly binding on accountId is not supported, use !Ref logicalId instead.`);
                } else if (elm !== '*') {
                    throw new OrgFormationError(`Invalid account binding ${elm} on ${id}. Expected literal '*' or !Ref logicalId.`);
                }
            } else if (typeof elm === 'object') {
                Validator.ThrowForUnknownAttribute(elm, `account binding ${id}`, 'Ref');
            } else {
                throw new OrgFormationError(`Unexpected type ${typeof elm} found on account binding ${id}. expected either string or object`);
            }
        };

        if (Array.isArray(resourceRefs)) {
            for (const elm of resourceRefs) {
                validateSingleReference(elm);
            }
        } else {
            validateSingleReference(resourceRefs);
        }
    }

    private static validateReferenceToOU(resourceRefs: IResourceRef | IResourceRef[], id: string): void {
        const validateSingleReference = (elm: any): void => {
            if (typeof elm === 'string') {
                if (elm.match(/\d{12}/)) {
                    throw new OrgFormationError(`Invalid organizational unit binding ${elm} on ${id}. Expected literal '*' or !Ref logicalId.`);
                }
            } else if (typeof elm === 'object') {
                Validator.ThrowForUnknownAttribute(elm, `organizational unit binding ${id}`, 'Ref');
            } else {
                throw new OrgFormationError(`Unexpected type ${typeof elm} found on organizational unit binding ${id}. expected either string or object`);
            }
        };

        if (Array.isArray(resourceRefs)) {
            for (const elm of resourceRefs) {
                validateSingleReference(elm);
            }
        } else {
            validateSingleReference(resourceRefs);
        }
    }
}
