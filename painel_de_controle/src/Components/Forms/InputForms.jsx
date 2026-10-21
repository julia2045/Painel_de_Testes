import React from 'react'
import Styles from './InputForms.module.css'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const InputForms = ({
    name,
    type, 
    label, 
    value, 
    onchange, 
    error, 
    placeholder, 
   }) => {
    
    const [showPassword, setShowPassword] = React.useState(false);
    const isPasswordType = type === 'password';

   
  return (
    <div className={Styles.form_control}>
      <label htmlFor={name}>{label}</label>
      <div className={Styles.input_container}>
        <input
            type={isPasswordType && showPassword ? 'text' : type}
            id={name}
            name={name}
            value={value}
            onChange={onchange}
            onBlur={onblur}
            placeholder={placeholder}
            className={error ? Styles.error : ''}
        />
        {isPasswordType && (
            <span 
            className={Styles.eyeIcon}
            onClick={() => setShowPassword(!showPassword)}
            >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
        )}
      </div>
      {error && <span className={Styles.error_text}>{error}</span>}
       
    </div>
  )
}

export default InputForms
