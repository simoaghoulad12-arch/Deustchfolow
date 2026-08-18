import { GermanyCoachService } from '../germany-coach.service';
import type { GermanyPathService } from '../../path/germany-path.service';
import type { GermanySourceService } from '../../sources/germany-source.service';
import type { DocumentChecklistService } from '../../documents/document-checklist.service';

function buildDeps(overrides?: {
  pathService?: Partial<Record<string, jest.Mock>>;
  sourceService?: Partial<Record<string, jest.Mock>>;
  documentService?: Partial<Record<string, jest.Mock>>;
}) {
  const pathService = {
    getOwnPath: jest.fn().mockResolvedValue({
      userId: 'user-1',
      goalType: 'WORK',
      currentStep: 'QUALIFICATION_CHECK',
      steps: [],
      nextStep: 'JOB_OR_APPRENTICESHIP',
    }),
    ...overrides?.pathService,
  } as unknown as GermanyPathService;

  const sourceService = {
    listActive: jest.fn().mockResolvedValue([{ id: 'source-1', topic: 'RECOGNITION_OF_QUALIFICATIONS' }]),
    ...overrides?.sourceService,
  } as unknown as GermanySourceService;

  const documentService = {
    listOwn: jest.fn().mockResolvedValue([]),
    ...overrides?.documentService,
  } as unknown as DocumentChecklistService;

  return { pathService, sourceService, documentService };
}

describe('GermanyCoachService', () => {
  it('returns path=null and no sources when the user has not set a goal yet', async () => {
    const { pathService, sourceService, documentService } = buildDeps({
      pathService: { getOwnPath: jest.fn().mockResolvedValue(null) },
    });
    const service = new GermanyCoachService(pathService, sourceService, documentService);

    const result = await service.getMyPathOverview('user-1');

    expect(result.path).toBeNull();
    expect(result.relevantSources).toEqual([]);
    expect(sourceService.listActive).not.toHaveBeenCalled();
  });

  it('fetches sources for the topic hinted by the current step', async () => {
    const { pathService, sourceService, documentService } = buildDeps();
    const service = new GermanyCoachService(pathService, sourceService, documentService);

    const result = await service.getMyPathOverview('user-1');

    expect(sourceService.listActive).toHaveBeenCalledWith({ topic: 'RECOGNITION_OF_QUALIFICATIONS' });
    expect(result.relevantSources).toHaveLength(1);
  });

  it('returns no sources for a step with no topic hint, without ever inventing one', async () => {
    const { pathService, sourceService, documentService } = buildDeps({
      pathService: {
        getOwnPath: jest.fn().mockResolvedValue({
          userId: 'user-1',
          goalType: 'WORK',
          currentStep: 'ORIENTATION',
          steps: [],
          nextStep: 'GERMAN_LEVEL',
        }),
      },
    });
    const service = new GermanyCoachService(pathService, sourceService, documentService);

    const result = await service.getMyPathOverview('user-1');

    expect(result.relevantSources).toEqual([]);
    expect(sourceService.listActive).not.toHaveBeenCalled();
  });

  it('includes the user\'s document checklist in the overview', async () => {
    const { pathService, sourceService, documentService } = buildDeps({
      documentService: { listOwn: jest.fn().mockResolvedValue([{ id: 'doc-1' }]) },
    });
    const service = new GermanyCoachService(pathService, sourceService, documentService);

    const result = await service.getMyPathOverview('user-1');

    expect(result.documents).toEqual([{ id: 'doc-1' }]);
  });
});
