"use client";

import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { useState } from "react";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { axiosAdmin } from "@/app/lib/api/axios";

export default function Page() {
  const queryClient = useQueryClient();

  const [values, setValues] = useState({
    question: "",
    answer: "",
  });
  const [errors, setErrors] = useState({
    question: "",
    answer: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  //validation
  const faqSchema = Yup.object().shape({
    question: Yup.string().required("შეკითხვა აუცილებელია"),
    answer: Yup.string().required("პასუხი აუცილებელია"),
  });

  //add faq
  const addFaqMutation = useMutation({
    mutationFn: (payload: { question: string; answer: string }) =>
      axiosAdmin.post("admin/faq", payload),

    onSuccess: () => {
      toast.success("FAQ დაემატა");

      setValues({ question: "", answer: "" });
      setErrors({ question: "", answer: "" });

      // refresh faqs list
      queryClient.invalidateQueries({
        queryKey: ["adminFaqs"],
      });
    },

    onError: () => {
      toast.error("ვერ დაემატა");
    },
  });

  const handleAddFaq = async () => {
    try {
      await faqSchema.validate(values, { abortEarly: false });

      addFaqMutation.mutate(values);
    } catch (err: any) {
      if (err.inner) {
        const newErrors: any = {};
        err.inner.forEach((e: any) => {
          if (e.path) {
            newErrors[e.path] = e.message;
            toast.error(e.message);
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 flex flex-col gap-2 w-full max-w-2xl mx-auto">
      <PanelFormInput
        id="question"
        value={values.question}
        onChange={handleChange}
        label="შეკითხვა"
        error={errors.question}
      />

      <PanelFormInput
        id="answer"
        value={values.answer}
        onChange={handleChange}
        label="პასუხი"
        error={errors.answer}
      />

      <div className="flex justify-end">
        <Button
          onClick={handleAddFaq}
          disabled={addFaqMutation.isPending}
          className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto"
        >
          {addFaqMutation.isPending && <Loader2Icon className="animate-spin" />}
          დამატება
        </Button>
      </div>
    </div>
  );
}
