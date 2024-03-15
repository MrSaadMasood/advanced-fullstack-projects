import SignUpForm from "../Forms/SignupForm";

export default function Signup() {
  return (
    <div className="flex">
        <div data-testid={"image"} className="h-screen w-[33%] hidden md:block overflow-hidden">
            <img src="/pattern.jpg" alt="theme" width={"2000px"} />
        </div>
        <div className="bg-black text-white h-screen w-full md:w-[67%] flex flex-col justify-center items-center">
            <div className="flex justify-center items-start">
                <h1 className="font-bold text-5xl mb-8">ChatApe</h1>
                <img src="/logo.png" alt="logo" width={"200px"} className="w-14 md:w-16" />
            </div>
            <h2 className="font-bold text-3xl mb-8">Create Account</h2>
            <SignUpForm />
         </div>
    </div>
  );
}
