import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // This should be an App Password
  },
});

export const sendOrderEmail = async (orderData: any) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: [process.env.EMAIL_USER, orderData.customerEmail].filter(Boolean), // Send to admin and customer
    subject: `🐾 New Order Received - PrintsByPaws #${orderData.id.slice(0, 8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0e4db; padding: 20px; border-radius: 10px;">
        <h2 style="color: #A87B62; text-align: center; text-transform: uppercase;">New Order Confirmation</h2>
        <p>Hi there,</p>
        <p>A new pet portrait order has been placed! Here are the details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background-color: #fcf8f5;">
            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #eee;">Field</th>
            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #eee;">Value</th>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Pet Name</b></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${orderData.petName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Size</b></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${orderData.size}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Frame Style</b></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${orderData.frameStyle}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Number of Pets</b></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${orderData.numPets}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Background</b></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${orderData.background}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Font</b></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${orderData.font}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Add-On</b></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${orderData.addon}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Gift Wrap</b></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${orderData.giftWrap ? "Yes" : "No"}</td>
          </tr>
        </table>
        
        <div style="margin-top: 30px; text-align: center; color: #888; font-size: 12px;">
          <p>© 2026 PrintsByPaws. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
