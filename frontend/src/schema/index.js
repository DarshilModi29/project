import * as Yup from 'yup';

export const subAdminSchema = Yup.object({
    username: Yup.string().min(2).required("Please enter username"),
    email: Yup.string().email().required("Please enter email"),
    password: Yup.string().min(8).required("Please enter password"),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

export const tagSchema = Yup.object({
    tag_name: Yup.string().min(2).required("Please enter Tag name"),
});

export const registerSchema = Yup.object({
    username: Yup.string().min(2).required("Please enter username"),
    email: Yup.string().email().required("Please enter email"),
    password: Yup.string().min(8).required("Please enter password"),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match'),
})

export const signinSchema = Yup.object({
    email: Yup.string().email().required("Please enter email"),
    password: Yup.string().min(8).required("Please enter password"),
});

export const inquirySchema = Yup.object({
    inquireFor: Yup.string().required("Please select an option"),
    description: Yup.string().min(5).required("Please describe your inquiry image or tag"),
})

export const extensionFilter = (file) => {
    if (!file) return false;

    return ['image/jpg', 'image/jpeg', 'image/png'].includes(file.type);
}