export const getVerificationEmailTemplate = (
  name: string,
  verificationCode: string,
): string => {
  return `
      <div style="direction: rtl; font-family: 'Tahoma', 'Segoe UI', Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fcfcfc;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0957DE; margin: 0; font-size: 22px;">تایید حساب کاربری</h2>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 20px;" />
        <p style="color: #333; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
          سلام <strong>${name || "کاربر گرامی"}</strong>،<br>
          به پلتفرم ما خوش آمدید! برای تکمیل ثبت‌نام و فعال‌سازی حساب کاربری خود، لطفاً از کد تایید زیر استفاده کنید:
        </p>
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; background-color: #f0f5ff; border: 2px dashed #0957DE; color: #0957DE; font-size: 26px; font-weight: bold; letter-spacing: 6px; padding: 12px 30px; border-radius: 8px; font-family: monospace;">
            ${verificationCode}
          </div>
        </div>
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 20px;">
          ⚠️ این کد به دلیل حفظ امنیت شما فقط تا <strong>۱۵ دقیقه</strong> دیگر معتبر است.
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 25px; margin-bottom: 15px;" />
        <p style="color: #999; font-size: 11px; text-align: center; margin: 0;">
          این یک ایمیل خودکار است، لطفاً به آن پاسخ ندهید.
        </p>
      </div>
    `;
};
