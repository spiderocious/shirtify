/**
 * Client for the external R2 file-service (presigned-URL proxy).
 *
 *   https://go-file-service-production.up.railway.app
 *
 * The service never stores files — it issues short-lived signed URLs. The flow:
 *   1. getUploadUri()  → { key, uri }
 *   2. PUT the file directly to `uri`
 *   3. persist `key` (never the uri — uris expire)
 *   4. getFileUri(key) → a fresh view url (1h) when you need to display/download
 *
 * Pure `fetch`-based so it runs unchanged in the browser (uploads/views) and in
 * Node 20 (server-side export pipeline). Lives in @shirtify/core for that reason.
 */

export interface UploadTicket {
  key: string;
  uri: string;
}

/** Bytes accepted by an upload PUT. Kept lib-agnostic (no DOM `BodyInit`). */
export type UploadBody = ArrayBuffer | Uint8Array | Blob;

export interface FileServiceOptions {
  baseUrl: string;
}

export const createFileService = ({ baseUrl }: FileServiceOptions) => {
  const root = baseUrl.replace(/\/+$/, '');

  return {
    /** Get a presigned upload URL + permanent key. Call right before uploading. */
    async getUploadUri(ext: string): Promise<UploadTicket> {
      const safeExt = ext.replace(/[^a-z0-9]/gi, '');
      const res = await fetch(`${root}/get-upload-uri?ext=${encodeURIComponent(safeExt)}`);
      if (!res.ok) throw new Error(`file-service get-upload-uri failed: ${res.status}`);
      const body = (await res.json()) as { key: string; uri: string };
      return { key: body.key, uri: body.uri };
    },

    /** Get a fresh presigned view URL for a stored key (valid ~1h). */
    async getFileUri(key: string): Promise<string> {
      const res = await fetch(`${root}/get-file-uri?key=${encodeURIComponent(key)}`);
      if (!res.ok) throw new Error(`file-service get-file-uri failed: ${res.status}`);
      const body = (await res.json()) as { uri: string };
      return body.uri;
    },

    /** PUT raw bytes to a presigned upload uri (used server-side for exports). */
    async putToUri(uri: string, body: UploadBody, contentType: string): Promise<void> {
      // `fetch` accepts these bytes at runtime in Node 20 and browsers; the
      // init is cast as a whole to stay free of the DOM-only `BodyInit` type.
      const init = {
        method: 'PUT',
        body,
        headers: { 'Content-Type': contentType },
      } as unknown as Parameters<typeof fetch>[1];
      const res = await fetch(uri, init);
      if (!res.ok) throw new Error(`file-service upload PUT failed: ${res.status}`);
    },

    /**
     * Convenience for server-side: upload bytes in one call (get ticket → PUT).
     * Returns the permanent key to persist.
     */
    async upload(body: UploadBody, ext: string, contentType: string): Promise<string> {
      const { key, uri } = await this.getUploadUri(ext);
      await this.putToUri(uri, body, contentType);
      return key;
    },
  };
};

export type FileService = ReturnType<typeof createFileService>;
