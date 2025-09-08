"use client";

import { axiosAdmin } from "@/app/api/axios";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { Button } from "@/app/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { BsPen } from "react-icons/bs";
import { toast } from "react-toastify";
import * as Yup from "yup";

export default function Page() {
  const router = useRouter();

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFaqs = () => {
    setLoading(true);
    axiosAdmin
      .get("/admin/faqs")
      .then(({ data }) => setFaqs(data))
      .catch((err) => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

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

  // validation
  const faqSchema = Yup.object().shape({
    question: Yup.string().required("შეკითხვა აუცილებელია"),
    answer: Yup.string().required("პასუხი აუცილებელია"),
  });

  // add faq
  const handleAddFaq = async () => {
    setLoading(true);
    try {
      await faqSchema.validate(values, { abortEarly: false });

      axiosAdmin
        .post(`/admin/faq`, values)
        .then(() => {
          toast.success("FAQ დაემატა", {
            position: "bottom-right",
            autoClose: 3000,
          });
          fetchFaqs();
          setValues({ question: "", answer: "" });
          setErrors({ question: "", answer: "" });
        })
        .catch(() => {
          toast.error("ვერ განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });
          setLoading(false);
        })
        .finally(() => {});
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

  // delete faq
  const handleDeleteFaq = async (id: number) => {
    setLoading(true);
    axiosAdmin
      .delete(`/admin/faqs/${id}`)
      .then(() => {
        toast.success("FAQ წაიშალა", {
          position: "bottom-right",
          autoClose: 3000,
        });
        fetchFaqs();
      })
      .catch(() => {
        toast.error("ვერ წაიშალა", {
          position: "bottom-right",
          autoClose: 3000,
        });
        setLoading(false);
      })
      .finally(() => {});
  };

  return (
    <div className="flex flex-col items-center gap-y-[20px] w-full">
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col gap-2 w-full max-w-2xl mx-auto">
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
            disabled={loading}
            className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto"
          >
            {loading && <Loader2Icon className="animate-spin mr-2" />}
            დამატება
          </Button>
        </div>
      </div>
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        faqs.map((faq) => (
          <div
            key={faq.id}
            className="w-full p-4 border rounded-xl shadow-sm bg-white space-y-2"
          >
            <div className="flex items-center justify-between">
              <p># {faq.order}</p>
              <div className="flex items-center gap-[10px]">
                <p className="text-sm">
                  {faq.status ? "აქტიური" : "დაბლოკილი"}
                </p>
                <Button
                  onClick={() => {
                    router.push(`/admin/panel/faqs/${faq.id}`);
                  }}
                  className="bg-[gray] hover:bg-[#696767] text-[20px] cursor-pointer"
                >
                  <BsPen />
                </Button>
                <Button
                  onClick={() => {
                    handleDeleteFaq(faq.id);
                  }}
                  className="bg-[red] hover:bg-[#b91c1c] text-[20px] cursor-pointer"
                >
                  <AiOutlineDelete />
                </Button>
              </div>
            </div>

            <h2 className="text-lg">{faq.question}</h2>

            <p className="text-myLightGray">{faq.answer}</p>
          </div>
        ))
      )}
    </div>
  );
}
