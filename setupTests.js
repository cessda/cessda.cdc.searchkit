// setup file
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

global.fetch = require('jest-mock-fetch').default;

configure({ adapter: new Adapter() });
