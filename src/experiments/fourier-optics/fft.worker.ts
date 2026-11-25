/// <reference lib="webworker" />

/**
 * 2D FFT worker for the Fourier-optics bench.
 *
 * The main thread posts a typed SimulateRequest. The worker runs the same pure
 * function used by the synchronous fallback and transfers every Float64Array
 * buffer back instead of copying it. Requests carry an id so that a late
 * result from an older parameter set can be discarded by the client.
 */

import { simulateFourF, type WorkerRequest, type WorkerResponse } from "./physics";

const scope = self as unknown as DedicatedWorkerGlobalScope;

scope.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (!request || request.type !== "simulate") return;

  try {
    const result = simulateFourF(request.params);
    const response: WorkerResponse = { type: "result", id: request.id, result };
    const transfer: Transferable[] = [
      result.object.buffer,
      result.spectrum.buffer,
      result.phase.buffer,
      result.filtered.buffer,
      result.reconstruction.buffer,
      result.profile.buffer
    ];
    scope.postMessage(response, transfer);
  } catch (error) {
    const response: WorkerResponse = {
      type: "error",
      id: request.id,
      message: error instanceof Error ? error.message : "Unknown FFT worker error"
    };
    scope.postMessage(response);
  }
});

export {};
