"use client";

import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import PanelFormInput from "../inputs/panel-form-input";
import { Loader2Icon } from "lucide-react";
import { useReviewsStore } from "@/app/store/useReviewsStore";
import StarRating from "../inputs/star-rating";
import { Button } from "@/components/ui/button";

interface CreateReviewValues {
  review: string;
  stars: null | number;
}

export default function CreateReview() {
  const {
    openCreateReviewModal,
    toggleOpenCreateReviewModal,
    modalType,
    createReview,
  } = useReviewsStore();

  const [values, setValues] = useState<CreateReviewValues>({
    review: "",
    stars: 5,
  });

  const [errors, setErrors] = useState({
    review: "",
    stars: "",
  });

  const [loading, setLoading] = useState(false);

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

  const createOrderSchema = Yup.object().shape({
    review: Yup.string().required("შეავსე შეფასების ველი"),
    stars: Yup.number()
      .required("შეაფასე ვარსკვლავებით")
      .min(1, "მინიმუმ 1 ვარსკვლავი უნდა იყოს")
      .max(5, "მაქსიმუმ 5 ვარსკვლავი შეიძლება იყოს"),
  });

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      await createOrderSchema.validate(values, { abortEarly: false });

      await createReview(modalType!, {
        review: values.review,
        stars: values.stars,
      });
      toggleOpenCreateReviewModal();

      // reset form values
      setValues({
        review: "",
        stars: 5,
      });

      setErrors({
        review: "",
        stars: ""
      });

      setLoading(false);
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

  useEffect(() => {
    if (openCreateReviewModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openCreateReviewModal]);

  return (
    <div
      className={`${
        openCreateReviewModal ? "" : "opacity-0 pointer-events-none"
      } fixed inset-0 z-20 flex items-center justify-center`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity ${
          openCreateReviewModal ? "opacity-50" : "opacity-0"
        }`}
        onClick={() => toggleOpenCreateReviewModal()} // closes when clicking outside
      ></div>

      <div
        className={`bg-white rounded-2xl shadow-lg py-6 px-3 w-full sm:w-[600px] mx-[10px] z-[22] transition-transform duration-200 flex flex-col gap-y-[10px] max-h-[80vh] ${
          openCreateReviewModal ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-lg font-semibold ">შეაფასე Tech Service</h2>
        <div className="flex-1 overflow-y-auto showScroll pr-2">
          <div className="flex flex-col gap-y-[10px]">
            <div className="self-end">
              <StarRating
                value={values.stars || 5}
                onChange={(star) =>
                  setValues((prev) => ({ ...prev, stars: star }))
                }
              />
            </div>
            <PanelFormInput
              id="review"
              value={values.review || ""}
              onChange={handleChange}
              label={"შეფასება"}
              error={errors.review}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            onClick={() => {
              toggleOpenCreateReviewModal();
              setErrors((prev) => ({
                ...prev,
                review: "",
                stars: ""
              }));

              setValues((prev) => ({
                ...prev,
                review: "",
                stars: 5,
              }));
            }}
            className="h-[45px] px-6 cursor-pointer bg-red-500 hover:bg-[#b91c1c]"
          >
            გაუქმება
          </Button>
          <Button
            onClick={handleCreateOrder}
            disabled={loading}
            className="h-[45px] px-6 text-white cursor-pointer"
          >
            {loading && <Loader2Icon className="animate-spin" />}
            დამატება
          </Button>
        </div>
      </div>
    </div>
  );
}
