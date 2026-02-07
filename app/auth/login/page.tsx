"use client";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

const LoginPage = () => {
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
      <div className="h-[75vh] bg-white animate-in slide-in-from-bottom-8 fade-in duration-1000 rounded-t-2xl flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
