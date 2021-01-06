# AWS Organization Formation Client

A typescript client library for AWS Organization Formation.

## Installation
``` bash
> npm i aws-organization-formation-client
```

## Usage

``` js
const orgClient = new OrgFormationClient( {
    credentials : myCrendialsProvider.resolve(), // works just like any other aws service
    stateBucketName: 'my-state-bucket-name', // default will be organization-formation-${MasterAccountId}
    stateObjectKey: 'state.json', // this is the default
    organizationObjectKey: 'organization.yml', // this is the default
})

```

how to enumerate account ids

``` js
const developmentOUBinding: IOrganizationBinding = { OrganizationalUnit: { Ref: 'DevelopmentOU' } };
const developmentOUAccountIds: string[] = await orgClient.enumerateAccountIds(developmentOUBinding);

const moreComplexBinding: IOrganizationBinding = { IncludeMasterAccount: true, Account: '*', ExcludeAccount: [ { Ref: 'AccountB' } ] };
const moreComplexAccountIds: string[] = await orgClient.enumerateAccountIds(moreComplexBinding);
```
how to retrieve metadata related to an account:
``` js
const account = await orgClient.getAccount('1223123123123');
console.log(account.logicalId);
console.log(account.accountName);
console.log(account.alias);
console.log(account.rootEmail);
console.log(account.tags);
//etc
```