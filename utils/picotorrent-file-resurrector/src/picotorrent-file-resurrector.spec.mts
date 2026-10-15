import "reflect-metadata";

vi.mock("sqlite", () => ({ open: vi.fn(), default: { open: vi.fn() } }));

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  const mockWriteFileSync: Mock = vi.fn();
  const mocked = { ...actual, writeFileSync: mockWriteFileSync };
  return { ...mocked, default: mocked };
});

vi.mock("node:path", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:path")>();
  const mockJoin: Mock = vi.fn((subpath, fileSubPath) => `${subpath}\\${fileSubPath}`);
  const mocked = { ...actual, join: mockJoin };
  return { ...mocked, default: mocked };
});

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { Database, open } from "sqlite";
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
    const mockInfoHash = "MOCK_INFO_HASH";
    const mockResumeData = "MOCK_RESUME_DATA";

    let mockDb: Partial<Mocked<Database>>;
    let mockEach: Mock;
    let mockOpen: Mock;
    let mockWriteFileSync: Mock;
    let mockPathJoin: Mock;
    let mockLogger: Mock;

    beforeEach(() => {
      mockEach = vi.fn();
      mockOpen = vi.mocked(open);
      mockDb = {
        close: vi.fn().mockResolvedValue(void 0),
        each: mockEach,
      };
      mockEach.mockResolvedValue(0);
      mockOpen.mockResolvedValue(mockDb);
      mockWriteFileSync = vi.mocked(writeFileSync);
      mockPathJoin = vi.mocked(join);
      mockLogger = vi.spyOn(console, "log");
    });

    test("should open DB connection once with expected parameters", async () => {
      await service.extract();

      expect(mockOpen).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          filename: mockDbFilePath,
          mode: sqlite3.OPEN_READONLY,
        }),
      );
    });

    test("should log extraction start with expected parameters", async () => {
      await service.extract();

      expect(mockLogger).toHaveBeenCalledWith(`Starting torrent file extraction using DB at "${mockDbFilePath}".`);
    });

    test("should execute DB query once with expected parameters", async () => {
      const expectedQuery = "select info_hash, resume_data from torrent_resume_data";

      await service.extract();

      expect(mockEach).toHaveBeenCalledExactlyOnceWith(expectedQuery, expect.any(Function));
    });

    describe("successful resultset", () => {
      beforeEach(() => {
        mockEach.mockImplementation((_, callback) => {
          callback(null, { info_hash: mockInfoHash, resume_data: mockResumeData });
          return Promise.resolve(1);
        });
      });

      test("should log expected number of times", async () => {
        await service.extract();

        expect(mockLogger).toHaveBeenCalledTimes(4);
      });

      test("should log torrent file created once with expected parameters", async () => {
        await service.extract();

        expect(mockLogger).toHaveBeenCalledWith(
          `Torrent file created in "${mockBaseOutputDirectoryPath}" for torrent with info has "${mockInfoHash}".`,
        );
      });

      test("should log affected torrents with expected parameters", async () => {
        await service.extract();

        expect(mockLogger).toHaveBeenCalledWith("1 torrent(s) resurrected!");
      });

      test("should construct expected file path once with expected parameters", async () => {
        await service.extract();

        expect(mockPathJoin).toHaveBeenCalledExactlyOnceWith(mockBaseOutputDirectoryPath, `${mockInfoHash}.torrent`);
      });

      test("should write new torrent file once with expected parameters", async () => {
        await service.extract();

        expect(mockWriteFileSync).toHaveBeenCalledExactlyOnceWith(
          `${mockBaseOutputDirectoryPath}\\${mockInfoHash}.torrent`,
          mockResumeData,
        );
      });
    });

    describe("resultset error", () => {
      const expectedErrorMessage = "Expected error occurred!";

      let mockErrorLogger: Mock;

      beforeEach(() => {
        mockEach.mockImplementation((_, callback) => {
          callback(new Error(expectedErrorMessage), {});
          return Promise.resolve(0);
        });

        mockErrorLogger = vi.spyOn(console, "error");
      });

      test("should log error once with expected parameters", async () => {
        await service.extract();

        expect(mockErrorLogger).toHaveBeenCalledExactlyOnceWith(
          "An error occurred during torrent data from DB: error: ",
          new Error(expectedErrorMessage),
        );
      });

      test("should log at error level expected number of times", async () => {
        await service.extract();

        expect(mockErrorLogger).toHaveBeenCalledOnce();
      });

      test("should log expected number of times", async () => {
        await service.extract();

        expect(mockLogger).toHaveBeenCalled(3);
      });

      test("should log affected torrents with expected parameters", async () => {
        await service.extract();

        expect(mockLogger).toHaveBeenCalledWith("0 torrent(s) resurrected!");
      });

      test("should log that DB connection closed with expected parameters", async () => {
        await service.extract();

        expect(mockLogger).toHaveBeenCalledWith("DB connection closed.");
      });
    });
  });
});
