"use client"
import { useState } from "react";
import { postcodeValidator } from 'postcode-validator';
import { Button } from "./Button";

type PostcodeInputProps = {
  buttonText?: string;
  placeholder?: string;
}

export function PostcodeInput({buttonText}: PostcodeInputProps) {

    const [isPostcodeValid,setIsPostcodeValid] = useState(true);
    const [postcode,setPostCode] = useState("");
    const computedButtonText = buttonText || "Submit";
    const country = "GB"; // Default to UK, can be parameterized later

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
  
  const setIsPostcodeValidState = (postcode: string) => {
    if(postcode === "") {
      setIsPostcodeValid(true);
    } else{
      setIsPostcodeValid(postcodeValidator(postcode, country));
      console.log("Postcode validation result:", postcodeValidator(postcode, country));
    }
  };

  return (
     <form method="post" onSubmit={handleSubmit}>

    <div className="flex flex-row items-center justify-center h-full">
        <span className="bg-white-50">
            <input className="border bg-blue-50 placeholder:text-gray-500 m-5 text-black p-2" type="text" placeholder="Enter postcode" maxLength={11} name="postcode" onChange={(e) => {
                      console.log(e.target.value);
                      setPostCode(e.target.value);
                      setIsPostcodeValidState(e.target.value);
                      
                  }} />
        </span>
        <Button buttonText={computedButtonText} disabledState={disableButton}/>
    </div>
    <div className="flex flex-col items-center justify-center">
            { showValidationError && <p className="text-red-500">Postcode is invalid</p>}
    </div>
     </form>
  );
}

