"use client";

import { axiosAdmin } from "@/app/api/axios";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Dropdown } from "@/app/components/inputs/drop-down";
import * as Yup from "yup";
import { Button } from "@/app/components/ui/button";
import { toast } from "react-toastify";
import StarRating from "@/app/components/inputs/star-rating";
import PanelFormInput from "@/app/components/inputs/panel-form-input";
import { useParams } from "next/navigation";

export default function Page() {
  const { reviewId } = useParams<{
      reviewId: string;
    }>();

  const [review, setReview] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  const [values, setValues] = useState({
    review: "",
    stars: 5,
    status: 1,
  });

  const [errors, setErrors] = useState({
    review: "",
    stars: "",
  });

  // fetch review
  const fetchReview = () => {
    setLoading(true);

    axiosAdmin
      .get(`admin/reviews/${reviewId}`)
      .then((res) => {
        setReview(res.data);
        setValues({
          review: res.data.review || "",
          stars: res.data.stars || 5,
          status: res.data.status ? 2 : 1 || 1,
        });
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  // update order

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { id: string; value: string } }
  ) => {
    const { id, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const updateReviewSchema = Yup.object().shape({
    review: Yup.string().required("შეავსე შეფასების ველი"),
    stars: Yup.number()
      .required("შეაფასე ვარსკვლავებით")
      .min(1, "მინიმუმ 1 ვარსკვლავი უნდა იყოს")
      .max(5, "მაქსიმუმ 5 ვარსკვლავი შეიძლება იყოს"),
  });

  const handleAdminUpdateReview = async () => {
    setLoading(true);
    try {
      // Yup validation
      setErrors({
        review: "",
        stars: "",
      });
      await updateReviewSchema.validate(values, { abortEarly: false });

      let payload: any = {
        review: values.review,
        stars: values.stars,
        status: values.status == 1 ? false : true,
      };

      axiosAdmin
        .patch(`admin/reviews/${reviewId}`, payload)
        .then((res) => {
          toast.success(`შეფასება განახლდა`, {
            position: "bottom-right",
            autoClose: 3000,
          });

          fetchReview();

          setErrors({
            review: "",
            stars: "",
          });
        })
        .catch((error) => {
          toast.error("ვერ განახლდა", {
            position: "bottom-right",
            autoClose: 3000,
          });

          setErrors({
            review: "შეცდომა",
            stars: "შეცდომა",
          });

          setLoading(false);
        })
        .finally(() => {});
    } catch (err: any) {
      // Yup validation errors
      if (err.inner) {
        err.inner.forEach((e: any) => {
          if (e.path) {
            setErrors((prev) => ({
              ...prev,
              [e.path]: e.message,
            }));
            toast.error(e.message, {
              position: "bottom-right",
              autoClose: 3000,
            });
          }
        });
      }
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader2Icon className="animate-spin size-6 text-gray-600" />
      </div>
    );

  return (
    <div
      className={`border rounded-lg shadow px-[10px] py-[20px] sm:p-[20px] bg-white w-full max-w-3xl mx-auto flex flex-col gap-y-4`}
    >
      {/* Header */}
      <h2 className={`flex justify-end text-sm`}>
        {review.status ? "გამოქვეყნებულია" : "გამოუქვეყნებელია"}
      </h2>

      {/* Main Info */}
      <div>
        <p className="text-sm">
          დაემატა:{" "}
          <span className="text-base font-semibold">
            {dayjs(review.created_at).format("DD.MM.YYYY - HH:mm:ss")}
          </span>
        </p>
        <p className="text-sm">
          განახლდა:{" "}
          <span className="text-base font-semibold">
            {dayjs(review.updated_at).format("DD.MM.YYYY - HH:mm:ss")}
          </span>
        </p>
      </div>

      {/* User */}
      <div>
        <h3>{review.individual ? "ინდივიდუალური მომხმარებელი" : "კომპანია"}</h3>
        <p>
          {review.individual
            ? review.individual?.name + " " + review.individual?.lastName
            : review.company && review.company?.companyName}
        </p>

        <p>
          {review.individual ? review.individual?.phone : review.company?.phone}
        </p>
      </div>

      {/* review */}
      <div className="flex flex-col gap-y-2">
        <PanelFormInput
          id="review"
          value={values.review}
          onChange={handleChange}
          label="შეფასება"
          error={errors.review}
        />
        <StarRating
          value={values.stars || 5}
          onChange={(star) => setValues((prev) => ({ ...prev, stars: star }))}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-[10px]">
        <Dropdown
          data={[
            { id: 1, name: "დაბლოკვა" },
            { id: 2, name: "გამოქვეყნება" },
          ]}
          id="status"
          value={values.status}
          onChange={handleChange}
          label="სტატუსი"
        />
      </div>

      <Button
        onClick={() => {
          handleAdminUpdateReview();
        }}
        disabled={loading}
        className="h-11 cursor-pointer self-end"
      >
        ცვლილებების შენახვა
      </Button>
    </div>
  );
}
