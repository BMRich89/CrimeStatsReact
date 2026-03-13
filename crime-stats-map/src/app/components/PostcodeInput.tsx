"use client"
import { useState } from "react";
import { postcodeValidator } from 'postcode-validator';
import { Button } from "./Button";
import { Crime } from "../types/crime";

type PostcodeInputProps = {
  buttonText?: string;
  placeholder?: string;
  onCrimesLoaded?: (crimes: Crime[]) => void;
}

export function PostcodeInput({ buttonText, onCrimesLoaded }: PostcodeInputProps) {

    const [isPostcodeValid, setIsPostcodeValid] = useState(true);
    const [postcode, setPostCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const computedButtonText = buttonText || "Submit";
    const country = "GB"; // Default to UK

    const showValidationError = !isPostcodeValid && postcode !== "";
    const disableButton = !isPostcodeValid || postcode === "" || isLoading;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!postcode) return;

    setIsLoading(true);
    setError(null);
    onCrimesLoaded?.([]);

    try {
      const res = await fetch(`/api/crime?postcode=${encodeURIComponent(postcode)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed: ${res.statusText}`);
      }
      const data: Crime[] = await res.json();
      onCrimesLoaded?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const setIsPostcodeValidState = (value: string) => {
    if (value === "") {
      setIsPostcodeValid(true);
    } else {
      setIsPostcodeValid(postcodeValidator(value, country));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-row items-center justify-center h-full">
        <span className="bg-white-50">
          <input
            className="border bg-blue-50 placeholder:text-gray-500 m-5 text-black p-2"
            type="text"
            placeholder="Enter postcode"
            maxLength={11}
            name="postcode"
            value={postcode}
            onChange={(e) => {
              setPostCode(e.target.value);
              setIsPostcodeValidState(e.target.value);
            }}
          />
        </span>
        <Button buttonText={isLoading ? "Searching…" : computedButtonText} disabledState={disableButton} />
      </div>
      <div className="flex flex-col items-center justify-center">
        {showValidationError && <p className="text-red-500">Postcode is invalid</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </form>
  );
}

