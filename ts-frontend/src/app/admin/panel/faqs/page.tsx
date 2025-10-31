"use client";

import { axiosAdmin } from "@/app/api/axios";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { Button } from "@/app/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { BsEye } from "react-icons/bs";
import { toast } from "react-toastify";
import * as Yup from "yup";

export default function Page() {
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

  if (loading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-y-[20px] w-full">
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
            disabled={loading}
            className="h-[45px] px-6 text-white cursor-pointer w-full sm:w-auto"
          >
            დამატება
          </Button>
        </div>
      </div>
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">FAQs</h2>
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[900px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">რიგი</TableHead>
                <TableHead className="font-semibold">კითხვა</TableHead>
                <TableHead className="font-semibold">პასუხი</TableHead>
                <TableHead className="font-semibold">სტატუსი</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    ინფორმაცია არ მოიძებნა
                  </TableCell>
                </TableRow>
              ) : (
                faqs.map((faq) => (
                  <TableRow key={faq.id} className="hover:bg-gray-50">
                    <TableCell>{faq.id}</TableCell>
                    <TableCell>{faq.order}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {faq.question}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {faq.answer}
                    </TableCell>
                    <TableCell>
                      {faq.status ? "აქტიური" : "დაბლოკილი"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/panel/faqs/${faq.id}`}>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="hover:bg-gray-100 mr-3"
                        >
                          <BsEye className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        onClick={() => {
                          handleDeleteFaq(faq.id);
                        }}
                        variant="secondary"
                        size="icon"
                        className="bg-[red] hover:bg-[#b91c1c]"
                      >
                        <AiOutlineDelete className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
