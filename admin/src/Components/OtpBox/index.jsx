import React, { useEffect, useMemo, useRef, useState } from "react";

const isDigit = (ch) => /^[0-9]$/.test(ch ?? "");

export default function OtpBox({
  length = 6,
  onChange = () => { },
  onComplete = () => { },
  autoFocus = true,
  disabled = false,
  namePrefix = "otp",
  className = "",
  value, // opcional: modo controlado
}) {
  const inputsRef = useRef([]);
  const [otp, setOtp] = useState(() => Array.from({ length }, () => ""));

  // Modo controlado (si pasan value, sincroniza)
  useEffect(() => {
    if (typeof value === "string" && value.length <= length) {
      const next = Array.from({ length }, (_, i) => value[i] ?? "");
      setOtp(next);
    }
  }, [value, length]);

  // Primer focus
  useEffect(() => {
    if (!autoFocus || disabled) return;
    const idx = otp.findIndex((d) => !d);
    const target = inputsRef.current[idx >= 0 ? idx : length - 1];
    target?.focus();
  }, [autoFocus, disabled, length]);

  const code = useMemo(() => otp.join(""), [otp]);
  useEffect(() => {
    onChange(code);
    if (otp.every((d) => d !== "")) onComplete(code);
  }, [code]); // eslint-disable-line

  const focusIndex = (i) => inputsRef.current[i]?.focus();

  const setAt = (i, v) => {
    setOtp((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  };

  const handleChange = (e, i) => {
    const raw = e.target.value;
    // Si el usuario pega más de 1 caracter en un input, toma el último dígito
    const ch = raw.slice(-1);
    if (!isDigit(ch)) {
      // Limpia si metieron letra
      setAt(i, "");
      return;
    }
    setAt(i, ch);
    // Avanza
    if (i < length - 1) focusIndex(i + 1);
    else inputsRef.current[i]?.select();
  };

  const handleKeyDown = (e, i) => {
    const key = e.key;

    if (key === "Backspace") {
      if (otp[i]) {
        // borra el actual y se queda
        setAt(i, "");
        return;
      }
      // si ya está vacío, retrocede
      if (i > 0) {
        e.preventDefault();
        setAt(i - 1, "");
        focusIndex(i - 1);
      }
    }

    if (key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      focusIndex(i - 1);
    }
    if (key === "ArrowRight" && i < length - 1) {
      e.preventDefault();
      focusIndex(i + 1);
    }
  };

  const handlePaste = (e, startIndex) => {
    e.preventDefault();
    const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, ""); // solo dígitos
    if (!text) return;

    const chars = text.slice(0, length - startIndex).split("");
    setOtp((prev) => {
      const next = [...prev];
      let j = startIndex;
      for (const d of chars) {
        if (j >= length) break;
        next[j++] = d;
      }
      return next;
    });

    const last = Math.min(startIndex + chars.length - 1, length - 1);
    focusIndex(last);
    inputsRef.current[last]?.select();
  };

  const handleFocus = (e) => e.target.select();

  return (
    <div
      className={`otpBox flex gap-2 justify-center ${className}`}
      aria-label="Ingrese el código de verificación"
    >
      {otp.map((val, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          id={`${namePrefix}-input-${i}`}
          name={`${namePrefix}[${i}]`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={1}
          value={val}
          disabled={disabled}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={(e) => handlePaste(e, i)}
          onFocus={handleFocus}
          className="w-[35px] h-[35px] sm:w-[45px] sm:h-[45px] text-center text-[14px] sm:text-[17px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ))}
    </div>
  );
}
