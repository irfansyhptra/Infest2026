/**
 * Rangkaian acara lengkap tiap lomba, untuk kalender di dashboard.
 *
 * Kenapa di sini dan bukan di tabel competitions: tabel itu hanya punya kolom
 * tetap (registration_start, qualification_end, final_date, ...) — satu kolom
 * per jenis tanggal. Rangkaian di bawah punya belasan acara per lomba
 * (technical meeting, penilaian, pengumuman finalis, ...) yang tidak ada
 * kolomnya, dan jumlahnya berbeda-beda tiap lomba. Menambah kolom untuk tiap
 * acara tidak akan pernah cukup.
 *
 * Kolom tanggal di database tetap dipakai dan tetap harus akurat — bukan
 * duplikat hiasan: registration_* mengisi "Periode Pendaftaran" di kartu, dan
 * qualification_end benar-benar MEMBLOKIR upload setelah lewat deadline
 * (lihat ProposalUpload/NotebookUpload). Jadwal di bawah ini tambahan untuk
 * tampilan kalender, dan tanggalnya harus konsisten dengan kolom-kolom itu.
 *
 * `end` boleh dikosongkan untuk acara satu hari.
 */
export type ScheduleEvent = {
  title: string;
  start: string; // YYYY-MM-DD
  end?: string; // YYYY-MM-DD, untuk acara berdurasi
};

/** Dikunci per slug kompetisi supaya cocok dengan baris di tabel competitions. */
const RAW_SCHEDULE: Record<string, ScheduleEvent[]> = {
  datascience: [
    { title: "Pendaftaran Early Bird", start: "2026-07-20", end: "2026-08-10" },
    { title: "Pendaftaran Reguler", start: "2026-08-11", end: "2026-09-12" },
    { title: "Technical Meeting Penyisihan", start: "2026-09-16" },
    { title: "Babak Penyisihan", start: "2026-09-18", end: "2026-09-30" },
    { title: "Penilaian", start: "2026-10-01", end: "2026-10-11" },
    { title: "Pengumuman Finalis", start: "2026-10-12" },
    { title: "Technical Meeting Finalis", start: "2026-10-15" },
    { title: "Pengumpulan Slide Presentasi Finalis", start: "2026-10-22" },
    { title: "Final Presentasi", start: "2026-10-23" },
    { title: "Pengumuman Juara", start: "2026-10-25" },
  ],

  hackathon: [
    { title: "Pendaftaran Early Bird", start: "2026-07-20", end: "2026-07-30" },
    { title: "Pendaftaran Middle Bird", start: "2026-07-31", end: "2026-08-13" },
    { title: "Pendaftaran Reguler", start: "2026-08-14", end: "2026-09-04" },
    { title: "Pengumpulan Proposal / Hasil Study Case", start: "2026-08-20", end: "2026-09-12" },
    { title: "Mentoring & Penjelasan Study Case (Online)", start: "2026-09-06" },
    { title: "Pengumuman Finalis", start: "2026-09-14" },
    { title: "Technical Meeting Babak Final (Online)", start: "2026-09-20" },
    { title: "Babak Final & Presentasi (Onsite)", start: "2026-10-23", end: "2026-10-24" },
    { title: "Pengumuman Juara (Onsite)", start: "2026-10-25" },
  ],

  "uiux-design-competition": [
    { title: "Pendaftaran Lomba", start: "2026-07-20", end: "2026-10-03" },
    { title: "Pengumpulan Karya", start: "2026-09-27", end: "2026-10-03" },
    { title: "Penilaian Karya", start: "2026-10-04", end: "2026-10-10" },
    { title: "Pengumuman Finalis", start: "2026-10-11" },
    { title: "Technical Meeting Finalis", start: "2026-10-15" },
    { title: "Final Round", start: "2026-10-17" },
    { title: "Pengumuman Juara", start: "2026-10-25" },
  ],
};

/**
 * Tiap periode pendaftaran dapat penanda satu hari di tanggal terakhirnya
 * ("Hari Terakhir Pendaftaran Early Bird", dst). Sebagai rentang saja batas
 * akhirnya gampang kelewat di kalender — ujung rentang tidak menonjol.
 *
 * Diturunkan, bukan ditulis manual, supaya tanggalnya tidak bisa lepas dari
 * periodenya waktu jadwal digeser.
 */
const withDeadlineMarkers = (events: ScheduleEvent[]): ScheduleEvent[] =>
  events.flatMap((e) =>
    e.end && e.end !== e.start && e.title.startsWith("Pendaftaran")
      ? [e, { title: `Hari Terakhir ${e.title}`, start: e.end }]
      : [e]
  );

export const COMPETITION_SCHEDULE: Record<string, ScheduleEvent[]> =
  Object.fromEntries(
    Object.entries(RAW_SCHEDULE).map(([slug, events]) => [
      slug,
      withDeadlineMarkers(events),
    ])
  );
