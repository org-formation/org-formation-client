import { OrgFormationClient, OrgFormationClientConfiguration } from '../src'
import { TemplateRoot } from '../src/parser';
import { PersistedState } from '../src/persisted-state';

interface OrgFormationClientInternal {
    ensureInitialized(): Promise<{
        template: TemplateRoot;
        persistedState: PersistedState;
    }>,
    getInternalData(stateBucketName: string, stateObjectKey: string, organizationObjectKey: string): Promise<any>,
    getDefaultStateBucketName(): Promise<string>,
};

describe('when initializing org formation client without any config', () => {
    let orgClient: OrgFormationClient;
    let orgClientInternal: OrgFormationClientInternal;
    let getInternalDataSpy: jest.SpyInstance;
    let getDefaultStateBucketName: jest.SpyInstance;

    beforeEach(async () => {
        orgClient = new OrgFormationClient();
        orgClientInternal = orgClient as unknown as OrgFormationClientInternal;
        getInternalDataSpy = jest.spyOn(orgClientInternal, 'getInternalData').mockReturnValue(Promise.resolve({}));
        getDefaultStateBucketName = jest.spyOn(orgClientInternal, 'getDefaultStateBucketName').mockReturnValue(Promise.resolve('organization-formation-123123123123'));

        await orgClientInternal.ensureInitialized();
    })

    test('default stateBucketName is used', () => {
        expect(getInternalDataSpy.mock.calls.length).toBe(1);
        expect(getInternalDataSpy.mock.calls[0][0]).toBe('organization-formation-123123123123');
    });

    test('default stateObjectKey is used', () => {
        expect(getInternalDataSpy.mock.calls.length).toBe(1);
        expect(getInternalDataSpy.mock.calls[0][1]).toBe('state.json');
    });

    test('default organizationObjectKey is used', () => {
        expect(getInternalDataSpy.mock.calls.length).toBe(1);
        expect(getInternalDataSpy.mock.calls[0][2]).toBe('organization.yml');
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
});


describe('when initializing org formation client with specific config', () => {
    let orgClient: OrgFormationClient;
    let orgClientConfig: OrgFormationClientConfiguration;
    let orgClientInternal: OrgFormationClientInternal;
    let getInternalDataSpy: jest.SpyInstance;
    let getDefaultStateBucketName: jest.SpyInstance;
    beforeEach(async () => {
        orgClientConfig = {
            stateBucketName: 'my-custom-bucket-name',
            organizationObjectKey: 'my-org-key.yml',
            stateObjectKey: 'my-state-key.json',
        };
        orgClient = new OrgFormationClient(orgClientConfig);
        orgClientInternal = orgClient as unknown as OrgFormationClientInternal;
        getInternalDataSpy = jest.spyOn(orgClientInternal, 'getInternalData').mockReturnValue(Promise.resolve({}));
        getDefaultStateBucketName = jest.spyOn(orgClientInternal, 'getDefaultStateBucketName').mockReturnValue(Promise.resolve('organization-formation-123123123123'));

        await orgClientInternal.ensureInitialized();
    })

    test('stateBucketName from config is used', () => {
        expect(getInternalDataSpy.mock.calls.length).toBe(1);
        expect(getInternalDataSpy.mock.calls[0][0]).toBe('my-custom-bucket-name');
    });

    test('stateObjectKey from config is used', () => {
        expect(getInternalDataSpy.mock.calls.length).toBe(1);
        expect(getInternalDataSpy.mock.calls[0][1]).toBe('my-state-key.json');
    });

    test('organizationObjectKey from config is used', () => {
        expect(getInternalDataSpy.mock.calls.length).toBe(1);
        expect(getInternalDataSpy.mock.calls[0][2]).toBe('my-org-key.yml');
    });

    test('getDefaultStateBucketName is not called', () => {
        expect(getDefaultStateBucketName).toHaveBeenCalledTimes(0);
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
