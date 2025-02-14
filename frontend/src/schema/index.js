import * as Yup from 'yup';

export const subAdminSchema = Yup.object({
    username: Yup.string().trim().min(2).required("Please enter username"),
    email: Yup.string().trim().email().required("Please enter email"),
    password: Yup.string().trim().min(8).required("Please enter password"),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

export const tagSchema = Yup.object({
    tag_name: Yup.string().trim().min(2).required("Please enter Tag name"),
});

export const registerSchema = Yup.object({
    username: Yup.string().trim().min(2).required("Please enter username"),
    email: Yup.string().trim().email().required("Please enter email"),
    password: Yup.string().trim().min(8).required("Please enter password"),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match'),
})

export const signinSchema = Yup.object({
    email: Yup.string().trim().email().required("Please enter email"),
    password: Yup.string().trim().min(8).required("Please enter password"),
});

export const inquirySchema = Yup.object({
    inquireFor: Yup.string()
        .required("Please select an option"),

    purpose: Yup.string().test("no-whitespace", "Whitespace is not allowed", (value) => !value || value.trim().length > 0)

});

export const contestSchema = Yup.object({
    title: Yup.string().trim().required("Please give title to the contest"),
    description: Yup.string().trim().required("Please describe contest for more information"),
    start_date: Yup.date().required("Please select starting date of the contest"),
    end_date: Yup.date().required("Please select ending date of the contest"),
    rules: Yup.string().trim().required("Need rules & guidelines for contest"),
    contest_size: Yup.number().nullable().min(0, "Negative numbers are not allowed"),
    prize_money: Yup.number().nullable().min(0, "Negative numbers are not allowed"),
});

export const infinteProSchema = Yup.object({
    email: Yup.string().trim().email().required("Please enter email"),
    phn_number: Yup.string().trim().min(10, "Phone Number must be 10 character long").max(10, "Phone Number must be 10 character long").required("Please enter your phone number").matches(/^[6-9]\d{9}$/, "Please enter valid Mobile Number"),
    upi: Yup.string().trim().required("Please enter your UPI ID").matches(/^[a-zA-Z0-9._%+-]{3,50}@[a-zA-Z]{2,}$/, "Please enter a valid UPI ID"),
    state: Yup.string().required("Please select your state"),
    city: Yup.string().required("Please select your city"),
});

export const extensionFilter = (file) => {
    if (!file) return false;

    return ['image/jpg', 'image/jpeg', 'image/png'].includes(file.type);
}