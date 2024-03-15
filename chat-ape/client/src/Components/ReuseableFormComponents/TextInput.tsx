import { useField } from "formik"

interface TextInputProps {
    label : string
    name : string
    type : string
    id : string
    className : string
}
function TextInput({ label , ...props } : TextInputProps) {
    const [ field , meta ] = useField(props)
    return (
        <>
            <input {...field} {...props} />
            <label htmlFor={props.name}>{label}</label>
            {meta.touched && meta.error ? (
                <div className="text-xs mt-1 text-red-500">{meta.error}</div>
            ) : null}
        </>
    )
}

export default TextInput