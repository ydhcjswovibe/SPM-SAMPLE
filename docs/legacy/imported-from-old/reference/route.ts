import type { NextRequest } from "next/server";

import { fetchEnrollmentManagementRows, fetchStudentOptions } from "../../../../lib/admin/enrollments";
import { resolveClassId } from "../../../../lib/admin/matrix";
import { requireAdminAccess } from "../../../../lib/supabase/server";
import type { EnrollmentLifecycleStatus } from "../../../../types/admin-enrollment";

type CreateEnrollmentBody = {
  class: string;
  year_month: string;
  student_id: string;
};

type UpdateEnrollmentBody = {
  enrollment_id: string;
  status: EnrollmentLifecycleStatus;
};

type DeleteEnrollmentBody = {
  enrollment_id: string;
};

function jsonError(message: string, status = 400, code = "BAD_REQUEST") {
  return Response.json({ error: { code, message } }, { status });
}

function ensureYearMonth(value: string | null) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  return value;
}

function isEnrollmentStatus(value: string | null | undefined): value is EnrollmentLifecycleStatus {
  return value === "ACTIVE" || value === "PENDING" || value === "CANCELLED";
}

export async function GET(request: NextRequest) {
  try {
    const adminAccess = await requireAdminAccess(request.headers.get("authorization"));
    if (!adminAccess.ok) {
      return adminAccess.response;
    }

    const { supabase } = adminAccess;
    const classFilter = request.nextUrl.searchParams.get("class");
    const yearMonth = ensureYearMonth(request.nextUrl.searchParams.get("year_month"));

    if (!yearMonth) {
      return jsonError("year_month must be in YYYY-MM format");
    }

    const studentOptions = await fetchStudentOptions(supabase);

    if (!classFilter) {
      return Response.json({ rows: [], student_options: studentOptions });
    }

    const classId = await resolveClassId(supabase, classFilter);
    if (!classId) {
      return Response.json({ rows: [], student_options: studentOptions });
    }

    const rows = await fetchEnrollmentManagementRows({
      supabase,
      classId,
      yearMonth,
    });

    return Response.json({
      rows,
      student_options: studentOptions,
    });
  } catch (error: any) {
    return jsonError(error?.message ?? "Failed to fetch enrollments", 500, "ENROLLMENT_FETCH_FAILED");
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminAccess = await requireAdminAccess(request.headers.get("authorization"));
    if (!adminAccess.ok) {
      return adminAccess.response;
    }

    const { supabase } = adminAccess;
    const body = (await request.json()) as CreateEnrollmentBody;
    const yearMonth = ensureYearMonth(body?.year_month ?? null);

    if (!yearMonth) {
      return jsonError("year_month must be in YYYY-MM format");
    }
    if (!body?.student_id) {
      return jsonError("student_id is required");
    }

    const classId = await resolveClassId(supabase, body.class);
    if (!classId) {
      return jsonError("class not found", 404, "CLASS_NOT_FOUND");
    }

    const { data: studentProfile, error: studentProfileError } = await supabase
      .from("profiles")
      .select("id,role")
      .eq("id", body.student_id)
      .maybeSingle();

    if (studentProfileError) {
      return jsonError(studentProfileError.message, 400, "STUDENT_PROFILE_LOOKUP_FAILED");
    }
    if (!studentProfile?.id || studentProfile.role !== "STUDENT") {
      return jsonError("student profile not found", 404, "STUDENT_NOT_FOUND");
    }

    const { data: existingEnrollment, error: existingEnrollmentError } = await supabase
      .from("enrollments")
      .select("id,status")
      .eq("class_id", classId)
      .eq("year_month", yearMonth)
      .eq("student_id", body.student_id)
      .maybeSingle();

    if (existingEnrollmentError) {
      return jsonError(existingEnrollmentError.message, 400, "ENROLLMENT_LOOKUP_FAILED");
    }

    if (existingEnrollment?.id) {
      if (existingEnrollment.status === "ACTIVE") {
        return Response.json({ ok: true, action: "existing" });
      }

      const { error: updateError } = await supabase
        .from("enrollments")
        .update({ status: "ACTIVE" })
        .eq("id", existingEnrollment.id);

      if (updateError) {
        return jsonError(updateError.message, 400, "ENROLLMENT_REACTIVATE_FAILED");
      }

      return Response.json({ ok: true, action: "reactivated" });
    }

    const { error: insertError } = await supabase.from("enrollments").insert({
      class_id: classId,
      student_id: body.student_id,
      year_month: yearMonth,
      payment_status: false,
      status: "ACTIVE",
    });

    if (insertError) {
      return jsonError(insertError.message, 400, "ENROLLMENT_CREATE_FAILED");
    }

    return Response.json({ ok: true, action: "created" });
  } catch (error: any) {
    return jsonError(error?.message ?? "Failed to create enrollment", 500, "ENROLLMENT_CREATE_FAILED");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminAccess = await requireAdminAccess(request.headers.get("authorization"));
    if (!adminAccess.ok) {
      return adminAccess.response;
    }

    const { supabase } = adminAccess;
    const body = (await request.json()) as UpdateEnrollmentBody;

    if (!body?.enrollment_id) {
      return jsonError("enrollment_id is required");
    }
    if (!isEnrollmentStatus(body?.status)) {
      return jsonError("status must be ACTIVE, PENDING, or CANCELLED");
    }

    const { data: updatedRows, error } = await supabase
      .from("enrollments")
      .update({ status: body.status })
      .select("id")
      .eq("id", body.enrollment_id);

    if (error) {
      return jsonError(error.message, 400, "ENROLLMENT_UPDATE_FAILED");
    }
    if (!updatedRows?.length) {
      return jsonError("enrollment not found", 404, "ENROLLMENT_NOT_FOUND");
    }

    return Response.json({ ok: true });
  } catch (error: any) {
    return jsonError(error?.message ?? "Failed to update enrollment", 500, "ENROLLMENT_UPDATE_FAILED");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminAccess = await requireAdminAccess(request.headers.get("authorization"));
    if (!adminAccess.ok) {
      return adminAccess.response;
    }

    if (adminAccess.role !== "OWNER") {
      return jsonError("OWNER 권한이 필요합니다.", 403, "OWNER_REQUIRED");
    }

    const { supabase } = adminAccess;
    const body = (await request.json()) as DeleteEnrollmentBody;

    if (!body?.enrollment_id) {
      return jsonError("enrollment_id is required");
    }

    const { data: deletedRows, error } = await supabase
      .from("enrollments")
      .delete()
      .eq("id", body.enrollment_id)
      .select("id");

    if (error) {
      return jsonError(error.message, 400, "ENROLLMENT_DELETE_FAILED");
    }
    if (!deletedRows?.length) {
      return jsonError("enrollment not found", 404, "ENROLLMENT_NOT_FOUND");
    }

    return Response.json({ ok: true });
  } catch (error: any) {
    return jsonError(error?.message ?? "Failed to delete enrollment", 500, "ENROLLMENT_DELETE_FAILED");
  }
}
