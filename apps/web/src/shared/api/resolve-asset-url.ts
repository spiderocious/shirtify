import { createFileService } from '@shirtify/core';

import { ENV } from '@shared/config/env.ts';

const fileService = createFileService({ baseUrl: ENV.FILE_SERVICE_URL });

/** Resolve an R2 storage key to a fresh (~1h) presigned view URL. */
export const resolveAssetUrl = (key: string): Promise<string> => fileService.getFileUri(key);

export { fileService };
