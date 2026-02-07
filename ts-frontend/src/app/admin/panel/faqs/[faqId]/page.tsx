"use client";

import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosAdmin } from "@/app/lib/api/axios";

const fetchAdminFaqById = async (faqId: string) => {
  const { data } = await axiosAdmin.get(`admin/faqs/${faqId}`);
  return data;
};

export default function Page() {
  const { faqId } = useParams<{
    faqId: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: faq,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["adminFaq", faqId],
    queryFn: () => fetchAdminFaqById(faqId),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      router.back();
    }
  }, [isError, router]);

  const [values, setValues] = useState({
    question: "",
    answer: "",
    status: false,
    order: 0,
  });
  const [errors, setErrors] = useState({
    question: "",
    answer: "",
  });

  useEffect(() => {
    if (faq) {
      setValues({
        question: faq.question,
        answer: faq.answer,
        status: faq.status,
        order: faq.order,
      });
    }
  }, [faq]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [id]: id == "order" ? Number(value) : value,
    }));
  };

  // validation
  const faqSchema = Yup.object().shape({
    question: Yup.string().required("შეკითხვა აუცილებელია"),
    answer: Yup.string().required("პასუხი აუცილებელია"),
  });

  const updateFaqMutation = useMutation({
    mutationFn: async (payload: any) =>
      axiosAdmin.patch(`admin/faqs/${faqId}`, payload),

    onSuccess: () => {
      toast.success("FAQ განახლდა");

      // refetch faq data
      queryClient.invalidateQueries({
        queryKey: ["adminFaq", faqId],
      });
      // refresh faqs list
      queryClient.invalidateQueries({
        queryKey: ["adminFaqs"],
      });

      setErrors({ question: "", answer: "" });
    },

    onError: () => {
      toast.error("ვერ განახლდა");
    },
  });

  const handleUpdateFaq = async () => {
    try {
      await faqSchema.validate(values, { abortEarly: false });

      updateFaqMutation.mutate(values);
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

  if (isLoading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className={`w-full flex flex-col items-center gap-y-[20px]`}>
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between w-full gap-4">
        <div className="w-full sm:w-[120px]">
          <PanelFormInput
            id="order"
            value={String(values.order)}
            onChange={handleChange}
            label="რიგი"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <p>დაბლოკილი</p>
          <Switch
            checked={values.status}
            onCheckedChange={(checked) =>
              setValues((prev) => ({ ...prev, status: checked }))
            }
            className="cursor-pointer"
          />
          <p>აქტიური</p>
        </div>
      </div>

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

      <Button
        onClick={handleUpdateFaq}
        disabled={updateFaqMutation.isPending}
        className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto self-end"
      >
        {updateFaqMutation.isPending && (
          <Loader2Icon className="animate-spin" />
        )}{" "}
        ცვლილების შენახვა
      </Button>
    </div>
  );
}
