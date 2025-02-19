import { Resend } from "resend";

const resend = new Resend("re_RHSmon1j_2kEP85dHXdyzXwhSVrk2XW65");

await resend.batch.send([
  {
    from: "Acme <onboarding@resend.dev>",
    to: ["foo@gmail.com"],
    subject: "hello world",
    html: "<h1>it works!</h1>",
  },
  {
    from: "Acme <onboarding@resend.dev>",
    to: ["bar@outlook.com"],
    subject: "world hello",
    html: "<p>it works!</p>",
  },
]);
