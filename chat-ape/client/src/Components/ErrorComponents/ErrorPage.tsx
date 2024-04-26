import { isRouteErrorResponse, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError()
  let errorString : string | undefined;

  if(isRouteErrorResponse(error)){
    errorString = error.statusText
  }
  else if (error instanceof Error){
    errorString = error.message
  }
  else if (typeof error === "string")
    errorString = error

  return (
    <div className="h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
        <p className="text-lg">Were sorry, but there seems to be an error.</p>
        {errorString && <p className="text-lg">{errorString}</p> } 
      </div>
    </div>
  );
};

export default ErrorPage;
