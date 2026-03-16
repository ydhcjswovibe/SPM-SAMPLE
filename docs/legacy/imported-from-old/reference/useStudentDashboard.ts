"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createBrowserSupabaseClient } from "../lib/supabase/browser";
import { resolveWeeklyImageItems } from "../lib/weekly-image";
import { resolveWeeklyVideoItems, type WeeklyVideoMediaRow } from "../lib/weekly-video";
import type { StudentDashboardData, StudentDashboardClassSummary } from "../types/student-dashboard";

function getCurrentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

type EnrollmentRow = {
  class_id: string;
  payment_status: boolean | null;
  status: string | null;
  classes: { name: string | null } | { name: string | null }[] | null;
};

type ClassLogRow = {
  class_id: string;
  week_number: number | null;
  progress: string | null;
  reflection: string | null;
  attendance_data: Record<string, boolean> | null;
  member_feedback: Record<string, string> | null;
  media: WeeklyVideoMediaRow[] | WeeklyVideoMediaRow | null;
};

function getClassName(classes: EnrollmentRow["classes"]) {
  if (!classes) return "이름 없는 클래스";
  if (Array.isArray(classes)) {
    return classes[0]?.name ?? "이름 없는 클래스";
  }
  return classes.name ?? "이름 없는 클래스";
}

export function useStudentDashboard(userId: string | null, enabled = true) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [dataOwnerUserId, setDataOwnerUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const previousUserIdRef = useRef<string | null>(null);

  const refetch = useCallback(() => {
    setReloadNonce((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !userId) {
      previousUserIdRef.current = null;
      setData(null);
      setDataOwnerUserId(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const hasUserChanged = previousUserIdRef.current !== null && previousUserIdRef.current !== userId;
    previousUserIdRef.current = userId;

    if (hasUserChanged) {
      setData(null);
      setDataOwnerUserId(null);
    }

    let cancelled = false;
    const yearMonth = getCurrentYearMonth();

    async function load() {
      setIsLoading(true);
      setError(null);

      const { data: enrollmentRows, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("class_id, payment_status, status, classes(name)")
        .eq("student_id", userId)
        .eq("year_month", yearMonth)
        .order("class_id", { ascending: true });

      if (cancelled) return;

      if (enrollmentError) {
        setError(enrollmentError.message);
        setIsLoading(false);
        return;
      }

      const enrollments = (enrollmentRows ?? []) as EnrollmentRow[];
      const classIds = Array.from(new Set(enrollments.map((row) => row.class_id).filter(Boolean)));

      let classLogs: ClassLogRow[] = [];
      if (classIds.length) {
        const { data: classLogRows, error: classLogError } = await supabase
          .from("class_logs")
          .select("class_id, week_number, progress, reflection, attendance_data, member_feedback, media(id, type, url, upload_method)")
          .eq("year_month", yearMonth)
          .in("class_id", classIds)
          .order("class_id", { ascending: true })
          .order("week_number", { ascending: true });

        if (cancelled) return;

        if (classLogError) {
          setError(classLogError.message);
          setIsLoading(false);
          return;
        }

        classLogs = (classLogRows ?? []) as ClassLogRow[];
      }

      const classSummaries: StudentDashboardClassSummary[] = enrollments.map((row) => {
        const logs = classLogs.filter((log) => log.class_id === row.class_id);
        const weeks = logs
          .filter((log) => typeof log.week_number === "number")
          .map((log) => {
            const feedback = log.member_feedback?.[userId]?.trim();
            const resolvedVideos = resolveWeeklyVideoItems(
              Array.isArray(log.media) ? log.media : log.media ? [log.media] : [],
              `${getClassName(row.classes)} ${log.week_number}주차`,
            );
            const resolvedImages = resolveWeeklyImageItems(
              Array.isArray(log.media) ? log.media : log.media ? [log.media] : [],
              `${getClassName(row.classes)} ${log.week_number}주차`,
            );

            return {
              weekNumber: log.week_number as number,
              attendanceChecked: Boolean(log.attendance_data?.[userId]),
              progressText: log.progress?.trim() ? log.progress.trim() : null,
              reflectionText: log.reflection?.trim() ? log.reflection.trim() : null,
              feedbackText: feedback ? feedback : null,
              weeklyVideo: {
                items: resolvedVideos
                  .filter((item): item is Extract<(typeof resolvedVideos)[number], { status: "ready" }> => item.status === "ready")
                  .map((item) => ({
                    mediaId: item.mediaId,
                    url: item.url,
                    youtubeId: item.youtubeId,
                    uploadMethod: item.uploadMethod,
                  })),
                invalidItems: resolvedVideos
                  .filter((item): item is Extract<(typeof resolvedVideos)[number], { status: "invalid" }> => item.status === "invalid")
                  .map((item) => ({
                    mediaId: item.mediaId,
                    url: item.url,
                    message: item.message,
                    uploadMethod: item.uploadMethod,
                  })),
              },
              weeklyImage: {
                items: resolvedImages
                  .filter((item): item is Extract<(typeof resolvedImages)[number], { status: "ready" }> => item.status === "ready")
                  .map((item) => ({
                    mediaId: item.mediaId,
                    url: item.url,
                    objectPath: item.objectPath,
                    uploadMethod: item.uploadMethod,
                  })),
                invalidItems: resolvedImages
                  .filter((item): item is Extract<(typeof resolvedImages)[number], { status: "invalid" }> => item.status === "invalid")
                  .map((item) => ({
                    mediaId: item.mediaId,
                    url: item.url,
                    message: item.message,
                    uploadMethod: item.uploadMethod,
                  })),
              },
            };
          });
        const attendanceTotal = logs.length;
        const attendanceChecked = logs.reduce((count, log) => {
          return count + (log.attendance_data?.[userId] ? 1 : 0);
        }, 0);
        const feedbackCount = logs.reduce((count, log) => {
          const feedback = log.member_feedback?.[userId];
          return count + (feedback && feedback.trim() ? 1 : 0);
        }, 0);

        return {
          classId: row.class_id,
          className: getClassName(row.classes),
          paymentStatus: Boolean(row.payment_status),
          enrollmentStatus: row.status ?? "ACTIVE",
          attendanceChecked,
          attendanceTotal,
          feedbackCount,
          weeks,
        };
      });

      const nextData: StudentDashboardData = {
        summary: {
          yearMonth,
          classCount: classSummaries.length,
          paidCount: classSummaries.filter((item) => item.paymentStatus).length,
          attendanceChecked: classSummaries.reduce((sum, item) => sum + item.attendanceChecked, 0),
          attendanceTotal: classSummaries.reduce((sum, item) => sum + item.attendanceTotal, 0),
          feedbackCount: classSummaries.reduce((sum, item) => sum + item.feedbackCount, 0),
        },
        classes: classSummaries,
      };

      setData(nextData);
      setDataOwnerUserId(userId);
      setIsLoading(false);
    }

    load().catch((loadError: any) => {
      if (cancelled) return;
      setError(loadError?.message ?? "학생 대시보드 조회 실패");
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, reloadNonce, supabase, userId]);

  return { data, dataOwnerUserId, isLoading, error, refetch };
}
