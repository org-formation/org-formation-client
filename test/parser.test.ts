import { readFileSync } from 'fs';
import { Parser } from '../src';


describe('when parsing basic organization and state file', () => {
    let parser: Parser;

    beforeEach(() => {
        const organizationObject = readFileSync('./test/resources/organization.yml').toString();
        const stateObject = readFileSync('./test/resources/state.yml').toString();

        parser = new Parser(organizationObject, stateObject);
    })

    test('enumerate account ids from star-binding return all accounts except master', () => {
        const result = parser.enumerateAccountIdsFromBinding({Account: '*'});

        expect(result).toBeDefined();
        expect(result).toContain('11111111112');
        expect(result.length).toBe(9);
        expect(result).not.toContain('11111111111');
    });

    test('enumerate account ids from include-master-binding returns only master', () => {
        const result = parser.enumerateAccountIdsFromBinding({IncludeMasterAccount: true});
        expect(result).toBeDefined();
        expect(result[0]).toBe('111111111111');
        expect(result.length).toBe(1);
    });

});