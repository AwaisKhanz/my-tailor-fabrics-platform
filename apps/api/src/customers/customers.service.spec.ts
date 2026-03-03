import { Test, TestingModule } from '@nestjs/testing';
import { CustomerStatus } from '@tbms/shared-types';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let prismaMock: {
    customer: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };
  let searchServiceMock: {
    searchCustomers: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = {
      customer: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    searchServiceMock = {
      searchCustomers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SearchService, useValue: searchServiceMock },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('applies branch, status, and vip filters in list queries', async () => {
    prismaMock.customer.findMany.mockResolvedValue([]);
    prismaMock.customer.count.mockResolvedValue(0);

    await service.findAll(
      'branch-1',
      2,
      10,
      undefined,
      true,
      CustomerStatus.BLACKLISTED,
    );

    expect(prismaMock.customer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          branchId: 'branch-1',
          isVip: true,
          status: CustomerStatus.BLACKLISTED,
        }),
        skip: 10,
        take: 10,
      }),
    );
    expect(prismaMock.customer.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        deletedAt: null,
        branchId: 'branch-1',
        isVip: true,
        status: CustomerStatus.BLACKLISTED,
      }),
    });
  });

  it('uses search service for text searches and skips prisma pagination query', async () => {
    const searchResults = [{ id: 'cust-1' }];
    searchServiceMock.searchCustomers.mockResolvedValue(searchResults);

    const result = await service.findAll('branch-1', 3, 25, 'Ali', undefined);

    expect(searchServiceMock.searchCustomers).toHaveBeenCalledWith(
      'Ali',
      'branch-1',
      25,
    );
    expect(prismaMock.customer.findMany).not.toHaveBeenCalled();
    expect(prismaMock.customer.count).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: searchResults,
      meta: { total: 1, page: 1, lastPage: 1 },
    });
  });
});
