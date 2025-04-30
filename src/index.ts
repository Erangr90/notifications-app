import { doTasks } from "../lib/notifications/doTasks";

async function run() {
  try {
    await doTasks();
  } catch (error) {
    console.log(error);
  }
}

run();
