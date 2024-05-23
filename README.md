# Lifexplore

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.3.

## Requirements
- Node.js
- npm
- git

## Setup
1. Clone the repository to your local machine
```
git clone git@github.com:klschoef/lifexplore.git
```
2. Install the required dependencies
```
npm install
```
3. Copy the 'src/app/local-config-example.ts' file to 'src/app/local-config.ts' and adjust the values to your needs.
4. Install the openapi-generator-cli and the ng-openapi-gen package
```
npm install @openapitools/openapi-generator-cli -g
npm install -g ng-openapi-gen
```
5. Generate the TypeScript files with these commands:
```
npm run-script gen-dres-client
npm run-script gen-dres-dev-client
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


# OpenAPI Integration

run `npm install @openapitools/openapi-generator-cli -g`
(run `npm install -g ng-openapi-gen`)

Next, add the following lines to your `package.json` file:

  "scripts": {
    "gen-dres-client": "openapi-generator-cli generate -g typescript-angular -i https://raw.githubusercontent.com/dres-dev/DRES/master/doc/oas-client.json -o openapi/dres --skip-validate-spec --additional-properties npmName=@dres-client-openapi/api,ngVersion=13.0.0,enumPropertyNaming=original",
    "gen-dres-dev-client": "openapi-generator-cli generate -g typescript-angular -i https://raw.githubusercontent.com/dres-dev/DRES/dev/doc/oas-client.json -o openapi/dres --skip-validate-spec --additional-properties npmName=@dres-client-openapi/api,ngVersion=13.0.0,enumPropertyNaming=original"
  },
  
  "dependencies": {
    "@openapitools/openapi-generator-cli": "2.4.26"
  },
  
Finally, generate the TypeScript files with these commands:
`npm run-script gen-dres-client`
`npm run-script gen-dres-dev-client`

Simply import the generated files like this:
`import {SubmissionService} from '../../openapi/dres/api/submission.service';`

# Development

## Add new query-type

1. Add new type to the QueryPartType enum in app/main/components/exp-search-area/models/query-parts.ts

````
export enum QueryPartType {
  objects = "Objects",
  texts = "Texts",
  concepts = "Concepts",
  ...
  new_type_key = "New Type"
}
````
2. Extend the enum in app/main/models/object-query.ts
This is the model of the query object itself, which will be stored and transmitted to the backend.
Add your new type here.

````
export default interface ObjectQuery {
  objects: ObjectQueryPart[],
  texts: ObjectQueryPart[],
  concepts: ObjectQueryPart[],
  places: ObjectQueryPart[],
  ...
  address?: string,
  country?: string,
  new_type_key?: string
}
````

3. Add case to main/utils/transformers/graphical-to-json-query-transformer.ts in transformGraphicalContentPartToJson method.
This is needed for the graphical user interface output to get a json object out of it, to store and send it to the backend.
The queryObject is the json object, so you need to set the value with the right key here.
```
        case QueryPartType.weekday:
          queryObject.weekday = queryPart.query ?? "";
          break;
        case QueryPartType.address:
          queryObject.address = queryPart.query ?? "";
          break;
        case QueryPartType.new_type_key:
          queryObject.new_type_key = queryPart.query ?? "";
          break;
```

4. Add case to main/utils/transformers/json-to-graphical-query-transformer.ts in transformObjectQueryToGraphicalContentPart method.
This is needed to translate a stored json query to a graphical user interface object, to use it there.
```
        case 'address':
        case 'city':
        case 'country':
        case 'new_type_key':
```

5. Add if statement for main/utils/history-entry-to-text.ts, to translate the query object to a human readable string.
```
        if (dict.country) {
          result += ` -co ${dict.country}`;
        }
        if (dict.new_type_key) {
          result += ` -ntk ${dict.new_type_key}`;
        }
```
