import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('returns reader dashboard data', () => {
    const service = new DashboardService();
    expect(service.getStats().length).toBe(3);
    expect(service.getRecentLoans()[0].statusTone).toBe('late');
    expect(service.getReservations()[0].chips.length).toBe(2);
  });
});
