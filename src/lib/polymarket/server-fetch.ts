import { GAMMA_BASE, CLOB_REST, DATA_API } from "./constants";

const DEFAULT_HEADERS = {
  Accept: "application/json",
};

export async function gammaGet(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path.startsWith("http") ? path : `${GAMMA_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    headers: DEFAULT_HEADERS,
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`Gamma ${res.status}: ${await res.text()}`);
  return res.json() as Promise<unknown>;
}

export async function clobGet(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path.startsWith("http") ? path : `${CLOB_REST}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    headers: DEFAULT_HEADERS,
    next: { revalidate: 15 },
  });
  if (!res.ok) throw new Error(`CLOB ${res.status}: ${await res.text()}`);
  return res.json() as Promise<unknown>;
}

export async function dataGet(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path.startsWith("http") ? path : `${DATA_API}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    headers: DEFAULT_HEADERS,
    next: { revalidate: 20 },
  });
  if (!res.ok) throw new Error(`Data API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<unknown>;
}
