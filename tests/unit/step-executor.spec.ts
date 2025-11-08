import { StepExecutor } from '../../src/core/step-executor';
import { GeneratorContext, Step } from '../../src/core/interfaces';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('../../src/cli/logger');

describe('StepExecutor', () => {
  let executor: StepExecutor;
  let context: GeneratorContext;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    executor = new StepExecutor();
    context = {
      config: {},
      state: new Map(),
      dryRun: false,
      checkpointPath: '/tmp/checkpoint.json',
    };
    jest.clearAllMocks();
  });

  describe('addStep', () => {
    it('adds step to executor', () => {
      const step: Step = {
        name: 'test',
        description: 'Test step',
        execute: jest.fn(),
      };

      executor.addStep(step);
      expect(executor.getStepNames()).toContain('test');
    });
  });

  describe('execute', () => {
    it('executes all steps in order', async () => {
      const execOrder: number[] = [];
      
      executor.addStep({
        name: 'step1',
        description: 'Step 1',
        execute: () => { execOrder.push(1); },
      });
      
      executor.addStep({
        name: 'step2',
        description: 'Step 2',
        execute: () => { execOrder.push(2); },
      });

      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      await executor.execute(context);

      expect(execOrder).toEqual([1, 2]);
    });

    it('skips steps with skip condition', async () => {
      const executeFn = jest.fn();
      
      executor.addStep({
        name: 'skipped',
        description: 'Skipped step',
        execute: executeFn,
        skip: () => true,
      });

      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      await executor.execute(context);

      expect(executeFn).not.toHaveBeenCalled();
    });

    it('starts from specified step', async () => {
      const execOrder: number[] = [];
      
      executor.addStep({
        name: 'step1',
        description: 'Step 1',
        execute: () => { execOrder.push(1); },
      });
      
      executor.addStep({
        name: 'step2',
        description: 'Step 2',
        execute: () => { execOrder.push(2); },
      });

      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      await executor.execute(context, 'step2');

      expect(execOrder).toEqual([2]);
    });

    it('throws error for invalid start step', async () => {
      await expect(executor.execute(context, 'invalid')).rejects.toThrow('Invalid start step');
    });

    it('saves checkpoint after each step', async () => {
      executor.addStep({
        name: 'test',
        description: 'Test',
        execute: jest.fn(),
      });

      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      await executor.execute(context);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        context.checkpointPath,
        expect.stringContaining('"executedSteps"'),
        'utf-8'
      );
    });
  });

  describe('rollback', () => {
    it('calls rollback functions in reverse order', async () => {
      const rollbackOrder: number[] = [];
      
      executor.addStep({
        name: 'step1',
        description: 'Step 1',
        execute: jest.fn(),
        rollback: () => { rollbackOrder.push(1); },
      });
      
      executor.addStep({
        name: 'step2',
        description: 'Step 2',
        execute: jest.fn(),
        rollback: () => { rollbackOrder.push(2); },
      });

      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      await executor.execute(context);
      await executor.rollback(context);

      expect(rollbackOrder).toEqual([2, 1]);
    });

    it('continues rollback even if one fails', async () => {
      const rollbackFn = jest.fn();
      
      executor.addStep({
        name: 'step1',
        description: 'Step 1',
        execute: jest.fn(),
        rollback: () => { throw new Error('Rollback failed'); },
      });
      
      executor.addStep({
        name: 'step2',
        description: 'Step 2',
        execute: jest.fn(),
        rollback: rollbackFn,
      });

      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      await executor.execute(context);
      await executor.rollback(context);

      expect(rollbackFn).toHaveBeenCalled();
    });
  });

  describe('restoreCheckpoint', () => {
    it('returns empty state if checkpoint does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = await executor.restoreCheckpoint('/tmp/checkpoint.json');

      expect(result.executedSteps).toEqual([]);
      expect(result.state.size).toBe(0);
    });

    it('restores checkpoint from file', async () => {
      const checkpoint = {
        executedSteps: ['step1', 'step2'],
        state: [['key', 'value']],
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(checkpoint));

      const result = await executor.restoreCheckpoint('/tmp/checkpoint.json');

      expect(result.executedSteps).toEqual(['step1', 'step2']);
      expect(result.state.get('key')).toBe('value');
    });
  });

  describe('getStepNames', () => {
    it('returns all step names', () => {
      executor.addStep({ name: 'step1', description: 'Step 1', execute: jest.fn() });
      executor.addStep({ name: 'step2', description: 'Step 2', execute: jest.fn() });

      expect(executor.getStepNames()).toEqual(['step1', 'step2']);
    });
  });
});
