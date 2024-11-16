export const CacheService = {
  getInstance: jest.fn().mockReturnValue({
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    has: jest.fn().mockResolvedValue(false),
    keys: jest.fn().mockResolvedValue([]),
    values: jest.fn().mockResolvedValue([]),
    entries: jest.fn().mockResolvedValue([]),
    size: jest.fn().mockResolvedValue(0),
  }),
}
