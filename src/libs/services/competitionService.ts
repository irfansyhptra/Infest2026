import { supabase } from "./supabaseClient";
import { cloudinaryService } from "./cloudinaryService";

// Interface untuk kompetisi
export interface Competition {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;

  // Competition Details
  registration_fee: number;
  early_bird: number;
  early_bird_end?: string; // batas akhir early bird
  // Bank account info for payments (per-competition)
  bank_account_number?: string;
  bank_account_receiver_name?: string;
  bank_account_name?: string;

  // Timeline
  registration_start: string;
  registration_end: string;
  competition_start: string;
  competition_end: string;
  qualification_end?: string; // batas pengumpulan karya proposal
  final_date?: string; // tanggal babak final/grand final
  final_announcement?: string; // tanggal pengumuman final

  // Resources
  guidebook_url?: string;
  poster_image_url?: string;
  whatsapp_group?: string; // WhatsApp group link

  // Prizes
  first_prize_amount?: number;
  first_prize_description?: string;
  second_prize_amount?: number;
  second_prize_description?: string;
  third_prize_amount?: number;
  third_prize_description?: string;

  // Status and Metadata
  status: "draft" | "open" | "ongoing" | "closed" | "completed";
  is_google_form_registration?: boolean;
  google_form_registration_url?: string;
  created_at: string;
  updated_at: string;
}

// Interface untuk registrasi kompetisi (updated schema)
export interface CompetitionRegistration {
  id: string;
  competition_id: string;
  team_id: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  registration_date: string;
  approved_at?: string;
  payment_proof_url?: string;
  twibbon_proof_url?: string;
  // add new asset fields
  proposal_url?: string;
  orisinalitas_url?: string;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  competition?: Competition;
  team?: {
    id: string;
    name: string;
    code: string;
    members?: Array<{
      id: string;
      full_name: string;
      email: string;
      whatsapp?: string;
      university?: string;
      faculty?: string;
      major?: string;
      student_id?: string;
      is_team_leader: boolean;
    }>;
  };
}

// Interface untuk data registrasi baru (team-based)
export interface TeamRegistrationData {
  competition_id: string;
  team_id: string;
  notes?: string;
}

// Interface untuk upload bukti pembayaran
export interface PaymentProofData {
  registration_id?: string;
  file: File;
  payment_method: "bank_transfer" | "e_wallet" | "cash";
  payment_date: string;
  account_name: string;
  notes?: string;
}

// Interface untuk detail registrasi lengkap
export interface RegistrationDetail {
  registration: CompetitionRegistration;
  team_leader: {
    full_name: string;
    email: string;
    whatsapp: string;
    university: string;
    faculty: string;
    major: string;
  };
  team_members: Array<{
    full_name: string;
    email: string;
    university: string;
    faculty: string;
    major: string;
    student_id: string;
  }>;
}

/**
 * Helper to validate team size based on competition requirements
 */
export function validateTeamSize(
  compName: string,
  compSlug: string,
  memberCount: number
): { isValid: boolean; error?: string } {
  const name = compName.toLowerCase();
  const slug = (compSlug || "").toLowerCase();

  // List of competitions that require min 2 and max 3 members
  const TEAM_BASED_2_TO_3_COMPETITIONS = [
    "hackathon",
    "ctf",
    "capture the flag",
    "web development",
    "competitive programming",
    "data science",
    "data sains",
  ];

  const isTeam2To3 = TEAM_BASED_2_TO_3_COMPETITIONS.some(
    (item) => name.includes(item) || slug.includes(item.replace(/\s+/g, "-"))
  );

  if (isTeam2To3) {
    if (memberCount < 2) {
      return {
        isValid: false,
        error: `Kompetisi ${compName} memerlukan minimal 2 anggota tim. Jumlah anggota tim Anda saat ini: ${memberCount}. Silakan tambahkan anggota di menu Tim terlebih dahulu.`,
      };
    }
    if (memberCount > 3) {
      return {
        isValid: false,
        error: `Kompetisi ${compName} maksimal 3 anggota tim. Jumlah anggota tim Anda saat ini: ${memberCount}.`,
      };
    }
  } else {
    // Default: UI/UX or other competitions (min 1, max 3)
    if (memberCount < 1) {
      return {
        isValid: false,
        error: "Jumlah anggota tim minimal 1 orang.",
      };
    }
    if (memberCount > 3) {
      return {
        isValid: false,
        error: "Jumlah anggota tim maksimal 3 orang.",
      };
    }
  }

  return { isValid: true };
}


