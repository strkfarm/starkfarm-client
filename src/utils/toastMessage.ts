import { createStandaloneToast } from "@chakra-ui/react";
const {  toast } = createStandaloneToast();
interface ToastProps {
  status?: "error" | "success";
  title?: string;
  description?: string;
  stay?: number;
}
export const toastMessage = ({ status, title, description, stay }: ToastProps) => {
  toast({
    status: status || "error",
    title: title || (status === "error" ? "Error" : "Success"),
    description: description,
    duration: stay ? null : 4000,
    position: "top-right",
    // variant: "top-accent",
  });
};
