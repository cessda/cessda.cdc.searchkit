export const mockDispatch = jest.fn();

jest.mock('../../src/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));
