"use client";

import { axiosAdmin } from "@/app/api/axios";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { Switch } from "@/app/components/ui/switch";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Button } from "@/app/components/ui/button";

interface FaqPageProps {
  params: Promise<{
    faqId: string;
  }>;
}

export default function Page({ params }: FaqPageProps) {
  const resolvedParams = React.use(params);
  const { faqId } = resolvedParams;

  const [loading, setLoading] = useState<boolean>(true);
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
    setLoading(true);
    axiosAdmin
      .get(`/admin/faqs/${faqId}`)
      .then((res) => {
        const data = res.data;
        setValues({
          question: data.question,
          answer: data.answer,
          status: data.status,
          order: data.order,
        });
        setLoading(false);
      })
      .catch(() => {})
      .finally(() => {});
  }, [faqId]);

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

  const handleUpdateFaq = async () => {
    setLoading(true);
    try {
      await faqSchema.validate(values, { abortEarly: false });

      axiosAdmin
        .patch(`/admin/faqs/${faqId}`, values)
        .then(() => {
          toast.success("FAQ განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          setErrors({ question: "", answer: "" });
          setLoading(false);
        })
        .catch(() => {
          toast.error("ვერ განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });
        });
    } catch (err: any) {
      if (err.inner) {
        const newErrors: any = {};
        err.inner.forEach((e: any) => {
          if (e.path) {
            newErrors[e.path] = e.message;
            toast.error(e.message, {
              position: "bottom-right",
              autoClose: 3000,
            });
          }
        });
        setErrors(newErrors);
      }
      setLoading(false);
    }
  };

  return (
    <div className={`w-full flex flex-col items-center gap-y-[20px]`}>
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <>
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
            disabled={loading}
            className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto self-end"
          >
            {loading && <Loader2Icon className="animate-spin mr-2" />}
            ცვლილების შენახვა
          </Button>
        </>
      )}
    </div>
  );
}
