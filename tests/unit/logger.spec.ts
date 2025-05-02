import { Logger } from '../../src/cli/logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('logs success messages', () => {
    Logger.success('Test success');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.anything(), 'Test success');
  });

  it('logs error messages', () => {
    Logger.error('Test error');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.anything(), 'Test error');
  });

  it('logs warning messages', () => {
    Logger.warning('Test warning');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.anything(), 'Test warning');
  });

  it('logs info messages', () => {
    Logger.info('Test info');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.anything(), 'Test info');
  });

  it('logs step progress', () => {
    Logger.step(1, 5, 'Test step');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.anything(), 'Test step');
  });

  it('logs commands', () => {
    Logger.command('yarn install');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('logs headers', () => {
    Logger.header('Test Header');
    expect(consoleLogSpy).toHaveBeenCalledTimes(2); // Header + underline
  });

  it('logs sections', () => {
    Logger.section('Test Section');
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it('returns styled path', () => {
    const result = Logger.path('/test/path');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('returns styled code', () => {
    const result = Logger.code('const x = 1');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});
