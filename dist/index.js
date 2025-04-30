"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// lib/notifications/doTasks.ts
var import_node_schedule = __toESM(require("node-schedule"));

// db/knex.ts
var import_knex = __toESM(require("knex"));
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var kdb = (0, import_knex.default)({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL
  }
});

// lib/auth/sendEmail.ts
var import_axios = __toESM(require("axios"));
var API_KEY = "3a3a68a5-cf80-441a-b8d0-dc3a9113cb96";
async function sendEmail(msg) {
  const url = "https://rest.smoove.io/v1/Campaigns";
  const params = {
    sendnow: true
  };
  const emailBody = `
    <div dir="rtl">
    <h1> \u05D4\u05E9\u05D9\u05E2\u05D5\u05E8 ${msg.title}</h1>
    <h4>${msg.desc} \u05D9\u05EA\u05D7\u05D9\u05DC \u05D1 -  ${msg.date}</h4>
    </div>`;
  const body = {
    subject: `\u05E9\u05D9\u05E2\u05D5\u05E8 ${msg.title}`,
    body: emailBody,
    toMembersByEmail: msg.emails
  };
  const response = await import_axios.default.post(url, body, {
    params,
    headers: {
      Authorization: `ApiKey ${API_KEY}`,
      "Content-Type": "application/json"
    }
  }).catch((error) => {
    var _a;
    console.log("Error:", ((_a = error.response) == null ? void 0 : _a.data) || error.message);
  });
  console.log("Response:", response == null ? void 0 : response.data);
}

// lib/auth/sendSms.ts
var import_axios2 = __toESM(require("axios"));
var API_KEY2 = "3a3a68a5-cf80-441a-b8d0-dc3a9113cb96";
async function sendSms(msg) {
  const url = "https://rest.smoove.io/v1/Messages";
  const params = {
    sendnow: true
  };
  const msgBody = `\u05D4\u05E9\u05D9\u05E2\u05D5\u05E8 ${msg.title} - ${msg.desc} \u05D9\u05EA\u05D7\u05D9\u05DC \u05D1 ${msg.date}`;
  const body = {
    body: msgBody,
    toMembersByCell: msg.sms
  };
  const response = await import_axios2.default.post(url, body, {
    params,
    headers: {
      Authorization: `ApiKey ${API_KEY2}`,
      "Content-Type": "application/json"
    }
  }).catch((error) => {
    var _a;
    console.log("Error:", ((_a = error.response) == null ? void 0 : _a.data) || error.message);
  });
  console.log("Response:", response == null ? void 0 : response.data);
}

// lib/notifications/doTasks.ts
async function doTasks() {
  import_node_schedule.default.scheduleJob({ hour: 9, dayOfWeek: 0 }, async () => {
    const sundayMsgs = await sunday();
    sendNoti(sundayMsgs);
  });
  import_node_schedule.default.scheduleJob({ hour: 20, dayOfWeek: [0, 1, 2, 3, 4] }, async () => {
    const dayBeforeMsgs = await dayBefore();
    sendNoti(dayBeforeMsgs);
  });
  import_node_schedule.default.scheduleJob({ hour: 9, dayOfWeek: [0, 1, 2, 3, 4] }, async () => {
    const morningMsgs = await morning();
    sendNoti(morningMsgs);
  });
  import_node_schedule.default.scheduleJob({ hour: 13, minute: 55 }, async () => {
    const minutesMsgs = await minutes();
    minutesMsgs.forEach((msg) => {
      const fifteenMinutesBefore = strToDate(msg.date);
      import_node_schedule.default.scheduleJob(fifteenMinutesBefore, () => {
        sendNoti2(msg);
      });
    });
  });
}
function strToDate(str) {
  const [datePart, timePart] = str.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  date.setMinutes(date.getMinutes() - 15);
  return date;
}
function sendNoti2(obj) {
  var _a, _b;
  ((_a = obj == null ? void 0 : obj.emails) == null ? void 0 : _a.length) && sendEmail(obj);
  ((_b = obj == null ? void 0 : obj.sms) == null ? void 0 : _b.length) && sendSms(obj);
}
function sendNoti(arr) {
  arr.forEach((msg) => {
    var _a, _b;
    ((_a = msg == null ? void 0 : msg.emails) == null ? void 0 : _a.length) && sendEmail(msg);
    ((_b = msg == null ? void 0 : msg.sms) == null ? void 0 : _b.length) && sendSms(msg);
  });
}
async function morning() {
  const res = await kdb.raw(
    `SELECT u.name, u.email, u.phone, l.title, l.desc, l.id, l.date, u."notiMethod"
  FROM "User" u
  JOIN "Post" l ON l."communityId" = ANY(u."community_ids")
  WHERE l.date::date = CURRENT_DATE
  AND "notiTime" @> ARRAY['MORNING']::varchar[]`
  );
  const messages = serializeMsg(res.rows);
  return messages;
}
async function minutes() {
  const res = await kdb.raw(
    `SELECT u.name, u.email, u.phone, l.title, l.desc, l.id, l.date, u."notiMethod"
  FROM "User" u
  JOIN "Post" l ON l."communityId" = ANY(u."community_ids")
  WHERE l.date::date = CURRENT_DATE
  AND "notiTime" @> ARRAY['MINUTES']::varchar[]`
  );
  const messages = serializeMsg(res.rows);
  return messages;
}
async function dayBefore() {
  const res = await kdb.raw(
    `SELECT u.name, u.email, u.phone, l.title, l.desc, l.id, l.date, u."notiMethod"
  FROM "User" u
  JOIN "Post" l ON l."communityId" = ANY(u."community_ids")
  WHERE l.date::date = CURRENT_DATE + INTERVAL '1 day'
  AND "notiTime" @> ARRAY['DAY']::varchar[]`
  );
  const messages = serializeMsg(res.rows);
  return messages;
}
async function sunday() {
  const res = await kdb.raw(
    `SELECT u.name, l.date, u.email, u.phone, l.title, l.desc, l.id, u."notiMethod"
  FROM "User" u
  JOIN "Post" l ON l."communityId" = ANY(u."community_ids")
  WHERE l.date::date BETWEEN 
    (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer)
    AND 
    (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer + 5)
  AND "notiTime" @> ARRAY['SUNDAY']::varchar[]`
  );
  const messages = serializeMsg(res.rows);
  return messages;
}
function serializeMsg(rows) {
  const group = rows.reduce((acc, item) => {
    if (!acc[item.id]) {
      acc[item.id] = [];
    }
    acc[item.id].push(item);
    return acc;
  }, {});
  const msgArr = [];
  for (const el in group) {
    const msg = {
      sms: [],
      emails: []
    };
    group[el].forEach((user) => {
      if (user.notiMethod.includes("email") && user.email)
        msg.emails.push(user.email);
      if (user.notiMethod.includes("sms") && user.phone)
        msg.sms.push(user.phone);
    });
    msg.title = group[el][0].title;
    msg.desc = group[el][0].desc;
    msg.date = dateFormat(group[el][0].date);
    msgArr.push(msg);
  }
  return msgArr;
}
function dateFormat(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes2 = date.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes2}`;
}

// src/index.ts
console.log("ggggggggggggg");
async function run() {
  try {
    await doTasks();
  } catch (error) {
    console.log(error);
  }
}
run();
//# sourceMappingURL=index.js.map