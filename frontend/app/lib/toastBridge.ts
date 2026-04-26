export type ToastType = "success" | "error" | "warn" | "info";

type ToastHandler = (message: string, type: ToastType, duration?: number) => void;

let _handler: ToastHandler | null = null;

export function registerToastHandler(fn: ToastHandler): void {
  _handler = fn;
}

export function emitToast(message: string, type: ToastType, duration?: number): void {
  _handler?.(message, type, duration);
}
