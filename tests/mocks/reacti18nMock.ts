// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
    };
  },
  withTranslation: () => (Component: { defaultProps: object; }) => {
    Component.defaultProps = { ...Component.defaultProps, t: (str: string) => str };
    return Component;
  },
}));
