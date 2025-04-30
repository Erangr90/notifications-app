import axios from "axios";
const API_KEY = "3a3a68a5-cf80-441a-b8d0-dc3a9113cb96";

export async function sendEmail(msg) {
  const url = "https://rest.smoove.io/v1/Campaigns";
  const params = {
    sendnow: true,
  };

  const emailBody = `
    <div dir="rtl">
    <h1> השיעור ${msg.title}</h1>
    <h4>${msg.desc} יתחיל ב -  ${msg.date}</h4>
    </div>`;

  const body = {
    subject: `שיעור ${msg.title}`,
    body: emailBody,
    toMembersByEmail: msg.emails,
  };

  const response = await axios
    .post(url, body, {
      params,
      headers: {
        Authorization: `ApiKey ${API_KEY}`,
        "Content-Type": "application/json",
      },
    })
    .catch((error) => {
      console.log("Error:", error.response?.data || error.message);
    });

  console.log("Response:", response?.data);
}
