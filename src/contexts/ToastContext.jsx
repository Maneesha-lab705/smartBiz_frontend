import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Snackbar, Alert, Slide } from "@mui/material";

const ToastContext = createContext(null);

function SlideUp(props) {
  return <Slide {...props} direction="up" />;
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const timerRef = useRef(null);

  const showToast = useCallback((message, severity = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ open: false, message, severity });
    timerRef.current = setTimeout(() => {
      setToast({ open: true, message, severity });
    }, 50);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setToast((t) => ({ ...t, open: false }));
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        TransitionComponent={SlideUp}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ zIndex: 99999 }}
      >
        <Alert
          onClose={handleClose}
          severity={toast.severity}
          variant="filled"
          sx={{
            minWidth: 300,
            fontWeight: 500,
            fontSize: "0.875rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            "& .MuiAlert-icon": { fontSize: "1.2rem" },
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
