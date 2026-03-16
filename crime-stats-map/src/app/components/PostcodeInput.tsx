"use client";
import { useState } from "react";
import { postcodeValidator } from "postcode-validator";
import { Button } from "./Button";
import { CrimeSearchResponse } from "../types/crime";

type PostcodeInputProps = {
  Postcode?: string;
  SetPostcode?: (postcode: string) => void;
  onCrimesLoaded: (response: CrimeSearchResponse) => void;
};

export function PostcodeInput({ Postcode, SetPostcode, onCrimesLoaded }: PostcodeInputProps) {
  const [postcode, setPostcode] = useState(Postcode ?? "");
  const [isPostcodeValid, setIsPostcodeValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const country = "GB";

  const showValidationError = !isPostcodeValid && postcode !== "";
  const disableButton = !isPostcodeValid || postcode === "" || isLoading;

  const handleChange = (value: string) => {
    setPostcode(value);
    SetPostcode?.(value);
    if (value === "") {
      setIsPostcodeValid(true);
    } else {
      setIsPostcodeValid(postcodeValidator(value, country));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!postcode || !isPostcodeValid) return;

    const cleanedPostcode = postcode.trim().replace(/\s+/g, "");
    setError(null);
    onCrimesLoaded({ crimes: [] });
    setIsLoading(true);

    try {
      const res = await fetch(`/api/crime?postcode=${encodeURIComponent(cleanedPostcode)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const data: CrimeSearchResponse = await res.json();
      onCrimesLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-row items-center justify-center h-1/5">
        <span className="bg-white-50">
          <input
            className="border bg-blue-50 placeholder:text-gray-500 m-5 text-black p-2"
            type="text"
            placeholder="Enter postcode"
            maxLength={11}
            name="postcode"
            value={postcode}
            onChange={(e) => handleChange(e.target.value)}
          />
        </span>
        <Button
          buttonText={isLoading ? "Searching…" : "Submit"}
          disabledState={disableButton}
        />
      </div>
      <div className="flex flex-col items-center justify-center">
        {showValidationError && <p className="text-red-500">Postcode is invalid</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </form>
  );
}

