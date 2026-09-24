import "reflect-metadata";

import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import { container } from "tsyringe";
import { afterAll, beforeEach, describe, expect, type Mock, type Mocked, test, vi } from "vitest";

import { PicotorrentFileResurrector } from "./picotorrent-file-resurrector.mts";
import { InjectionToken } from "./injection-token.enum.mts";

describe("PicotorrentFileResurrector", () => {
  const mockBaseOutputDirectoryPath = "./";
  const mockDbFilePath = "./db";

  let service: PicotorrentFileResurrector;

  beforeEach(() => {
    container.register(InjectionToken.BaseOutputDirectoryPath, { useValue: mockBaseOutputDirectoryPath });
    container.register(InjectionToken.DbFilePath, { useValue: mockDbFilePath });

    service = container.resolve(PicotorrentFileResurrector);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  test("should create", () => {
    expect(service).toBeDefined();
  });

  describe("extract", () => {
    let mockDb: Partial<Mocked<Database>>;
    let mockOpen: Mock;
    let mockWriteFileSync: Mock;
    let mockPath: { join: Mock };

    beforeEach(() => {
      mockOpen = vi.fn();
      mockDb = {
        each: vi.fn(),
      };
      mockOpen.mockResolvedValue(mockDb);
      vi.doMock(import("sqlite"), () => ({ open: mockOpen }));
      mockWriteFileSync = vi.fn();
      vi.stubGlobal("writeFileSync", mockWriteFileSync);
      mockPath = { join: vi.fn() };
      vi.stubGlobal("path", mockPath);
      mockPath.join.mockImplementation((subpath, fileSubPath) => `${subpath}\\${fileSubPath}`);
    });

    // TODO: currently failing, the mock doesn't seem to be used.
    test("should open DB connection once with expected parameters", async () => {
      await service.extract();

      expect(mockOpen).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          filename: mockDbFilePath,
          mode: sqlite3.OPEN_READONLY,
        }),
      );
    });
  });
});
