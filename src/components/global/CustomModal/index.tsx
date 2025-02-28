import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalContext } from "@/providers/ModalProvider";

type Props = {
  title: string;
  subHeading: string;
  children: React.ReactNode;
  defaultOpen: boolean;
};

const CustomModal = ({ title, subHeading, children, defaultOpen }: Props) => {
  const { isOpen, setClose } = useModalContext();
  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent className="overflow-scroll md:max-h-[700px] md:h-fit h-screen bg-card">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subHeading}</DialogDescription>
          {children}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
