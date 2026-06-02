import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const NotifyContext = createContext(null);

export function NotifyProvider({ children }) {
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Ya",
    cancelText: "Batal",
    resolve: null,
  });

  const showNotification = useCallback(({ title, message, type = "info" }) => {
    setDialog({
      open: true,
      title: title || "Notifikasi",
      message: message || "",
      type,
    });
  }, []);

  const closeNotification = useCallback(() => {
    setDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const closeConfirm = useCallback((result) => {
    setConfirmDialog((prev) => {
      if (prev.resolve) prev.resolve(result);
      return { ...prev, open: false, resolve: null };
    });
  }, []);

  const confirm = useCallback(
    ({ title, message, confirmText = "Ya", cancelText = "Batal" }) =>
      new Promise((resolve) => {
        setConfirmDialog({
          open: true,
          title: title || "Konfirmasi",
          message: message || "Apakah Anda yakin?",
          confirmText,
          cancelText,
          resolve,
        });
      }),
    [],
  );

  const notify = useMemo(
    () => ({
      showNotification,
      success: (title, message) => showNotification({ title, message, type: "success" }),
      error: (title, message) => showNotification({ title, message, type: "error" }),
      info: (title, message) => showNotification({ title, message, type: "info" }),
      confirm,
    }),
    [showNotification, confirm],
  );

  const accentClass =
    dialog.type === "success"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : dialog.type === "error"
        ? "bg-red-600 hover:bg-red-700"
        : "bg-sky-600 hover:bg-sky-700";

  return (
    <NotifyContext.Provider value={notify}>
      {children}

      <AlertDialog open={dialog.open} onOpenChange={(open) => !open && closeNotification()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={closeNotification} className={accentClass}>
              Oke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && closeConfirm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => closeConfirm(false)}>
              {confirmDialog.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => closeConfirm(true)}>
              {confirmDialog.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NotifyContext.Provider>
  );
}

export function useNotify() {
  const context = useContext(NotifyContext);
  if (!context) {
    throw new Error("useNotify must be used within NotifyProvider");
  }
  return context;
}
