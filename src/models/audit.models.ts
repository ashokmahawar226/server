import {z} from 'zod';

export const AuditSchema = z.object({
  path: z.string(),
  method: z.string(),
  requestBody: z.record(z.any()),
  username: z.string(),
  timestamp: z.number(),
});

export type Audit = z.infer<typeof AuditSchema>;
