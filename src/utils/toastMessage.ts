import { toast } from "react-toastify";
interface ToastProps {
  status?: "error" | "success";
  title?: string;
  description?: string;
  stay?: number;
}
export const toastError = ({ status, title, description, stay }: ToastProps) => {
  toast.error(description);
};

export const toastSuccess = ({ status, title, description, stay }: ToastProps) => {
  toast.success(description);
};
