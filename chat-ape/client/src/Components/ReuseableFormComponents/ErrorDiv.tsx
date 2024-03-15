interface Props {
    isFailed : boolean
    errorMessage : string
    width : string
}

function ErrorDiv( { width, isFailed , errorMessage } : Props) {
    
    return isFailed ? (
        <div
            data-testid={"error"} 
            className={`mt-3 ${width} bg-red-600 rounded-xl text-white text-center fade`}>
            {errorMessage}
        </div>
    ) : null
}

export default ErrorDiv