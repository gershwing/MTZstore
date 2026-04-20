import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Verify = () => {
  const history = useNavigate();

  // Esta pagina ya no se usa - registro y forgot password tienen OTP inline
  useEffect(() => {
    history("/register");
  }, [history]);

  return null;
};

export default Verify;
