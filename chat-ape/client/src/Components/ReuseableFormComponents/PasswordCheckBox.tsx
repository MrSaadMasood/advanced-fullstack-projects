
interface Props { checked : boolean, setChecked : React.Dispatch<React.SetStateAction<boolean>>}

function PasswordCheckBox({ checked, setChecked } : Props) {
  return (
    <div className="flex justify-start items-center mb-2">
        <label htmlFor="showPassword" className="text-[#999999]">Show Password</label>
        <input
            type="checkbox"
            name="showPassword"
            id="showPassword"
            className="ml-2"
            checked={checked}
            onChange={()=> setChecked(!checked)}
        />
    </div>
  )
}

export default PasswordCheckBox