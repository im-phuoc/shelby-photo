import { toast as sonnerToast } from "sonner";

/**
 * Wrapper hook for sonner toast to maintain compatibility with existing code
 * Uses sonner's toast API which is simpler and more modern
 */
export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant,
      ...props
    }: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive";
      [key: string]: any;
    }) => {
      if (variant === "destructive") {
        return sonnerToast.error(title, {
          description,
          ...props,
        });
      }
      return sonnerToast(title, {
        description,
        ...props,
      });
    },
    dismiss: sonnerToast.dismiss,
  };
}
