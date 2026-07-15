"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, type UserProfile } from "@/libs/services/authService";
import { teamService, type TeamWithMembers } from "@/libs/services/teamService";
import { TeamSkeleton } from "@/components/skeletons";
import type { User } from "@supabase/supabase-js";
import {
  User as UserIcon,
  Trophy,
  Users,
  Edit3,
  Hash,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  UserPlus,
  Copy,
  LogOut,
  Settings,
  Plus,
  Crown,
  UserMinus,
  EyeOff,
  Info,
} from "lucide-react";
import { TEAM_REQUIREMENTS } from "@/libs/security/constants";
import {
  getMissingProfileFields,
  isProfileComplete,
} from "@/libs/helpers/dashboard";

const TeamContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showKickModal, setShowKickModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [teamCompetitionStatus, setTeamCompetitionStatus] = useState<{
    hasRegistration: boolean;
    competitionName?: string;
  }>({ hasRegistration: false });
  const [canModifyTeamState, setCanModifyTeamState] = useState<{
    canModify: boolean;
    reason?: string;
  }>({ canModify: true });
  const [memberToKick, setMemberToKick] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    position?: "insideCard" | "outsideCard";
    text: string;
  } | null>(null);
  const router = useRouter();

  // Form states
  const [createTeamForm, setCreateTeamForm] = useState({
    name: "",
    description: "",
    maxMembers: 3,
    isPublic: true,
  });

  const [joinTeamForm, setJoinTeamForm] = useState({
    teamCode: "",
  });

  const [previewTeam, setPreviewTeam] = useState<TeamWithMembers | null>(null);
  const [createNameError, setCreateNameError] = useState<string | null>(null);

  console.log("MESSAGE: ", message);

  // Load data saat component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Get current user
      const userResult = await authService.getCurrentUser();
      if (userResult.error || !userResult.user) {
        router.push("/auth/login");
        return;
      }

      setUser(userResult.user);
      setProfile(userResult.profile);

      // Get user's team
      const teamResult = await teamService.getUserTeam(userResult.user.id);
      if (teamResult.error) {
        setMessage({ type: "error", text: teamResult.error });
      } else {
        setTeam(teamResult.data || null);

        // Check team competition registration status if team exists
        if (teamResult.data) {
          const competitionCheck =
            await teamService.hasActiveCompetitionRegistration(
              teamResult.data.id
            );
          if (competitionCheck.data) {
            setTeamCompetitionStatus(competitionCheck.data);
          }

          // Check whether team members can be modified (blocked if approved)
          const canModify = await teamService.canModifyTeam(teamResult.data.id);
          if (canModify.data) setCanModifyTeamState(canModify.data);
        }
      }
    } catch (error) {
      console.error("Error loading team data:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat memuat data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Check if profile is complete for team actions
  const canAccessTeamActions = isProfileComplete(profile);
  const missingFields = getMissingProfileFields(profile);

  // Handle team action with profile check
  const handleTeamAction = (action: "create" | "join") => {
    if (!canAccessTeamActions) {
      setShowProfileWarning(true);
      return;
    }

    if (action === "create") {
      setShowCreateModal(true);
    } else if (action === "join") {
      setShowJoinModal(true);
    }
  };

  // Handle create team
  const handleCreateTeam = async () => {
    if (!user) return;
    if (!createTeamForm.name.trim()) {
      setMessage({ type: "error", text: "Nama tim harus diisi." });
      return;
    }

    setIsCreatingTeam(true);
    try {
      setCreateNameError(null);
      const result = await teamService.createTeam(user.id, {
        name: createTeamForm.name.trim(),
        description: createTeamForm.description.trim() || undefined,
        is_public: createTeamForm.isPublic,
      });

      if (result.error) {
        // Tampilkan error nama tim duplikat di bawah input
        if (result.error.toLowerCase().includes("nama tim sudah digunakan")) {
          setCreateNameError(result.error);
        } else {
          setMessage({ type: "error", text: result.error });
        }
      } else {
        setMessage({ type: "success", text: "Tim berhasil dibuat!" });
        setShowCreateModal(false);
        setCreateTeamForm({
          name: "",
          description: "",
          maxMembers: 3,
          isPublic: true,
        });
        setCreateNameError(null);
        await loadData(); // Reload team data
      }
    } catch (error) {
      console.error("Error creating team:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat membuat tim.",
      });
    } finally {
      setIsCreatingTeam(false);
    }
  };

  // Handle join team - preview first
  const handlePreviewTeam = async () => {
    if (!joinTeamForm.teamCode.trim()) {
      setMessage({ type: "error", text: "Kode tim harus diisi." });
      return;
    }

    try {
      const result = await teamService.getTeamByCode(
        joinTeamForm.teamCode.trim()
      );
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else if (!result.data) {
        setMessage({
          type: "error",
          position: "insideCard",
          text: "Tim dengan kode tersebut tidak ditemukan.",
        });
      } else {
        setPreviewTeam(result.data);
      }
    } catch (error) {
      console.error("Error previewing team:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat mencari tim.",
      });
    }
  };

  // Handle join team
  const handleJoinTeam = async () => {
    if (!user || !previewTeam) return;

    // Prevent joining if team modifications are blocked
    const canModify = await teamService.canModifyTeam(previewTeam.id);
    if (canModify.data && !canModify.data.canModify) {
      setMessage({
        type: "error",
        text: canModify.data.reason || "Anggota tim tidak dapat diubah.",
        position: "insideCard",
      });
      return;
    }

    setIsJoiningTeam(true);
    try {
      const result = await teamService.joinTeam(user.id, previewTeam.code);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Berhasil bergabung dengan tim!" });
        setShowJoinModal(false);
        setJoinTeamForm({ teamCode: "" });
        setPreviewTeam(null);
        await loadData(); // Reload team data
      }
    } catch (error) {
      console.error("Error joining team:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat bergabung dengan tim.",
      });
    } finally {
      setIsJoiningTeam(false);
    }
  };

  // Handle leave team
  const handleLeaveTeam = async () => {
    if (!user || !team) return;

    // Check if team members can be modified
    const canModify = await teamService.canModifyTeam(team.id);
    if (canModify.data && !canModify.data.canModify) {
      setMessage({
        type: "error",
        text:
          canModify.data.reason || "Anggota tim tidak dapat keluar dari tim.",
        position: "outsideCard",
      });
      return;
    }

    setShowLeaveModal(true);
  };

  const confirmLeaveTeam = async () => {
    if (!user) return;

    try {
      const result = await teamService.leaveTeam(user.id);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Berhasil keluar dari tim." });
        setShowLeaveModal(false);
        await loadData(); // Reload team data
      }
    } catch (error) {
      console.error("Error leaving team:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat keluar dari tim.",
      });
    }
  };

  // Handle kick member
  const handleKickMember = async (memberId: string, memberName: string) => {
    if (!user || !team) return;

    // Check if team members can be modified
    const canModify = await teamService.canModifyTeam(team.id);
    if (canModify.data && !canModify.data.canModify) {
      setMessage({
        type: "error",
        text: canModify.data.reason || "Anggota tim tidak dapat dikeluarkan.",
      });
      return;
    }

    setMemberToKick({ id: memberId, name: memberName });
    setShowKickModal(true);
  };

  const confirmKickMember = async () => {
    if (!user || !memberToKick) return;

    try {
      const result = await teamService.kickMember(user.id, memberToKick.id);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: `${memberToKick.name} berhasil dikeluarkan dari tim.`,
        });
        setShowKickModal(false);
        setMemberToKick(null);
        await loadData(); // Reload team data
      }
    } catch (error) {
      console.error("Error kicking member:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat mengeluarkan anggota.",
        position: "insideCard",
      });
    }
  };

  // Copy team code to clipboard
  const copyTeamCode = () => {
    if (team?.code) {
      navigator.clipboard.writeText(team.code);
      setIsCopied(true);

      // Reset icon setelah 2 detik
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  // Get user's role in team
  const getUserRole = () => {
    if (!user || !team?.members) return null;
    const member = team.members.find((m) => m.id === user.id);
    return member?.is_team_leader ? "leader" : "member";
  };

  const userRole = getUserRole();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <TeamSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-neutral_02 to-neutral_01 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-brand_01" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral_01">
              Tim Anda
            </h1>
            <p className="text-neutral_01/60 text-sm sm:text-base">
              Kelola tim dan anggota tim
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {!team && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => handleTeamAction("join")}
              disabled={!canAccessTeamActions}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral_01/20 rounded-xl transition-colors ${
                canAccessTeamActions
                  ? "bg-neutral_01/10 text-neutral_01 hover:bg-neutral_01/20"
                  : "bg-neutral_01/5 text-neutral_01/40 cursor-not-allowed"
              }`}
              title={
                !canAccessTeamActions
                  ? "Lengkapi profil Anda terlebih dahulu"
                  : ""
              }
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm font-medium">Gabung Tim</span>
            </button>
            <button
              onClick={() => handleTeamAction("create")}
              disabled={!canAccessTeamActions}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
                canAccessTeamActions
                  ? "bg-neutral_02 hover:bg-neutral_02/80 text-brand_01"
                  : "bg-neutral_01/10 text-neutral_01/40 cursor-not-allowed"
              }`}
              title={
                !canAccessTeamActions
                  ? "Lengkapi profil Anda terlebih dahulu"
                  : ""
              }
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Buat Tim</span>
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {message && message.position === "outsideCard" && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border mb-6 ${
            message.type === "success"
              ? "bg-green-500/10 border-green-400/20 text-green-400"
              : "bg-red-500/10 border-red-400/20 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Profile Completeness Warning */}
      {!team && !canAccessTeamActions && (
        <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-yellow-400 font-medium mb-2">
                Profil Belum Lengkap
              </h4>
              <p className="text-yellow-400/80 text-sm mb-3">
                Lengkapi profil Anda terlebih dahulu untuk dapat membuat atau
                bergabung dengan tim.
              </p>
              <button
                onClick={() => router.push("/dashboard?menu=profil")}
                className="text-sm bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                Lengkapi Profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Content */}
      {team ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Team Info */}
          <div className="bg-neutral_01/5 backdrop-blur-sm border border-neutral_01/10 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg sm:text-xl font-bold text-neutral_01 truncate">
                    {team.name}
                  </h2>
                  {userRole === "leader" && (
                    <Crown className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-neutral_01/60 mb-4 text-sm sm:text-base">
                  {team.description || "Tidak ada deskripsi"}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-neutral_01/80">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {team.current_members}/{TEAM_REQUIREMENTS.MAX_MEMBERS}{" "}
                      anggota
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 flex-shrink-0" />
                    <span>Kode: {team.code}</span>
                    <button
                      onClick={copyTeamCode}
                      className={`p-1 hover:bg-neutral_01/10 rounded transition-all duration-200 text-neutral_01`}
                      title={isCopied ? "Disalin!" : "Salin kode tim"}
                    >
                      {isCopied ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {team.is_public ? (
                      <Eye className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <EyeOff className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{team.is_public ? "Publik" : "Private"}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleLeaveTeam}
                  className="p-2 flex justify-center sm:p-2.5 bg-red-500/10 border border-red-400/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Competition Registration Status Warning */}
          {teamCompetitionStatus.hasRegistration && (
            <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-blue-400 font-medium mb-2">
                    Tim Terdaftar Kompetisi
                  </h4>
                  <p className="text-blue-400/80 text-sm">
                    Tim Anda sudah terdaftar untuk kompetisi{" "}
                    <strong>{teamCompetitionStatus.competitionName}</strong>.
                    Anggota tim tidak dapat diubah selama masa kompetisi aktif.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Team Members */}
          <div className="bg-neutral_01/5 backdrop-blur-sm border border-neutral_01/10 rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-neutral_01 mb-4 sm:mb-6">
              Anggota Tim
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {team.members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-neutral_01/5 rounded-xl"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral_02 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-brand_01" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-neutral_01 text-sm sm:text-base truncate">
                          {member.full_name}
                        </h4>
                        {member.is_team_leader && (
                          <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-neutral_01/60 truncate">
                        {member.email}
                      </p>
                      {member.university && (
                        <p className="text-xs text-neutral_01/40 truncate">
                          {member.university} - {member.major}
                        </p>
                      )}
                    </div>
                  </div>

                  {userRole === "leader" && !member.is_team_leader && (
                    <button
                      onClick={() =>
                        handleKickMember(member.id, member.full_name)
                      }
                      className="p-2 bg-red-500/10 border border-red-400/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0 ml-2"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // No Team State
        <div className="bg-neutral_01/5 backdrop-blur-sm border border-neutral_01/10 rounded-2xl p-8 text-center">
          <Users className="w-16 h-16 text-neutral_01/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral_01 mb-2">
            Belum Bergabung Tim
          </h3>
          <p className="text-neutral_01/60 mb-6">
            Anda belum bergabung dengan tim manapun. Buat tim baru atau
            bergabung dengan tim yang sudah ada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => handleTeamAction("join")}
              disabled={!canAccessTeamActions}
              className={`flex items-center justify-center gap-2 px-6 py-3 border border-neutral_01/20 rounded-xl transition-colors ${
                canAccessTeamActions
                  ? "bg-neutral_01/10 text-neutral_01 hover:bg-neutral_01/20"
                  : "bg-neutral_01/5 text-neutral_01/40 cursor-not-allowed"
              }`}
              title={
                !canAccessTeamActions
                  ? "Lengkapi profil Anda terlebih dahulu"
                  : ""
              }
            >
              <UserPlus className="w-5 h-5" />
              <span>Gabung Tim</span>
            </button>
            <button
              onClick={() => handleTeamAction("create")}
              disabled={!canAccessTeamActions}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-colors ${
                canAccessTeamActions
                  ? "bg-neutral_02 hover:bg-neutral_02/80 text-brand_01"
                  : "bg-neutral_01/10 text-neutral_01/40 cursor-not-allowed border border-neutral_01/20"
              }`}
              title={
                !canAccessTeamActions
                  ? "Lengkapi profil Anda terlebih dahulu"
                  : ""
              }
            >
              <Plus className="w-5 h-5" />
              <span>Buat Tim Baru</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-neutral_01/30 rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-neutral_01">
                Buat Tim Baru
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-neutral_01/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-neutral_01" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral_01 mb-2">
                  Nama Tim <span className="text-red-500">*</span>
                </label>
                <p className="text-white/40 text-sm mb-2">
                  Anda tidak dapat mengubah nama tim setelah dibuat.
                </p>
                <input
                  type="text"
                  value={createTeamForm.name}
                  onChange={(e) =>
                    setCreateTeamForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  onInput={() => createNameError && setCreateNameError(null)}
                  className={`w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border rounded-lg text-neutral_01 placeholder-neutral_01/40 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    createNameError
                      ? "border-red-500/40 focus:ring-red-500/40"
                      : "border-neutral_01/20 focus:ring-neutral_02/50"
                  }`}
                  placeholder="Masukkan nama tim"
                  maxLength={50}
                />
                {createNameError && (
                  <p className="mt-2 text-sm text-red-400">{createNameError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral_01 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={createTeamForm.description}
                  onChange={(e) =>
                    setCreateTeamForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 placeholder-neutral_01/40 focus:outline-none focus:ring-2 focus:ring-neutral_02/50 resize-none transition-all duration-200"
                  placeholder="Deskripsi tim (opsional)"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <p className="text-white/40 text-sm ">
                Setiap tim hanya bisa memiliki maksimal{" "}
                <b>{TEAM_REQUIREMENTS.MAX_MEMBERS} anggota.</b>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 hover:bg-neutral_01/20 transition-colors text-center"
              >
                Batal
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={isCreatingTeam || !createTeamForm.name.trim()}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-neutral_02 hover:bg-neutral_02/80 rounded-lg text-brand_01 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isCreatingTeam ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Membuat...</span>
                  </>
                ) : (
                  <span>Buat Tim</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-neutral_01/30 rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-neutral_01">
                Bergabung dengan Tim
              </h3>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinTeamForm({ teamCode: "" });
                  setPreviewTeam(null);
                }}
                className="p-2 hover:bg-neutral_01/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-neutral_01" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral_01 mb-2">
                  Kode Tim
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinTeamForm.teamCode}
                    onChange={(e) =>
                      setJoinTeamForm((prev) => ({
                        ...prev,
                        teamCode: e.target.value.toUpperCase(),
                      }))
                    }
                    className="flex-1 px-3 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 placeholder-neutral_01/40 focus:outline-none focus:ring-2 focus:ring-neutral_02/50 transition-all duration-200"
                    placeholder="Masukkan kode tim"
                    maxLength={8}
                  />
                  <button
                    onClick={handlePreviewTeam}
                    disabled={!joinTeamForm.teamCode.trim()}
                    className="px-4 py-2 bg-neutral_02 hover:bg-neutral_02/80 rounded-lg text-brand_01 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cari
                  </button>
                </div>
              </div>
              {message && message.position === "insideCard" && (
                <div
                  className={`flex items-center gap-2 px-3 py-2.5 bg-${
                    message.type === "success"
                      ? "green-500/10 border-green-400/20 text-green-400"
                      : "red-500/10 border-red-400/20 text-red-400"
                  } rounded-lg`}
                >
                  {message.text}
                </div>
              )}
              {/* Team Preview */}
              {previewTeam && (
                <div className="p-4 bg-neutral_01/10 border border-neutral_01/20 rounded-lg">
                  <h4 className="font-medium text-neutral_01 mb-2">
                    {previewTeam.name}
                  </h4>
                  <p className="text-sm text-neutral_01/60 mb-3">
                    {previewTeam.description || "Tidak ada deskripsi"}
                  </p>
                  <div className="flex items-center justify-between text-sm text-neutral_01/80">
                    <span>
                      {previewTeam.current_members}/
                      {TEAM_REQUIREMENTS.MAX_MEMBERS} anggota
                    </span>
                    <span
                      className={
                        previewTeam.is_full ? "text-red-400" : "text-green-400"
                      }
                    >
                      {previewTeam.is_full ? "Penuh" : "Tersedia"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinTeamForm({ teamCode: "" });
                  setPreviewTeam(null);
                }}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 hover:bg-neutral_01/20 transition-colors text-center"
              >
                Batal
              </button>
              <button
                onClick={handleJoinTeam}
                disabled={isJoiningTeam || !previewTeam || previewTeam.is_full}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-neutral_02 hover:bg-neutral_02/80 rounded-lg text-brand_01 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isJoiningTeam ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Bergabung...</span>
                  </>
                ) : (
                  <span>Bergabung</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kick Member Confirmation Modal */}
      {showKickModal && memberToKick && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-neutral_01/30 rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 border border-red-400/30 rounded-xl flex items-center justify-center">
                <UserMinus className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-neutral_01">
                  Keluarkan Anggota
                </h3>
                <p className="text-sm text-neutral_01/60">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <div className="bg-neutral_01/10 border border-neutral_01/20 rounded-xl p-4 mb-6">
              <p className="text-neutral_01 mb-2">
                Anda yakin ingin mengeluarkan{" "}
                <span className="font-semibold text-red-400">
                  {memberToKick.name}
                </span>{" "}
                dari tim?
              </p>
              <p className="text-sm text-neutral_01/60">
                Anggota yang dikeluarkan tidak akan bisa mengakses tim lagi dan
                harus bergabung ulang jika ingin kembali.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowKickModal(false);
                  setMemberToKick(null);
                }}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 hover:bg-neutral_01/20 transition-colors text-center"
              >
                Batal
              </button>
              <button
                onClick={confirmKickMember}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
              >
                <UserMinus className="w-4 h-4" />
                Keluarkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Team Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-neutral_01/30 rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-800/20 border border-red-400/30 rounded-xl flex items-center justify-center">
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-red-600/60" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-neutral_01">
                  Keluar dari Tim
                </h3>
                <p className="text-sm text-neutral_01/60">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <div className="bg-neutral_01/10 border border-neutral_01/20 rounded-xl p-4 mb-6">
              {userRole === "leader" ? (
                <div>
                  <p className="text-neutral_01 mb-2">
                    Anda adalah{" "}
                    <span className="font-semibold text-yellow-400">
                      leader tim
                    </span>
                    . Jika Anda keluar:
                  </p>
                  <ul className="text-sm text-neutral_01/80 space-y-1 ml-4">
                    <li>
                      • Kepemimpinan akan dialihkan ke anggota lain secara
                      otomatis
                    </li>
                    <li>• Anda harus bergabung ulang jika ingin kembali</li>
                    <li>• Tim akan tetap berjalan tanpa Anda</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p className="text-neutral_01 mb-2">
                    Anda yakin ingin keluar dari tim{" "}
                    <span className="font-semibold text-neutral_02">
                      {team?.name}
                    </span>
                    ?
                  </p>
                  <p className="text-sm text-neutral_01/60">
                    Anda harus bergabung ulang jika ingin kembali ke tim ini.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 hover:bg-neutral_01/20 transition-colors text-center"
              >
                Batal
              </button>
              <button
                onClick={confirmLeaveTeam}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-red-900 hover:bg-red-900/80 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Keluar Tim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Incomplete Warning Modal */}
      {showProfileWarning && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-md border border-neutral_01/30 rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 border border-yellow-400/30 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-neutral_01">
                  Profil Belum Lengkap
                </h3>
                <p className="text-sm text-neutral_01/60">
                  Lengkapi profil untuk mengakses fitur tim
                </p>
              </div>
            </div>

            <div className="bg-neutral_01/10 border border-neutral_01/20 rounded-xl p-4 mb-6">
              <p className="text-neutral_01 mb-3">
                Untuk membuat atau bergabung dengan tim, Anda harus melengkapi
                semua field profil terlebih dahulu.
              </p>

              <div className="mb-4">
                <p className="text-neutral_01/80 text-sm mb-2">
                  Field yang belum diisi:
                </p>
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                  {missingFields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0" />
                      <span className="text-neutral_01/70">{field}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-3">
                <p className="text-yellow-400 text-sm">
                  💡 <strong>Tips:</strong> Pastikan semua informasi pribadi,
                  akademik, dan alamat telah diisi dengan benar.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowProfileWarning(false)}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 hover:bg-neutral_01/20 transition-colors text-center"
              >
                Nanti Saja
              </button>
              <button
                onClick={() => {
                  setShowProfileWarning(false);
                  router.push("/dashboard?menu=profil");
                }}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Lengkapi Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamContent;
