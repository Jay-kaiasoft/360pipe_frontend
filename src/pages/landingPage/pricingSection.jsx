import Header from "./header";
import { NavLink, useNavigate } from "react-router-dom";

const PricingSection = () => {
  const navigate = useNavigate();

  const handlePlanSelection = () => {
    navigate("/register");
  };

  return (
    <div className="bg-gradient-to-tr from-[#f7f5e8] via-[#e6eafc] to-[#f7f5e8] min-h-screen">
      <div className='absolute z-50 w-full px-5 lg:px-20 border-b border-gray-200 shadow-sm'>
        <Header />
      </div>

      <section className="pt-24 md:pt-32 flex items-center justify-center px-5 lg:px-20">
        <div className="mx-auto px-4 w-full">

          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            For Businesses Of All Sizes
          </h2>

          <p className="mb-12 text-black">
            <NavLink to="" className="text-blue-600 ">
              Click here
            </NavLink>{" "}
            to use our Savings Calculator when you move all your tools to
            360Pipe.
          </p>

          <div className="md:bg-gray-50 md:rounded-md md:shadow overflow-hidden">
            <div className="hidden md:block">
              {/* Plan Names */}
              <div className="grid grid-cols-5 border-b">
                <div className="p-4 font-semibold text-black">Plans</div>
                {["Pay As You Go", "Surveys Only", "Pay as You Grow", "Enterprise"].map(
                  (plan, index) => (
                    <div key={index} className="p-4 text-center font-semibold border-l text-black">
                      {plan}
                    </div>
                  )
                )}
              </div>

              {/* Monthly Base Cost */}
              <div className="grid grid-cols-5 border-b">
                <div className="p-4 font-medium text-black">Monthly Base Cost</div>
                {["$0", "$250", "$0.10", "Custom Price"].map((price, index) => (
                  <div key={index} className="p-4 text-center border-l font-bold">
                    {price}
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-5">
                <div className="p-4"></div>
                {["Pay As You Go", "Surveys Only", "Pay As You Grow"].map((plan, index) => (
                  <div key={index} className="p-4 text-center border-l">
                    <button
                      onClick={() => handlePlanSelection()}
                      type="button"
                      className="relative px-5 py-2 rounded group overflow-hidden font-medium bg-[#FFD600] text-[#222] shadow-md"
                    >
                      <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-out bg-blue-600 group-hover:h-full"></span>

                      <span className="relative z-10 transition-colors duration-300 group-hover:text-white text-lg font-bold">
                        Choose Plan
                      </span>
                    </button>                    
                  </div>
                ))}
                {/* Enterprise Call */}
                <div className="p-4 text-center border-l flex flex-col items-center justify-center text-blue-600">
                  {/* <p className="font-semibold">Call Us</p>
                  <p className="text-sm text-gray-600">+1 415 906 4001 ext 1</p> */}
                </div>
              </div>
            </div>

            <div className="block md:hidden">
              {[
                { name: "Pay As You Go", price: "$0" },
                { name: "Surveys Only", price: "$250" },
                { name: "Pay as You Grow", price: "$0.10" },
                { name: "Enterprise", price: "Custom Price" },
              ].map((plan, index) => (
                <div
                  key={index}
                  className="bg-white border rounded-md shadow-sm p-6 mb-4 text-center"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-4">{plan.price}</p>
                  {plan.name !== "Enterprise" ? (
                    <button
                      onClick={() => handlePlanSelection()}
                      className="bg-[#FFD600] px-5 py-2 rounded font-bold hover:bg-blue-600 hover:text-white transition"
                    >
                      Choose Plan
                    </button>
                  ) : (
                    <div className="text-blue-600">
                      <p className="font-semibold">Call Us</p>
                      <p className="text-sm text-gray-600">+1 415 906 4001 ext 1</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default PricingSection;