import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AdminDashboardService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AdminDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('falls back to mock stats when backend fails', (done) => {
    service.loadDashboardStats().subscribe((stats) => {
      expect(stats.totalUsers).toBe(47);
      expect(service.dashStats()?.topBooks.length).toBeGreaterThan(0);
      done();
    });

    httpMock.expectOne('admin/dashboard').error(new ProgressEvent('error'));
  });

  it('stores dashboard stats when backend succeeds', (done) => {
    service.loadDashboardStats().subscribe((stats) => {
      expect(stats.totalUsers).toBe(10);
      expect(service.dashStats()?.totalUsers).toBe(10);
      done();
    });

    httpMock.expectOne('admin/dashboard').flush({
      totalUsers: 10,
      activeUsers: 8,
      inactiveUsers: 2,
      totalBooks: 20,
      availableBooks: 12,
      activeLoans: 4,
      overdueLoans: 1,
      returnedThisMonth: 3,
      totalReservations: 2,
      pendingReservations: 1,
      topBooks: [],
      loansByMonth: [],
      usersByRole: [],
      recentActivity: [],
    });
  });
});
