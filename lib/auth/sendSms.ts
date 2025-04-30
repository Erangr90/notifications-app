import axios from "axios";
const API_KEY = "3a3a68a5-cf80-441a-b8d0-dc3a9113cb96";

export async function sendSms(msg) {
  const url = "https://rest.smoove.io/v1/Messages";
  const params = {
    sendnow: true,
  };

  const msgBody = `השיעור ${msg.title} - ${msg.desc} יתחיל ב ${msg.date}`;

  const body = {
    body: msgBody,
    toMembersByCell: msg.sms,
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
