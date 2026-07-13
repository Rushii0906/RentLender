"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { calculateExpiryDate } from "@/lib/expiry";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  // Pre-defined admin account for instant local checkout
  const isAdmin = email === "admin@samarth.com" && password === "admin123";
  
  // Also look up in SQLite database
  let user = null;
  if (!isAdmin) {
    try {
      user = await db.user.findFirst({
        where: { email, passwordHash: password } // simple plain-text match for local demo simplicity
      });
    } catch (e) {
      console.error("Database lookup error:", e);
    }
  }

  if (isAdmin || user) {
    const cookieStore = await cookies();
    cookieStore.set({
      name: "samarth_session",
      value: isAdmin ? "admin-session-id" : user!.id,
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return { success: true };
  }

  return { success: false, error: "Invalid email or password." };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("samarth_session");
  return { success: true };
}

// CREATE AGREEMENT ACTION
export async function createAgreement(data: {
  tenantName: string;
  tenantMobile: string;
  ownerName: string;
  ownerMobile: string;
  propertyAddress: string;
  rentAmount: number;
  securityDeposit: number;
  startDate: string; // YYYY-MM-DD
  durationMonths: number;
}) {
  try {
    const start = new Date(data.startDate);
    const expiry = calculateExpiryDate(start, data.durationMonths);

    const agreement = await db.agreement.create({
      data: {
        tenantName: data.tenantName,
        tenantMobile: data.tenantMobile,
        ownerName: data.ownerName,
        ownerMobile: data.ownerMobile,
        propertyAddress: data.propertyAddress,
        rentAmount: data.rentAmount,
        securityDeposit: data.securityDeposit,
        startDate: start,
        durationMonths: data.durationMonths,
        expiryDate: expiry,
      },
    });

    revalidatePath("/");
    revalidatePath("/agreements");
    return { success: true, id: agreement.id };
  } catch (error: any) {
    console.error("Failed to create agreement:", error);
    return { success: false, error: error.message || "Failed to create agreement" };
  }
}

// UPDATE AGREEMENT ACTION
export async function updateAgreement(id: string, data: {
  tenantName: string;
  tenantMobile: string;
  ownerName: string;
  ownerMobile: string;
  propertyAddress: string;
  rentAmount: number;
  securityDeposit: number;
  startDate: string; // YYYY-MM-DD
  durationMonths: number;
}) {
  try {
    const start = new Date(data.startDate);
    const expiry = calculateExpiryDate(start, data.durationMonths);

    const agreement = await db.agreement.update({
      where: { id },
      data: {
        tenantName: data.tenantName,
        tenantMobile: data.tenantMobile,
        ownerName: data.ownerName,
        ownerMobile: data.ownerMobile,
        propertyAddress: data.propertyAddress,
        rentAmount: data.rentAmount,
        securityDeposit: data.securityDeposit,
        startDate: start,
        durationMonths: data.durationMonths,
        expiryDate: expiry,
      },
    });

    revalidatePath("/");
    revalidatePath("/agreements");
    revalidatePath(`/agreements/${id}`);
    return { success: true, id: agreement.id };
  } catch (error: any) {
    console.error("Failed to update agreement:", error);
    return { success: false, error: error.message || "Failed to update agreement" };
  }
}

// DELETE AGREEMENT ACTION
export async function deleteAgreement(id: string) {
  try {
    await db.agreement.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/agreements");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete agreement:", error);
    return { success: false, error: error.message || "Failed to delete agreement" };
  }
}

// LOG SIMULATED REMINDER ACTION
export async function logSimulatedReminder(data: {
  agreementId: string;
  type: string;
  channel: string;
  recipient: string;
}) {
  try {
    const log = await db.reminderLog.create({
      data: {
        agreementId: data.agreementId,
        type: data.type,
        channel: data.channel,
        recipient: data.recipient,
        status: "simulated_sent",
      },
    });

    revalidatePath(`/agreements/${data.agreementId}`);
    revalidatePath("/reminders");
    return { success: true, log };
  } catch (error: any) {
    console.error("Failed to log reminder:", error);
    return { success: false, error: error.message || "Failed to log reminder" };
  }
}

// LOG SIMULATED GREETING ACTION
export async function logSimulatedGreeting(data: {
  occasion: string;
  channel: string;
  recipientGroup: string;
}) {
  try {
    const log = await db.greetingLog.create({
      data: {
        occasion: data.occasion,
        channel: data.channel,
        recipientGroup: data.recipientGroup,
      },
    });

    revalidatePath("/greetings");
    return { success: true, log };
  } catch (error: any) {
    console.error("Failed to log greeting:", error);
    return { success: false, error: error.message || "Failed to log greeting" };
  }
}
