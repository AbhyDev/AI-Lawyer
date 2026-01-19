// models/Case.js
import mongoose from "mongoose";

// CORRECTED: Added missing fields to match Python class
const PersonDetailSchema = new mongoose.Schema(
  {
    name: { type: String },
    role: { type: String },
    phone_number: { type: String },
    email_address: { type: String },
    address: { type: String },
  },
  { _id: false },
);

// ALL Fields are now list of Strings
const EvidenceClassSchema = new mongoose.Schema(
  {
    photographs_and_videos: { type: [String] },
    official_reports: { type: [String] },
    contracts_and_agreements: { type: [String] },
    financial_records: { type: [String] },
    affidavits_and_statements: { type: [String] },
    digital_communications: { type: [String] },
    call_detail_records: { type: [String] },
    forensic_reports: { type: [String] },
    expert_opinions: { type: [String] },
    physical_object_descriptions: { type: [String] },
  },
  { _id: false },
);

// contains evidence_summary, confidential_contacts, privileged_communications, legal_strategy_and_notes
const PrivateSectionSchema = new mongoose.Schema(
  {
    evidence_summary: { type: String },
    confidential_contacts: { type: [PersonDetailSchema] },
    privileged_communications: {
      type: Map,
      of: String,
    },
    legal_strategy_and_notes: { type: String },
  },
  { _id: false },
);

const PublicSectionSchema = new mongoose.Schema(
  {
    court_details: {
      type: Map,
      of: String,
    },
    parties: {
      type: Map,
      of: [String],
    },
    case_type: { type: String },
    case_status: { type: String },
    case_summary: { type: String },
    timeline_of_proceedings: [
      {
        _id: false,
        date: { type: String },
        event: { type: String },
      },
    ],
  },
  { _id: false },
);

const CaseSchema = new mongoose.Schema(
  {
    CaseID: { type: String, required: true, unique: true, index: true },
    CaseName: { type: String, default: "Untitled Case" }, // LLM-generated case title for display
    LawyerID: { type: String, required: true, index: true },
    JudgeID: { type: String, required: true, index: true },
    UserID: { type: String, required: true, index: true },
    Evidence: { type: EvidenceClassSchema },
    Private: { type: PrivateSectionSchema },
    Public: { type: PublicSectionSchema },
  },
  { timestamps: true },
);

export const Case = mongoose.model("Case", CaseSchema);
