import { useEffect, useState } from "react";
import { Input } from "../ui/input";

interface DecimalInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  integer?: boolean;
}

const formatDisplay = (value: number, integer?: boolean): string => {
  if (value === 0) return "";
  return integer ? String(Math.trunc(value)) : String(value);
};

const parseInputValue = (raw: string, integer?: boolean): number => {
  if (raw === "" || raw === "-" || raw === ".") return 0;
  const parsed = integer ? parseInt(raw, 10) : parseFloat(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export function DecimalInput({
  value,
  onChange,
  className,
  disabled,
  placeholder = "0.00",
  integer,
}: DecimalInputProps) {
  const [text, setText] = useState(() => formatDisplay(value, integer));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(formatDisplay(value, integer));
    }
  }, [value, integer, focused]);

  const pattern = integer ? /^-?\d*$/ : /^-?\d*\.?\d*$/;

  return (
    <Input
      type="text"
      inputMode={integer ? "numeric" : "decimal"}
      value={text}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        if (text === "" || text === "." || text === "-") {
          setText("");
          onChange(0);
          return;
        }
        const normalized = parseInputValue(text, integer);
        setText(formatDisplay(normalized, integer));
        onChange(normalized);
      }}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw !== "" && !pattern.test(raw)) return;
        setText(raw);
        onChange(parseInputValue(raw, integer));
      }}
    />
  );
}
