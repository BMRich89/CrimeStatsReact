"use client"
import { useRef, useState } from "react";
import { postcodeValidator, postcodeValidatorExistsForCountry } from 'postcode-validator';
import { Button } from "./Button";

type PostcodeInputProps = {
  Postcode?: string;
  SetPostcode: (postcode: string) => void;
}

export function PostcodeInput({Postcode, SetPostcode}: PostcodeInputProps) {

    const [isPostcodeValid,setIsPostcodeValid] = useState(true);
    const country = "GB"; // Default to UK, can be parameterized later

    const showValidationError = !isPostcodeValid && Postcode !== "";
    const disableButton = !isPostcodeValid || Postcode === "";
  
      const setIsPostcodeValidState = (postcode: string) => {
    if(postcode === "") {
      setIsPostcodeValid(true);
    } else{
      setIsPostcodeValid(postcodeValidator(postcode, country));
      console.log("Postcode validation result:", postcodeValidator(postcode, country));
    }
  };
  
  return (
  <>
    <div className="flex flex-row items-center justify-center h-1/5">
        <span className="bg-white-50">
            <input className="border bg-blue-50 placeholder:text-gray-500 m-5 text-black p-2" type="text" placeholder="Enter postcode" maxLength={11} name="postcode" onChange={(e) => {
                      console.log(e.target.value);
                      SetPostcode(e.target.value);
                      setIsPostcodeValidState(e.target.value);                
                  }} />
        </span>
        <Button buttonText="Submit" disabledState={disableButton}/>
    </div>
    <div className="flex flex-col items-center justify-center">
            { showValidationError && <p className="text-red-500">Postcode is invalid</p>}
    </div>
    </>
  );
}

