import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getEditHistory,
  addToHistoryDB,
  removeFromHistoryDB,
  clearHistoryDB,
} from "@/lib/supabase";

// Get history
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await getEditHistory(session.user.id);
    return NextResponse.json({ history });
  } catch (error) {
    console.error("Get history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

// Add to history
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { original_url, transformed_url, prompt, operations, file_name } = body;

    if (!original_url || !transformed_url || !prompt || !operations || !file_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const item = await addToHistoryDB(session.user.id, {
      original_url,
      transformed_url,
      prompt,
      operations,
      file_name,
    });

    if (!item) {
      return NextResponse.json(
        { error: "Failed to add to history" },
        { status: 500 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Add history error:", error);
    return NextResponse.json(
      { error: "Failed to add to history" },
      { status: 500 }
    );
  }
}

// Delete history item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll");

    if (clearAll === "true") {
      const success = await clearHistoryDB(session.user.id);
      if (!success) {
        return NextResponse.json(
          { error: "Failed to clear history" },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json(
        { error: "History item ID required" },
        { status: 400 }
      );
    }

    const success = await removeFromHistoryDB(id);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to remove from history" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete history error:", error);
    return NextResponse.json(
      { error: "Failed to delete from history" },
      { status: 500 }
    );
  }
}
