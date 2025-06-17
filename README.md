# CESSDA.CDC.SEARCHKIT

[![Build Status](https://jenkins.cessda.eu/buildStatus/icon?job=cessda.cdc.searchkit%2Fmain)](https://jenkins.cessda.eu/job/cessda.cdc.searchkit/job/main/)
[![Quality Gate Status](https://sonarqube.cessda.eu/api/project_badges/measure?project=eu.cessda.pasc%3Apasc-searchkit&metric=alert_status)](https://sonarqube.cessda.eu/dashboard?id=eu.cessda.pasc%3Apasc-searchkit)
[![Coverage](https://sonarqube.cessda.eu/api/project_badges/measure?project=eu.cessda.pasc%3Apasc-searchkit&metric=coverage)](https://sonarqube.cessda.eu/dashboard?id=eu.cessda.pasc%3Apasc-searchkit)
[![SQAaaS badge shields.io](https://img.shields.io/badge/sqaaas%20software-bronze-e6ae77)](https://api.eu.badgr.io/public/assertions/CeKfNy5qR-CD4OqJuTUt8w "SQAaaS bronze badge achieved")

This repository contains all source code for the CESSDA Data Catalogue web application.

CESSDA's repositories are used for harvesting and indexing with very minimal changes to Elasticsearch mappings:
[cessda.metadata.harvester](https://github.com/cessda/cessda.metadata.harvester)
[cessda.cdc.osmh-indexer.cmm](https://github.com/cessda/cessda.cdc.osmh-indexer.cmm)

## Prerequisites

[Node.js](https://nodejs.org/) version 18 (LTS) is required to install and run this application.

You will need an existing local or remote Elasticsearch version 8 instance setup and running.

## Quick Start

Please be aware of *Known Issues* (see bottom) before running.

1. Check *Prerequisites* and install any required software.
2. Clone the repository to your local workspace.
3. Open a Command Prompt/Terminal window and navigate to the project root directory.
4. Enter `npm install` to install the application and all required dependencies.
5. Set the required environment variables (see *Configuration* below).
6. Run the application using one of the following commands.
    * Development: `npm run startdev`
    * Production: `npm run startprod` (Requires the application to be built. See *Building* below.)

> **Building:** In order to run the application in production, it must first be built using the `npm run build` command. This will compile assets into the `/dist` directory. This is not needed if the application is started with `npm run startdev`.  
> **Updating:** When fetching/pulling new builds it is recommended to run `npm install` again. This will ensure all locally installed dependencies match their development environment counterparts.  
> **Testing:** Tests can be run using `npm run test`. Code coverage will be reported in the `/coverage` directory.

## Configuration

The application can be configured using the following environment variables.

| Variable                     | Default Value | Description
| ---------------------------- | ------------- | -----------
| `PASC_DEBUG_MODE`            | `false`       | Enables debug mode which outputs additional debugging information in the user interface and web browser console.
| `PASC_PORT`                  | `8088`        | The port number which will be used to access this web application.
| `PASC_ELASTICSEARCH_URL`     | `http://localhost:9200/` | The web address of the Elasticsearch instance which powers all searches.
| `SEARCHKIT_ELASTICSEARCH_USERNAME` | `undefined` | The username to use when accessing a secured Elasticsearch cluster.
| `SEARCHKIT_ELASTICSEARCH_PASSWORD` | `undefined` | The password to use when accessing a secured Elasticsearch cluster.
| `SEARCHKIT_LOG_LEVEL`        | `info`        | The logging level used for server side events.
| `SEARCHKIT_USE_JSON_LOGGING` | `false`       | Whether to log using JSON rather than plain text.

Set environment variables using the following syntax.

* Windows: `set PASC_PORT=80`
* macOS/Linux: `export PASC_PORT=80`
* Dockerfile: `ENV PASC_PORT=80`

If running in a development environment using JetBrains WebStorm (see *Tooling* below), variables can be set within the IDE [using this documentation](https://www.jetbrains.com/help/webstorm/run-debug-configuration-node-js.html).

## Project Structure

This project follows a best practice structure for React+Redux applications. [Redux Toolkit](https://redux-toolkit.js.org/) is used for simplified store setup and usage.

```bash
<ROOT>
├── coverage            # The output directory for the code coverage report using the test command.
├── dist                # The output directory for compilation using the build command.
├── node_modules        # Third party packages and dependencies.
├── common              # Common source code, shared between the client and the server.
├── server              # Markup and source code for the Searchkit server.
└── src                 # Contains all source code and assets for the client.
    ├── actions         # Redux actions and action creators for state container.
    ├── components      # React user interface components.
    ├── containers      # React page container components.
    ├── i18n            # Language translations.
    ├── img             # Image assets.
    ├── reducers        # Redux reducers for state container.
    ├── styles          # SASS files for styling.
    └── utilities       # Miscellaneous scripts and helpers.
└── tests               # Jest unit tests.
```

## Technology Stack

Several frameworks are used in this application.

The primary programming language is Flow and JSX in ECMAScript 6. See *Tooling* (below) for compatible IDEs.

| Framework/Technology                                 | Description                                              |
| ---------------------------------------------------- | -------------------------------------------------------- |
| JavaScript/[JSX](https://facebook.github.io/jsx/)    | ECMAScript with XML-like syntax extensions.              |
| [React](https://reactjs.org/)                        | JavaScript library for building web applications.        |
| [Redux](https://redux.js.org/)                       | Predictable state container for JavaScript applications. |
| [Searchkit](http://www.searchkit.co/)                | React component library for Elasticsearch.               |
| [Babel](https://babeljs.io/)                         | JavaScript compiler for ECMAScript 6.                    |
| [TypeScript](https://www.typescriptlang.org/)        | Static type checker for JavaScript.                      |
| [Webpack](https://webpack.js.org/)                   | JavaScript module bundler.                               |
| [Sass](http://sass-lang.com/)                        | CSS extension language.                                  |
| [Bulma](https://bulma.io/)                           | CSS framework based on Flexbox.                          |
| [Jest](https://jestjs.io/)                           | JavaScript testing framework.                            |
| [React Testing Library](https://testing-library.com/)| JavaScript testing utility for React Components.         |
| [Winston](https://github.com/winstonjs/winston)      | JavaScript logging framework.                            |

See [`package.json`](package.json) in the root directory for a full list of third party libraries used.

## Tooling

For development, the following software tools are recommended and have full support for the technologies/languages used in this project.

* [JetBrains WebStorm](https://www.jetbrains.com/webstorm/)
* [Atom](https://atom.io/) with [Nuclide](https://nuclide.io/) (EOL Announced) package
* [Visual Studio Code](https://code.visualstudio.com/)

## How To

### Add a new Collection (Thematic View)

* See instructions in `/docs/collections/howto.md`.

### Add a new language

1. Create a new language file in the `/src/i18n/` directory, using the 2 letter language ISO code for the directory name. It is recommended to copy the English file `en/translation.json` and use that as a template/starting point.
2. Add your translations to the new file. Basic HTML mark-up is supported but its use should be limited. Some strings use variables which are defined as `%(VARIABLE)s`. Do not modify the JSON structure or object keys.
3. Notify the application about this new file by adding it to the languages array defined in `/src/utilities/language.js`. It is expected that each language will have its own Elasticsearch index. Use the following syntax:

```javascript
{
  code: 'code',          // The 2 letter ISO code for this language.
  label: 'label',        // The native label for this language.
  index: 'cmmstudy_code' // The Elasticsearch index containing data for this language.
}
```

> Translations can be displayed in mark-up using `const { t, i18n } = useTranslation();` and `t("filters.summary.label")` where `t` takes the JSON path to the specific string required.

### Add a new field

1. Each study retrieved from Elasticsearch is first routed through the `getStudyModel()` method located in `/src/utilities/metadata.js`. This cleans the data and applies type restrictions. Add the new field to the object returned from this method. Like other fields, it should be provided from Elasticsearch as a child property of the `data._source` object.
2. If the field should be displayed on the search page for each result, modify the `/src/components/Result.jsx` component. Add additional HTML mark-up as necessary and the new field will be available as a child property of the `item` object. For example `<p>{item.newField}</p>`.
3. If the field should be displayed on the study detail page, modify the `/src/components/Detail.jsx` component. Add additional HTML mark-up as necessary and the new field will be available as a child property of the `item` object. For example `<p>{item.newField}</p>`.
4. Remember to add new strings to the translations located in `/src/locales` if necessary (i.e. for the new field label etc.)
5. Remember to modify the `getJsonLd()` method if you want the new field to be available in the JSON-LD Schema (see how to *Modify Schema.org JSON-LD* below).

### Modify search filters

All search filters are created in `/src/containers/SearchPage.jsx` and their Elasticsearch configuration is in `/server/helper.ts`.

Example of [RefinementList](https://www.algolia.com/doc/api-reference/widgets/refinement-list/react/) from InstantSearch:

```json
{
  attribute: "country",
  field: "searchField",
  type: "string",
  nestedPath: "studyAreaCountries"
}
```

```jsx
<RefinementList attribute="country" searchable sortBy={['name:asc']} limit={200} showMore={true} showMoreLimit={500}
                classNames={{
                  searchBox: 'focus-visible',
                  checkbox: 'focus-visible',
                  list: 'ais-CustomRefinementList'
                }}/>
```

High `limit` can be used here because of the `ais-CustomRefinementList` class that makes the values horizontally scrollable. Usually lower `limit`, e.g. 16, is recommended, along with `showMore` set to false. Setting searchable is always recommended for any filter that supports it.

### Modify sorting fields

The list of available fields for sorting can be modified in the `/server/helper.ts` and then set in `/src/containers/SearchPage.jsx`.

### Modify Elasticsearch queries

Queries performed against Elasticsearch are defined in `/server/helper.ts` and `/server/elasticsearch.ts`. Client being used is set in `/src/utilities/searchkit.js` but also defined in `/server/helper.ts` like most of the queries.

### Modify Schema.org JSON-LD (used by Google Dataset search)

1. General organisation information and social media links are generated for every page. JSON-LD can be modified in `/src/components/Footer.jsx`.
2. Dataset metadata is generated on the detail page for a single study record. JSON-LD can be modified in `/src/utilities/metadata.js` using method `getJsonLd()`. This method takes a study returned from `getStudyModel()` as its input.

> Google documentation on supported dataset JSON-LD properties can be found at <https://developers.google.com/search/docs/data-types/dataset>

## Versioning

See [Semantic Versioning](https://semver.org/) for guidance.

## License

See the [LICENSE](LICENSE.txt) file.
