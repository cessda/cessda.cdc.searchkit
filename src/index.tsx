import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import './i18n/config';
import "./styles/design.scss";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <HelmetProvider>
  <Provider store={store}>
    <App />
  </Provider>
  </HelmetProvider>
  
);

// import React from "react";
// import ReactDOM from "react-dom";
// import { applyMiddleware, createStore } from "redux";
// import { Provider } from "react-redux";
// import AboutPage from "./containers/AboutPage";
// import DetailPage from "./containers/DetailPage";
// import NotFoundPage from "./containers/NotFoundPage";
// import SearchPage from "./containers/SearchPage";
// import App from "./containers/App";
// import { browserHistory, IndexRoute, Route, Router } from "react-router";
// import { routerMiddleware, syncHistoryWithStore } from "react-router-redux";
// import { rootReducer as reducers } from "./reducers";
// import thunk from "redux-thunk";
// import { composeWithDevTools } from "redux-devtools-extension";
// import { detect } from "detect-browser";
// import "./styles/design.scss";
// import getPaq from "./utilities/getPaq";

// // Import images used by Open Graph
// require('./img/cessda_logo_dc.png');

// // Initialise Matomo Analytics.
// const _paq = getPaq();
// const url = '';
// const url2 = '';
// const siteId = '';
// const siteId2 = '';

// _paq.push(['setTrackerUrl', url + 'matomo.php']);
// _paq.push(['setSiteId', siteId]);
// _paq.push(['addTracker', url2 + 'matomo.php', siteId2]);

// const element = document.createElement('script');
// const script = document.getElementsByTagName('script')[0];

// element.type = 'text/javascript';
// element.async = true;
// element.defer = true;
// element.src = url + 'matomo.js';

// if (script?.parentNode) {
//   script.parentNode.insertBefore(element, script);
// }

// const store = createStore(reducers, composeWithDevTools(applyMiddleware(thunk, routerMiddleware(browserHistory))));

// const history = syncHistoryWithStore(browserHistory, store);

// history.listen(location => {
//   // Notify Matomo Analytics of page change.
//   _paq.push(['setReferrerUrl', location.pathname + location.search]);
//   _paq.push(['setCustomUrl', location.pathname + location.search]);
//   _paq.push(['setDocumentTitle', 'CESSDA Data Catalogue']);

//   // Remove all previously assigned custom variables, requires Matomo (formerly Piwik) 3.0.2
//   _paq.push(['deleteCustomVariables', 'page']);
//   _paq.push(['trackPageView']);

//   // Make Matomo aware of newly added content
//   const content = document.getElementById('root');
//   _paq.push(['MediaAnalytics::scanForMedia', content]);
//   _paq.push(['FormAnalytics::scanForForms', content]);
//   _paq.push(['trackContentImpressionsWithinNode', content]);
//   _paq.push(['enableLinkTracking']);
// });

// const root = document.getElementById('root');

// if (root instanceof HTMLElement) {
//   if (document.documentElement instanceof HTMLElement && detect()?.name === 'ie') {
//     document.documentElement.classList.add('legacy-browser');
//   }
//   ReactDOM.render(
//     <Provider store={store}>
//       <Router history={history} onUpdate={() => window.scrollTo(0, 0)}>
//         <Route path="/" component={App}>
//           <IndexRoute component={SearchPage} />
//           <Route path="detail" component={DetailPage} />
//           <Route path="study/pid/:pid" component={DetailPage} />
//           <Route path="about" component={AboutPage} />
//           <Route path='*' component={NotFoundPage}/>
//         </Route>
//       </Router>
//     </Provider>, root
//   );
// }
