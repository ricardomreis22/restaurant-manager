"use client";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";

const RegisterPage = () => {
  return (
    <div className="fixed inset-0 z-20 flex flex-col">
      <div className="flex-1 flex items-center justify-center pb-4">
        <Image
          src="/favicon.ico"
          alt="Restaurant Manager"
          width={120}
          height={96}
          className="w-24 h-20 sm:w-24 sm:h-20"
        />
      </div>
      <div className="h-[80vh] bg-white animate-in slide-in-from-bottom-64 fade-in-0 duration-1000 rounded-t-2xl flex items-center justify-center">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
