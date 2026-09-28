export type Example = {
  id: string;
  label: string;
  text: string;
};

export const EXAMPLES: Example[] = [
  {
    id: "job",
    label: "Job Application",
    text: `Congratulations! Your application has been shortlisted for the Software Engineer position.

Please complete the technical assessment by 30 September 2026 at 11:59 PM via the link sent to your email.

Candidates who fail to complete the assessment will not proceed to the next stage of the hiring process.`,
  },
  {
    id: "university",
    label: "University",
    text: `Dear Students,

All participants must submit their final presentation slides through the student portal before Friday at 5:00 PM.

Late submissions will not be accepted and will result in automatic disqualification from the project showcase.

Please ensure your slides are in PDF format and do not exceed 20 pages.`,
  },
  {
    id: "bill",
    label: "Bill",
    text: `TENAGA NASIONAL BERHAD

Account No: 7823-4567-001
Dear Customer,

Your electricity bill of RM 184.60 is due by 5 October 2026.

Late payment may result in service interruption. You may pay online via myTNB, at any TNB counter, or through your bank's internet banking.`,
  },
  {
    id: "event",
    label: "Event",
    text: `IBM AI Meetup — Building With Foundation Models

Date: 2 October 2026
Time: 7:00 PM – 9:30 PM
Venue: IBM Plaza, Kuala Lumpur (Level 12, Banquet Hall)

Registration is required before attending. Seats are limited. Please register at ibm.com/events/kl-ai-meetup before 30 September 2026.`,
  },
  {
    id: "no-action",
    label: "No Action",
    text: `Hi there,

Your parcel (Tracking No: MY9234567890) has been delivered successfully to your address on 28 September 2026 at 2:47 PM.

The parcel was received by: Resident

Thank you for shopping with us.`,
  },
];
