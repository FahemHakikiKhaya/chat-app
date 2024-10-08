"use client";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { IoKeyOutline, IoMailOutline, IoPersonOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingModal from "@/app/components/LoadingModal";

enum AuthFormType {
  LOGIN = "Login",
  REGISTER = "Register",
}

const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [formType, setFormType] = useState<AuthFormType>(AuthFormType.LOGIN);
  const [isLoading, setIsLoading] = useState<Boolean>(false);

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/users");
    }
  }, [router, session.status]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const toggleFormType = () => {
    if (formType === AuthFormType.LOGIN) {
      setFormType(AuthFormType.REGISTER);
    } else {
      setFormType(AuthFormType.LOGIN);
    }
  };

  const handleRegister = async (data: FieldValues) => {
    try {
      await axios.post("/api/register", data);
      await signIn("credentials", data);
      toast.success("Registered successfully", { position: "top-right" });
    } catch (error) {
      toast.error(`${error}`, { position: "top-right" });
    }
  };

  const handleLogin = async (action: string, data?: FieldValues) => {
    try {
      const res = await signIn(action, {
        ...(action === "credentials" && data),
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      if (res?.ok) {
        toast.success("Logged in successfully", { position: "top-right" });
      }
    } catch (error) {
      toast.error(`${error}`, { position: "top-right" });
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {
      if (formType === AuthFormType.REGISTER) {
        await handleRegister(data);
      } else if (formType === AuthFormType.LOGIN) {
        await handleLogin("credentials", data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {formType === AuthFormType.REGISTER && (
        <label className="input input-bordered flex items-center gap-2">
          <IoPersonOutline />
          <input
            type="text"
            className="grow"
            placeholder="Username"
            {...register("name", { required: false })}
          />
        </label>
      )}
      <label className="input input-bordered flex items-center gap-2">
        <IoMailOutline />
        <input
          type="text"
          className="grow"
          placeholder="Email"
          {...register("email", { required: true })}
        />
      </label>
      <label className="input input-bordered flex items-center gap-2">
        <IoKeyOutline />
        <input
          type="password"
          className="grow"
          placeholder="Password"
          {...register("password", { required: true })}
        />
      </label>
      <button className="btn w-full" type="submit">
        {isLoading ? (
          <>
            <span className="loading loading-spinner"></span>
            loading
          </>
        ) : formType === AuthFormType.LOGIN ? (
          "Sign In"
        ) : (
          "Register"
        )}
      </button>
      <div className="divider">OR</div>
      <div className="flex flex-col gap-4">
        <button
          className="btn btn-md btn-outline"
          onClick={() => handleLogin("google")}
        >
          <FcGoogle />
          Continue With Google
        </button>
        <button
          className="btn btn-md btn-outline"
          onClick={() => handleLogin("github")}
        >
          <FaGithub />
          Continue With Github
        </button>
      </div>

      <div className="flex gap-1 justify-center">
        <p>New to connect?</p>
        <p className="underline cursor-pointer" onClick={toggleFormType}>
          {formType === AuthFormType.LOGIN ? "Create an account" : "Login"}
        </p>
      </div>
    </form>
  );
};

export default AuthForm;
