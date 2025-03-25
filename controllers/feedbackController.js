const Feedback = require("../models/feedback");
const client = require("@sendgrid/client");
const Contract = require("../models/contract");
const Service = require("../models/service");
const cloudinary = require("cloudinary").v2;
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const { ConnectionStates } = require("mongoose");

client.setApiKey(process.env.SENDGRID_API_KEY);

const createFeedback = async (req, res) => {
  const { efficiency, work, behavior, equipment, pestService } = req.body;
  const { id } = req.params;
  try {
    const newId = id.split("-")[0];
    const email = id.split("-")[1];
    if (!efficiency || !work || !behavior || !equipment || !pestService)
      return res.status(400).json({ msg: "Please provide all values" });

    if (email) {
      const contract = await Contract.findOne({ _id: newId });
      if (!contract) return res.status(404).json({ msg: "Contract Not Found" });
      req.body.email = email;
      req.body.contract = contract.contractNo;
    } else {
      const service = await Service.findOne({ _id: newId }).populate({
        path: "contract",
        select: "contractNo",
      });
      if (!service) return res.status(404).json({ msg: "Contract Not Found" });
      req.body.contract = service.contract.contractNo;
    }

    await Feedback.create(req.body);

    res.status(201).json({
      msg: "We thank you for your time spent taking this feedback. Your response has been recorded",
    });
  } catch (error) {
    res.status(500).json({ msg: error });
    console.log(error);
  }
};

const getFeedback = async (req, res) => {
  try {
    const result = await Feedback.aggregate([
      {
        $group: {
          _id: "$pestService",
          avgRating: {
            $avg: "$rating",
          },
          numOfRating: {
            $sum: 1,
          },
        },
      },
    ]);
    const result1 = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: {
            $avg: "$rating",
          },
          numOfRating: {
            $sum: 1,
          },
        },
      },
    ]);

    const feedbacks = await Feedback.find();

    const fields = [
      { label: "Contract Number", value: "contract" },
      { label: "Name", value: "email" },
      { label: "Service Name", value: "pestService" },
      { label: "Rating", value: "rating" },
      { label: "Work Efficiency", value: "efficiency" },
      { label: "Know His Work", value: "work" },
      { label: "His Behavior", value: "behavior" },
      { label: "Faulty Equipment", value: "equipment" },
      { label: "Improvement Needed", value: "improvement" },
      { label: "Good Aspect", value: "aspect" },
      { label: "Recommendation", value: "recommend" },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(feedbacks);

    const fileName = "Feedback Report.csv";

    fs.writeFileSync(path.resolve(__dirname, "../files/", fileName), csv);
    const result2 = await cloudinary.uploader.upload(`files/${fileName}`, {
      resource_type: "raw",
      use_filename: true,
      folder: "service-reports",
    });
    fs.unlinkSync(`./files/${fileName}`);

    const link = result2.secure_url;

    return res.status(200).json({ result1, result, link });
  } catch (error) {
    res.status(500).json({ msg: error });
    console.log(error);
  }
};

const addContacts = async (req, res) => {
  const { feedbackEmails } = req.body;

  const queryParams = {
    delete_all_contacts: "true",
  };

  const request1 = {
    url: `/v3/marketing/contacts`,
    method: "DELETE",
    qs: queryParams,
  };

  client
    .request(request1)
    .then(([response, body]) => {
      const data = {
        contacts: req.body,
      };

      const request = {
        url: `/v3/marketing/contacts`,
        method: "PUT",
        body: data,
      };

      client
        .request(request)
        .then(([response, body]) => {
          res.status(200).json({ msg: "Contacts has been added" });
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((error) => {
      console.error(error);
    });
};

const scheduleMail = async (req, res, next) => {
  try {
    const curDate = new Date().toISOString().split("T")[0];
    const time = new Date(curDate + "T11:22:00.542Z");

    const data = {
      name: "Feedback Mail",
      send_to: { all: true },
      email_config: {
        design_id: "28b42ac5-d110-4484-b071-f41380d9b0c2",
        sender_id: 3405907,
        suppression_group_id: -1,
      },
    };

    const request = {
      url: `/v3/marketing/singlesends`,
      method: "POST",
      body: data,
    };

    client
      .request(request)
      .then(([response, body]) => {
        const data1 = {
          send_at: "now",
        };

        const request1 = {
          url: `/v3/marketing/singlesends/${response.body.id}/schedule`,
          method: "PUT",
          body: data1,
        };

        client
          .request(request1)
          .then(([response, body]) => {
            res.status(200).json({ msg: "Email has been schedule" });
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    next(error);
    console.error(error);
  }
};
//scheduleFeedbackEmails
const sendMails = async (req, res, next) => {
  try {
    // Validate input
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res
        .status(400)
        .json({ error: "Request body must be a non-empty array of contacts." });
    }

    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
    const formattedDate = tomorrow.toISOString().split("T")[0];
    const scheduledTime = new Date(`${formattedDate}T02:30:00.542Z`);
    const currentMonth = tomorrow.getMonth();
    const listNameFormatted = moment(tomorrow).format("Do MMM");
    const emailsToSend = [];

    // Loop through incoming email data
    for (let contact of req.body) {
      try {
        const feedbackRecord = await Feedback.findOne({
          contract: contact.contract,
        });

        // Add contact if no feedback or feedback from a different month
        if (
          !feedbackRecord ||
          currentMonth !== new Date(feedbackRecord.createdAt).getMonth()
        ) {
          emailsToSend.push(contact);
        }
      } catch (error) {
        return next(
          new Error(
            `Error finding feedback for contract ${contact.contract}: ${error.message}`
          )
        );
      }
    }

    if (emailsToSend.length === 0) {
      return res.status(200).json({ msg: "No emails to send." });
    }

    // Create a new marketing list
    const listResponse = await client.request({
      url: `/v3/marketing/lists`,
      method: "POST",
      body: { name: listNameFormatted },
    });

    const listId = listResponse.body.id;

    // Add contacts to the newly created list
    await client.request({
      url: `/v3/marketing/contacts`,
      method: "PUT",
      body: {
        list_ids: [listId],
        contacts: emailsToSend,
      },
    });

    // Send the email to the list
    const emailResponse = await client.request({
      url: `/v3/marketing/singlesends`,
      method: "POST",
      body: {
        name: "Feedback Mail",
        send_to: { list_ids: [listId] },
        email_config: {
          design_id: "28b42ac5-d110-4484-b071-f41380d9b0c2",
          sender_id: 3405907,
          suppression_group_id: -1,
        },
      },
    });

    const singleSendId = emailResponse.body.id;

    // Schedule the email to be sent at the specified time
    await client.request({
      url: `/v3/marketing/singlesends/${singleSendId}/schedule`,
      method: "PUT",
      body: { send_at: scheduledTime },
    });

    res.status(200).json({ msg: "Email has been scheduled." });
  } catch (error) {
    // Log error and pass to middleware
    next(error);
  }
};

module.exports = {
  createFeedback,
  scheduleMail,
  addContacts,
  getFeedback,
  sendMails,
};
