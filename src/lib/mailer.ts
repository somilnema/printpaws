import nodemailer from "nodemailer";

const isEmailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    })
  : null;

export const sendOrderEmail = async (orderData: any) => {
  // Normalize fields to support both snake_case (Supabase database columns) and camelCase (API request properties)
  const id = orderData.id || `MOCK_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const customerEmail = orderData.customer_email || orderData.customerEmail || "";
  const petName = orderData.pet_name || orderData.petName || "Not Specified";
  const size = orderData.size || "Standard";
  const frameStyle = orderData.frame_style || orderData.frameStyle || "None";
  const numPets = orderData.num_pets !== undefined ? orderData.num_pets : (orderData.numPets !== undefined ? orderData.numPets : "1");
  const background = orderData.background || "Classic";
  const font = orderData.font || "Modern";
  const addon = orderData.addon || "None";
  const giftWrap = orderData.gift_wrap !== undefined ? orderData.gift_wrap : (orderData.giftWrap !== undefined ? orderData.giftWrap : false);
  const totalPrice = orderData.total_price || orderData.totalPrice || "0";
  const photoUrl = orderData.photo_url || orderData.photoUrl || "";
  const razorpayPaymentId = orderData.razorpayPaymentId || orderData.razorpay_payment_id || "";
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "";

  const subject = `🐾 Order Confirmed! Peternity Masterpiece #${id.slice(0, 8).toUpperCase()}`;
  
  const html = `
    <div style="background-color: #fcf9f6; padding: 20px 10px; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #2C2623; line-height: 1.5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(180, 142, 117, 0.15); border: 1px solid #f3ece5;">
        
        <!-- Top Decorative Gradient Bar -->
        <div style="background: linear-gradient(135deg, #B38E75 0%, #8A6651 100%); height: 8px;"></div>
        
        <!-- Premium Header Area -->
        <div style="padding: 35px 20px 25px; text-align: center;">
          <div style="font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: #B38E75; font-weight: 700; margin-bottom: 8px;">Peternity</div>
          <h1 style="font-size: 26px; margin: 0; color: #2C2623; font-weight: 800;">Masterpiece Confirmed! 🐾</h1>
          <p style="color: #6E6259; font-size: 14px; margin-top: 10px; margin-bottom: 0; line-height: 1.6;">
            We have received your custom order details. Our master artists are ready to transform your uploaded photo into a magnificent, premium portrait!
          </p>
        </div>

        <!-- Sleek Order Identifier Box -->
        <div style="margin: 0 20px; padding: 15px 20px; background-color: #FAF8F5; border-radius: 12px; border: 1px dashed #EADFC9; text-align: center;">
          <span style="font-size: 11px; color: #8A6651; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Order Confirmation ID</span>
          <div style="font-size: 18px; font-weight: 700; color: #2C2623; margin-top: 4px; letter-spacing: 0.5px;">#${id.slice(0, 8).toUpperCase()}</div>
        </div>

        <!-- High-Definition Image Highlight Box -->
        ${photoUrl ? `
        <div style="padding: 30px 20px 15px; text-align: center;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #8A6651; margin-bottom: 15px; margin-top: 0; font-weight: 700;">Uploaded Pet Portrait Reference</h3>
          <div style="display: inline-block; padding: 12px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06); border: 1px solid #efece8; max-width: 100%;">
            <img src="${photoUrl}" alt="Uploaded Pet Photo" style="max-width: 100%; max-height: 320px; border-radius: 8px; display: block; object-fit: contain; margin: 0 auto;" />
          </div>
          <div style="margin-top: 18px;">
            <a href="${photoUrl}" target="_blank" style="display: inline-block; background-color: #B38E75; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: 700; border-radius: 8px; box-shadow: 0 4px 12px rgba(179, 142, 117, 0.3); letter-spacing: 0.5px;">
              📥 Download Original High-Definition Photo
            </a>
          </div>
        </div>
        ` : ''}

        <!-- Custom Order Specifications -->
        <div style="padding: 20px 20px 10px;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #8A6651; margin-bottom: 15px; margin-top: 0; font-weight: 700; border-bottom: 2px solid #FAF8F5; padding-bottom: 8px;">Order Details Summary</h3>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; color: #6E6259;">Pet's Royal Name</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; text-align: right; font-weight: 700; color: #2C2623;">${petName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; color: #6E6259;">Number of Pets</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; text-align: right; font-weight: 700; color: #2C2623;">${numPets}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; color: #6E6259;">Portrait Size</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; text-align: right; font-weight: 700; color: #2C2623;">${size}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; color: #6E6259;">Frame Style Choice</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; text-align: right; font-weight: 700; color: #2C2623;">${frameStyle}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; color: #6E6259;">Background Option</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; text-align: right; font-weight: 700; color: #2C2623;">${background}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; color: #6E6259;">Custom Art Add-ons</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; text-align: right; font-weight: 700; color: #2C2623;">${addon}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; color: #6E6259;">Premium Gift Wrap</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; text-align: right; font-weight: 700; color: #2C2623;">${giftWrap ? '🎁 Yes (Premium Wrap Included)' : 'No'}</td>
            </tr>
            ${razorpayPaymentId ? `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; color: #6E6259;">Razorpay Payment Reference</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #FAF8F5; text-align: right; font-weight: 700; color: #4A6B53; font-family: monospace;">${razorpayPaymentId}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <!-- Premium Highlight Total Table Box -->
        <div style="margin: 25px 20px; padding: 20px; background-color: #FAF8F5; border-radius: 12px; border: 1px solid #EADFC9;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: middle;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8A6651; font-weight: 700;">Total Paid Amount</div>
                <div style="font-size: 26px; font-weight: 800; color: #2C2623; margin-top: 4px;">₹${totalPrice}</div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <span style="background-color: #4A6B53; color: #ffffff; font-size: 11px; font-weight: 700; padding: 8px 16px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block;">
                  ✓ Payment Successful
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Order Information Footer -->
        <div style="padding: 10px 20px 35px; font-size: 13px; color: #6E6259; border-top: 1px solid #FAF8F5; margin-top: 20px; line-height: 1.6;">
          <p style="margin: 15px 0 5px 0; font-size: 12px; color: #8A6651;">
            <b>Next Steps:</b> Our team of artists will craft a draft of your portrait and share it with you for approval. If you need to make any alterations to your customized selections, please reach out to <a href="mailto:${process.env.EMAIL_USER || 'peternity.memories@gmail.com'}" style="color: #B38E75; text-decoration: none; font-weight: 700;">${process.env.EMAIL_USER || 'peternity.memories@gmail.com'}</a> within 12 hours.
          </p>
        </div>

        <!-- Branding Footer -->
        <div style="background-color: #FAF8F5; padding: 30px 20px; text-align: center; border-top: 1px solid #efece8;">
          <p style="margin: 0; font-size: 12px; color: #8A6651; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">✨ Made with Love for Pet Families ✨</p>
          <p style="margin: 8px 0 0; font-size: 11px; color: #A0948D;">© 2026 Peternity. All rights reserved.</p>
        </div>

      </div>
    </div>
  `;

  // 🐾 Beautiful Dark-Theme Owner/Admin Notification Template
  const adminHtml = `
    <div style="background-color: #121212; padding: 20px 10px; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #E5E5E5; line-height: 1.5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1A1A1A; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); border: 1px solid #2A2A2A;">
        
        <!-- Top Decorative Gold Bar -->
        <div style="background: linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%); height: 8px;"></div>
        
        <!-- Premium Header Area -->
        <div style="padding: 35px 20px 25px; text-align: center;">
          <div style="font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: #D4AF37; font-weight: 700; margin-bottom: 8px;">Peternity Admin</div>
          <h1 style="font-size: 26px; margin: 0; color: #FFFFFF; font-weight: 800;">🚨 NEW ORDER RECEIVED!</h1>
          <p style="color: #A0A0A0; font-size: 14px; margin-top: 10px; margin-bottom: 0; line-height: 1.6;">
            A new masterpiece has been purchased and is ready for production. Below are the design specifications and original image.
          </p>
        </div>

        <!-- Order ID & Revenue Box -->
        <div style="margin: 0 20px; padding: 20px; background-color: #222222; border-radius: 12px; border: 1px dashed #D4AF37; text-align: center;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="text-align: left; width: 50%;">
                <span style="font-size: 11px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Order ID</span>
                <div style="font-size: 18px; font-weight: 700; color: #FFFFFF; margin-top: 4px;">#${id.toUpperCase()}</div>
              </td>
              <td style="text-align: right; width: 50%;">
                <span style="font-size: 11px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Revenue Generated</span>
                <div style="font-size: 22px; font-weight: 800; color: #D4AF37; margin-top: 4px;">₹${totalPrice}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- High-Definition Image Reference -->
        ${photoUrl ? `
        <div style="padding: 30px 20px 15px; text-align: center;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #D4AF37; margin-bottom: 15px; margin-top: 0; font-weight: 700;">Source Artwork Image</h3>
          <div style="display: inline-block; padding: 12px; background-color: #222222; border-radius: 12px; border: 1px solid #333333; max-width: 100%;">
            <img src="${photoUrl}" alt="Uploaded Pet Photo" style="max-width: 100%; max-height: 320px; border-radius: 8px; display: block; object-fit: contain; margin: 0 auto;" />
          </div>
          <div style="margin-top: 18px;">
            <a href="${photoUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%); color: #111111; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: 700; border-radius: 8px; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3); letter-spacing: 0.5px;">
              📥 Download Source Image for Artists
            </a>
          </div>
        </div>
        ` : ''}

        <!-- Design Specifications Table -->
        <div style="padding: 20px 20px 10px;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #D4AF37; margin-bottom: 15px; margin-top: 0; font-weight: 700; border-bottom: 2px solid #222222; padding-bottom: 8px;">Design Specifications</h3>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #E5E5E5;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; color: #A0A0A0;">Pet's Royal Name</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; text-align: right; font-weight: 700; color: #FFFFFF;">${petName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; color: #A0A0A0;">Number of Pets</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; text-align: right; font-weight: 700; color: #FFFFFF;">${numPets}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; color: #A0A0A0;">Portrait Size</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; text-align: right; font-weight: 700; color: #FFFFFF;">${size}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; color: #A0A0A0;">Frame Style Choice</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; text-align: right; font-weight: 700; color: #FFFFFF;">${frameStyle}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; color: #A0A0A0;">Background Option</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; text-align: right; font-weight: 700; color: #FFFFFF;">${background}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; color: #A0A0A0;">Custom Art Add-ons</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; text-align: right; font-weight: 700; color: #FFFFFF;">${addon}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; color: #A0A0A0;">Premium Gift Wrap</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; text-align: right; font-weight: 700; color: #FFFFFF;">${giftWrap ? '🎁 Yes (Premium Wrap)' : 'No'}</td>
            </tr>
            ${razorpayPaymentId ? `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; color: #A0A0A0;">Razorpay Payment Reference</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #222222; text-align: right; font-weight: 700; color: #52C41A; font-family: monospace;">${razorpayPaymentId}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <!-- Customer Contact Footer -->
        <div style="padding: 20px 20px 35px; font-size: 13px; color: #A0A0A0; border-top: 1px solid #222222; margin-top: 20px; line-height: 1.6;">
          <p style="margin: 5px 0;"><b>Customer Contact Email:</b> <a href="mailto:${customerEmail}" style="color: #D4AF37; text-decoration: none; font-weight: 700;">${customerEmail}</a></p>
          <p style="margin: 15px 0 5px 0; font-size: 12px; color: #8A6651;">
            <b>Action Required:</b> Assign this order to your portrait designers. Send the initial preview proof to the customer at <b>${customerEmail}</b> once completed.
          </p>
        </div>

        <!-- Branding Footer -->
        <div style="background-color: #151515; padding: 30px 20px; text-align: center; border-top: 1px solid #222222;">
          <p style="margin: 0; font-size: 12px; color: #D4AF37; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">⚡ Peternity Portal ⚡</p>
        </div>

      </div>
    </div>
  `;

  const customerMailOptions = {
    from: process.env.EMAIL_USER || "noreply@peternity.com",
    to: customerEmail,
    subject: subject,
    html: html,
  };

  const adminMailOptions = {
    from: process.env.EMAIL_USER || "noreply@peternity.com",
    to: adminEmail,
    subject: `🚨 NEW ORDER RECEIVED! Peternity Masterpiece #${id.slice(0, 8).toUpperCase()}`,
    html: adminHtml,
  };

  if (!transporter) {
    console.log("\n==========================================================================");
    console.log("📧 [DEVELOPMENT MODE] Nodemailer email not sent because credentials are not configured.");
    console.log("To configure, add EMAIL_USER and EMAIL_PASS to your .env file.");
    console.log(`To Customer:  ${customerEmail}`);
    console.log(`To Admin/Owner: ${adminEmail || "(Not Configured)"}`);
    console.log(`Subject:      ${subject}`);
    console.log("==========================================================================");
    console.log("📋 Detailed Normalized Data:");
    console.log(JSON.stringify({ id, customerEmail, petName, size, frameStyle, numPets, background, font, addon, giftWrap, totalPrice, photoUrl, razorpayPaymentId }, null, 2));
    console.log("==========================================================================");
    console.log("🎨 Premium HTML Output Previews logged successfully.");
    console.log("==========================================================================\n");
    return { success: true, mocked: true, message: "Credentials not configured. Logged content." };
  }

  try {
    // Send separate emails concurrently
    const [custInfo, adminInfo] = await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);
    
    console.log(`📧 Emails sent successfully: Customer (${custInfo.messageId}), Owner (${adminInfo.messageId})`);
    return { 
      success: true, 
      customerMessageId: custInfo.messageId, 
      adminMessageId: adminInfo.messageId 
    };
  } catch (error) {
    console.error("❌ Failed to send order confirmation emails via SMTP:", error);
    // Return gracefully to prevent the overall checkout flow from breaking
    return { success: false, error: error };
  }
};

