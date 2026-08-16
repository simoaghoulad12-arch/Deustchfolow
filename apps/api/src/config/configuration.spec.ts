import configuration from './configuration';

describe('configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('falls back to sensible development defaults', () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;

    expect(configuration()).toEqual({ nodeEnv: 'development', port: 4000 });
  });

  it('reads NODE_ENV and PORT from the environment', () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '8080';

    expect(configuration()).toEqual({ nodeEnv: 'production', port: 8080 });
  });
});
