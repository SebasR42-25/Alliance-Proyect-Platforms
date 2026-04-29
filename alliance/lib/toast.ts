export type ToastPayload = {
  message: string;
  sub?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
};

type Listener = (payload: ToastPayload & { id: number }) => void;
type Unsubscribe = () => void;

const listeners = new Set<Listener>();
let counter = 0;

export function showToast(payload: ToastPayload): void {
  const id = ++counter;
  listeners.forEach((l) => l({ ...payload, id }));
}

export function subscribeToToasts(listener: Listener): Unsubscribe {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
