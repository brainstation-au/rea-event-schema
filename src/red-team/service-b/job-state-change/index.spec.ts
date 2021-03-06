import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { JobStateChangeDetail } from '.';

describe('job state change detail', () => {
  test('parse a valid document', () => {
    const data = JSON.parse(readFileSync(join(__dirname, 'sample-input.json'), 'utf-8'));
    expect(JobStateChangeDetail.parse({
      ...data,
      extra: 'bar',
    })).toEqual({
      ...data,
    });
  });

  test('parse an invalid document', () => {
    expect(() => JobStateChangeDetail.parse({
      jobname: 'foo',
      jobid: '4f4b5803-5885-4aa8-9c39-97fbf52a67b8',
      state: 'SUBMITTED',
    })).toThrow(z.ZodError);
  });
});
