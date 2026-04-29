jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useNavigate: jest.fn(() => jest.fn()),
    useLocation: jest.fn(() => ({
      pathname: '/',
      search: '',
      key: 'mockKey',
    })),
    useSearchParams: jest.fn(),
  };
});
