// Placeholder for toast types - we'll use sonner for actual toasts
export type ToastActionElement = React.ReactElement;
export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
