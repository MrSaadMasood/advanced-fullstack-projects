function SubmitButton({ value } : { value : string}) {
  return (
        <input
            type="submit"
            value={value}
            className="bg-[#4E9F3D] w-[4.5rem] h-10 p-2 rounded-md hover:bg-[#5ab747] cursor-pointer"
        />
  )
}

export default SubmitButton