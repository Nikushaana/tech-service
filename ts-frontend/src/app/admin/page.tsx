"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Loader2Icon } from "lucide-react";
import FormInput from "../components/inputs/form-input";
import * as Yup from "yup";

export default function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);

  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  //   useEffect(() => {
  //     if (admin.id) {
  //       router.push("/admin/panel/vacancy");
  //     }
  //   }, [admin]);

  // Yup validation schema
  const loginSchema = Yup.object().shape({
    email: Yup.string().required("ელ. ფოსტა აუცილებელია"),
    password: Yup.string().required("პაროლი აუცილებელია"),
  });

  const handleLogin = async () => {
    // setLoading(true);
    // try {
    //   // Yup validation
    //   resetErrors();
    //   await loginSchema.validate(values, { abortEarly: false });
    //   axiosFront
    //     .post(`auth/login`, {
    //       phone: values.phone,
    //       password: values.password,
    //     })
    //     .then((res) => {
    //       router.push("/");
    //       resetValues();
    //       toast.success("ავტორიზაცია შესრულდა", {
    //         position: "bottom-right",
    //         autoClose: 3000,
    //       });
    //       resetErrors();
    //       // Save user and token in store
    //       const role = res.data.user.role; // "individual" | "company" | "technician"
    //       const token = res.data.token;
    //       login(role, token); // single method handles setting currentUser & localStorage
    //     })
    //     .catch((error) => {
    //       toast.error("ავტორიზაცია ვერ შესრულდა", {
    //         position: "bottom-right",
    //         autoClose: 3000,
    //       });
    //       setErrors("phone", "შეცდომა");
    //       setErrors("password", "შეცდომა");
    //     })
    //     .finally(() => {
    //       setLoading(false);
    //     });
    // } catch (err: any) {
    //   // Yup validation errors
    //   if (err.inner) {
    //     err.inner.forEach((e: any) => {
    //       if (e.path) {
    //         setErrors(e.path, e.message);
    //         toast.error(e.message, {
    //           position: "bottom-right",
    //           autoClose: 3000,
    //         });
    //       }
    //     });
    //   }
    //   setLoading(false);
    // }
  };

  return (
    <div className="flex flex-col gap-y-5 items-center justify-center h-screen px-4">
      <div className="rounded-xl bg-gray-100 border-[1px] w-full max-w-sm sm:max-w-md md:max-w-lg p-6 sm:p-10 shadow-2xl flex flex-col gap-y-5">
        <img
          onClick={() => {
            router.push("/");
          }}
          src="/images/logo.png"
          alt="logo"
          className="h-[60px] object-contain cursor-pointer self-center"
        />

        {/* <FormInput
          id="email"
          value={values.email || ""}
          onChange={(e) => setValues("email", e.target.value)}
          label="ელ. ფოსტა"
          error={errors.email}
        />
        <FormInput
          id="password"
          value={values.password || ""}
          onChange={(e) => setValues("password", e.target.value)}
          label="პაროლი"
          type="password"
          error={errors.password}
        /> */}

        <Button
          onClick={() => {
            handleLogin();
          }}
          disabled={loading}
          className="h-11 cursor-pointer"
        >
          {loading && <Loader2Icon className="animate-spin" />}შესვლა
        </Button>
      </div>
    </div>
  );
}
