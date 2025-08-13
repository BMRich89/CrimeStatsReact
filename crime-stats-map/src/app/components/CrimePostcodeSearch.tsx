"use client"
import { useState } from "react";
import { postcodeValidator } from 'postcode-validator';
import { Button } from "./Button";
import { PostcodeInput } from "./PostcodeInput";

type CrimePostcodeSearchProps = {
  buttonText?: string;
  placeholder?: string;
}

export function CrimePostcodeSearch({buttonText}: CrimePostcodeSearchProps) {

    const [isPostcodeValid,setIsPostcodeValid] = useState(true);
    const [postcode,setPostCode] = useState("");
    const computedButtonText = buttonText || "Submit";

    const showValidationError = !isPostcodeValid && postcode !== "";
    const disableButton = !isPostcodeValid || postcode === "";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    if(formData.get("postcode") === null || formData.get("postcode") === "") {
      console.error("Postcode input is empty");
      return;

    }
    console.log("Input value:", formData.get("postcode"));
    const postcodeValue = formData.get("postcode") as string;
    const cleanedPostcode = postcodeValue.replace(/\s+/g, '')
    fetch(`/api/crime?postcode=${cleanedPostcode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Data received:", data);
      // Handle the data as needed, e.g., update state or display results
    })
    .catch(error => { 
      console.error("Error fetching data:", error);
      // Handle the error, e.g., show an error message to the user
    });    
  };
  


  return (
     <form method="post" onSubmit={handleSubmit}>
        <PostcodeInput Postcode={postcode} SetPostcode={(p:string) => setPostCode(p)}/>
     </form>
  );
}

