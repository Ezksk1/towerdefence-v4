"use client"

export interface Toast {
  id?: string;
  title?: string;
  description?: string;
  open?: boolean;
  variant?: "default" | "destructive";
}

export type ToastActionElement = React.ReactNode;
export type ToastProps = Toast;

const useToast = () => {
  const toast = (props: Toast) => {
    if (typeof window !== "undefined") {
      console.log("[Toast]", props.title, props.description);
    }
  };

  const dismiss = (toastId?: string) => {
    console.log("[Toast dismissed]", toastId);
  };

  return { toast, dismiss, toasts: [] };
};

export { useToast };
