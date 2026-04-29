type LogoutHandler = () => void;

let _handler: LogoutHandler | null = null;

export function registerLogoutHandler(fn: LogoutHandler): void {
  _handler = fn;
}

export function emitLogout(): void {
  _handler?.();
}
