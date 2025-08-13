type ButtonProps = {
  buttonText?: string;
  buttonAction?: () => void;
  disabledState?: boolean;
}

export function Button({buttonText, buttonAction, disabledState}: ButtonProps) {
    return (!disabledState ?
        <button type="submit" className="bg-blue-500 p-2 rounded-sm hover:bg-blue-900 cursor-pointer" onClick={buttonAction}>{buttonText}</button>
        :
        <button type="submit" className="bg-gray-500 p-2 rounded-sm hover:bg-gray-600" disabled>{buttonText}</button>
    );
}