import { useState } from "react";
import { toast } from "react-toastify";
import { passwordChangeSchema } from "@/app/utils/validation";
import UserPasswordUpdate from "../shared components/user-password-update";
import { axiosIndividual } from "@/app/lib/api/axios";

export default function IndividualPasswordUpdate() {
  const [values, setValues] = useState({
    oldPassword: "",
    newPassword: "",
    repeatNewPassword: "",
  });

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    repeatNewPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  // change password

  const handleChangeIndividualPassword = async () => {
    setLoading(true);
    try {
      // Yup validation
      setErrors((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        repeatNewPassword: "",
      }));

      await passwordChangeSchema.validate(values, { abortEarly: false });

      axiosIndividual
        .patch(`individual/change-password`, {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        })
        .then((res) => {
          setValues((prev) => ({
            ...prev,
            oldPassword: "",
            newPassword: "",
            repeatNewPassword: "",
          }));

          toast.success(`პაროლი განახლდა`);
        })
        .catch((error) => {
          if (error.response.data.message === "Old password is incorrect") {
            setErrors((prev) => ({
              ...prev,
              oldPassword: "შეცდომა",
            }));
            toast.error("ძველი პაროლი არასწორია");
          } else {
            toast.error("პაროლი ვერ განახლდა");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err: any) {
      // Yup validation errors
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
      setLoading(false);
    }
  };
  return (
    <UserPasswordUpdate
      title="პაროლის განახლება"
      values={values}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleChangeIndividualPassword}
      loading={loading}
    />
  );
}
