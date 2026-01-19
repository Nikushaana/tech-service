"use client";

import { useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import PanelFormInput from "../inputs/panel-form-input";
import { Loader2Icon } from "lucide-react";
import { useReviewsStore } from "@/app/store/useReviewsStore";
import StarRating from "../inputs/star-rating";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosCompany, axiosIndividual } from "@/app/lib/api/axios";

interface CreateReviewValues {
  review: string;
  stars: number;
}

export default function CreateReview() {
  const { openCreateReviewModal, toggleOpenCreateReviewModal, modalType } =
    useReviewsStore();

  const queryClient = useQueryClient();

  const [values, setValues] = useState<CreateReviewValues>({
    review: "",
    stars: 5,
  });

  const [errors, setErrors] = useState({
    review: "",
    stars: "",
  });

  const handleChange = (e: { target: { id: string; value: string } }) => {
    const { id, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const createReviewSchema = Yup.object().shape({
    review: Yup.string().required("შეავსე შეფასების ველი"),
    stars: Yup.number()
      .required("შეაფასე ვარსკვლავებით")
      .min(1, "მინიმუმ 1 ვარსკვლავი უნდა იყოს")
      .max(5, "მაქსიმუმ 5 ვარსკვლავი შეიძლება იყოს"),
  });

  // add review
  const addReviewMutation = useMutation({
    mutationFn: (payload: { review: string; stars: number }) =>
      (modalType === "company" ? axiosCompany : axiosIndividual).post(
        `${modalType}/create-review`,
        payload
      ),

    onSuccess: () => {
      toast.success("შეფასება დაემატა", {
        position: "bottom-right",
        autoClose: 3000,
      });

      // refresh reviews list
      queryClient.invalidateQueries({
        queryKey: ["userReviews"],
      });

      toggleOpenCreateReviewModal();

      // reset form values
      setValues({
        review: "",
        stars: 5,
      });

      setErrors({
        review: "",
        stars: "",
      });
    },

    onError: () => {
      toast.error("შეფასება ვერ დაემატა", {
        position: "bottom-right",
        autoClose: 3000,
      });
    },
  });

  const handleCreateReview = async () => {
    try {
      await createReviewSchema.validate(values, { abortEarly: false });

      addReviewMutation.mutate(values);
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
    }
  };

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
                stars: "",
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
            onClick={handleCreateReview}
            disabled={addReviewMutation.isPending}
            className="h-[45px] px-6 text-white cursor-pointer"
          >
            {addReviewMutation.isPending && (
              <Loader2Icon className="animate-spin" />
            )}
            დამატება
          </Button>
        </div>
      </div>
    </div>
  );
}
