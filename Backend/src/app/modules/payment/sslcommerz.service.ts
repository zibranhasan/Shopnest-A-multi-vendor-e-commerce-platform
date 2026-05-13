import { envVars } from "../../config/env.js";
import type { ISSLPayload } from "./payment.interface.js";

export const sslPaymentInit = async (payload: ISSLPayload) => {
    const formData = new URLSearchParams();
    formData.append("store_id", envVars.SSL.STORE_ID);
    formData.append("store_passwd", envVars.SSL.STORE_PASS);
    formData.append("total_amount", payload.amount.toString());
    formData.append("currency", "BDT");
    formData.append("tran_id", payload.transactionId);
    formData.append("success_url", `${envVars.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}`);
    formData.append("fail_url", `${envVars.SSL.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}`);
    formData.append("cancel_url", `${envVars.SSL.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}`);
    formData.append("ipn_url", envVars.SSL.SSL_IPN_URL);
    formData.append("shipping_method", "N/A");
    formData.append("product_name", "Shopnest Order");
    formData.append("product_category", "E-Commerce");
    formData.append("product_profile", "general");
    formData.append("cus_name", payload.name);
    formData.append("cus_email", payload.email);
    formData.append("cus_add1", "Bangladesh");
    formData.append("cus_city", "Dhaka");
    formData.append("cus_country", "Bangladesh");
    formData.append("cus_phone", payload.phoneNumber || "01700000000");
    formData.append("ship_name", "N/A");
    formData.append("ship_add1", "N/A");
    formData.append("ship_city", "N/A");
    formData.append("ship_state", "N/A");
    formData.append("ship_postcode", "1000");
    formData.append("ship_country", "N/A");

    const response = await fetch(envVars.SSL.SSL_PAYMENT_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
    });

    return await response.json();
};
