const ZARINPAL_BASE_URL = "https://sandbox.zarinpal.com";

const ZARINPAL_REQUEST_URL = `${ZARINPAL_BASE_URL}/pg/v4/payment/request.json`;
const ZARINPAL_VERIFY_URL = `${ZARINPAL_BASE_URL}/pg/v4/payment/verify.json`;
const ZARINPAL_GATEWAY_URL = `${ZARINPAL_BASE_URL}/pg/StartPay/`;

const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;
const CALLBACK_URL = process.env.ZARINPAL_CALLBACK_URL;

if (!MERCHANT_ID) {
  throw new Error("❌ ZARINPAL_MERCHANT_ID is not defined in .env");
}

if (!CALLBACK_URL) {
  throw new Error("❌ ZARINPAL_CALLBACK_URL is not defined in .env");
}

export interface ZarinPalRequestPayload {
  amount: number;
  description: string;
  email?: string;
  mobile?: string;
  orderId?: string;
}

export interface ZarinPalRequestResult {
  success: boolean;
  authority?: string;
  paymentUrl?: string;
  fee?: number;
  feeType?: string;
  error?: string;
  errorCode?: number;
}

export interface ZarinPalVerifyPayload {
  authority: string;
  amount: number;
}

export interface ZarinPalVerifyResult {
  success: boolean;
  alreadyVerified?: boolean;
  refId?: string;
  cardPan?: string;
  cardHash?: string;
  feeType?: string;
  fee?: number;
  error?: string;
  errorCode?: number;
}

const getErrorMessage = (code: number): string => {
  const errors: Record<number, string> = {
    [-9]: "خطای اعتبارسنجی (داده‌های ارسالی نامعتبر)",
    [-10]: "آی‌پی یا مرچنت کد پذیرنده صحیح نیست",
    [-11]: "مرچنت کد فعال نیست",
    [-12]: "تلاش بیش از حد در یک بازه زمانی کوتاه",
    // [-13]: "محدودیت تراکنش",
    [-14]: "آدرس بازگشت با دامنه ثبت شده مغایرت دارد",
    // [-15]: "درگاه پرداخت به حالت تعلیق درآمده است",
    // [-16]: "سطح تایید پذیرنده پایین‌تر از سطح نقره‌ای است",
    // [-17]: "محدودیت پذیرنده در سطح آبی",
    // [-18]: "امکان استفاده از کد درگاه اختصاصی در سایت دیگر را ندارید",
    // [-19]: "امکان ایجاد تراکنش برای این ترمینال امکان‌پذیر نیست",

    // [-30]: "پذیرنده اجازه دسترسی به تسویه شناور را ندارد",
    // [-31]: "حساب بانکی تسویه را به پنل اضافه کنید",
    // [-32]: "مبلغ تسهیم از مبلغ کل بیشتر است",
    // [-33]: "درصدهای تسهیم اشتباه است",
    // [-34]: "مبلغ تسهیم از مبلغ کل بیشتر است",
    // [-35]: "تعداد افراد دریافت‌کننده تسهیم بیش از حد مجاز است",
    // [-36]: "حداقل مبلغ جهت تسهیم باید ۱۰۰۰۰ ریال باشد",
    // [-37]: "یک یا چند شماره شبا غیرفعال است",
    // [-38]: "عدم تعریف صحیح شبا",
    // [-39]: "خطا در تسهیم",
    // [-40]: "پارامترهای اضافی نامعتبر است",
    [-41]: "حداکثر مبلغ پرداختی ۱۰۰ میلیون تومان است",

    [-50]: "مبلغ پرداخت شده با مبلغ ارسالی متفاوت است",
    [-51]: "پرداخت ناموفق",
    [-52]: "خطای غیرمنتظره",
    [-53]: "پرداخت متعلق به این مرچنت کد نیست",
    [-54]: "اتوریتی نامعتبر است",
    [-55]: "تراکنش مورد نظر یافت نشد",

    // [-60]: "امکان ریورس کردن تراکنش با بانک وجود ندارد",
    // [-61]: "تراکنش موفق نیست یا قبلاً ریورس شده است",
    // [-62]: "آی‌پی درگاه ست نشده است",
    // [-63]: "حداکثر زمان برای ریورس منقضی شده است",
  };

  return errors[code] || `خطای ناشناخته (کد: ${code})`;
};

export const requestPayment = async (
  payload: ZarinPalRequestPayload,
): Promise<ZarinPalRequestResult> => {
  try {
    const response = await fetch(ZARINPAL_REQUEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: payload.amount,
        currency: "IRR",
        description: payload.description,
        callback_url: CALLBACK_URL,
        metadata: {
          email: payload.email,
          mobile: payload.mobile,
          order_id: payload.orderId,
        },
      }),
    });

    const result = await response.json();

    if (result.data?.code === 100) {
      return {
        success: true,
        authority: result.data.authority,
        paymentUrl: `${ZARINPAL_GATEWAY_URL}${result.data.authority}`,
        fee: result.data.fee,
        feeType: result.data.fee_type,
      };
    }

    const errorCode = result.errors?.code || result.data?.code || -999;
    return {
      success: false,
      error: getErrorMessage(errorCode),
      errorCode,
    };
  } catch (error) {
    console.error("❌ ZarinPal request error:", error);
    return {
      success: false,
      error: "خطا در ارتباط با درگاه پرداخت",
    };
  }
};

export const verifyPayment = async (
  payload: ZarinPalVerifyPayload,
): Promise<ZarinPalVerifyResult> => {
  try {
    const response = await fetch(ZARINPAL_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        authority: payload.authority,
        amount: payload.amount,
      }),
    });

    const result = await response.json();

    if (result.data?.code === 100) {
      return {
        success: true,
        alreadyVerified: false,
        refId: String(result.data.ref_id),
        cardPan: result.data.card_pan,
        cardHash: result.data.card_hash,
        feeType: result.data.fee_type,
        fee: result.data.fee,
      };
    }

    if (result.data?.code === 101) {
      return {
        success: true,
        alreadyVerified: true,
        refId: String(result.data.ref_id),
        cardPan: result.data.card_pan,
        feeType: result.data.fee_type,
        fee: result.data.fee,
      };
    }

    const errorCode = result.errors?.code || result.data?.code || -999;
    return {
      success: false,
      error: getErrorMessage(errorCode),
      errorCode,
    };
  } catch (error) {
    console.error("❌ ZarinPal verify error:", error);
    return {
      success: false,
      error: "خطا در تأیید پرداخت",
    };
  }
};
