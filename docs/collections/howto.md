# CDC Thematic Views (Collections)

## Overview

Thematic Views (hereafter "Views", also known as Collections in the public UI) consist of custom indexes, styles/graphics and information pages allowing the customised presentation and search of subsets of the main CDC indexes.

## Adding a new View

The below steps are required for adding a new View. Note also the requirement for View-specific Elasticsearch indexes.

### Configuration file

Views are defined in the configuration file `/src/utilities/thematicViews.ts` in the array constant named "thematicViews". A new View must be added using the below type specification. It is usually easiest to copy and update an existing View entry. Example below using the "sample" View name.

```json
{
    "key": "sample", //used for navigation and reducers
    "path": "/sample", //path is automatically added to server side routing. If root ("/"), sets the View as the default view for the current instance.
    "defaultIndex": "sample_en", // Default Elasticsearch index. If available, English should be default.
    "title": "Sample Thematic View", // Used in page titles and logo heading
    "longTitle": "An Interesting Example Thematic View", // Expanded title, used on the Collections page
    "listDescription": "An Example Thematic View configuration for documentation purposes",  // used on the Collections overview page
    "rootClass": "sample", //the CSS body class
    "icon": "sample-icon.svg", //required, preferably SVG but may also be PNG. The file must be placed in `/src/img/icons/`
    "favicon": "sample-favicon.png", //required, PNG or SVG. The file must be placed in `/src/img/favicons/`
    "EsIndexes": // at least one index must be specified. This array also controls the language selector (index switcher)
      [
      
        {
          indexName: 'sample_en',
          languageCode: 'en',
          language: 'English',
          excludeFilters: [] // Filters can be also excluded on the index level, see excludeFilters[] for the View level below
        },
        {
          indexName: 'sample_fi',
          languageCode: 'fi',
          language: 'Finnish',
          excludeFilters: []
        },
     ],
      excludeFields: ['publisher'], // Fields that should be hidden on the detail page. Use (almost) any field names as specified in the return statement of getStudyModel() in common/metadata.ts. See also src/components/Detail.tsx.
      excludeFilters: ['publisher']  // Filters that should be hidden on the search page. Use any of the following:  "topic", "keywords", "publisher", "country", "collectionYear", "timeMethod". See also src/containers/SearchPage.tsx.
  },
```

### Icons

Image files referenced by the View must be created.

A main icon SVG must be placed in `/src/img/icons/`. Example name: sample-icon.svg
A favicon PNG  must be placed in `/src/img/favicons/`. Example name: sample-favicon.png

### Styles

View-specific colours are set in `/src/styles/modules/colours/_tvColours.scss`. Simply add the set of colours after the :root selector using the rootClass from the View configuration. See example below.

Coulours can be specified using any CSS-supported notation. HSL has been used as standard for View styles.

```css
.sample {
  --primary_highlight: hsl(204, 87%, 32%);
  --secondary_highlight: hsl(204, 87%, 40%);
  --text: hsl(201, 21%, 36%);
  --bg: hsl(201, 20%, 96%);
  --footer: hsl(201, 20%, 100%);
}
```

### Content pages / components

Previous versions of the CDC used the translation mechanism for limited CMS functionality, but this introduces problems in handling custom layouts and elements for specific Views.
Until the CDC can vbe integrated with a CMS package, static content pages are used with an abstraction level for pages and components that have different content for different Views.

This applies to the footers and the About and User Guide pages.

For each View, the following components must be added (using the name "Sample" for examples):

1. `/src/components/dynamic/footers/SampleFooter.tsx`
2. `/src/components/dynamic/pages/aboutPages/SampleAboutPage.tsx`
3. `/src/components/dynamic/pages/userGuidePages/SampleUserGuidePage.tsx`

It is usually quickest to simply make a copy of an existing component and then update its name and content.


The View-specific components must then be referenced in their respective metacomponents, again using the "Sample" view for examples.

In `/src/components/Footer.tsx`:

```jsx
const footers = {
    ...

    sample: require('./dynamic/footers/SampleFooter.tsx').default,
};
```


In `/src/containers/AboutPage.tsx`:

```jsx
const aboutPages = {
  ...

  sample: require('../components//dynamic/pages/aboutPages/SampleAboutPage.tsx').default,
};
```

In `/src/containers/UserGuidePage.tsx`:

```jsx
const userGuidePages = {
  ...

  sample: require('../components/dynamic/pages/userGuidePages/SampleUserGuidePage.tsx').default,
};
```

### Building and deploying
It is regrettably not possible to provide the required CMS elements on the current stack without rebuilding the app, although the Thematic View functionality itself is config-based. Additionally, the Elasticsearch indexes have to be built for each View.

Once the Elasticsearch instance is updated with the View's indexes and the steps in this howto have been performed, the app can be built and deployed as usual.