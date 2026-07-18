import { forgeSections } from "../forge-ai.ts";
import type {
  ForgeAnalysisRequest,
  ForgeWorkspaceAnalysis,
} from "../forge-ai.ts";

export const proptechAnalysisRequest: ForgeAnalysisRequest = {
  contractVersion: 1,
  generationMode: "initial",
  requestedSections: [...forgeSections],
  projectDNA: {
    idea: "Build Africa's leading proptech platform for independent agencies.",
    firstCustomer:
      "Independent residential property agencies in Lagos managing 20 to 200 active listings.",
    coreProblem:
      "Agents lose leads and listing accuracy across spreadsheets, messaging apps, and disconnected portals.",
    desiredOutcome:
      "Agencies manage listings and follow up with qualified buyers from one reliable workspace.",
    biggestConstraint:
      "Limited integration access and inconsistent property data across local listing channels.",
  },
};

export const proptechWorkspaceAnalysis: ForgeWorkspaceAnalysis = {
  contractVersion: 1,
  project: {
    title: "African Agency PropTech",
    elevatorPitch:
      "A unified operating workspace for independent African property agencies to manage listings and convert buyer interest.",
    problemStatement:
      "Independent agencies lose revenue because property data and buyer follow-up are fragmented across unreliable tools.",
    targetCustomer:
      "Independent residential property agencies in Lagos with 20 to 200 active listings.",
    valueProposition:
      "Keep every listing accurate and every qualified buyer moving from inquiry to viewing in one workspace.",
  },
  discover: {
    customerSegments: [
      {
        id: "segment-1",
        title: "Independent agency owner",
        summary:
          "Owner-managed agencies coordinating small sales and letting teams.",
        detail:
          "The initial segment has enough listing volume to feel operational pain but lacks resources for enterprise software.",
        evidenceStatus: "assumption",
      },
    ],
    painPoints: [
      {
        id: "pain-1",
        title: "Fragmented lead follow-up",
        summary:
          "Buyer inquiries disappear across personal messaging accounts and spreadsheets.",
        detail:
          "Teams cannot reliably assign ownership, track the last contact, or identify which buyers are ready for a viewing.",
        evidenceStatus: "assumption",
      },
      {
        id: "pain-2",
        title: "Inconsistent listing data",
        summary:
          "Price and availability changes do not reach every channel consistently.",
        detail:
          "Agents risk promoting unavailable properties and lose buyer trust when information differs between channels.",
        evidenceStatus: "signal",
      },
    ],
    marketSignals: [
      {
        id: "signal-1",
        title: "Messaging-led operations",
        summary:
          "Agency workflows often begin and end in mobile messaging tools.",
        detail:
          "A successful product should complement existing communication habits before attempting to replace them.",
        evidenceStatus: "assumption",
      },
    ],
    competitorPatterns: [
      {
        id: "competitor-1",
        title: "Portal-first products",
        summary:
          "Many products optimize public listing distribution before internal agency operations.",
        detail:
          "Forge should validate whether operational coordination is a stronger entry point than another consumer marketplace.",
        evidenceStatus: "assumption",
      },
    ],
    opportunities: [
      {
        id: "opportunity-1",
        title: "Agency operating layer",
        summary:
          "Unify listing truth, lead ownership, and viewing coordination.",
        detail:
          "A focused operating layer can create daily utility without requiring immediate control of consumer demand.",
        evidenceStatus: "assumption",
      },
    ],
  },
  decide: {
    assumptions: [
      {
        id: "assumption-1",
        title: "Agencies will centralize lead status",
        summary:
          "Teams will update a shared workflow if it reduces missed follow-up.",
        detail:
          "This depends on mobile speed, clear ownership, and immediate value for individual agents.",
        evidenceStatus: "assumption",
      },
    ],
    risks: [
      {
        id: "risk-1",
        title: "Low data discipline",
        summary: "Agents may not keep shared records current.",
        severity: "high",
        mitigation:
          "Minimize required entry, support mobile workflows, and make the next action useful to the agent completing it.",
      },
    ],
    tradeoffs: [
      {
        id: "tradeoff-1",
        title: "Workflow depth before channel breadth",
        summary:
          "Prioritize reliable internal operations over many portal integrations.",
        detail:
          "This narrows early distribution capabilities but makes the core product independently useful.",
        evidenceStatus: "assumption",
      },
    ],
    recommendedPositioning: {
      id: "positioning-1",
      title: "The operating workspace for independent property agencies",
      summary: "Lead with fewer missed buyers and more trustworthy listings.",
      rationale:
        "The position addresses recurring agency operations rather than competing directly for consumer marketplace traffic.",
      nextAction: "Test the message with ten Lagos agency owners.",
    },
    businessModelOptions: [
      {
        id: "model-1",
        title: "Agency subscription",
        summary:
          "Charge a monthly fee based on active agents or listing volume.",
        detail:
          "Subscription pricing aligns revenue with recurring operational value and is easy to pilot manually.",
        evidenceStatus: "assumption",
      },
    ],
  },
  design: {
    personas: [
      {
        id: "persona-1",
        title: "Agency operations lead",
        summary:
          "Coordinates listings, agents, inquiries, and viewing schedules.",
        detail:
          "Needs an accurate overview without chasing individual agents for updates.",
        evidenceStatus: "assumption",
      },
    ],
    mvpFeatures: [
      {
        id: "feature-1",
        name: "Shared listing register",
        description:
          "Maintain one current record for property availability, price, owner, and assigned agent.",
        priority: "must",
        rationale:
          "Reliable inventory is the foundation for every downstream workflow.",
      },
      {
        id: "feature-2",
        name: "Lead follow-up pipeline",
        description:
          "Assign inquiries, record status, and surface the next follow-up action.",
        priority: "must",
        rationale:
          "Missed follow-up is the clearest revenue-linked customer pain.",
      },
    ],
    userJourney: [
      {
        id: "journey-1",
        title: "Capture inquiry",
        outcome:
          "A buyer inquiry is linked to a property and assigned to an agent.",
        sequence: 1,
      },
      {
        id: "journey-2",
        title: "Coordinate viewing",
        outcome: "The qualified buyer reaches a confirmed property viewing.",
        sequence: 2,
      },
    ],
    experiencePrinciples: [
      {
        id: "principle-1",
        title: "Mobile first, not mobile reduced",
        summary: "Core actions must be complete and fast on a phone.",
        detail:
          "Agents should update a lead or listing in seconds while moving between properties.",
        evidenceStatus: "assumption",
      },
    ],
  },
  build: {
    architectureSummary: {
      id: "architecture-1",
      title: "Modular web application",
      description:
        "Use a typed Next.js application with a relational data model and explicit integration boundaries.",
      rationale:
        "A modular monolith keeps early delivery simple while preserving clear ownership of listings, leads, and activities.",
    },
    systemComponents: [
      {
        id: "component-1",
        title: "Agency workspace",
        description:
          "Authenticated interface for listings, lead pipeline, assignments, and activity history.",
        rationale:
          "This is the daily operating surface for the initial customer.",
      },
    ],
    dataEntities: [
      {
        id: "entity-1",
        title: "Property listing",
        description:
          "Canonical property record containing availability, price, location, owner, and assignment.",
        rationale:
          "A single source of listing truth prevents contradictory customer communication.",
      },
      {
        id: "entity-2",
        title: "Buyer lead",
        description:
          "Inquiry record linked to interests, assigned agent, current stage, and follow-up activity.",
        rationale: "Lead history makes responsibility and momentum visible.",
      },
    ],
    apiCapabilities: [
      {
        id: "api-1",
        title: "Listing synchronization boundary",
        description:
          "Expose controlled imports and exports for future portal and messaging integrations.",
        rationale:
          "An explicit boundary avoids coupling the core model to any single channel.",
      },
    ],
    implementationMilestones: [
      {
        id: "milestone-1",
        title: "Operational prototype",
        outcome:
          "One pilot agency can manage listings and lead follow-up end to end.",
        sequence: 1,
      },
    ],
    technicalRisks: [
      {
        id: "technical-risk-1",
        title: "Unreliable external data",
        summary: "Portal and partner feeds may be incomplete or unavailable.",
        severity: "high",
        mitigation:
          "Keep the canonical internal workflow useful without integrations and treat imports as replaceable adapters.",
      },
    ],
  },
  validate: {
    criticalQuestions: [
      {
        id: "question-1",
        title: "Will agents maintain shared lead status?",
        summary:
          "Daily usage is required for the workflow to remain trustworthy.",
        detail:
          "Validate whether the personal benefit of reminders and ownership outweighs the effort of updating status.",
        evidenceStatus: "assumption",
      },
    ],
    experiments: [
      {
        id: "experiment-1",
        title: "Concierge workflow pilot",
        outcome:
          "Three agencies use a manually supported listing and lead workflow for two weeks.",
        sequence: 1,
      },
    ],
    successMetrics: [
      {
        id: "metric-1",
        name: "Qualified lead follow-up rate",
        definition:
          "Share of qualified inquiries receiving a recorded next action.",
        target: "At least 80 percent within one business day",
      },
    ],
    evidenceNeeded: [
      {
        id: "evidence-1",
        title: "Observed agency workflow",
        summary:
          "Direct observation of how listings and inquiries move through a team.",
        detail:
          "Collect workflow evidence from at least five agencies before expanding product scope.",
        evidenceStatus: "assumption",
      },
    ],
  },
  launch: {
    goToMarketStrategy: {
      id: "gtm-1",
      title: "Founder-led agency cohort",
      summary:
        "Recruit a small Lagos cohort through direct industry relationships.",
      rationale:
        "High-touch onboarding produces stronger workflow evidence and avoids premature paid acquisition.",
      nextAction: "Recruit five agencies for a four-week operating cohort.",
    },
    launchMilestones: [
      {
        id: "launch-milestone-1",
        title: "Pilot cohort active",
        outcome:
          "Five agencies have imported live listings and assigned active buyer leads.",
        sequence: 1,
      },
    ],
    channels: [
      {
        id: "channel-1",
        title: "Industry referrals",
        summary:
          "Use trusted agency owners and professional groups for introductions.",
        detail:
          "Referral-led outreach reduces trust friction for a product handling commercially sensitive listings and leads.",
        evidenceStatus: "assumption",
      },
    ],
    launchRisks: [
      {
        id: "launch-risk-1",
        title: "Onboarding burden",
        summary: "Existing listing data may require extensive manual cleanup.",
        severity: "medium",
        mitigation:
          "Limit pilot inventory, provide a structured import template, and measure setup time.",
      },
    ],
    firstThirtyDays: [
      {
        id: "day-plan-1",
        title: "Recruit and observe",
        outcome:
          "Complete workflow interviews and secure the first three pilot commitments.",
        sequence: 1,
      },
      {
        id: "day-plan-2",
        title: "Run the concierge pilot",
        outcome:
          "Measure follow-up behavior and listing accuracy with live agency data.",
        sequence: 2,
      },
    ],
  },
  intelligence: {
    projectHealth: {
      id: "health-1",
      title: "Coherent foundation",
      summary: "The target customer, pain, and initial workflow align.",
      detail:
        "The foundation is directionally coherent but depends on unverified adoption and workflow assumptions.",
      evidenceStatus: "assumption",
    },
    momentum: {
      id: "momentum-1",
      title: "Ready for customer evidence",
      summary:
        "The project has a focused segment and testable operating workflow.",
      detail:
        "Progress now depends on observed agency behavior rather than additional planning detail.",
      evidenceStatus: "signal",
    },
    nextRecommendation: {
      id: "recommendation-1",
      title: "Run five workflow interviews",
      summary:
        "Observe listing updates and buyer follow-up inside independent agencies.",
      rationale:
        "The largest uncertainties concern behavior, data discipline, and the severity of missed follow-up.",
      nextAction:
        "Schedule five 45-minute workflow interviews with Lagos agency owners.",
    },
    confidence: 68,
    unresolvedQuestions: [
      "Which lead source creates the highest volume of missed follow-up?",
      "How often do availability and price changes make published listings inaccurate?",
      "Who inside the agency will own data quality?",
    ],
  },
};
