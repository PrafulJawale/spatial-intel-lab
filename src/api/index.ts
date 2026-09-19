import { demoAdapter } from "./demoAdapter";
import { realAdapter } from "./realAdapter";

export type { SatQueryAdapter } from "./adapter";
export * from "./types";

const useRealBackend = import.meta.env.VITE_SATQUERY_API_MODE === "real";

export const satQueryAdapter = useRealBackend ? realAdapter : demoAdapter;