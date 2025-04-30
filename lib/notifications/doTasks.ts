import schedule from "node-schedule";
import { kdb } from "../../db/knex";
import { sendEmail } from "../auth/sendEmail";
import { sendSms } from "../auth/sendSms";

export async function doTasks() {
  schedule.scheduleJob({ hour: 9, dayOfWeek: 0 }, async () => {
    const sundayMsgs = await sunday();
    sendNoti(sundayMsgs);
  });
  schedule.scheduleJob({ hour: 20, dayOfWeek: [0, 1, 2, 3, 4] }, async () => {
    const dayBeforeMsgs = await dayBefore();
    sendNoti(dayBeforeMsgs);
  });
  schedule.scheduleJob({ hour: 9, dayOfWeek: [0, 1, 2, 3, 4] }, async () => {
    const morningMsgs = await morning();
    sendNoti(morningMsgs);
  });
  schedule.scheduleJob({ hour: 8, dayOfWeek: [0, 1, 2, 3, 4] }, async () => {
    const minutesMsgs = await minutes();
    minutesMsgs.forEach((msg) => {
      const fifteenMinutesBefore = strToDate(msg.date);
      schedule.scheduleJob(fifteenMinutesBefore, () => {
        sendNoti2(msg);
      });
    });
  });
}

function strToDate(str) {
  // Split the string format
  const [datePart, timePart] = str.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  // Create the date object (Note: month is 0-based in JS Date)
  const date = new Date(year, month - 1, day, hour, minute);
  // Subtract 15 minutes (in milliseconds)
  date.setMinutes(date.getMinutes() - 15);
  return date;
}

function sendNoti2(obj) {
  obj?.emails?.length && sendEmail(obj);
  obj?.sms?.length && sendSms(obj);
}

function sendNoti(arr) {
  arr.forEach((msg) => {
    msg?.emails?.length && sendEmail(msg);
    msg?.sms?.length && sendSms(msg);
  });
}

async function morning() {
  const res = await kdb.raw(
    `SELECT u.name, u.email, u.phone, l.title, l.desc, l.id, l.date, u."notiMethod"
  FROM "User" u
  JOIN "Post" l ON l."communityId" = ANY(u."community_ids")
  WHERE l.date::date = CURRENT_DATE
  AND "notiTime" @> ARRAY['MORNING']::varchar[]`,
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
  AND "notiTime" @> ARRAY['MINUTES']::varchar[]`,
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
  AND "notiTime" @> ARRAY['DAY']::varchar[]`,
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
  AND "notiTime" @> ARRAY['SUNDAY']::varchar[]`,
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

  const msgArr: any = [];

  for (const el in group) {
    const msg: any = {
      sms: [],
      emails: [],
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
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
