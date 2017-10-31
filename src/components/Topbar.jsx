import React from 'react';
import {ActionBar, ActionBarRow, PageSizeSelector} from 'searchkit';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Translate from 'react-translate-component';
import {SortingSelector} from './SortingSelector';

class TopBar extends React.Component {
  render() {
    return (
      <ActionBar>
        <ActionBarRow>
          <div className="level">
            <div className="level-left">
              <Translate className="level-item"
                         component="label"
                         content="resultsPerPage"/>

              <PageSizeSelector className="level-item" options={[10, 30, 50, 150]}/>
            </div>
            <div className="level-right">
              <Translate className="level-item"
                         component="label"
                         content="sortBy"/>

              <SortingSelector className="level-item" options={[{
                translation: 'sorting.relevance',
                field: '_score',
                order: 'desc',
                defaultOption: true
              }, {
                translation: 'sorting.latest',
                field: 'oaiDatestamp',
                order: 'desc'
              }, {
                translation: 'sorting.first',
                field: 'oaiDatestamp',
                order: 'asc'
              }]}/>
            </div>
          </div>
        </ActionBarRow>
      </ActionBar>
    );
  }
}

TopBar.propTypes = {
  code: PropTypes.string.isRequired
};

const mapStateToProps = (state) => {
  return {
    code: state.language.code
  };
};

export default connect(mapStateToProps)(TopBar);
