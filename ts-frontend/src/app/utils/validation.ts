import * as Yup from "yup";

export const phoneSchema = Yup.string()
    .matches(/^5\d{8}$/, "ნომერი უნდა დაიწყოს 5-ით და იყოს 9 ციფრი")
    .required("ტელეფონის ნომერი აუცილებელია");

export const sendCodeSchema = Yup.object().shape({
    phone: Yup.string()
        .matches(/^5\d{8}$/, "ნომერი უნდა დაიწყოს 5-ით და იყოს 9 ციფრი")
        .required("ტელეფონის ნომერი აუცილებელია"),
});

export const verifyCodeSchema = Yup.object().shape({
    phone: phoneSchema,
    code: Yup.string()
        .required("კოდი აუცილებელია"),
});

export const verifyCodePasswordResetSchema = Yup.object().shape({
    phone: phoneSchema,
    code: Yup.string()
        .required("კოდი აუცილებელია"),
    // Passwords
    newPassword: Yup.string()
        .min(6, "ახალი პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო")
        .required("ახალი პაროლი აუცილებელია"),
    repeatNewPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "პაროლები უნდა დაემთხვეს")
        .required("გაიმეორე ახალი პაროლი"),
});

export const passwordChangeSchema = Yup.object().shape({
    oldPassword: Yup.string()
        .required("ძველი პაროლი აუცილებელია"),
    newPassword: Yup.string()
        .min(6, "ახალი პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო")
        .required("ახალი პაროლი აუცილებელია"),
    repeatNewPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "პაროლები უნდა დაემთხვეს")
        .required("გაიმეორე ახალი პაროლი"),
});

// Role options
export type UserRole = "individual" | "company" | "technician" | "delivery";

export const registerSchema = Yup.object().shape({
    phone: phoneSchema,
    role: Yup.mixed<UserRole>()
        .oneOf(["individual", "company", "technician", "delivery"], "არასწორი როლი")
        .required("როლი აუცილებელია"),

    // Individual & Staff fields
    name: Yup.string().when("role", {
        is: (val: UserRole) => val === "individual" || val === "technician" || val === "delivery",
        then: (schema) => schema.required("სახელი აუცილებელია"),
        otherwise: (schema) => schema.notRequired(),
    }),
    lastName: Yup.string().when("role", {
        is: (val: UserRole) => val === "individual" || val === "technician" || val === "delivery",
        then: (schema) => schema.required("გვარი აუცილებელია"),
        otherwise: (schema) => schema.notRequired(),
    }),

    // Company fields
    companyAgentName: Yup.string().when("role", {
        is: (val: UserRole) => val === "company",
        then: (schema) => schema.required("სახელის აუცილებელია"),
        otherwise: (schema) => schema.notRequired(),
    }),
    companyAgentLastName: Yup.string().when("role", {
        is: (val: UserRole) => val === "company",
        then: (schema) => schema.required("გვარის აუცილებელია"),
        otherwise: (schema) => schema.notRequired(),
    }),
    companyName: Yup.string().when("role", {
        is: (val: UserRole) => val === "company",
        then: (schema) => schema.required("კომპანიის სახელი აუცილებელია"),
        otherwise: (schema) => schema.notRequired(),
    }),
    companyIdentificationCode: Yup.string().when("role", {
        is: (val: UserRole) => val === "company",
        then: (schema) => schema.required("კომპანიის იდენტიფიკაციის კოდი აუცილებელია"),
        otherwise: (schema) => schema.notRequired(),
    }),

    // Passwords
    password: Yup.string()
        .min(6, "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო")
        .required("პაროლი აუცილებელია"),
    repeatPassword: Yup.string()
        .oneOf([Yup.ref("password")], "პაროლები უნდა დაემთხვეს")
        .required("გაიმეორე პაროლი"),
});