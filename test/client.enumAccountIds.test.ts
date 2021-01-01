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

    test('enumerate account ids from star-binding return all accounts except master', async () => {
        const result = await orgClient.enumerateAccountIds({Account: '*'});

        expect(result).toBeDefined();
        expect(result).toContain('11111111112');
        expect(result.length).toBe(9);
        expect(result).not.toContain('111111111111');
    });

    test('enumerate account ids from include-master-binding returns only master', async () => {
        const result = await orgClient.enumerateAccountIds({IncludeMasterAccount: true});

        expect(result).toBeDefined();
        expect(result[0]).toBe('111111111111');
        expect(result.length).toBe(1);
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