export const competitionService = {
  /**
   * Get all active competitions
   */
  async getActiveCompetitions(): Promise<{
    competitions: Competition[] | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .eq("status", "open")
        .order("registration_start", { ascending: true });

      if (error) {
        console.error("Error fetching competitions:", error);
        return { competitions: null, error: error.message };
      }

      return { competitions: data as Competition[], error: null };
    } catch (error: any) {
      console.error("Error fetching competitions:", error);
      return { competitions: null, error: error.message };
    }
  },

  /**
   * Get competition by ID
   */
  async getCompetitionById(
    id: string
  ): Promise<{ competition: Competition | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching competition:", error);
        return { competition: null, error: error.message };
      }

      return { competition: data as Competition, error: null };
    } catch (error: any) {
      console.error("Error fetching competition:", error);
      return { competition: null, error: error.message };
    }
  },

  /**
   * Get team's competition registration (single registration)
   */
  async getTeamRegistration(teamId: string): Promise<{
    registration: CompetitionRegistration | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("competition_registrations")
        .select(
          `
          *,
          competition:competitions(*),
          team:teams(
            id,
            name,
            code,
            members:user_profiles!fk_user_team(id, full_name, email, is_team_leader)
          )
        `
        )
        .eq("team_id", teamId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return { registration: null, error: null };
        }
        console.error("Error fetching team registration:", error);
        return { registration: null, error: error.message };
      }

      return { registration: data as CompetitionRegistration, error: null };
    } catch (error: any) {
      console.error("Error fetching team registration:", error);
      return { registration: null, error: error.message };
    }
  },

  /**
   * Get user's competition registrations (through team)
   */
  async getUserRegistrations(userId: string): Promise<{
    registrations: CompetitionRegistration | null;
    error: string | null;
  }> {
    try {
      // First get user's team
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("team_id")
        .eq("id", userId)
        .single();

      if (profileError || !userProfile.team_id) {
        return { registrations: null, error: null };
      }

      // Then get team's registration
      const result = await this.getTeamRegistration(userProfile.team_id);
      return { registrations: result.registration, error: result.error };
    } catch (error: any) {
      console.error("Error fetching user registrations:", error);
      return { registrations: null, error: error.message };
    }
  },

  /**
   * Register team for a competition
   */
  async registerTeamForCompetition(
    teamId: string,
    registrationData: TeamRegistrationData
  ): Promise<{
    registration: CompetitionRegistration | null;
    error: string | null;
  }> {
    try {
      // Check if team already registered for any competition
      const { data: existingRegistrations, error: existingError } =
        await supabase
          .from("competition_registrations")
          .select("id, competition:competitions(name)")
          .eq("team_id", teamId)
          // Only block if there is an active registration (pending/approved)
          .in("status", ["pending", "approved"]);

      if (existingError) {
        return {
          registration: null,
          error: "Gagal memeriksa registrasi tim yang ada",
        };
      }

      if (existingRegistrations && existingRegistrations.length > 0) {
        const competitionName =
          (existingRegistrations[0].competition as any)?.name ||
          "kompetisi lain";
        return {
          registration: null,
          error: `Tim sudah terdaftar untuk ${competitionName}. Setiap tim hanya bisa mendaftar satu kompetisi.`,
        };
      }

      // Check if competition is still open for registration
      const { data: competition, error: compError } = await supabase
        .from("competitions")
        .select("registration_end, status, name, slug")
        .eq("id", registrationData.competition_id)
        .single();

      if (compError) {
        return { registration: null, error: "Kompetisi tidak ditemukan" };
      }

      // Verify team size requirements
      const { data: members, error: membersError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("team_id", teamId);

      if (membersError) {
        return {
          registration: null,
          error: "Gagal memeriksa anggota tim",
        };
      }

      const memberCount = members?.length || 0;
      const validation = validateTeamSize(competition.name, competition.slug, memberCount);
      if (!validation.isValid) {
        return {
          registration: null,
          error: validation.error || "Jumlah anggota tim tidak memenuhi syarat",
        };
      }

      if (competition.status !== "open") {
        return {
          registration: null,
          error: "Kompetisi tidak tersedia untuk pendaftaran",
        };
      }

      const registrationEnd = new Date(competition.registration_end);
      const now = new Date();

      if (now > registrationEnd) {
        return {
          registration: null,
          error: "Pendaftaran kompetisi sudah ditutup",
        };
      }

      // Create registration
      const { data, error } = await supabase
        .from("competition_registrations")
        .insert({
          team_id: teamId,
          competition_id: registrationData.competition_id,
          status: "pending",
          registration_date: new Date().toISOString(),
          notes: registrationData.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(
          `
          *,
          competition:competitions(*),
          team:teams(
            id,
            name,
            code,
            members:user_profiles!fk_user_team(id, full_name, email, is_team_leader)
          )
        `
        )
        .single();

      if (error) {
        console.error("Error creating registration:", error);
        return { registration: null, error: error.message };
      }

      return { registration: data as CompetitionRegistration, error: null };
    } catch (error: any) {
      console.error("Error registering team for competition:", error);
      return { registration: null, error: error.message };
    }
  },

  /**
   * Cancel team registration
   */
  async cancelTeamRegistration(
    registrationId: string,
    teamId: string
  ): Promise<{ error: string | null }> {
    try {
      // Check if registration belongs to team
      const { data: registration, error: fetchError } = await supabase
        .from("competition_registrations")
        .select("status")
        .eq("id", registrationId)
        .eq("team_id", teamId)
        .single();

      if (fetchError) {
        return { error: "Registrasi tidak ditemukan" };
      }

      if (registration.status === "approved") {
        return {
          error: "Registrasi yang sudah disetujui tidak dapat dibatalkan",
        };
      }

      // Update status to withdrawn
      const { error } = await supabase
        .from("competition_registrations")
        .update({
          status: "withdrawn",
          updated_at: new Date().toISOString(),
        })
        .eq("id", registrationId)
        .eq("team_id", teamId);

      if (error) {
        console.error("Error cancelling registration:", error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error("Error cancelling registration:", error);
      return { error: error.message };
    }
  },

  /**
   * Check if team has any active registrations
   */
  async hasActiveRegistration(teamId: string): Promise<{
    hasRegistration: boolean;
    registration?: CompetitionRegistration;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("competition_registrations")
        .select(
          `
          *,
          competition:competitions(name, status)
        `
        )
        .eq("team_id", teamId)
        // Active means pending or approved
        .in("status", ["pending", "approved"])
        .limit(1);

      if (error) {
        console.error("Error checking team registration:", error);
        return { hasRegistration: false, error: error.message };
      }

      const hasRegistration = data && data.length > 0;
      return {
        hasRegistration,
        registration: hasRegistration
          ? (data[0] as CompetitionRegistration)
          : undefined,
        error: null,
      };
    } catch (error: any) {
      console.error("Error checking team registration:", error);
      return { hasRegistration: false, error: error.message };
    }
  },

  /**
   * Get detailed registration information
   */
  async getRegistrationDetail(
    registrationId: string,
    teamId: string
  ): Promise<{
    registration: RegistrationDetail | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("competition_registrations")
        .select(
          `
          *,
          competition:competitions(*),
          team:teams(
            id,
            name,
            code,
            created_by,
            members:user_profiles(
              id,
              full_name,
              email,
              whatsapp,
              university,
              faculty,
              major,
              student_id,
              is_team_leader
            )
          )
        `
        )
        .eq("id", registrationId)
        .eq("team_id", teamId)
        .single();

      if (error) {
        console.error("Error fetching registration detail:", error);
        return { registration: null, error: error.message };
      }

      // Transform data ke format yang dibutuhkan
      const registration = data as CompetitionRegistration;
      const teamMembers = registration.team?.members || [];
      const teamLeader = teamMembers.find((member) => member.is_team_leader);

      if (!teamLeader) {
        return { registration: null, error: "Team leader tidak ditemukan" };
      }

      const registrationDetail: RegistrationDetail = {
        registration,
        team_leader: {
          full_name: teamLeader.full_name,
          email: teamLeader.email,
          whatsapp: teamLeader.whatsapp || "",
          university: teamLeader.university || "",
          faculty: teamLeader.faculty || "",
          major: teamLeader.major || "",
        },
        team_members: teamMembers.map((member) => ({
          full_name: member.full_name,
          email: member.email,
          university: member.university || "",
          faculty: member.faculty || "",
          major: member.major || "",
          student_id: member.student_id || "",
        })),
      };

      return { registration: registrationDetail, error: null };
    } catch (error: any) {
      console.error("Error fetching registration detail:", error);
      return { registration: null, error: error.message };
    }
  },

  /**
   * Submit payment proof (with Cloudinary upload)
   */
  async submitPaymentProof(
    paymentData: PaymentProofData
  ): Promise<{ success: boolean; error: string | null; url?: string }> {
    try {
      // Validate file
      const validation = cloudinaryService.validateFile(paymentData.file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || "File tidak valid",
        };
      }

      // Upload to Cloudinary
      const uploadResult = await cloudinaryService.uploadFile(
        paymentData.file,
        `payment-proofs/${paymentData.registration_id}`
      );

      if (!uploadResult.success) {
        return {
          success: false,
          error: uploadResult.error || "Gagal upload gambar",
        };
      }

      // Update registration dengan informasi pembayaran
      const { error } = await supabase
        .from("competition_registrations")
        .update({
          payment_proof_url: uploadResult.data?.secure_url,
          notes: `${paymentData.notes || ""}\n\nPayment Method: ${
            paymentData.payment_method
          }\nPayment Date: ${paymentData.payment_date}\nAccount Name: ${
            paymentData.account_name
          }`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentData.registration_id);

      if (error) {
        console.error("Error updating payment proof:", error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null, url: uploadResult.data?.secure_url };
    } catch (error: any) {
      console.error("Error submitting payment proof:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Submit twibbon proof (PDF) and store URL in registration
   */
  async submitTwibbonProof(params: {
    registration_id: string;
    file: File;
  }): Promise<{ success: boolean; error: string | null; url?: string }> {
    try {
      // Validate PDF
      const validation = cloudinaryService.validatePdf(params.file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || "File PDF tidak valid",
        };
      }

      // Upload to Cloudinary (PDF endpoint)
      const uploadResult = await cloudinaryService.uploadPdf(
        params.file,
        `twibbon-proofs/${params.registration_id}`
      );

      if (!uploadResult.success) {
        return {
          success: false,
          error: uploadResult.error || "Gagal upload PDF",
        };
      }

      console.log(
        "Twibbon proof uploaded successfully:",
        uploadResult.data?.secure_url
      );

      // Update registration with twibbon proof URL
      const { error } = await supabase
        .from("competition_registrations")
        .update({
          twibbon_proof_url: uploadResult.data?.secure_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.registration_id);

      if (error) {
        console.error("Error updating twibbon proof:", error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null, url: uploadResult.data?.secure_url };
    } catch (error: any) {
      console.error("Error submitting twibbon proof:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get competition statistics
   */
  async getCompetitionStats(
    competitionId: string
  ): Promise<{ stats: any | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("competition_registrations")
        .select("status, payment_proof_url")
        .eq("competition_id", competitionId);

      if (error) {
        console.error("Error fetching competition stats:", error);
        return { stats: null, error: error.message };
      }

      const stats = {
        total_registrations: data.length,
        pending_registrations: data.filter((r) => r.status === "pending")
          .length,
        approved_registrations: data.filter((r) => r.status === "approved")
          .length,
        rejected_registrations: data.filter((r) => r.status === "rejected")
          .length,
        withdrawn_registrations: data.filter((r) => r.status === "withdrawn")
          .length,
      };

      return { stats, error: null };
    } catch (error: any) {
      console.error("Error getting competition stats:", error);
      return { stats: null, error: error.message };
    }
  },

  /**
   * Register team for competition with payment proof upload
   */
  async registerTeamWithPayment(
    teamId: string,
    registrationData: TeamRegistrationData,
    paymentData: Omit<PaymentProofData, "registration_id">,
    twibbonFile?: File
  ): Promise<{
    registration: CompetitionRegistration | null;
    error: string | null;
  }> {
    try {
      // Validate files
      const validation = cloudinaryService.validateFile(paymentData.file);
      if (!validation.isValid) {
        return {
          registration: null,
          error: validation.error || "File bukti pembayaran tidak valid",
        };
      }
      if (!twibbonFile) {
        return { registration: null, error: "File PDF twibbon wajib diunggah" };
      }
      const pdfValidation = cloudinaryService.validatePdf(twibbonFile);
      if (!pdfValidation.isValid) {
        return {
          registration: null,
          error: pdfValidation.error || "File PDF tidak valid",
        };
      }

      // Guard: team must not have an active registration
      const activeCheck = await this.hasActiveRegistration(teamId);
      if (activeCheck.error)
        return { registration: null, error: activeCheck.error };
      if (activeCheck.hasRegistration) {
        const compName =
          activeCheck.registration?.competition?.name || "kompetisi lain";
        return {
          registration: null,
          error: `Tim sudah terdaftar untuk ${compName}. Setiap tim hanya bisa mendaftar satu kompetisi.`,
        };
      }

      // Guard: competition must be open and within registration period
      const { data: comp, error: compErr } = await supabase
        .from("competitions")
        .select("id, name, slug, status, registration_end")
        .eq("id", registrationData.competition_id)
        .single();
      if (compErr || !comp)
        return { registration: null, error: "Kompetisi tidak ditemukan" };
      if (comp.status !== "open")
        return {
          registration: null,
          error: "Kompetisi tidak tersedia untuk pendaftaran",
        };
      if (new Date() > new Date(comp.registration_end))
        return {
          registration: null,
          error: "Pendaftaran kompetisi sudah ditutup",
        };

      // Verify team size requirements
      const { data: members, error: membersError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("team_id", teamId);

      if (membersError) {
        return {
          registration: null,
          error: "Gagal memeriksa anggota tim",
        };
      }

      const memberCount = members?.length || 0;
      const sizeValidation = validateTeamSize(comp.name, comp.slug, memberCount);
      if (!sizeValidation.isValid) {
        return {
          registration: null,
          error: sizeValidation.error || "Jumlah anggota tim tidak memenuhi syarat",
        };
      }

      // Pre-generate registration ID to use in Cloudinary folder and insert
      const regId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      // Upload files first
      const [paymentUpload, twUpload] = await Promise.all([
        cloudinaryService.uploadFile(
          paymentData.file,
          `payment-proofs/${regId}`
        ),
        cloudinaryService.uploadPdf(twibbonFile, `twibbon-proofs/${regId}`),
      ]);

      if (!paymentUpload.success) {
        return {
          registration: null,
          error: paymentUpload.error || "Gagal upload bukti pembayaran",
        };
      }
      if (!twUpload.success) {
        return {
          registration: null,
          error: twUpload.error || "Gagal upload PDF twibbon",
        };
      }

      // Insert registration with non-null URLs to satisfy NOT NULL constraints
      const { data: inserted, error: insertErr } = await supabase
        .from("competition_registrations")
        .insert({
          id: regId,
          team_id: teamId,
          competition_id: registrationData.competition_id,
          status: "pending",
          registration_date: new Date().toISOString(),
          notes: `${registrationData.notes || ""}`.trim() || null,
          payment_proof_url: paymentUpload.data?.secure_url,
          twibbon_proof_url: twUpload.data?.secure_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(
          `
          *,
          competition:competitions(*),
          team:teams(
            id,
            name,
            code,
            members:user_profiles!fk_user_team(id, full_name, email, is_team_leader)
          )
        `
        )
        .single();

      if (insertErr) {
        console.error("Error inserting registration with proofs:", insertErr);
        return { registration: null, error: insertErr.message };
      }

      return { registration: inserted as CompetitionRegistration, error: null };
    } catch (error: any) {
      console.error("Error registering team with payment:", error);
      return { registration: null, error: error.message };
    }
  },

  /**
   * Submit proposal PDF URL for an approved registration.
   * This stores the URL in the notes field for now to avoid schema changes.
   */
  async submitProposal(
    registrationId: string,
    proposalUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("competition_registrations")
        .update({
          proposal_url: proposalUrl,
        })
        .eq("id", registrationId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async submitOriginality(
    registrationId: string,
    originalityUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("competition_registrations")
        .update({
          orisinalitas_url: originalityUrl,
        })
        .eq("id", registrationId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
