export const ApiService = {
  getInstance: jest.fn().mockReturnValue({
    createPin: jest.fn().mockResolvedValue({}),
    schedulePin: jest.fn().mockResolvedValue({}),
    getBoardAnalytics: jest.fn().mockResolvedValue({
      impressions: 1000,
      saves: 50,
      clicks: 100,
    }),
    getPinAnalytics: jest.fn().mockResolvedValue({
      impressions: 100,
      saves: 5,
      clicks: 10,
    }),
  }),
}
