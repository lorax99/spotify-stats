import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useNavigateToHome = () => {
  const navigate = useNavigate();

  const navigateToHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return { navigateToHome };
};
