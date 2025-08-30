import { useState } from "react";
import Button from "../../../components/common/buttons/button";
import CopyRight from "../../landingPage/copyRight";
import Header from "../../landingPage/header";
import Stapper from "../../../components/common/stapper/stapper";
import Input from "../../../components/common/input/input";

const Register = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [steps] = useState([
        "Employee Info",
        "Employment Info",
        "PayRoll Info",
        "Direact Deposite",
        "Face Registration",
    ]);

    return (
        <div className="h-screen flex flex-col">
            {/* Fixed Header */}
            <div className="absolute z-50 w-full px-5 lg:px-20 border-b border-gray-200 shadow-sm bg-white">
                <Header />
            </div>

            {/* Main content (center form) */}
            <div className="flex flex-1 items-start justify-center px-5 lg:px-20 pt-24 lg:pt-32">
                <form className="w-full max-w-md p-6 ">
                    <div className="mb-5">
                        <p className="text-center text-2xl font-semibold">Registration</p>
                    </div>

                    <div className="mb-6">
                        <Stapper steps={steps} activeStep={activeStep} orientation="horizontal" />
                    </div>

                    <div className="flex flex-col gap-4">
                        <Input label="Email" type="email" required />
                        <Input label="Password" type="password" required />
                    </div>

                    <div className="mt-6 flex justify-center items-center gap-3">
                        <Button type="submit" text={"Back"} />
                        <Button type="submit" text={"Next"} />
                    </div>
                </form>
            </div>

            {/* Footer */}
            <div>
                <CopyRight />
            </div>
        </div>
    );
};

export default Register;
