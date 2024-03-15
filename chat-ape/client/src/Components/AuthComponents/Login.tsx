import LoginForm from "../Forms/LoginForm";

export default function Login() {

    return (
        <div className="flex">
            <div className="h-screen w-[33%] hidden lg:block overflow-hidden" >
                <img src="/pattern.jpg" alt="theme" width={"2000px"} />
            </div>
            <div className="bg-black text-white h-screen w-full lg:w-[67%] flex flex-col justify-center items-center">
                <div className="flex justify-center items-start">
                    <h1 className="font-bold text-5xl mb-8">ChatApe</h1>
                    <img data-testid={"login-logo"} src="/logo.png" alt="logo" width={"200px"} className="w-14 md:w-16" />
                </div>
                <h2 className="font-bold text-3xl mb-8">Login</h2>
                <LoginForm />
            </div>
        </div>
    );
}
