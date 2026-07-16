import { Logger } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { connectMock, disconnectMock } = vi.hoisted(() => ({
  connectMock: vi.fn(async () => undefined),
  disconnectMock: vi.fn(async () => undefined),
}));

vi.mock('@toonexpo/db', () => {
  const prisma = {
    $connect: connectMock,
    $disconnect: disconnectMock,
    $extends: vi.fn(() => prisma),
  };
  return { prisma, PrismaClient: class {} };
});

import { DATABASE_IDLE_TIMEOUT_MS, PrismaService } from './prisma.service';

describe('PrismaService connection lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    connectMock.mockClear();
    disconnectMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('connects on init and disconnects after the coded idle timeout', async () => {
    const service = new PrismaService();
    const logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    await service.onModuleInit();
    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^Connected successfully \(\d+ms\)$/),
    );

    await vi.advanceTimersByTimeAsync(DATABASE_IDLE_TIMEOUT_MS);
    expect(disconnectMock).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith('Disconnected (idle 5m)');

    await service.onModuleDestroy();
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('disconnects on shutdown', async () => {
    const service = new PrismaService();
    const logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(disconnectMock).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith('Disconnected (shutdown)');
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('logs connection failure in red', async () => {
    connectMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const service = new PrismaService();
    const errorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    await expect(service.onModuleInit()).rejects.toThrow('ECONNREFUSED');
    expect(errorSpy).toHaveBeenCalledWith('Connection failed: ECONNREFUSED');
    errorSpy.mockRestore();
  });
});
