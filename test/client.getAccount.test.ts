import { readFileSync } from 'fs';
import { OrgFormationClient } from '../src'
import { TemplateRoot } from '../src/parser';
import { PersistedState } from '../src/persisted-state';

interface OrgFormationClientInternal {
    ensureInitialized(): Promise<{
        template: TemplateRoot;
        persistedState: PersistedState;
    }>,
};

describe('when initializing org formation client with org and state files', () => {
    let orgClient: OrgFormationClient;
    let orgClientInternal: OrgFormationClientInternal;
    let ensureInitializedSpy: jest.SpyInstance;

    beforeEach(async () => {
        orgClient = new OrgFormationClient();
        orgClientInternal = orgClient as unknown as OrgFormationClientInternal;

        const organizationObject = readFileSync('./test/resources/organization.yml').toString();
        const stateObject = readFileSync('./test/resources/state.yml').toString();

        ensureInitializedSpy = jest.spyOn(orgClientInternal, 'ensureInitialized').mockReturnValue(Promise.resolve({
            template: TemplateRoot.createFromContents(organizationObject),
            persistedState: PersistedState.Load(stateObject)
        }));
    })

    test('get account can be used to get master account data', async () => {
        const result = await orgClient.getAccount('111111111111');

        expect(result).toBeDefined();
        expect(result.accountId).toBe('111111111111');
        expect(result.logicalId).toBe('MasterAccount');
        expect(result.accountName).toBe('oc test account 2');
        expect(result.rootEmail).toBe('olaf@email.com');
        expect(result.alias).toBe('org-formation-master');
        expect(result.tags['budget-alarm-threshold']).toBe('200');
    });

    test('get account can be used to get any account data', async () => {
        const result = await orgClient.getAccount('11111111112')

        expect(result).toBeDefined();
        expect(result.accountId).toBe('11111111112');
        expect(result.logicalId).toBe('SharedUsersAccount');
        expect(result.accountName).toBe('Shared Users Account');
        expect(result.rootEmail).toBe('users-2@olafconijn.awsapps.com');
        expect(result.alias).toBe('org-formation-users');
        expect(result.tags['budget-alarm-threshold']).toBe('100');
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
});





 // test('enumerate account ids from star-binding return all accounts except master', () => {
    //     const result = parser.enumerateAccountIdsFromBinding({Account: '*'});

    //     expect(result).toBeDefined();
    //     expect(result).toContain('11111111112');
    //     expect(result.length).toBe(9);
    //     expect(result).not.toContain('11111111111');
    // });

    // test('enumerate account ids from include-master-binding returns only master', () => {
    //     const result = parser.enumerateAccountIdsFromBinding({IncludeMasterAccount: true});
    //     expect(result).toBeDefined();
    //     expect(result[0]).toBe('111111111111');
    //     expect(result.length).toBe(1);
    // });
