# Changelog

All notable changes to Searchkit will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

*For each release, use the following sub-sections:*

- *Added (for new features)*
- *Changed (for changes in existing functionality)*
- *Deprecated (for soon-to-be removed features)*
- *Removed (for now removed features)*
- *Fixed (for any bug fixes)*
- *Security (in case of vulnerabilities)*

## [3.2.1] - 2023-03-28

### Additions

- Get information about the users of the Search API using HTTP headers ([#530](https://github.com/cessda/cessda.cdc.versions/issues/530))
- Show alternate languages when a study is not found in the selected language ([#375](https://github.com/cessda/cessda.cdc.versions/issues/375))

## [3.2.0] - 2022-12-08

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.7413641.svg)](https://doi.org/10.5281/zenodo.7413641)

### Additions

- Add a "Not Found" page if a path that is not either `/`, `/about` or `/detail` is requested. ([#469](https://github.com/cessda/cessda.cdc.versions/issues/469))
- Add universe descriptions to the study detail page. ([#471](https://github.com/cessda/cessda.cdc.versions/issues/471))
- Add related publications to the study detail page. ([#471](https://github.com/cessda/cessda.cdc.versions/issues/471))
- Make the search filters "float", keeping them onscreen when the search page is scrolled. ([#473](https://github.com/cessda/cessda.cdc.versions/issues/473))

### Changes

- Replace `node-sass` with Dart Sass (i.e. `sass`). This is due to the deprecation of `node-sass` and also makes Searchkit more portable between different versions of Node.
- Use AND for the search API, reflecting the default behaviour of the user interface. ([#475](https://github.com/cessda/cessda.cdc.versions/issues/475))
- Default to only displaying 12 keywords, add a button to show all keywords ([#500](https://github.com/cessda/cessda.cdc.versions/issues/500))

### Fixes

- Fix the search API returning `undefined` for the `ResultsCount.available` field. This was due to Elasticsearch 7 changing the way the total results were returned. ([#493](https://github.com/cessda/cessda.cdc.versions/issues/493))

## [3.1.0] - 2022-09-22

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.7410382.svg)](https://doi.org/10.5281/zenodo.7410382)

### Changes

- Uses EOSC helpdesk feedback form, instead of JIRA issue collector ([#459](https://github.com/cessda/cessda.cdc.versions/issues/459))

### Fixes

- Improve Google Datasearch results by fixing soft 404 errors. ([#467](https://github.com/cessda/cessda.cdc.versions/issues/467))

## [3.0.3] - 2022-09-07

### Additions

- Add signposting links to the OAI-PMH representation into the HTML `<head>` element. ([#455](https://github.com/cessda/cessda.cdc.versions/issues/455))

### Fixes

- Ensure that all required fields are present before rendering the HTML. ([#460](https://github.com/cessda/cessda.cdc.versions/issues/460))
- Return 404 if a client requests the detail page but does not specify a `q` parameter. ([#467](https://github.com/cessda/cessda.cdc.versions/issues/467))

## [3.0.2] - 2022-09-06

### Additions

- Add OpenGraph and Twitter metadata for rich embedding in external applications ([#441](https://github.com/cessda/cessda.cdc.versions/issues/441))
- Respond with JSON-LD if a client specifies `application/ld+json` in the HTTP `Accept` header ([#336](https://github.com/cessda/cessda.cdc.versions/issues/336))

### Changes

- Exclude internal Elasticsearch calls from Prometheus metrics ([#440](https://github.com/cessda/cessda.cdc.versions/issues/440))
- Support Elasticsearch 7 ([#429](https://github.com/cessda/cessda.cdc.versions/issues/429))
- Update Node.js to v16 ([#269](https://github.com/cessda/cessda.cdc.versions/issues/269))
- Update Webpack to v5 ([#269](https://github.com/cessda/cessda.cdc.versions/issues/269))

### Fixes

- Use lenient queries for the search API ([#440](https://github.com/cessda/cessda.cdc.versions/issues/440))
- Fix the identifier field not being a valid persistent identifier in the JSON-LD representation ([#442](https://github.com/cessda/cessda.cdc.versions/issues/442))
- Respond with 404 if a study does not exist ([#444](https://github.com/cessda/cessda.cdc.versions/issues/444))
- Fix the search not returning expected results by restricting the search operators that can be used ([#453](https://github.com/cessda/cessda.cdc.versions/issues/453))
- Ensure the license field in the JSON-LD representation is a valid URL ([#454](https://github.com/cessda/cessda.cdc.versions/issues/454))
- Ensure the length of the description field in the JSON-LD representation does not exceed 5000 characters ([#454](https://github.com/cessda/cessda.cdc.versions/issues/454))

### Removals

- Remove `image-webpack-loader` and replace it with Webpack 5 asset modules ([#269](https://github.com/cessda/cessda.cdc.versions/issues/269))

## [3.0.0] - 2022-06-07

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.6577730.svg)](https://doi.org/10.5281/zenodo.6577730)

### Additions

- Cut-off of long abstracts in detailed view. ([#414](https://github.com/cessda/cessda.cdc.versions/issues/414))
- Add CORS support to the CDC external API and the Swagger documentation. ([#426](https://github.com/cessda/cessda.cdc.versions/issues/426))
- Added Czech translation, completed Danish translation. ([#422](https://github.com/cessda/cessda.cdc.versions/issues/422))
- Added link to API docs. ([#420](https://github.com/cessda/cessda.cdc.versions/issues/420))
- Add documentation for search API ([#402](https://github.com/cessda/cessda.cdc.versions/issues/402))
- Add metrics instrumentation for UI + API Search Queries. ([#393](https://github.com/cessda/cessda.cdc.versions/issues/393))
- Expose metadata as Linked Open Data ([#358](https://github.com/cessda/cessda.cdc.versions/issues/358))
- Add API for external search ([#357](https://github.com/cessda/cessda.cdc.versions/issues/357))

### Changes

- Revised Danish translation. ([#422](https://github.com/cessda/cessda.cdc.versions/issues/422))
- Changed order of About and User Guide buttons ([#420](https://github.com/cessda/cessda.cdc.versions/issues/420))
- Add the current language to the request URL in User Interface and refine the update logic for the detail page. ([#394](https://github.com/cessda/cessda.cdc.versions/issues/394))
- Clarify the help text in the search box. ([#379](https://github.com/cessda/cessda.cdc.versions/issues/379))

## [2.5.0] - 2021-11-25

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.5709998.svg)](https://doi.org/10.5281/zenodo.5709998)

### Additions

- Added `ts-jest` support, convert all tests to use TypeScript ([#351](https://github.com/cessda/cessda.cdc.versions/issues/351))
- Change the page title depending on the current study or search query ([#364](https://github.com/cessda/cessda.cdc.versions/issues/364))
- Add sorting options for filtering studies by date published ([#289](https://github.com/cessda/cessda.cdc.versions/issues/289))
- Add Czech language support ([#372](https://github.com/cessda/cessda.cdc.versions/issues/372))

### Changes

- Replaced `moment` with `js-joda`, fixing various date handling bugs ([#354](https://github.com/cessda/cessda.cdc.versions/issues/354))
- Optimised the related studies queries to perform the required filtering on Elasticsearch ([#369](https://github.com/cessda/cessda.cdc.versions/issues/369))
- Optimised the study details Elasticsearch query to retrieve the study by ID, rather than perform a search for the ID and selecting the first result ([#369](https://github.com/cessda/cessda.cdc.versions/issues/369))
- Converted the server components to use TypeScript ([#369](https://github.com/cessda/cessda.cdc.versions/issues/369))
- Extracted common Webpack configuration to `webpack.common.js` ([#369](https://github.com/cessda/cessda.cdc.versions/issues/369))
- Sort by the collection end date, rather than the collection start date ([#370](https://github.com/cessda/cessda.cdc.versions/issues/370))

### Removals

- Removed `jest-enzyme` and `jest-environment-enzyme` as these were not compatible with Jest 27 ([#269](https://github.com/cessda/cessda.cdc.versions/issues/269))

### Fixes

- Fixed JSON data previously included studyXmlSourceUrl pointing to the source record ([#385](https://github.com/cessda/cessda.cdc.versions/issues/385))
- Handle slow connections between the client and the server by setting the connection timeout to the largest supported values ([#350](https://github.com/cessda/cessda.cdc.versions/issues/350))
- Only show the available date fields on the Detail page ([#354](https://github.com/cessda/cessda.cdc.versions/issues/354))
- Filter out PID objects that are missing a persistent identifier, fixing cases where the agency would be displayed on its own ([#369](https://github.com/cessda/cessda.cdc.versions/issues/369))
- Fixed some code smells identified by SonarQube ([#369](https://github.com/cessda/cessda.cdc.versions/issues/369))

### Security

## [2.4.0] - 2021-06-23

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.5017246.svg)](https://doi.org/10.5281/zenodo.5017246)

### Additions

- Enabled ElasticSearch security ([#321](https://github.com/cessda/cessda.cdc.versions/issues/321))
- Added support for structured JSON logging ([#313](https://github.com/cessda/cessda.cdc.versions/issues/313))
- Added a direct link to the User Guide in the header ([#305](https://github.com/cessda/cessda.cdc.versions/issues/305))
- Added support for logging with JSON ([#313](https://github.com/cessda/cessda.cdc.versions/issues/313))

### Changes

- Updated ElasticSearch from version 5.6 to 6.8 ([#312](https://github.com/cessda/cessda.cdc.versions/issues/312))
- Added support for Elasticsearch security ([#321](https://github.com/cessda/cessda.cdc.versions/issues/321))
- Converted Searchkit from JavaScript to TypeScript ([#307](https://github.com/cessda/cessda.cdc.versions/issues/307))
- Updated 'About' text in line with User Guide improvements for latest release ([#304](https://github.com/cessda/cessda.cdc.versions/issues/304))
- Simplified the Jenkinsfile used to build Searchkit ([#294](https://github.com/cessda/cessda.cdc.versions/issues/294))
- Updated many 3rd party dependencies, via [Renovate Bot](https://github.com/renovatebot)
- Updated Node.js to 14 ([#269](https://github.com/cessda/cessda.cdc.versions/issues/269))
- User interface adjustments ([#270](https://github.com/cessda/cessda.cdc.versions/issues/270))
- Updated outdated links that were displayed if JavaScript was disabled ([#322](https://github.com/cessda/cessda.cdc.versions/issues/322))

### Fixes

- Fix tests broken by relying on internal implementation details in react-icons ([#269](https://github.com/cessda/cessda.cdc.versions/issues/269))
- Fixed search not working on the about page ([#344](https://github.com/cessda/cessda.cdc.versions/issues/344))
- Fix the default operator, **AND**, not being applied to searches ([#242](https://github.com/cessda/cessda.cdc.versions/issues/242))

## [2.3.2]

### Changes

- Updated CESSDA Main Office address in footer ([#310](https://github.com/cessda/cessda.cdc.versions/issues/310))

## [2.3.1] - 2021-02-11

[10.5281/zenodo.4534768](https://zenodo.org/record/4534768)

### Removals

- Removed the ability to enable analytics using the `PASC_ELASTICSEARCH_URL` environment variable ([#282](https://github.com/cessda/cessda.cdc.versions/issues/282))

### Fixes

- Fixed Searchkit breaking when selecting a study language using the "Study description available in" links ([#279](https://github.com/cessda/cessda.cdc.versions/issues/279))

## [2.3.0] - 2021-02-09

[10.5281/zenodo.4525832](https://zenodo.org/record/4525832)

### Additions

- Add an about page with links to the documentation, this replaces the advanced search popup ([#259](https://github.com/cessda/cessda.cdc.versions/issues/259))
- Use a localised field derived from the country ISO code for the country filter ([#252](https://github.com/cessda/cessda.cdc.versions/issues/252))
- Add missing translations for `language.notAvailable.field` ([#250](https://github.com/cessda/cessda.cdc.versions/issues/250))
- Move the language selector into the search box, and add the total number of studies to the interface ([#241](https://github.com/cessda/cessda.cdc.versions/issues/241))
- Reintroduce translation support, localise "Not Available" ([#235](https://github.com/cessda/cessda.cdc.versions/issues/235))
- Whitelist styling HTML tags ([#226](https://github.com/cessda/cessda.cdc.versions/issues/226))
- Add link to the CESSDA Topics Classification CV ([#208](https://github.com/cessda/cessda.cdc.versions/issues/208))
- Add option to set default language as part of endpoint specification ([#192](https://github.com/cessda/cessda.cdc.versions/issues/192))
- Make the keywords and topics clickable in the detail view ([#175](https://github.com/cessda/cessda.cdc.versions/issues/175))
- Added Code of Conduct ([#174](https://github.com/cessda/cessda.cdc.versions/issues/174))
- Add tooltip attributions to CVS and ELSST on the study detail page ([#173](https://github.com/cessda/cessda.cdc.versions/issues/173))
- Added highlighting for searched terms in the search results page ([#145](https://github.com/cessda/cessda.cdc.versions/issues/145))

### Changes

- Updated the tooltips for the search filters ([#266](https://github.com/cessda/cessda.cdc.versions/issues/266))
- Keep all sections visible in the study details page at all times ([#263](https://github.com/cessda/cessda.cdc.versions/issues/263))
- Add a minimum results score to prevent irrelevant matches from being returned by Elasticsearch ([#258](https://github.com/cessda/cessda.cdc.versions/issues/258))
- Rename "Go to publisher" to "Access data" ([#254](https://github.com/cessda/cessda.cdc.versions/issues/254))
- Improve the semantics of the HTML on the detail page ([#245](https://github.com/cessda/cessda.cdc.versions/issues/245))
- Change the default search operator to be AND ([#242](https://github.com/cessda/cessda.cdc.versions/issues/242))
- Include all fields in the search, except for the fields the CDC user group wants to exclude ([#238](https://github.com/cessda/cessda.cdc.versions/issues/238))
- Fixed various React.js warnings present in development mode ([#232](https://github.com/cessda/cessda.cdc.versions/issues/232))
- Applied Elasticsearch boosts at query time ([#224](https://github.com/cessda/cessda.cdc.versions/issues/224/why-no-results-with-title))
	- This is due to the depreciation of index-time boosting
- Added a link to the document landing page in the footer ([#220](https://github.com/cessda/cessda.cdc.versions/issues/220))
- Fix warnings from the ZAP scanning report ([#218](https://github.com/cessda/cessda.cdc.versions/issues/218))
- Fixed translations not being applied to the sorting selector ([#215](https://github.com/cessda/cessda.cdc.versions/issues/215))
- Apply `eslint` suggested fixes ([#203](https://github.com/cessda/cessda.cdc.versions/issues/203))
- Update Searchkit dependencies ([#198](https://github.com/cessda/cessda.cdc.versions/issues/198))
- Update Elasticsearch to 5.6 ([#188](https://github.com/cessda/cessda.cdc.versions/issues/188))
- Always show the extra metadata at the bottom of each result ([#165](https://github.com/cessda/cessda.cdc.versions/issues/165))
- UI and metadata languages, search box ([#164](https://github.com/cessda/cessda.cdc.versions/issues/164))

### Removals

- Remove the data file language from the detail page ([#255](https://github.com/cessda/cessda.cdc.versions/issues/255))
- Remove the Elasticsearch proxy ([#237](https://github.com/cessda/cessda.cdc.versions/issues/237))
- Fix HTML tags appearing in various sections of the detail page ([#226](https://github.com/cessda/cessda.cdc.versions/issues/226))
- Remove unnecessary filtering in the default request ([#217](https://github.com/cessda/cessda.cdc.versions/issues/217))
- Remove "Not available" if no PID agency is present ([#156](https://github.com/cessda/cessda.cdc.versions/issues/156))

## [2.2.1] - 2020-05-04

Searchkit - [10.5281/zenodo.3786300](https://zenodo.org/record/3786300)

### Added

- French language index

### Changed

- default results sorting order (from relevance to collection date descending) ([#163](https://github.com/cessda/cessda.cdc.versions/issues/163))
- various UI label changes ([#153](https://github.com/cessda/cessda.cdc.versions/issues/153))), ([#154](https://github.com/cessda/cessda.cdc.versions/issues/154))

### Deprecated

- N/A

### Removed

- Norwegian language index

### Fixed

- compiler warnings, as recommended by Error Prone
- issues reported by SonarQube
- test data to match changes made to the expected conditions ('not available' -> 'Agency not available')

### Security

- N/A
