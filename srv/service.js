const cds = require("@sap/cds");
const { UPDATE } = require("@sap/cds/lib/ql/cds-ql");
const e = require("express");
// const { and } = require("three/tsl");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gowthaminagineni27@gmail.com",
    pass: "ntff cyrg umer kadx"
  }
});

module.exports = class TimesheetService extends cds.ApplicationService {
  async init() {
    const { Activities, ApproverWorkList, EmployeesDetail } = cds.entities("TimesheetService");

    this.before("READ", async (req) => {
      console.log("--- REQUEST ---", req);
      console.log("Event :", req.event);
      console.log("Path  :", req.path);
      console.log("User  :", req.user?.id);
      console.log("➡️ User roles   :", req.user?.roles);
      console.log("➡️ Is Manager? :", req.user?.is?.("Manager"));

    });

    const calcDiffMinutes = (from, to) => {
      if (!from || !to) return null;

      const [fh, fm] = String(from).split(":").map(Number);
      const [th, tm] = String(to).split(":").map(Number);

      const fromMin = fh * 60 + fm;
      const toMin = th * 60 + tm;

      let diffMin = toMin - fromMin;
      if (diffMin < 0) diffMin += 24 * 60;

      return diffMin;
    };

    const toDecimalHours = (mins) => Math.round((mins / 60) * 100) / 100;

    const toHoursText = (mins) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m`;
    };

    this.on("me", async (req) => ({
      isManager: req.user.is("Manager"),
    }));
    this.before(["CREATE", "UPDATE"], ApproverWorkList, async (req) => { });

    this.before(["CREATE", "UPDATE"], Activities, async (req) => {
      req.data.status_code = "P";

      const { workDate } = req.data;

      const holiday = await SELECT.one.from('Holidays')
        .where({ holidayDate: workDate });

      if (holiday) {
        req.error(400, `Cannot create timesheet on holiday: ${holiday.name}`);
      }

      if (req.event === 'CREATE') {
        let empData = await SELECT.from(EmployeesDetail).where({ ID: req.data.pers_ID });
        let employeeName = empData[0].fullName;
        const mailOptions = {
          from: "gowthaminagineni27@gmail.com",
          to: "nagenanicharanteja26@gmail.com", // later make dynamic
          subject: `Timesheet Submitted -  ${req.data.ActNo}`,
          text: `Timesheet ${req.data.ActNo} submitted for approval`,
          html: `
  <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
      
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background:#0a6ed1; color:#ffffff; padding:15px 20px;">
              <h2 style="margin:0;">Timesheet Notification</h2>
          </div>

          <!-- Body -->
          <div style="padding:20px;">
              
              <p style="font-size:14px;">Hello Manager,</p>

              <p style="font-size:14px;">
                  A new timesheet has been submitted and is awaiting your approval.
              </p>

              <!-- Details Table -->
              <table style="width:100%; border-collapse:collapse; margin-top:15px;">
                  <tr>
                      <td style="padding:8px; font-weight:bold;">Activity No</td>
                      <td style="padding:8px;">${req.data.ActNo}</td>
                  </tr>
                  <tr style="background:#f9f9f9;">
                      <td style="padding:8px; font-weight:bold;">Employee</td>
                      <td style="padding:8px;">${employeeName}</td>
                  </tr>
                  <tr>
                      <td style="padding:8px; font-weight:bold;">Work Date</td>
                      <td style="padding:8px;">${req.data.workDate}</td>
                  </tr>
                  <tr style="background:#f9f9f9;">
                      <td style="padding:8px; font-weight:bold;">Hours</td>
                      <td style="padding:8px;">${req.data.hoursText}</td>
                  </tr>
                  <tr>
                      <td style="padding:8px; font-weight:bold;">Description</td>
                      <td style="padding:8px;">${req.data.description || '-'}</td>
                  </tr>
              </table>

              <!-- Button -->
              <div style="text-align:center; margin-top:25px;">
                  <a href="https://your-app-url"
                    style="background:#0a6ed1; color:#ffffff; padding:10px 20px; text-decoration:none; border-radius:5px; font-size:14px;">
                    Review Timesheet
                  </a>
              </div>

              <p style="margin-top:25px; font-size:13px; color:#555;">
                  Please review and take appropriate action.
              </p>

          </div>

          <!-- Footer -->
          <div style="background:#f4f6f8; padding:15px; text-align:center; font-size:12px; color:#777;">
             © Timesheet Management System | SAP CAP Application <br><br>
            <b>This is a system-generated email. Please do not reply.</b>
          </div>

      </div>

  </div>
  `
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (err) {
          console.error("Mail error:", err);
        }
      } else if (req.event === 'UPDATE') {
        const mailOptions = {
          from: "gowthaminagineni27@gmail.com",
          to: "nagenanicharanteja26@gmail.com", // later make dynamic manager mail, add deployed url
          subject: `Timesheet Updated -  ${req.data.ActNo}`,
          text: `Timesheet ${req.data.ActNo} submitted for approval`,
          html: `
<div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
    
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background:#0a6ed1; color:#ffffff; padding:12px 20px;">
            <h3 style="margin:0;">Timesheet Update Notification</h3>
        </div>

        <!-- Body -->
        <div style="padding:20px;">
            
            <p style="font-size:14px;">Hello Manager,</p>

            <p style="font-size:14px;">
                The timesheet request currently under your review has been <b>updated</b>.
            </p>

            <p style="font-size:14px;">
                Kindly review the latest changes using the link below.
            </p>

            <!-- Button -->
            <div style="text-align:center; margin-top:20px;">
                <a href="https://your-app-url"
                   style="background:#0a6ed1; color:#ffffff; padding:10px 18px; text-decoration:none; border-radius:5px; font-size:14px;">
                   Review Request
                </a>
            </div>

            <p style="margin-top:20px; font-size:13px; color:#555;">
                Thank you.
            </p>

        </div>

        <!-- Footer -->
        <div style="background:#f4f6f8; padding:12px; text-align:center; font-size:12px; color:#777;">
           © Timesheet Management System | SAP CAP Application <br><br>
            <b>This is a system-generated email. Please do not reply.</b>
        </div>

    </div>

</div>
`
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (err) {
          console.error("Mail error:", err);
        }
      }


    });



    this.on(["Approve"], ApproverWorkList, async (req) => {
      const keys = req.params[0];
      console.log("Event :", keys);
      let data = await SELECT.from(Activities).where({ ID: keys.ID });
      const mailOptions = {
          from: "gowthaminagineni27@gmail.com",
          to: "nagenanicharanteja26@gmail.com", // later make dynamic manager mail, add deployed url
          subject: `Timesheet Approved -  ${data[0].ActNo}`,
          text: `Timesheet ${data[0].ActNo} submitted for approval`,
          html: `
<div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
    
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background:#107e3e; color:#ffffff; padding:15px 20px;">
            <h2 style="margin:0;">Timesheet Approved</h2>
        </div>

        <!-- Body -->
        <div style="padding:20px;">
            
            <p style="font-size:14px;">Hello,</p>

            <p style="font-size:14px;">
                Your timesheet has been <b style="color:#107e3e;">approved</b>.
            </p>

            <!-- Details -->
            <table style="width:100%; border-collapse:collapse; margin-top:15px;">
                <tr>
                    <td style="padding:8px; font-weight:bold;">Activity No</td>
                    <td style="padding:8px;">${data[0].ActNo}</td>
                </tr>
                <tr style="background:#f9f9f9;">
                    <td style="padding:8px; font-weight:bold;">Work Date</td>
                    <td style="padding:8px;">${data[0].workDate}</td>
                </tr>
                <tr>
                    <td style="padding:8px; font-weight:bold;">Hours</td>
                    <td style="padding:8px;">${data[0].hoursText}</td>
                </tr>
            </table>

            <!-- Button -->
            <div style="text-align:center; margin-top:25px;">
                <a href="https://your-app-url"
                   style="background:#107e3e; color:#ffffff; padding:10px 20px; text-decoration:none; border-radius:5px; font-size:14px;">
                   View Details
                </a>
            </div>

            <p style="margin-top:25px; font-size:13px; color:#555;">
                Thank you.
            </p>

        </div>

        <!-- Footer -->
        <div style="background:#f4f6f8; padding:15px; text-align:center; font-size:12px; color:#777;">
            © Timesheet Management System | SAP CAP Application <br><br>
            <b>This is a system-generated email. Please do not reply.</b>
        </div>

    </div>

</div>
`
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (err) {
          console.error("Mail error:", err);
        }
      await UPDATE(Activities).set({ status_code: "A" }).where(keys);

      req.info(200, `Activity ${data[0].ActNo} sent successfully`);
      return await cds.read(Activities).where(keys);
    });

    this.on(["Reject"], ApproverWorkList, async (req) => {
      const keys = req.params[0];
      const { text } = req.data;
      console.log("Event :", keys);
      let data = await SELECT.from(Activities).where({ ID: keys.ID });
      const mailOptions = {
          from: "gowthaminagineni27@gmail.com",
          to: "nagenanicharanteja26@gmail.com", // later make dynamic manager mail, add deployed url
          subject: `Timesheet Rejected -  ${data[0].ActNo}`,
          text: `Timesheet ${data[0].ActNo} submitted for approval`,
          html: `
<div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
    
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background:#bb0000; color:#ffffff; padding:15px 20px;">
            <h2 style="margin:0;">Timesheet Rejected</h2>
        </div>

        <!-- Body -->
        <div style="padding:20px;">
            
            <p style="font-size:14px;">Hello,</p>

            <p style="font-size:14px;">
                Your timesheet has been <b style="color:#bb0000;">rejected</b>.
            </p>

            <!-- Details -->
            <table style="width:100%; border-collapse:collapse; margin-top:15px;">
                <tr>
                    <td style="padding:8px; font-weight:bold;">Activity No</td>
                    <td style="padding:8px;">${data[0].ActNo}</td>
                </tr>
                <tr style="background:#f9f9f9;">
                    <td style="padding:8px; font-weight:bold;">Work Date</td>
                    <td style="padding:8px;">${data[0].workDate}</td>
                </tr>
                <tr>
                    <td style="padding:8px; font-weight:bold;">Hours</td>
                    <td style="padding:8px;">${data[0].hoursText}</td>
                </tr>
            </table>

            <!-- Rejection Comment -->
            <div style="margin-top:20px; padding:12px; background:#fff1f0; border-left:4px solid #bb0000;">
                <b>Rejection Reason:</b><br>
                ${text || 'No comments provided'}
            </div>

            <!-- Button -->
            <div style="text-align:center; margin-top:25px;">
                <a href="https://your-app-url"
                   style="background:#bb0000; color:#ffffff; padding:10px 20px; text-decoration:none; border-radius:5px; font-size:14px;">
                   Review & Update
                </a>
            </div>

            <p style="margin-top:25px; font-size:13px; color:#555;">
                Please update and resubmit your timesheet.
            </p>

        </div>

        <!-- Footer -->
        <div style="background:#f4f6f8; padding:15px; text-align:center; font-size:12px; color:#777;">
            © Timesheet Management System | SAP CAP Application <br><br>
            <b>This is a system-generated email. Please do not reply.</b>
        </div>

    </div>

</div>
`
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (err) {
          console.error("Mail error:", err);
        }
      await UPDATE(Activities)
        .set({ status_code: "R", rejectionComment: text })
        .where(keys);

      req.info(200, `Activity ${data[0].ActNo} rejected successfully`);

      return await cds.read(ApproverWorkList).where(keys);
    });

    this.before(["CREATE", "UPDATE"], Activities.drafts, async (req) => {
      let { timeFrom, timeTo } = req.data;

      const ID = req.params?.[0]?.ID || req.data.ID;

      if (ID && (!timeFrom || !timeTo)) {
        const current = await cds
          .tx(req)
          .run(
            SELECT.one
              .from(Activities.drafts)
              .columns("timeFrom", "timeTo")
              .where({ ID })
          );
        timeFrom ??= current?.timeFrom;
        timeTo ??= current?.timeTo;
      }

      const mins = calcDiffMinutes(timeFrom, timeTo);
      if (mins == null) return;

      req.data.hours = toDecimalHours(mins); // 1.73
      req.data.hoursText = toHoursText(mins); // "1h 44m"

      let { } = req.data;
    });

    this.on("READ", EmployeesDetail, async (req, next) => {
      if (req.user.is('Employee')) {
        const id = req.user.id;
        let data = await SELECT.from(EmployeesDetail).where({ email: id });
        return data;
      } else {
        await next();
      }

    })

    return super.init();
  }
};
