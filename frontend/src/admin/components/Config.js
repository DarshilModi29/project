import Swal from "sweetalert2";

const config = {
    SERVER_URL: "http://localhost:5000",

    alerts: {
        success: (text, title = "Success") => Swal.fire({
            title: title,
            text: text,
            icon: 'success',
        }),

        error: (text, title = "Error") => Swal.fire({
            title,
            text,
            icon: 'error',
            confirmButtonColor: '#d33',
        }),

        confirm: (title, text, confirmText = "Confirm", cancelText = "Cancel") => {
            return new Promise((resolve, reject) => {
                Swal.fire({
                    title,
                    text,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: confirmText,
                    cancelButtonText: cancelText
                }).then((result) => {
                    if (result.isConfirmed) {
                        resolve(true);  // Resolve as true when confirmed
                    } else {
                        resolve(false); // Resolve as false when canceled
                    }
                }).catch(reject);
            });
        }
    }
};

export default config;