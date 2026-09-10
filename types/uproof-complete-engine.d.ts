declare module '../uproof-complete-engine/src/index.mjs' {
  export const inputSchema: unknown[];
  export function createEngine(): {
    setInputs(values: Record<string, unknown>): unknown;
    calculateProject(options?: {includeProcessingData?: boolean; includeExactOutputSheets?: boolean; includeRawSheets?: boolean}): unknown;
    processingReferenceData(): unknown;
  };
}