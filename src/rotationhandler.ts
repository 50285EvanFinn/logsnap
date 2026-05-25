import * as fs from 'fs';
import {
  RotationState,
  RotationEvent,
  detectRotation,
  resolveRotatedPath,
} from './rotationwatcher';

export interface RotationHandlerOptions {
  onRotated?: (oldPath: string, newPath: string) => void;
  onTruncated?: (filePath: string) => void;
  onMissing?: (filePath: string) => void;
}

export interface RotationHandlerState {
  rotationState: RotationState;
  options: RotationHandlerOptions;
  lastEvent: RotationEvent;
}

export function createRotationHandler(
  rotationState: RotationState,
  options: RotationHandlerOptions = {}
): RotationHandlerState {
  return { rotationState, options, lastEvent: 'none' };
}

export function checkRotation(handler: RotationHandlerState): RotationEvent {
  const event = detectRotation(handler.rotationState);
  handler.lastEvent = event;

  switch (event) {
    case 'rotated': {
      const rotated = resolveRotatedPath(handler.rotationState.filePath);
      handler.options.onRotated?.(rotated, handler.rotationState.filePath);
      break;
    }
    case 'truncated':
      handler.options.onTruncated?.(handler.rotationState.filePath);
      break;
    case 'missing':
      handler.options.onMissing?.(handler.rotationState.filePath);
      break;
    default:
      break;
  }

  return event;
}

export function formatRotationEvent(event: RotationEvent, filePath: string): string {
  switch (event) {
    case 'rotated':  return `[rotation] File rotated: ${filePath}`;
    case 'truncated': return `[rotation] File truncated: ${filePath}`;
    case 'missing':  return `[rotation] File missing: ${filePath}`;
    default:         return `[rotation] No change: ${filePath}`;
  }
}
