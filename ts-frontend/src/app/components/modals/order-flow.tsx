"use client";

import { useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import PanelFormInput from "../inputs/panel-form-input";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderActions } from "@/app/hooks/useOrderActions";
import { useOrderFlowStore } from "@/app/store/useOrderFlowStore";

interface FormValues {
  payment_amount?: string;
  payment_reason?: string;
  reason?: string;
}

export default function OrderFlow() {
  const { openOrderFlowModal, HandleCloseOrderFlowModal } = useOrderFlowStore();
  const actions = useOrderActions();

  const [values, setValues] = useState<FormValues>({
    payment_amount: "",
    payment_reason: "",
    reason: "",
  });

  const [errors, setErrors] = useState({
    payment_amount: "",
    payment_reason: "",
    reason: "",
  });

  const handleChange = (e: { target: { id: string; value: string } }) => {
    const { id, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const schemas = {
    waitingDecision: Yup.object({
      payment_amount: Yup.string().required("საფასური აუცილებელია"),
      payment_reason: Yup.string().required("აღწერა აუცილებელია"),
    }),
    waitingPayment: Yup.object({
      payment_amount: Yup.string().required("საფასური აუცილებელია"),
      payment_reason: Yup.string().required("აღწერა აუცილებელია"),
    }),
    decisionCancel: Yup.object({
      reason: Yup.string().required("გაუქმების მიზეზი აუცილებელია"),
    }),
  };

  // add waiting decision
  const handleWaitingDecision = async () => {
    if (!openOrderFlowModal) return;

    const { actionKey, orderId, role } = openOrderFlowModal;

    try {
      await schemas[actionKey].validate(values, {
        abortEarly: false,
      });

      if (actionKey === "decisionCancel") {
        await actions.decision(
          "decisionCancel",
          orderId,
          { decision: "cancel", reason: values.reason },
          role!
        );
      } else {
        await actions[actionKey](orderId, {
          payment_amount: values.payment_amount!,
          payment_reason: values.payment_reason!,
        });
      }

      HandleCloseOrderFlowModal();
      setValues({ payment_amount: "", payment_reason: "", reason: "" });
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

  const isPending = actions.loadingAction === openOrderFlowModal?.actionKey;

  return (
    <div
      className={`${
        openOrderFlowModal ? "" : "opacity-0 pointer-events-none"
      } fixed inset-0 z-20 flex items-center justify-center`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity ${
          openOrderFlowModal ? "opacity-50" : "opacity-0"
        }`}
        onClick={() => HandleCloseOrderFlowModal()} // closes when clicking outside
      ></div>

      <div
        className={`bg-white rounded-2xl shadow-lg py-6 px-3 w-full sm:w-[600px] mx-[10px] z-[22] transition-transform duration-200 flex flex-col gap-y-[10px] max-h-[80vh] ${
          openOrderFlowModal ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-lg font-semibold ">დაამატე ინფორმაცია</h2>
        <div className="flex-1 overflow-y-auto showScroll pr-2">
          <div className="flex flex-col gap-y-[10px]">
            {openOrderFlowModal?.actionKey !== "decisionCancel" && (
              <PanelFormInput
                id="payment_amount"
                value={values.payment_amount || ""}
                onChange={handleChange}
                label={"საფასური"}
                error={errors.payment_amount}
              />
            )}
            {openOrderFlowModal?.actionKey !== "decisionCancel" && (
              <PanelFormInput
                id="payment_reason"
                value={values.payment_reason || ""}
                onChange={handleChange}
                label={"საფასურის აღწერა"}
                error={errors.payment_reason}
              />
            )}
            {openOrderFlowModal?.actionKey === "decisionCancel" && (
              <PanelFormInput
                id="reason"
                value={values.reason || ""}
                onChange={handleChange}
                label="გაუქმების მიზეზი"
                error={errors.reason}
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            onClick={() => {
              HandleCloseOrderFlowModal();
              setErrors((prev) => ({
                ...prev,
                payment_amount: "",
                payment_reason: "",
                reason: "",
              }));

              setValues((prev) => ({
                ...prev,
                payment_amount: "",
                payment_reason: "",
                reason: "",
              }));
            }}
            className="h-[45px] px-6 cursor-pointer bg-red-500 hover:bg-[#b91c1c]"
          >
            გაუქმება
          </Button>
          <Button
            onClick={handleWaitingDecision}
            disabled={isPending}
            className="h-[45px] px-6 text-white cursor-pointer"
          >
            {isPending && <Loader2Icon className="animate-spin" />}
            დამატება
          </Button>
        </div>
      </div>
    </div>
  );
}
